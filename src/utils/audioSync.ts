// Sistema nativo de sincronização de áudios
import { Audio } from '@/data/siteData';
import { getPortfolioAudios, isAudioFileAvailable } from './publicAudioManager';

// Função para buscar arquivos do servidor
const fetchAudioFilesFromServer = async (): Promise<string[]> => {
  try {
    const response = await fetch('/api/audio-files');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.files ? data.files.map((file: any) => file.name) : [];
  } catch (error) {
    console.error('Erro ao buscar arquivos do servidor:', error);
    return [];
  }
};

// Função para formatar título do arquivo
const formatAudioTitle = (fileName: string): string => {
  return fileName
    .replace(/\.[^/.]+$/, '') // Remove extensão
    .replace(/[-_]/g, ' ') // Substitui hífens por espaços
    .replace(/\b\w/g, l => l.toUpperCase()) // Capitaliza primeira letra
    .trim();
};

// Função para criar áudio a partir do nome do arquivo
const createAudioFromFileName = (fileName: string): Audio => {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: formatAudioTitle(fileName),
    description: `Locução profissional - ${formatAudioTitle(fileName)}`,
    fileName: fileName,
    order_position: Date.now() // Alterado de orderPosition para order_position
  };
};

// Função para limpar áudios corrompidos
export const cleanCorruptedAudios = async (): Promise<Audio[]> => {
  try {
    console.log('🧹 Iniciando limpeza de áudios corrompidos...');
    
    // Buscar arquivos do servidor
    const serverFiles = await fetchAudioFilesFromServer();
    console.log('📁 Arquivos válidos no servidor:', serverFiles);
    
    // Buscar áudios do localStorage
    const storedAudios = localStorage.getItem('siteAudios');
    let audios: Audio[] = storedAudios ? JSON.parse(storedAudios) : [];
    console.log('📦 Áudios no localStorage antes da limpeza:', audios.length);
    
    // Filtrar apenas áudios que existem no servidor
    const validAudios = audios.filter(audio => 
      audio.fileName && serverFiles.includes(audio.fileName)
    );
    console.log('✅ Áudios válidos após limpeza:', validAudios.length);
    
    // Criar áudios para arquivos que existem mas não estão cadastrados
    const existingFileNames = validAudios.map(audio => audio.fileName);
    const missingFiles = serverFiles.filter(fileName => !existingFileNames.includes(fileName));
    console.log('🆕 Arquivos não cadastrados:', missingFiles);
    
    const newAudios = missingFiles.map(fileName => createAudioFromFileName(fileName));
    
    // Combinar áudios válidos com novos
    const cleanedAudios = [...validAudios, ...newAudios];
    
    // Ordenar por data de criação (mais recentes primeiro)
    cleanedAudios.sort((a, b) => (b.order_position || 0) - (a.order_position || 0)); // Alterado de orderPosition para order_position
    
    // Salvar no localStorage
    localStorage.setItem('siteAudios', JSON.stringify(cleanedAudios));
    console.log('💾 Áudios limpos salvos no localStorage:', cleanedAudios.length);
    
    return cleanedAudios;
  } catch (error) {
    console.error('Erro ao limpar áudios corrompidos:', error);
    return [];
  }
};

// Função principal para sincronizar áudios - sistema nativo serverless
export const syncAudiosNative = async (): Promise<Audio[]> => {
  try {
    console.log('🔄 Iniciando sincronização de áudios...');
    
    // Buscar arquivos do servidor
    const serverFiles = await fetchAudioFilesFromServer();
    console.log('📁 Arquivos no servidor:', serverFiles);
    
    // Buscar áudios cadastrados no localStorage
    const storedAudios = localStorage.getItem('siteAudios');
    let audios: Audio[] = storedAudios ? JSON.parse(storedAudios) : [];
    console.log('📦 Áudios no localStorage:', audios.length);

    // Se não há áudios no localStorage, usar áudios do portfólio padrão
    if (audios.length === 0) {
      const portfolioAudios = getPortfolioAudios();
      audios = portfolioAudios.slice(0, 12); // Limitar a 12 áudios iniciais
      localStorage.setItem('siteAudios', JSON.stringify(audios));
      console.log('✅ Áudios padrão carregados:', audios.length);
      return audios;
    }

    // Filtrar apenas áudios que ainda existem na lista de arquivos disponíveis
    const validAudios = audios.filter(audio => 
      audio.fileName && serverFiles.includes(audio.fileName)
    );
    console.log('✅ Áudios válidos:', validAudios.length);
    
    // Detectar novos arquivos
    const existingFileNames = validAudios.map(audio => audio.fileName);
    const newFiles = serverFiles.filter(fileName => !existingFileNames.includes(fileName));
    console.log('🆕 Novos arquivos encontrados:', newFiles);

    // Criar objetos Audio para novos arquivos
    const newAudios: Audio[] = newFiles.map(fileName => createAudioFromFileName(fileName));
    
    // Combinar áudios existentes com novos
    const updatedAudios = [...validAudios, ...newAudios];
    
    // Ordenar por ordem de criação (mais recentes primeiro)
    updatedAudios.sort((a, b) => (b.order_position || 0) - (a.order_position || 0)); // Alterado de orderPosition para order_position
    
    // Salvar no localStorage
    localStorage.setItem('siteAudios', JSON.stringify(updatedAudios));
    console.log('🎵 Total de áudios após sincronização:', updatedAudios.length);
    
    return updatedAudios;
  } catch (error) {
    console.error('Erro na sincronização de áudios:', error);
    return [];
  }
};

