import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, RefreshCw, Play, Pause, Plus, Info, FolderOpen, Users, Search, Filter, ArrowLeft, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { extractDriveId } from '@/utils/driveUtils';
import { formatAudioTitle, getAudioUrl, refreshAudioLibrary, groupAudiosBySpeaker, getAvailableSpeakers, extractSpeakerInfo } from '@/utils/publicAudioManager';

interface Audio {
  id: string;
  title: string;
  description?: string;
  drive_id?: string;
  drive_url?: string;
  file_path?: string;
  file_url?: string;
  order_position: number; // Alterado de orderPosition para order_position
  created_at: string;
  updated_at: string;
}

const AudioManagement = () => {
  const [audios, setAudios] = useState<Audio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState('Todos');
  const [availableSpeakers, setAvailableSpeakers] = useState<string[]>([]);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const lastHashRef = useRef<string>('');

  const resolveAudioUrl = (audio: Audio): string | undefined => {
    // Preferir URL já resolvida
    if (audio.file_url) {
      // Se já for uma URL completa ou já estiver em /audios
      if (audio.file_url.startsWith('http') || audio.file_url.startsWith('/audios/')) {
        return audio.file_url;
      }
      // Caso seja apenas o nome do arquivo
      return getAudioUrl(audio.file_url);
    }
    if (audio.file_path) {
      // Se já for uma URL completa ou já estiver em /audios
      if (audio.file_path.startsWith('http') || audio.file_path.startsWith('/audios/')) {
        return audio.file_path;
      }
      // Usar caminho local na pasta /audios
      return getAudioUrl(audio.file_path);
    }
    if (audio.drive_url) {
      const id = extractDriveId(audio.drive_url);
      if (id) return `https://docs.google.com/uc?export=download&id=${id}`;
      // Se for apenas um ID puro
      if (/^[a-zA-Z0-9-_]+$/.test(audio.drive_url)) {
        return `https://docs.google.com/uc?export=download&id=${audio.drive_url}`;
      }
      return audio.drive_url;
    }
    if (audio.drive_id) {
      return `https://docs.google.com/uc?export=download&id=${audio.drive_id}`;
    }
    return undefined;
  };



  useEffect(() => {
    loadAudios();
  }, []);

  // Atualização automática: verifica novos arquivos na pasta /public/audios
  useEffect(() => {
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(async () => {
        try {
          const refreshed = await refreshAudioLibrary();
          const data = (refreshed || []).map((a, index) => ({
            id: a.id || `local_${index + 1}`,
            title: formatAudioTitle(a.title || a.fileName),
            description: a.description || '',
            file_path: a.fileName,
            file_url: getAudioUrl(a.fileName),
            order_position: a.order_position || index + 1, // Alterado de orderPosition para order_position
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          const names = data.map(d => d.file_path || '').sort().join('|');
          if (names && names !== lastHashRef.current) {
            const isInitial = lastHashRef.current === '';
            lastHashRef.current = names;
            setAudios(data);
            if (!isInitial) {
              toast.success('Novos áudios detectados automaticamente');
            }
          }
        } catch (e) {
          // Silenciar erros intermitentes; botão "Atualizar" continua disponível
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadAudios = async () => {
    try {
      setLoading(true);
      setError(null);

      // Atualizar biblioteca central e notificar páginas
      const refreshed = await refreshAudioLibrary();
      const data = (refreshed || []).map((a, index) => ({
        id: a.id || `local_${index + 1}`,
        title: formatAudioTitle(a.title || a.fileName),
        description: a.description || '',
        file_path: a.fileName,
        file_url: getAudioUrl(a.fileName),
        order_position: a.order_position || index + 1, // Alterado de orderPosition para order_position
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      setAudios(data);
      
      // Carregar locutores disponíveis
      const speakers = await getAvailableSpeakers();
      // Embaralhar a ordem dos locutores (exceto "Todos" que sempre fica primeiro)
      const shuffledSpeakers = speakers.sort(() => Math.random() - 0.5);
      setAvailableSpeakers(['Todos', ...shuffledSpeakers]);
      
      toast.success(`${data.length} áudios locais carregados`);
    } catch (err: any) {
      console.error('Erro ao carregar áudios:', err);
      setError(err.message || 'Erro ao carregar áudios');
      toast.error('Erro ao carregar áudios locais');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (audio: Audio) => {
    try {
      // Parar áudio atual se estiver tocando
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }

      if (playingId === audio.id) {
        // Se o mesmo áudio está tocando, pausar
        setPlayingId(null);
        setAudioElement(null);
        return;
      }

      // Resolver URL efetiva do áudio com fallback
      const audioUrl = resolveAudioUrl(audio);
      
      if (!audioUrl) {
        toast.error('URL do áudio não encontrada');
        return;
      }

      // Criar novo elemento de áudio
      const newAudio = new Audio(audioUrl);
      newAudio.crossOrigin = 'anonymous';
      
      newAudio.onloadstart = () => {
        setPlayingId(audio.id);
        toast.success(`Reproduzindo: ${audio.title}`);
      };

      newAudio.onended = () => {
        setPlayingId(null);
        setAudioElement(null);
      };

      newAudio.onerror = () => {
        setPlayingId(null);
        setAudioElement(null);
        toast.error(`Erro ao reproduzir: ${audio.title}`);
      };

      newAudio.play().catch((err) => {
        console.error('Falha ao iniciar reprodução:', err);
        setPlayingId(null);
        setAudioElement(null);
        toast.error(`Não foi possível iniciar: ${audio.title}`);
      });
      setAudioElement(newAudio);
      
    } catch (err) {
      console.error('Erro ao reproduzir áudio:', err);
      toast.error('Erro ao reproduzir áudio');
    }
  };

  const handleDelete = async (audioId: string) => {
    toast.info('Modo local: exclusão desativada. Remova o arquivo da pasta /audios.');
  };

  // Tutorial agora abre em popup (Dialog)
  // O botão "Adicionar" atua como gatilho via DialogTrigger
  // O estado isTutorialOpen controla a abertura do Dialog
  // Rolagem não é mais necessária
  const handleAddAudio = undefined as unknown as () => void;

  // Botão de copiar caminho removido conforme solicitação do usuário

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Gerenciamento de Áudios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Carregando áudios...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Gerenciamento de Áudios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadAudios} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrar por locutor selecionado
  let filteredAudios = audios;
  if (selectedSpeaker !== 'Todos') {
    filteredAudios = filteredAudios.filter(audio => {
      if (audio.file_path) {
        const { speaker } = extractSpeakerInfo(audio.file_path);
        return speaker === selectedSpeaker;
      }
      return false;
    });
  }

  return (
    <Card className="w-full max-w-6xl mx-auto bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Music className="h-8 w-8" />
          </div>
          <div>
            <div>Gerenciamento de Áudios</div>
            <div className="text-sm font-normal opacity-90 mt-1">
              Administre e organize seus arquivos de áudio
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controles principais com cores vibrantes */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-6 rounded-xl border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <Music className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Controles Principais</h3>
                <p className="text-sm text-gray-600">Gerencie seus arquivos de áudio</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-emerald-200">
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                  className="data-[state=checked]:bg-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">Auto-refresh</span>
              </div>
              <Dialog open={isTutorialOpen} onOpenChange={setIsTutorialOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Como Adicionar Áudios
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-blue-200 sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-blue-900">
                      <Info className="h-5 w-5" />
                      Como adicionar áudios
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    {/* Instruções gerais */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 text-blue-900 font-medium">
                        <FolderOpen className="h-4 w-4" />
                        Organização por pastas de locutor
                      </div>
                      
                      <div className="space-y-3 text-sm text-slate-800">
                        <div className="flex items-start gap-2">
                          <FolderOpen className="h-4 w-4 text-blue-700 mt-0.5" />
                          <p>
                            Coloque seus arquivos <span className="font-mono">.mp3</span> ou <span className="font-mono">.wav</span> na pasta correspondente ao locutor:
                            <br />
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                              /public/audios/[Nome do Locutor]/
                            </span>
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Users className="h-4 w-4 text-blue-700 mt-0.5" />
                          <p>
                            <strong>Exemplo:</strong> Para o locutor "Artur Sutto", coloque os áudios em:
                            <br />
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                              /public/audios/Artur Sutto/
                            </span>
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Edit className="h-4 w-4 text-blue-700 mt-0.5" />
                          <p>Use nomes simples para os arquivos (sem espaços/acentos), por exemplo: <span className="font-mono">meu-audio.mp3</span></p>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <RefreshCw className="h-4 w-4 text-blue-700 mt-0.5" />
                          <p>Com o servidor rodando, novos arquivos aparecem automaticamente em poucos segundos.</p>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <RefreshCw className="h-4 w-4 text-blue-700 mt-0.5" />
                          <p>Você pode clicar em <strong>Atualizar</strong> para recarregar na hora.</p>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                          <p className="text-xs text-yellow-800">
                            <strong>Importante:</strong> Cada locutor deve ter sua própria pasta dentro de /public/audios/
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={loadAudios} variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Filtros Melhorados */}
          <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-zinc-50 p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-slate-500 to-gray-500 rounded-lg">
                <Filter className="h-4 w-4 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-lg">Filtros Avançados</h4>
            </div>
            <div className="flex gap-4 items-end flex-wrap">
              {/* Botão Todos os Locutores - sempre visível */}
              {selectedSpeaker !== 'Todos' && (
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ArrowLeft className="h-4 w-4 inline mr-2 text-indigo-600" />
                    Navegação
                  </label>
                  <Button
                    onClick={() => setSelectedSpeaker('Todos')}
                    variant="outline"
                    className="flex items-center gap-2 border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Todos os locutores
                  </Button>
                </div>
              )}
              
              {/* Filtro por locutor */}
              <div className="w-full sm:w-auto sm:min-w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4 inline mr-2 text-purple-600" />
                  Locutor
                </label>
                <Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
                  <SelectTrigger className="w-full sm:w-56 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg">
                    <SelectValue placeholder="Selecione um locutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSpeakers.map((speaker) => (
                      <SelectItem key={speaker} value={speaker}>
                        <div className="flex items-center gap-2">
                          {speaker === 'Todos' ? (
                            <Music className="h-3 w-3 text-indigo-600" />
                          ) : (
                            <Users className="h-3 w-3 text-purple-600" />
                          )}
                          {speaker}
                          {speaker !== 'Todos' && (
                            <span className="text-xs text-gray-500 ml-1 bg-gray-100 px-2 py-0.5 rounded-full">
                              {audios.filter(audio => {
                                if (audio.file_path) {
                                  const { speaker: audioSpeaker } = extractSpeakerInfo(audio.file_path);
                                  return audioSpeaker === speaker;
                                }
                                return false;
                              }).length}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Estatísticas rápidas */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-2 rounded-lg">
                <Music className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  <strong>{filteredAudios.length}</strong> áudios {selectedSpeaker !== 'Todos' ? `de ${selectedSpeaker}` : 'no total'}
                </span>
              </div>
            </div>
          </div>

           {/* Estatísticas por Locutor */}
            {selectedSpeaker === 'Todos' && (
              <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900">Estatísticas por Locutor</h4>
                    <p className="text-sm text-gray-600">Visualize a distribuição de áudios por locutor</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableSpeakers.slice(1).map((speaker, index) => {
                    const speakerAudios = audios.filter(audio => {
                      if (audio.file_path) {
                        const { speaker: audioSpeaker } = extractSpeakerInfo(audio.file_path);
                        return audioSpeaker === speaker;
                      }
                      return false;
                    });
                    
                    // Cores alternadas para os cards
                    const gradients = [
                      'from-rose-50 to-pink-100 border-rose-200',
                      'from-orange-50 to-amber-100 border-orange-200',
                      'from-emerald-50 to-teal-100 border-emerald-200',
                      'from-blue-50 to-indigo-100 border-blue-200',
                      'from-purple-50 to-violet-100 border-purple-200',
                      'from-cyan-50 to-sky-100 border-cyan-200'
                    ];
                    
                    const iconColors = [
                      'text-rose-600',
                      'text-orange-600', 
                      'text-emerald-600',
                      'text-blue-600',
                      'text-purple-600',
                      'text-cyan-600'
                    ];
                    
                    const badgeColors = [
                      'bg-rose-100 text-rose-800',
                      'bg-orange-100 text-orange-800',
                      'bg-emerald-100 text-emerald-800',
                      'bg-blue-100 text-blue-800',
                      'bg-purple-100 text-purple-800',
                      'bg-cyan-100 text-cyan-800'
                    ];
                    
                    const gradient = gradients[index % gradients.length];
                    const iconColor = iconColors[index % iconColors.length];
                    const badgeColor = badgeColors[index % badgeColors.length];
                    
                    return (
                      <div
                        key={speaker}
                        className={`bg-gradient-to-br ${gradient} p-5 rounded-xl border-2 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300`}
                        onClick={() => setSelectedSpeaker(speaker)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedSpeaker(speaker);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Users className={`h-5 w-5 ${iconColor}`} />
                            <span className="font-bold text-gray-900 truncate cursor-pointer flex-1 min-w-0 text-lg">{speaker}</span>
                          </div>
                          <span className={`${badgeColor} text-sm font-bold px-3 py-1 rounded-full shadow-sm flex-shrink-0`}>{speakerAudios.length}</span>
                        </div>
                        <div className="text-sm text-gray-700 mb-3 font-medium">
                          {speakerAudios.length === 1 ? '1 áudio disponível' : `${speakerAudios.length} áudios disponíveis`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

           <div className="space-y-3 max-h-96 overflow-y-auto">
             {selectedSpeaker === 'Todos' ? null : (
               <>
                 {/* Cabeçalho para locutor selecionado */}
                 <div className="mb-6">
                   <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 p-5 rounded-xl border border-indigo-200 shadow-sm">
                     <div className="flex items-center gap-4">
                       <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                         <Users className="h-6 w-6 text-white" />
                       </div>
                       <div className="flex-1">
                         <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedSpeaker}</h3>
                         <div className="flex items-center gap-3">
                           <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm font-bold px-4 py-2 rounded-full border border-indigo-200">
                             {filteredAudios.length} {filteredAudios.length === 1 ? 'áudio disponível' : 'áudios disponíveis'}
                           </span>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 {/* Lista de áudios melhorada */}
                 <div className="space-y-4">
                   {filteredAudios.length === 0 ? (
                     <div className="text-center py-12">
                       <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl border border-yellow-200 max-w-md mx-auto">
                         <Search className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                         <h3 className="text-lg font-semibold text-yellow-800 mb-2">Nenhum áudio encontrado</h3>
                         <p className="text-sm text-yellow-600">
                           O locutor {selectedSpeaker} ainda não possui áudios
                         </p>
                       </div>
                     </div>
                   ) : (
                     filteredAudios.map((audio, index) => {
                       // Cores alternadas para os cards de áudio
                       const cardGradients = [
                         'from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100',
                         'from-purple-50 to-violet-50 border-purple-200 hover:from-purple-100 hover:to-violet-100',
                         'from-emerald-50 to-teal-50 border-emerald-200 hover:from-emerald-100 hover:to-teal-100',
                         'from-rose-50 to-pink-50 border-rose-200 hover:from-rose-100 hover:to-pink-100',
                         'from-orange-50 to-amber-50 border-orange-200 hover:from-orange-100 hover:to-amber-100',
                         'from-cyan-50 to-sky-50 border-cyan-200 hover:from-cyan-100 hover:to-sky-100'
                       ];
                       
                       const playButtonColors = [
                         'bg-blue-500 hover:bg-blue-600 text-white',
                         'bg-purple-500 hover:bg-purple-600 text-white',
                         'bg-emerald-500 hover:bg-emerald-600 text-white',
                         'bg-rose-500 hover:bg-rose-600 text-white',
                         'bg-orange-500 hover:bg-orange-600 text-white',
                         'bg-cyan-500 hover:bg-cyan-600 text-white'
                       ];
                       
                       const cardGradient = cardGradients[index % cardGradients.length];
                       const playButtonColor = playButtonColors[index % playButtonColors.length];
                       
                       return (
                         <div
                           key={
                             audio.file_path
                               ? `file-${audio.file_path}-${index}`
                               : audio.file_url
                               ? `url-${audio.file_url}-${index}`
                               : `id-${audio.id}-${index}`
                           }
                           className={`bg-gradient-to-r ${cardGradient} p-5 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]`}
                         >
                           <div className="flex items-center justify-between">
                             <div className="flex-1 min-w-0">
                               <div className="flex items-start gap-3">
                                 <div className="p-2 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
                                   <Music className="h-5 w-5 text-gray-700" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <h4 className="font-bold text-lg text-gray-900 mb-1 truncate">{audio.title}</h4>
                                   {audio.description && (
                                     <p className="text-sm text-gray-700 mb-2 line-clamp-2">{audio.description}</p>
                                   )}
                                   <div className="flex items-center gap-2 text-xs text-gray-500">
                                     <div className="bg-white/60 backdrop-blur-sm px-2 py-1 rounded-md border border-white/40">
                                       <span className="font-mono">
                                         {resolveAudioUrl(audio)?.split('/').pop() || 'Sem arquivo'}
                                       </span>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </div>

                             <div className="flex items-center gap-3 ml-4">
                               <Button
                                 onClick={() => handlePlay(audio)}
                                 size="lg"
                                 className={`${playingId === audio.id ? 'bg-gray-600 hover:bg-gray-700' : playButtonColor} shadow-lg transition-all duration-200 transform hover:scale-105`}
                               >
                                 {playingId === audio.id ? (
                                   <>
                                     <Pause className="h-5 w-5 mr-2" />
                                     Pausar
                                   </>
                                 ) : (
                                   <>
                                     <Play className="h-5 w-5 mr-2" />
                                     Reproduzir
                                   </>
                                 )}
                               </Button>
                             </div>
                           </div>
                         </div>
                       );
                     })
                   )}
                 </div>
               </>
             )}
           </div>
           {audios.length === 0 && (
             <div className="text-center py-12">
               <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-8 rounded-2xl border border-gray-200 max-w-md mx-auto">
                 <Music className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                 <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum áudio encontrado</h3>
                 <p className="text-sm text-gray-500">Adicione arquivos de áudio na pasta /audios para começar</p>
               </div>
             </div>
           )}
        </div>

        
      </CardContent>
    </Card>
  );
};

export default AudioManagement;