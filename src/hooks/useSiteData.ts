
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SiteText {
  section: string;
  content: string;
}

interface Audio {
  id: string;
  title: string;
  description: string | null;
  drive_id: string | null;
  file_path: string | null;
  order_position: number;
}

interface SiteConfig {
  config_key: string;
  config_value: string;
}

interface Client {
  id: string;
  name: string;
  quote: string;
  order_position: number;
}

export const useSiteData = () => {
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [audios, setAudios] = useState<Audio[]>([]);
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteData();
  }, []);

  const fetchSiteData = async () => {
    try {
      // Fetch texts
      const { data: textsData, error: textsError } = await supabase
        .from('site_texts')
        .select('section, content');

      if (textsError) throw textsError;

      const textsMap = (textsData || []).reduce((acc: Record<string, string>, item: SiteText) => {
        acc[item.section] = item.content;
        return acc;
      }, {});

      // Fetch audios
      const { data: audiosData, error: audiosError } = await supabase
        .from('audios')
        .select('*')
        .order('order_position');

      if (audiosError) throw audiosError;

      // Fetch configurations
      const { data: configsData, error: configsError } = await supabase
        .from('site_config')
        .select('config_key, config_value');

      if (configsError) throw configsError;

      const configsMap = (configsData || []).reduce((acc: Record<string, string>, item: SiteConfig) => {
        acc[item.config_key] = item.config_value;
        return acc;
      }, {});

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('order_position');

      if (clientsError) throw clientsError;

      setTexts(textsMap);
      setAudios(audiosData || []);
      setConfigs(configsMap);
      setClients(clientsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados do site:', error);
      toast.error('Erro ao carregar dados do site');
    } finally {
      setLoading(false);
    }
  };

  return { texts, audios, configs, clients, loading, refetch: fetchSiteData };
};
