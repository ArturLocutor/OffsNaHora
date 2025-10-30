import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Type, Save, Loader2, Mail, Phone, Instagram } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

const SiteManagement = () => {
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      toast.warning('Supabase não configurado. Seções que dependem de banco ficarão indisponíveis.');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar textos
      const { data: textsData } = await supabase
        .from('site_texts')
        .select('section, content');

      const textsMap = (textsData || []).reduce((acc: Record<string, string>, item) => {
        acc[item.section] = item.content;
        return acc;
      }, {});

      // Buscar configurações
      const { data: configsData } = await supabase
        .from('site_config')
        .select('config_key, config_value');

      const configsMap = (configsData || []).reduce((acc: Record<string, string>, item) => {
        acc[item.config_key] = item.config_value;
        return acc;
      }, {});

      setTexts(textsMap);
      setConfigs(configsMap);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const saveTexts = async (newTexts: Record<string, string>) => {
    setSaving(true);
    try {
      for (const [section, content] of Object.entries(newTexts)) {
        await supabase
          .from('site_texts')
          .upsert({ section, content, description: `Texto da seção ${section}` });
      }
      toast.success('Textos salvos com sucesso!');
      setTexts(newTexts);
    } catch (error) {
      console.error('Erro ao salvar textos:', error);
      toast.error('Erro ao salvar textos');
    } finally {
      setSaving(false);
    }
  };

  const saveConfigs = async (newConfigs: Record<string, string>) => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(newConfigs)) {
        await supabase
          .from('site_config')
          .upsert({ config_key: key, config_value: value, description: `Configuração ${key}` });
      }
      toast.success('Configurações salvas com sucesso!');
      setConfigs(newConfigs);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Gerenciar Site</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supabase não configurado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env.local` para habilitar as abas de Textos e Configurações.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Gerenciar Site</h2>
      </div>

      <Tabs defaultValue="texts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="texts" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Textos do Site
          </TabsTrigger>
          <TabsTrigger value="configs" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="texts">
          <TextsSection texts={texts} onSave={saveTexts} saving={saving} />
        </TabsContent>

        <TabsContent value="configs">
          <ConfigsSection configs={configs} onSave={saveConfigs} saving={saving} />
        </TabsContent>

      </Tabs>
    </div>
  );
};

const TextsSection = ({ texts, onSave, saving }: {
  texts: Record<string, string>;
  onSave: (texts: Record<string, string>) => Promise<void>;
  saving: boolean;
}) => {
  const [localTexts, setLocalTexts] = useState(texts);

  useEffect(() => {
    setLocalTexts(texts);
  }, [texts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localTexts);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Textos do Site</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            <div>
              <Label htmlFor="about-title">Título da Seção Sobre</Label>
              <Input
                id="about-title"
                value={localTexts['about-title'] || ''}
                onChange={(e) => setLocalTexts({...localTexts, 'about-title': e.target.value})}
                placeholder="Sobre o locutor"
              />
            </div>

            <div>
              <Label htmlFor="about-content">Texto da Seção Sobre</Label>
              <Textarea
                id="about-content"
                value={localTexts['about-content'] || ''}
                onChange={(e) => setLocalTexts({...localTexts, 'about-content': e.target.value})}
                placeholder="Fale sobre você..."
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="portfolio-title">Título do Portfólio</Label>
              <Input
                id="portfolio-title"
                value={localTexts['portfolio-title'] || ''}
                onChange={(e) => setLocalTexts({...localTexts, 'portfolio-title': e.target.value})}
                placeholder="Confira meu portfólio de voz"
              />
            </div>

            <div>
              <Label htmlFor="services-title">Título dos Serviços</Label>
              <Input
                id="services-title"
                value={localTexts['services-title'] || ''}
                onChange={(e) => setLocalTexts({...localTexts, 'services-title': e.target.value})}
                placeholder="Meus Serviços"
              />
            </div>

            <div>
              <Label htmlFor="cta-title">Título da Chamada para Ação</Label>
              <Input
                id="cta-title"
                value={localTexts['cta-title'] || ''}
                onChange={(e) => setLocalTexts({...localTexts, 'cta-title': e.target.value})}
                placeholder="Peça seu off agora mesmo!"
              />
            </div>

            <div>
              <Label htmlFor="testimonials-title">Título dos Depoimentos</Label>
              <Input
                id="testimonials-title"
                value={localTexts['testimonials-title'] || ''}
                onChange={(e) => setLocalTexts({...localTexts, 'testimonials-title': e.target.value})}
                placeholder="O que dizem sobre meu trabalho"
              />
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? 'Salvando...' : 'Salvar Textos'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ConfigsSection = ({ configs, onSave, saving }: {
  configs: Record<string, string>;
  onSave: (configs: Record<string, string>) => Promise<void>;
  saving: boolean;
}) => {
  const [localConfigs, setLocalConfigs] = useState(configs);

  useEffect(() => {
    setLocalConfigs(configs);
  }, [configs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localConfigs);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Site</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email de Contato
              </Label>
              <Input
                id="email"
                type="email"
                value={localConfigs['email'] || ''}
                onChange={(e) => setLocalConfigs({...localConfigs, 'email': e.target.value})}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                value={localConfigs['whatsapp_number'] || ''}
                onChange={(e) => setLocalConfigs({...localConfigs, 'whatsapp_number': e.target.value})}
                placeholder="5517981925660"
              />
            </div>

            <div>
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                URL do Instagram
              </Label>
              <Input
                id="instagram"
                value={localConfigs['instagram_url'] || ''}
                onChange={(e) => setLocalConfigs({...localConfigs, 'instagram_url': e.target.value})}
                placeholder="https://instagram.com/seu_perfil"
              />
            </div>

            <div>
              <Label htmlFor="google_drive_link">Link da Pasta do Google Drive</Label>
              <Input
                id="google_drive_link"
                value={localConfigs['google_drive_link'] || ''}
                onChange={(e) => setLocalConfigs({...localConfigs, 'google_drive_link': e.target.value})}
                placeholder="https://drive.google.com/drive/folders/..."
              />
            </div>

            <div>
              <Label htmlFor="profile_image">URL da Foto de Perfil</Label>
              <Input
                id="profile_image"
                value={localConfigs['profile_image'] || ''}
                onChange={(e) => setLocalConfigs({...localConfigs, 'profile_image': e.target.value})}
                placeholder="https://i.imgur.com/exemplo.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Cole a URL de uma imagem hospedada (ex: Imgur, Google Drive público)
              </p>
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};


export default SiteManagement;