// Função para forçar atualização completa
export const forceUpdateAudios = async (): Promise<Audio[]> => {
  try {
    console.log('🔄 Forçando atualização completa de áudios...');
    
    // Limpar localStorage
    localStorage.removeItem('siteAudios');
    console.log('🗑️ localStorage limpo');
    
    // Recarregar do zero
    const updatedAudios = await syncAudiosNative();
    console.log('✅ Atualização completa concluída:', updatedAudios.length);
    
    return updatedAudios;
  } catch (error) {
    console.error('Erro na atualização forçada:', error);
    return [];
  }
};

// Função para obter áudios para o portfólio com limite
export const getAudiosForPortfolio = (limit: number = 9): Audio[] => {
  try {
    const storedAudios = localStorage.getItem('siteAudios');
    let audios: Audio[] = [];

    if (storedAudios) {
      audios = JSON.parse(storedAudios);
    } else {
      // Se não há áudios no localStorage, usar áudios padrão
      const portfolioAudios = getPortfolioAudios();
      audios = portfolioAudios.slice(0, 12);
      localStorage.setItem('siteAudios', JSON.stringify(audios));
    }

    // Filtrar apenas áudios válidos e aplicar limite
    return audios
      .filter(audio => audio.fileName && isAudioFileAvailable(audio.fileName))
      .slice(0, limit);
  } catch (error) {
    console.error('Erro ao obter áudios do portfólio:', error);
    // Fallback para áudios padrão
    const portfolioAudios = getPortfolioAudios();
    return portfolioAudios.slice(0, limit);
  }
};

// Função para obter contagem total de áudios
export const getTotalAudiosCount = (): number => {
  try {
    const storedAudios = localStorage.getItem('siteAudios');
    if (storedAudios) {
      const audios: Audio[] = JSON.parse(storedAudios);
      return audios.filter(audio => 
        audio.fileName && isAudioFileAvailable(audio.fileName)
      ).length;
    }
    
    // Se não há áudios no localStorage, usar contagem padrão
    return Math.min(getPortfolioAudios().length, 12);
  } catch (error) {
    console.error('Erro ao obter contagem de áudios:', error);
    return 12; // Fallback
  }
};

// Função para adicionar novo áudio (para uso do admin)
export const addAudioToPortfolio = (audio: Audio): void => {
  try {
    const storedAudios = localStorage.getItem('siteAudios');
    const audios: Audio[] = storedAudios ? JSON.parse(storedAudios) : [];
    
    // Verificar se o áudio já existe
    const existingIndex = audios.findIndex(a => a.id === audio.id);
    
    if (existingIndex >= 0) {
      // Atualizar áudio existente
      audios[existingIndex] = audio;
    } else {
      // Adicionar novo áudio
      audios.push(audio);
    }
    
    localStorage.setItem('siteAudios', JSON.stringify(audios));
  } catch (error) {
    console.error('Erro ao adicionar áudio ao portfólio:', error);
  }
};

// Função para remover áudio do portfólio
export const removeAudioFromPortfolio = (audioId: string): void => {
  try {
    const storedAudios = localStorage.getItem('siteAudios');
    const audios: Audio[] = storedAudios ? JSON.parse(storedAudios) : [];
    
    const filteredAudios = audios.filter(audio => audio.id !== audioId);
    localStorage.setItem('siteAudios', JSON.stringify(filteredAudios));
  } catch (error) {
    console.error('Erro ao remover áudio do portfólio:', error);
  }
};

// Função para configurar atualização automática
export const setupAutoUpdate = (callback: (audios: Audio[]) => void, interval: number = 30000) => {
  console.log('⏰ Configurando atualização automática a cada', interval / 1000, 'segundos');
  
  const updateInterval = setInterval(async () => {
    try {
      const updatedAudios = await syncAudiosNative();
      callback(updatedAudios);
    } catch (error) {
      console.error('Erro na atualização automática:', error);
    }
  }, interval);
  
  return () => clearInterval(updateInterval);
};