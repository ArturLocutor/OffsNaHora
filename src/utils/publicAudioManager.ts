// Gerenciador de áudios da pasta public - Sistema Dinâmico com Suporte a Locutores
import { Audio } from '@/data/siteData';

// Interface para representar um locutor
interface Speaker {
  name: string;
  folder: string;
  audios: Audio[];
  bio?: string;
  contact?: string;
}

// Função para buscar arquivos de áudio disponíveis dinamicamente com suporte a locutores
export const getAvailableAudioFiles = async (): Promise<string[]> => {
  try {
    // Tentar buscar do servidor primeiro
    const response = await fetch('/api/audio-files');
    if (response.ok) {
      const data = await response.json();
      return data.files ? data.files.map((file: any) => file.name) : [];
    }
  } catch (error) {
    console.log('API não disponível, tentando manifesto audios.json');
  }

  // Tentar manifesto gerado pelo Vite (dev/build)
  try {
    const manifest = await fetch('/audios.json');
    if (manifest.ok) {
      const data = await manifest.json();
      const files = Array.isArray(data.files) ? data.files.map((f: any) => f.name) : [];
      if (files.length > 0) return files;
    }
  } catch (e) {
    console.log('Manifesto audios.json indisponível, usando lista padrão');
  }

  // Fallback final: lista estática de segurança baseada na estrutura atual
  return [
    'Artur Sutto/A PROGRAMAÇÃO QUE VOCE MERECE.mp3',
    'Artur Sutto/A PROGRAMAÇÃO QUE VOCÊ MERECE - SPOT.mp3',
    'Artur Sutto/A RÁDIO QUE ESTÁ SEMPRE COM VOCÊ - SPOT.mp3',
    'Artur Sutto/BAHIA REALIDADE FM - VHT.mp3',
    'Artur Sutto/BAHIA REALIDADE NEWS - VHT.mp3',
    'Artur Sutto/CHAMADA ESTREIA PROGRAMACAO.mp3',
    'Artur Sutto/CHAMADAS O TOM DO RAP - OFF.mp3',
    'Artur Sutto/CHAMADAS O TOM DO RAP - PRODUZIDO.mp3',
    'Artur Sutto/CROISSAINT E CIA - BLACK NOVEMBER 2024 SPOT.mp3',
    'Artur Sutto/DESCUBRA A SUA NOVA RÁDIO FAVORITA - SPOT.mp3',
    'Artur Sutto/DESCUBRA SUA RADIO FAVORITA.mp3',
    'Artur Sutto/DESTINY NETWORKING OFF.mp3',
    'Artur Sutto/DESTINY NETWORKING SPOT.mp3',
    'Artur Sutto/ESCRITA CRIATIVA NA PRÁTICA - OFF.mp3',
    'Artur Sutto/ESCRITA CRIATIVA NA PRÁTICA - SPOT.mp3',
    'Artur Sutto/GPX FM - WHATSAPP GERAL.mp3',
    'Artur Sutto/GUZZO CAPAS E ACESSÓRIOS - 17-10-2024.mp3',
    'Artur Sutto/HORA DO FALSHBACK PILOTO.mp3',
    'Artur Sutto/HORA DO FLASHBACK - PILOTO.mp3',
    'Artur Sutto/HORTIFRUTI 27-02-2024 OFF.mp3',
    'Artur Sutto/INSTAGRAM.mp3',
    'Artur Sutto/JORNAL BAHIA REALIDADE NEWS - VHT.mp3',
    'Artur Sutto/OFFS GERAL.mp3',
    'Artur Sutto/PAPAS BURGERS - MENSAGEM DE ANO NOVO 2024 SPOT.mp3',
    'Artur Sutto/PAPAS BURGERS - MENSAGEM DE NATAL 2024 SPOT.mp3',
    'Artur Sutto/PARAÍBA CONFECÇÕES - GRANDE INAUGURAÇÃO.mp3',
    'Artur Sutto/PARAÍBA CONFECÇÕES - VENHA ECONOMIZAR.mp3',
    'Artur Sutto/PILOTO APRESENTAÇÃO DE PROGRAMA.mp3',
    'Artur Sutto/PILOTO LOCUÇÃO ADULTA.mp3',
    'Artur Sutto/PILOTO LOCUÇÃO JOVEM.mp3',
    'Artur Sutto/PILOTO LOCUÇÃO PADRÃO.mp3',
    'Artur Sutto/PILOTO LOCUÇÃO POPULAR.mp3',
    'Artur Sutto/PILOTO LOCUÇÃO PUBLICITÁRIA.mp3',
    'Artur Sutto/PILOTO.mp3',
    'Artur Sutto/QUER SAIR PEDALANDO SPOT.mp3',
    'Artur Sutto/SARTORI BARBEARIA.mp3',
    'Artur Sutto/SIGA NOSSO INSTAGRAM.mp3',
    'Artur Sutto/SINTONIZE O MELHOR DA INTERNET - OFF.mp3',
    'Artur Sutto/SINTONIZE O MELHOR DA INTERNET - SPOT.mp3',
    'Artur Sutto/SPOTS GERAL.mp3',
    'Artur Sutto/VERACRUZ.mp3',
    'Artur Sutto/VH SOM DE BUTECO O MELHOR DO MODAO.mp3',
    'Artur Sutto/VH VOCE ESTA OUVINDO TOCA AI.mp3',
    'Artur Sutto/VINHETAS PRODUZIDAS - GERAL.mp3',
    'Rones Carvalho/VERACRUZ.mp3',
    'Rones Carvalho/VH VOCE ESTA OUVINDO TOCA AI.mp3',
    'VERACRUZ.mp3',
    'VH VOCE ESTA OUVINDO TOCA AI.mp3',
    'A RÁDIO QUE ESTÁ SEMPRE COM VOCÊ - SPOT.mp3',
    'CHAMADA ESTREIA PROGRAMACAO.mp3',
    'CHAMADAS O TOM DO RAP - OFF.mp3',
    'CHAMADAS O TOM DO RAP - PRODUZIDO.mp3',
    'CROISSAINT E CIA - BLACK NOVEMBER 2024 SPOT.mp3',
    'DESCUBRA A SUA NOVA RÁDIO FAVORITA - SPOT.mp3',
    'DESTINY NETWORKING OFF.mp3',
    'DESTINY NETWORKING SPOT.mp3',
    'ESCRITA CRIATIVA NA PRÁTICA - OFF.mp3',
    'ESCRITA CRIATIVA NA PRÁTICA - SPOT.mp3',
    'GPX FM - WHATSAPP GERAL.mp3',
    'GUZZO CAPAS E ACESSÓRIOS - 17-10-2024.mp3',
    'HORA DO FLASHBACK - PILOTO.mp3',
    'HORTIFRUTI 27-02-2024 OFF.mp3',
    'INSTAGRAM.mp3',
    'JORNAL BAHIA REALIDADE NEWS - VHT.mp3',
    'OFFS GERAL.mp3',
    'PAPAS BURGERS - MENSAGEM DE ANO NOVO 2024 SPOT.mp3',
    'PAPAS BURGERS - MENSAGEM DE NATAL 2024 SPOT.mp3',
    'PARAÍBA CONFECÇÕES - GRANDE INAUGURAÇÃO.mp3',
    'PARAÍBA CONFECÇÕES - VENHA ECONOMIZAR.mp3',
    'PILOTO APRESENTAÇÃO DE PROGRAMA.mp3',
    'PILOTO LOCUÇÃO ADULTA.mp3',
    'PILOTO LOCUÇÃO JOVEM.mp3',
    'PILOTO LOCUÇÃO PADRÃO.mp3',
    'PILOTO LOCUÇÃO POPULAR.mp3',
    'PILOTO LOCUÇÃO PUBLICITÁRIA.mp3',
    'PILOTO.mp3',
    'QUER SAIR PEDALANDO SPOT.mp3',
    'SARTORI BARBEARIA.mp3',
    'SINTONIZE O MELHOR DA INTERNET - OFF.mp3',
    'SINTONIZE O MELHOR DA INTERNET - SPOT.mp3',
    'SPOTS GERAL.mp3',
    'VERACRUZ.mp3',
    'VH SOM DE BUTECO O MELHOR DO MODAO.mp3',
    'VH VOCE ESTA OUVINDO TOCA AI.mp3',
    'VINHETAS PRODUZIDAS - GERAL.mp3'
  ];
};

