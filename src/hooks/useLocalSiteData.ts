import { useState, useEffect } from 'react';
import { 
  Audio, 
  Client, 
  Statistic,
  SiteConfig, 
  SiteText,
  defaultSiteData
} from '@/data/siteData';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { syncAudiosNative, forceUpdateAudios, cleanCorruptedAudios } from '@/utils/audioSync';
import { getAudiosWithFallback } from '@/utils/publicAudioManager';
import { Tables } from '@/integrations/supabase/types';

type Service = Tables<'services'>;

export const useLocalSiteData = () => {
  const [texts, setTexts] = useState<SiteText>({});
  const [audios, setAudios] = useState<Audio[]>([]);
  const [configs, setConfigs] = useState<SiteConfig>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [services, setServices] = useState<Service[]>([]); // Novo estado para serviços
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSiteData();
  }, []);

  const loadSiteData = async () => {
    try {
      // Se Supabase não está configurado, usar dados padrão e evitar chamadas ao cliente
      if (!isSupabaseConfigured) {
        setTexts(defaultSiteData.texts);
        setConfigs(defaultSiteData.configs);
        setClients(defaultSiteData.clients);
        setStatistics(defaultSiteData.statistics);
        setServices(defaultSiteData.services.map(s => ({
          ...s,
          id: s.id || '',
          created_at: s.created_at || new Date().toISOString(),
          updated_at: s.updated_at || new Date().toISOString(),
        })));
        const audiosData = await getAudiosWithFallback();
        setAudios(audiosData);
        return;
      }

      // Carregar dados do banco de dados quando Supabase estiver configurado
      await Promise.all([
        loadTextsFromDB(),
        loadConfigsFromDB(),
        loadClientsFromDB(),
        loadStatisticsFromDB(),
        loadAudiosFromDB(),
        loadServicesFromDB() // Carregar serviços
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do site:', error);
      // Em caso de erro, usar dados padrão
      setTexts(defaultSiteData.texts);
      setConfigs(defaultSiteData.configs);
      setClients(defaultSiteData.clients);
      setStatistics(defaultSiteData.statistics);
      // Mapear defaultSiteData.services para o tipo Service do Supabase
      setServices(defaultSiteData.services.map(s => ({
        ...s,
        id: s.id || '', // Garante que id exista, mesmo que vazio para dados padrão
        created_at: s.created_at || new Date().toISOString(),
        updated_at: s.updated_at || new Date().toISOString(),
      })));
      
      // Para áudios, usar fallback
      try {
        const audiosData = await getAudiosWithFallback();
        setAudios(audiosData);
      } catch (audioError) {
        console.error('Erro ao carregar áudios:', audioError);
        setAudios([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTextsFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from('site_texts')
        .select('*');

      if (error) throw error;

      const textsData: SiteText = {};
      data?.forEach(item => {
        textsData[item.section] = item.content;
      });

      // Se não há dados no banco, usar dados padrão e inserir
      if (!data || data.length === 0) {
        await initializeTextsInDB();
        setTexts(defaultSiteData.texts);
      } else {
        setTexts(textsData);
      }
    } catch (error) {
      console.error('Erro ao carregar textos:', error);
      setTexts(defaultSiteData.texts);
    }
  };

  const loadConfigsFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('*');

      if (error) throw error;

      const configsData: SiteConfig = {};
      data?.forEach(item => {
        configsData[item.config_key] = item.config_value;
      });

      // Se não há dados no banco, usar dados padrão e inserir
      if (!data || data.length === 0) {
        await initializeConfigsInDB();
        setConfigs(defaultSiteData.configs);
      } else {
        setConfigs(configsData);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setConfigs(defaultSiteData.configs);
    }
  };

  const loadClientsFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('order_position');

      if (error) throw error;

      // Se não há dados no banco, usar dados padrão e inserir
      if (!data || data.length === 0) {
        await initializeClientsInDB();
        setClients(defaultSiteData.clients);
      } else {
        const clientsData: Client[] = data.map(item => ({
          id: item.id,
          name: item.name,
          quote: item.quote,
          order_position: item.order_position // Alterado de orderPosition para order_position
        }));
        setClients(clientsData);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClients(defaultSiteData.clients);
    }
  };

  const loadStatisticsFromDB = async () => {
    try {
      // Como não temos tabela de estatísticas ainda, usar dados padrão
      setStatistics(defaultSiteData.statistics);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStatistics(defaultSiteData.statistics);
    }
  };

  const loadAudiosFromDB = async () => {
    try {
      // Carregar somente áudios locais do servidor/arquivo, ignorando Supabase
      const audiosData = await getAudiosWithFallback();
      setAudios(audiosData);
    } catch (error) {
      console.error('Erro ao carregar áudios locais:', error);
      try {
        const audiosData = await syncAudiosNative();
        setAudios(audiosData);
      } catch (fallbackError) {
        console.error('Erro no fallback de áudios locais:', fallbackError);
        setAudios([]);
      }
    }
  };

  const loadServicesFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Se não há dados no banco, usar dados padrão e inserir todos
        await initializeServicesInDB();
        setServices(defaultSiteData.services.map(s => ({
          ...s,
          id: s.id || '',
          created_at: s.created_at || new Date().toISOString(),
          updated_at: s.updated_at || new Date().toISOString(),
        })));
      } else {
        // Sincronizar serviços padrão que estejam faltando no DB
        try {
          const existingTitles = new Set((data || []).map(s => (s.title || '').trim().toLowerCase()));
          const missingDefaults = defaultSiteData.services.filter(s => !existingTitles.has((s.title || '').trim().toLowerCase()));

          if (missingDefaults.length > 0) {
            const rowsToInsert = missingDefaults.map(s => ({
              title: s.title,
              description: s.description,
              color: s.color,
              order_position: s.order_position
            }));

            const { error: insertError } = await supabase
              .from('services')
              .insert(rowsToInsert);

            if (insertError) throw insertError;

            const { data: refreshed, error: refetchError } = await supabase
              .from('services')
              .select('*')
              .order('order_position', { ascending: true });

            if (refetchError) throw refetchError;
            setServices(refreshed || data);
          } else {
            setServices(data);
          }
        } catch (syncError) {
          console.warn('Falha ao sincronizar serviços padrão:', syncError);
          setServices(data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      setServices(defaultSiteData.services.map(s => ({
        ...s,
        id: s.id || '',
        created_at: s.created_at || new Date().toISOString(),
        updated_at: s.updated_at || new Date().toISOString(),
      })));
    }
  };

  // Funções para inicializar dados padrão no banco
  const initializeTextsInDB = async () => {
    try {
      const textsToInsert = Object.entries(defaultSiteData.texts).map(([section, content]) => ({
        section,
        content,
        description: `Texto da seção ${section}`
      }));

      const { error } = await supabase
        .from('site_texts')
        .insert(textsToInsert);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao inicializar textos no banco:', error);
    }
  };

  const initializeConfigsInDB = async () => {
    try {
      const configsToInsert = Object.entries(defaultSiteData.configs).map(([config_key, config_value]) => ({
        config_key,
        config_value,
        description: `Configuração ${config_key}`
      }));

      const { error } = await supabase
        .from('site_config')
        .insert(configsToInsert);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao inicializar configurações no banco:', error);
    }
  };

  const initializeClientsInDB = async () => {
    try {
      const clientsToInsert = defaultSiteData.clients.map(client => ({
        name: client.name,
        quote: client.quote,
        order_position: client.order_position // Alterado de orderPosition para order_position
      }));

      const { error } = await supabase
        .from('clients')
        .insert(clientsToInsert);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao inicializar clientes no banco:', error);
    }
  };

  const initializeServicesInDB = async () => {
    try {
      const servicesToInsert = defaultSiteData.services.map(service => ({
        title: service.title,
        description: service.description,
        color: service.color,
        order_position: service.order_position
      }));

      const { error } = await supabase
        .from('services')
        .insert(servicesToInsert);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao inicializar serviços no banco:', error);
    }
  };

  // Funções de atualização usando banco de dados
  const updateTexts = async (newTexts: SiteText) => {
    try {
      if (!isSupabaseConfigured) {
        setTexts(newTexts);
        return;
      }
      // Atualizar no banco de dados
      for (const [section, content] of Object.entries(newTexts)) {
        await supabase
          .from('site_texts')
          .upsert({ 
            section, 
            content, 
            description: `Texto da seção ${section}` 
          });
      }
      
      setTexts(newTexts);
    } catch (error) {
      console.error('Erro ao atualizar textos:', error);
      throw error;
    }
  };

  const updateConfigs = async (newConfigs: SiteConfig) => {
    try {
      if (!isSupabaseConfigured) {
        setConfigs(newConfigs);
        return;
      }
      // Atualizar no banco de dados
      for (const [config_key, config_value] of Object.entries(newConfigs)) {
        await supabase
          .from('site_config')
          .upsert({ 
            config_key, 
            config_value, 
            description: `Configuração ${config_key}` 
          });
      }
      
      setConfigs(newConfigs);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  };

  const updateClients = async (newClients: Client[]) => {
    try {
      if (!isSupabaseConfigured) {
        setClients(newClients);
        return;
      }
      // Primeiro, deletar todos os clientes existentes
      await supabase
        .from('clients')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos

      // Inserir novos clientes
      const clientsToInsert = newClients.map(client => ({
        name: client.name,
        quote: client.quote,
        order_position: client.order_position // Alterado de orderPosition para order_position
      }));

      const { error } = await supabase
        .from('clients')
        .insert(clientsToInsert);

      if (error) throw error;
      
      setClients(newClients);
    } catch (error) {
      console.error('Erro ao atualizar clientes:', error);
      throw error;
    }
  };

  const updateStatistics = async (newStatistics: Statistic[]) => {
    try {
      // Por enquanto, apenas atualizar o estado local
      // TODO: Implementar tabela de estatísticas no banco
      setStatistics(newStatistics);
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      throw error;
    }
  };

  const updateServices = async (newServices: Service[]) => {
    try {
      if (!isSupabaseConfigured) {
        setServices(newServices);
        return;
      }
      // Primeiro, deletar todos os serviços existentes
      await supabase
        .from('services')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos

      // Inserir novos serviços
      const servicesToInsert = newServices.map(service => ({
        title: service.title,
        description: service.description,
        color: service.color,
        order_position: service.order_position
      }));

      const { error } = await supabase
        .from('services')
        .insert(servicesToInsert);

      if (error) throw error;
      
      setServices(newServices);
    } catch (error) {
      console.error('Erro ao atualizar serviços:', error);
      throw error;
    }
  };

  // Função para atualizar áudios
  const refreshAudios = async () => {
    try {
      await loadAudiosFromDB();
      return audios;
    } catch (error) {
      console.error('Erro ao atualizar áudios:', error);
      throw error;
    }
  };

  // Função para forçar atualização completa
  const forceRefreshAudios = async () => {
    try {
      const updatedAudios = await forceUpdateAudios();
      setAudios(updatedAudios);
      return updatedAudios;
    } catch (error) {
      console.error('Erro ao forçar atualização:', error);
      throw error;
    }
  };

  // Função para limpar áudios corrompidos
  const cleanAudios = async () => {
    try {
      const cleanedAudios = await cleanCorruptedAudios();
      setAudios(cleanedAudios);
      return cleanedAudios;
    } catch (error) {
      console.error('Erro ao limpar áudios:', error);
      throw error;
    }
  };

  // Atualização automática desativada em modo localhost (sem supabase)

  return {
    texts,
    setTexts,
    audios,
    setAudios,
    configs,
    setConfigs,
    clients,
    setClients,
    statistics,
    setStatistics,
    services, // Exportar serviços
    setServices,
    loading,
    updateTexts,
    updateConfigs,
    updateClients,
    updateStatistics,
    updateServices, // Exportar função de atualização de serviços
    refreshAudios,
    forceRefreshAudios,
    cleanAudios
  };
};