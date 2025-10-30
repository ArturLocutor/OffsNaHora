// Inicializador de áudios padrão para o portfólio
import { Audio } from '@/data/siteData';
import { getPortfolioAudios } from './publicAudioManager';

// Função para inicializar áudios padrão no localStorage
export const initializeDefaultAudios = (): Audio[] => {
  try {
    // Verificar se já existem áudios no localStorage
    const storedAudios = localStorage.getItem('siteAudios');
    if (storedAudios) {
      const audios: Audio[] = JSON.parse(storedAudios);
      if (audios.length > 0) {
        return audios; // Já tem áudios, não precisa inicializar
      }
    }

    // Obter áudios padrão do portfólio
    const portfolioAudios = getPortfolioAudios();
    
    // Selecionar os primeiros 12 áudios com títulos mais limpos
    const defaultAudios: Audio[] = portfolioAudios.slice(0, 12).map((audio, index) => ({
      ...audio,
      title: cleanAudioTitle(audio.title),
      description: `Locução profissional - ${cleanAudioTitle(audio.title)}`,
      orderPosition: index + 1
    }));

    // Salvar no localStorage
    localStorage.setItem('siteAudios', JSON.stringify(defaultAudios));
    
    return defaultAudios;
  } catch (error) {
    console.error('Erro ao inicializar áudios padrão:', error);
    return [];
  }
};

// Função para limpar títulos de áudio
const cleanAudioTitle = (title: string): string => {
  return title
    .replace(/\.mp3$/i, '') // Remove extensão
    .replace(/-/g, ' ') // Substitui hífens por espaços
    .replace(/_/g, ' ') // Substitui underscores por espaços
    .replace(/\s+/g, ' ') // Remove espaços duplos
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitaliza cada palavra
    .join(' ');
};

// Função para verificar se os áudios precisam ser atualizados
export const shouldUpdateAudios = (): boolean => {
  try {
    const storedAudios = localStorage.getItem('siteAudios');
    if (!storedAudios) return true;

    const audios: Audio[] = JSON.parse(storedAudios);
    return audios.length === 0;
  } catch (error) {
    return true; // Em caso de erro, force a atualização
  }
};

// Função para obter áudios com fallback automático
export const getAudiosWithFallback = (): Audio[] => {
  try {
    const storedAudios = localStorage.getItem('siteAudios');
    if (storedAudios) {
      const audios: Audio[] = JSON.parse(storedAudios);
      if (audios.length > 0) {
        return audios;
      }
    }

    // Se não há áudios, inicializar com padrões
    return initializeDefaultAudios();
  } catch (error) {
    console.error('Erro ao obter áudios:', error);
    // Em caso de erro, retornar áudios básicos
    return getPortfolioAudios().slice(0, 6).map((audio, index) => ({
      ...audio,
      title: cleanAudioTitle(audio.title),
      description: `Locução profissional`,
      orderPosition: index + 1
    }));
  }
};