export const getAudioUrl = (fileName: string): string => {
  // Verificar se é uma URL do Supabase (começa com https://)
  if (fileName.startsWith('https://')) {
    console.log('Supabase Audio URL:', fileName); // Debug
    return fileName;
  }
  // Se já é um caminho absoluto para /audios, retornar como está
  if (fileName.startsWith('/audios/')) {
    return fileName;
  }
  
  // Caso contrário, usar URLs relativas que apontam para a pasta public/audios
  // Codificar corretamente caracteres especiais e espaços
  const encoded = encodeURIComponent(fileName).replace(/%2F/g, '/');
  const url = `/audios/${encoded}`;
  console.log('Local Audio URL:', url); // Debug
  return url;
};

// Função para extrair informações do locutor a partir do caminho do arquivo
export const extractSpeakerInfo = (fileName: string): { speaker: string; speakerFolder: string; audioFileName: string } => {
  // Normalizar separadores de caminho (suportar tanto / quanto \)
  const normalizedFileName = fileName.replace(/\\/g, '/');
  
  // Verificar se o arquivo está em uma pasta de locutor
  if (normalizedFileName.includes('/')) {
    const parts = normalizedFileName.split('/');
    if (parts.length >= 2) {
      const speakerFolder = parts[0];
      const audioFileName = parts.slice(1).join('/');
      return {
        speaker: speakerFolder,
        speakerFolder: speakerFolder,
        audioFileName: audioFileName
      };
    }
  }
  
  // Se não está em pasta de locutor, retornar como "Geral"
  return {
    speaker: 'Geral',
    speakerFolder: '',
    audioFileName: fileName
  };
};

// Função para agrupar áudios por locutor
export const groupAudiosBySpeaker = async (): Promise<Speaker[]> => {
  try {
    const availableFiles = await getAvailableAudioFiles();
    const speakersMap = new Map<string, Speaker>();
    
    availableFiles.forEach((fileName, index) => {
      const { speaker, speakerFolder, audioFileName } = extractSpeakerInfo(fileName);
      
      if (!speakersMap.has(speaker)) {
        speakersMap.set(speaker, {
          name: speaker,
          folder: speakerFolder,
          audios: []
        });
      }
      
      const speakerData = speakersMap.get(speaker)!;
      speakerData.audios.push({
        id: `audio_${speaker}_${index}`,
        title: formatAudioTitle(audioFileName),
        description: `Locução profissional - ${formatAudioTitle(audioFileName)}`,
        fileName: fileName,
        order_position: speakerData.audios.length + 1,
        file_url: getAudioUrl(fileName)
      });
    });
    
    return Array.from(speakersMap.values());
  } catch (error) {
    console.error('Erro ao agrupar áudios por locutor:', error);
    return [];
  }
};

// Função para obter áudios de um locutor específico
export const getAudiosBySpeaker = async (speakerName: string): Promise<Audio[]> => {
  try {
    const speakers = await groupAudiosBySpeaker();
    const speaker = speakers.find(s => s.name === speakerName);
    return speaker ? speaker.audios : [];
  } catch (error) {
    console.error('Erro ao obter áudios do locutor:', error);
    return [];
  }
};

// Função para obter todos os locutores disponíveis
export const getAvailableSpeakers = async (): Promise<string[]> => {
  try {
    const speakers = await groupAudiosBySpeaker();
    return speakers.map(s => s.name);
  } catch (error) {
    console.error('Erro ao obter locutores disponíveis:', error);
    return [];
  }
};

export const validateAudioFileName = (fileName: string): boolean => {
  const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
  return validExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

// Função para verificar se um arquivo existe na lista
export const isAudioFileAvailable = async (fileName: string): Promise<boolean> => {
  const files = await getAvailableAudioFiles();
  return files.includes(fileName);
};

// Função para sincronizar todos os arquivos da pasta com o localStorage
export const syncAllAudioFiles = async (): Promise<Audio[]> => {
  try {
    const availableFiles = await getAvailableAudioFiles();
    const storedAudiosRaw = localStorage.getItem('siteAudios');
    const storedAudios: Audio[] = storedAudiosRaw ? JSON.parse(storedAudiosRaw) : [];
    const byFileName = new Map<string, Audio>();
    storedAudios.forEach(a => {
      if (a?.fileName) byFileName.set(a.fileName, a);
    });
    
    // Criar áudios para todos os arquivos disponíveis
    const allAudios: Audio[] = availableFiles.map((fileName, index) => {
      const existing = byFileName.get(fileName);
      if (existing) {
        return {
          id: existing.id || `audio_${index + 1}`,
          title: existing.title || formatAudioTitle(fileName),
          fileName: fileName,
          description: existing.description || `Locução profissional - ${formatAudioTitle(fileName)}`,
          order_position: existing.order_position || index + 1, // Alterado de orderPosition para order_position
        };
      }
      return {
        id: `audio_${index + 1}`,
        title: formatAudioTitle(fileName),
        fileName: fileName,
        description: `Locução profissional - ${formatAudioTitle(fileName)}`,
        order_position: index + 1, // Alterado de orderPosition para order_position
      };
    });

    // Salvar no localStorage
    localStorage.setItem('siteAudios', JSON.stringify(allAudios));
    
    console.log(`Sincronizados ${allAudios.length} áudios da pasta`);
    return allAudios;
  } catch (error) {
    console.error('Erro ao sincronizar áudios:', error);
    return [];
  }
};

// Atualiza biblioteca e avisa toda a aplicação
export const refreshAudioLibrary = async (): Promise<Audio[]> => {
  const audios = await syncAllAudioFiles();
  try {
    window.dispatchEvent(new CustomEvent('siteAudiosUpdated', { detail: audios }));
  } catch (e) {
    // Ambiente SSR/teste pode não ter window
  }
  return audios;
};

export const onSiteAudiosUpdated = (handler: (audios: Audio[]) => void) => {
  const listener = (e: Event) => {
    const detail = (e as CustomEvent).detail as Audio[];
    handler(detail || []);
  };
  window.addEventListener('siteAudiosUpdated', listener as EventListener);
  return () => window.removeEventListener('siteAudiosUpdated', listener as EventListener);
};

// Função para obter áudios do localStorage ou criar padrões
export const getPortfolioAudios = (): Audio[] => {
  try {
    // Tentar carregar do localStorage primeiro
    const storedAudios = localStorage.getItem('siteAudios');
    if (storedAudios) {
      const audios: Audio[] = JSON.parse(storedAudios);
      if (audios.length > 0) {
        return audios.map(audio => ({
          ...audio,
          title: formatAudioTitle(audio.title || audio.fileName),
          description: audio.description || `Locução profissional - ${formatAudioTitle(audio.fileName)}`
        }));
      }
    }

    // Se não há áudios no localStorage, criar padrões com todos os arquivos disponíveis
    const defaultFiles = [
      'A PROGRAMAÇÃO QUE VOCÊ MERECE - SPOT.mp3',
      'A RÁDIO QUE ESTÁ SEMPRE COM VOCÊ - SPOT.mp3',
      'BAHIA REALIDADE FM - VHT.mp3',
      'BAHIA REALIDADE NEWS - VHT.mp3',
      'CHAMADA ESTREIA PROGRAMACAO.mp3',
      'CHAMADAS O TOM DO RAP - OFF.mp3',
      'CHAMADAS O TOM DO RAP - PRODUZIDO.mp3',
      'CROISSAINT E CIA - BLACK NOVEMBER 2024 SPOT.mp3',
      'DESCUBRA A SUA NOVA RÁDIO FAVORITA - SPOT.mp3',
      'DESTINY NETWORKING OFF.mp3',
      'DESTINY NETWORKING SPOT.mp3',
      'ESCRITA CRIATIVA NA PRÁTICA - OFF.mp3',
      'ESCRITA CRIATIVA NA PRÁTICA - SPOT.mp3',
      'GPX FM - WHATSAPP GERAL.mp3',
      'GUZZO CAPAS E ACESSÓRIOS - 17-10-2024.mp3',
      'HORA DO FLASHBACK - PILOTO.mp3',
      'HORTIFRUTI 27-02-2024 OFF.mp3',
      'INSTAGRAM.mp3',
      'JORNAL BAHIA REALIDADE NEWS - VHT.mp3',
      'OFFS GERAL.mp3',
      'PAPAS BURGERS - MENSAGEM DE ANO NOVO 2024 SPOT.mp3',
      'PAPAS BURGERS - MENSAGEM DE NATAL 2024 SPOT.mp3',
      'PARAÍBA CONFECÇÕES - GRANDE INAUGURAÇÃO.mp3',
      'PARAÍBA CONFECÇÕES - VENHA ECONOMIZAR.mp3',
      'PILOTO APRESENTAÇÃO DE PROGRAMA.mp3',
      'PILOTO LOCUÇÃO ADULTA.mp3',
      'PILOTO LOCUÇÃO JOVEM.mp3',
      'PILOTO LOCUÇÃO PADRÃO.mp3',
      'PILOTO LOCUÇÃO POPULAR.mp3',
      'PILOTO LOCUÇÃO PUBLICITÁRIA.mp3',
      'PILOTO.mp3',
      'QUER SAIR PEDALANDO SPOT.mp3',
      'SARTORI BARBEARIA.mp3',
      'SINTONIZE O MELHOR DA INTERNET - OFF.mp3',
      'SINTONIZE O MELHOR DA INTERNET - SPOT.mp3',
      'SPOTS GERAL.mp3',
      'VERACRUZ.mp3',
      'VH SOM DE BUTECO O MELHOR DO MODAO.mp3',
      'VH VOCE ESTA OUVINDO TOCA AI.mp3',
      'VINHETAS PRODUZIDAS - GERAL.mp3'
    ];

    return defaultFiles.map((fileName, index) => ({
      id: `audio_${index + 1}`,
      title: formatAudioTitle(fileName),
      fileName: fileName,
      description: `Locução profissional - ${formatAudioTitle(fileName)}`,
      order_position: index + 1 // Alterado de orderPosition para order_position
    }));
  } catch (error) {
    console.error('Erro ao carregar áudios:', error);
    return [];
  }
};

// Função para formatar títulos de áudio
export const formatAudioTitle = (fileName: string): string => {
  if (!fileName) return 'Áudio sem título';
  
  // Remover extensão
  let title = fileName.replace(/\.[^/.]+$/, '');
  
  // Substituir hífens e underscores por espaços
  title = title.replace(/[-_]/g, ' ');
  
  // Capitalizar primeira letra de cada palavra
  title = title.replace(/\b\w/g, l => l.toUpperCase());
  
  // Limpar espaços extras
  title = title.trim();
  
  // Se o título ficou muito longo, truncar
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  return title;
};

// Função para obter áudios com fallback automático - AGORA SINCRONIZA TODOS OS ARQUIVOS
export const getAudiosWithFallback = async (): Promise<Audio[]> => {
  try {
    // Primeiro, tentar sincronizar todos os arquivos da pasta
    const syncedAudios = await syncAllAudioFiles();
    if (syncedAudios.length > 0) {
      return syncedAudios.map(audio => ({
        ...audio,
        title: formatAudioTitle(audio.title || audio.fileName),
        description: audio.description || `Locução profissional - ${formatAudioTitle(audio.fileName)}`
      }));
    }

    // Se não conseguiu sincronizar, usar localStorage
    const storedAudios = localStorage.getItem('siteAudios');
    if (storedAudios) {
      const audios: Audio[] = JSON.parse(storedAudios);
      if (audios.length > 0) {
        return audios.map(audio => ({
          ...audio,
          title: formatAudioTitle(audio.title || audio.fileName),
          description: audio.description || `Locução profissional - ${formatAudioTitle(audio.fileName)}`
        }));
      }
    }

    // Se não há áudios, retornar todos os áudios padrão
    const allAudios = getPortfolioAudios();
    console.log('Carregando áudios padrão:', allAudios.length);
    return allAudios;
  } catch (error) {
    console.error('Erro ao obter áudios com fallback:', error);
    return getPortfolioAudios();
  }
};