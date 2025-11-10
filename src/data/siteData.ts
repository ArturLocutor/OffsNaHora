export interface Audio {
  id: string;
  title: string;
  description: string | null;
  fileName: string; // Nome do arquivo na pasta public/audios/
  audioKey?: string; // Chave para acessar arquivo no localStorage
  order_position: number; // Alterado de orderPosition para order_position
  file_path?: string; // Caminho do arquivo no Supabase Storage
  file_url?: string; // URL pública do arquivo no Supabase
  driveUrl?: string; // URL do Google Drive para o arquivo de áudio
  drive_id?: string; // ID do arquivo no Google Drive
}

export interface Client {
  id: string;
  name: string;
  quote: string;
  order_position: number; // Alterado de orderPosition para order_position
}

export interface Statistic {
  id: string;
  title: string;
  value: number;
  suffix: string;
  description: string;
  color: string;
}

export interface Service {
  id?: string; // ID pode ser opcional para novos serviços antes de serem salvos no DB
  title: string;
  description: string | null;
  color: string;
  order_position: number;
  created_at?: string; // Opcional, será gerado pelo DB
  updated_at?: string; // Opcional, será gerado pelo DB
}

export interface SiteConfig {
  [key: string]: string;
}

export interface SiteText {
  [key: string]: string;
}

// Dados padrão do site
export const defaultSiteData = {
  texts: {
    'portfolio-title': 'Confira meu portfólio de voz',
    'portfolio-button': 'Veja Outras Locuções no Google Drive',
    'about-title': 'Sobre o locutor',
    'about-content': 'O Offs na Hora nasceu com um propósito claro: tornar o processo de gravação de offs rápido, profissional e acessível para todos que trabalham com comunicação. Sabemos que, no ritmo acelerado do rádio, da publicidade e da produção de conteúdo, agilidade e qualidade fazem toda a diferença. Por isso, criamos uma plataforma onde você pode solicitar gravações de voz profissionais de forma prática e segura, sem burocracia e com entrega rápida — tudo 100% online. Nosso compromisso é oferecer voz, emoção e presença, entregues com a eficiência que o seu projeto precisa. Offs na Hora — sua voz, pronta quando você precisa.',
    'services-title': 'Serviços',
    'cta-title': 'Peça seu off agora mesmo!',
    'cta-subtitle': 'Preencha o formulário abaixo para receber seu orçamento personalizado',
    'testimonials-title': 'O que dizem sobre meu trabalho'
  },
  configs: {
    email: 'contato@offsnahora.com.br',
    whatsapp_number: '17991598169',
    instagram_url: '',
    google_drive_link: 'https://drive.google.com/drive/folders/18aPWiGwGPA99nwVsEp9gGGAslCzFvFq8',
    profile_image: 'https://i.imgur.com/5H6o9S0.jpeg'
  },
  statistics: [
    {
      id: '1',
      title: 'Áudios Gravados',
      value: 44,
      suffix: '+ de',
      description: 'Áudios Gravados',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Clientes Satisfeitos',
      value: 50,
      suffix: '+ de',
      description: 'Clientes Satisfeitos',
      color: 'green'
    },
    {
      id: '3',
      title: 'Anos de Experiência',
      value: 3,
      suffix: '+ de',
      description: 'Anos de Experiência',
      color: 'purple'
    },
    {
      id: '4',
      title: 'Projetos Entregues',
      value: 100,
      suffix: '+ de',
      description: 'Projetos Entregues',
      color: 'orange'
    }
  ],
  audios: [
    {
      id: '1',
      title: 'Off Comercial - Exemplo 1',
      description: 'Gravação comercial para rádio',
      fileName: '',
      order_position: 1 // Alterado de orderPosition para order_position
    },
    {
      id: '2', 
      title: 'Chamada de Rádio - Exemplo 2',
      description: 'Locuções para emissoras',
      fileName: '',
      order_position: 2 // Alterado de orderPosition para order_position
    },
    {
      id: '3',
      title: 'Espera Telefônica - Exemplo 3',
      description: 'Mensagem profissional para atendimento',
      fileName: '',
      order_position: 3 // Alterado de orderPosition para order_position
    }
  ],
  clients: [
    {
      id: '1',
      name: 'João Silva',
      quote: 'Excelente trabalho! Muito profissional e entrega rápida.',
      order_position: 1 // Alterado de orderPosition para order_position
    },
    {
      id: '2',
      name: 'Maria Santos',
      quote: 'Locutor com voz marcante e qualidade excepcional.',
      order_position: 2 // Alterado de orderPosition para order_position
    }
  ],
  services: [ // Dados padrão para serviços
    { id: '1', title: "Gravação e Produção Personalizada", description: "Serviço completo de gravação e produção de áudio sob medida.", color: "orange", order_position: 1 },
    { id: '2', title: "Chamadas Impactantes", description: "Produção de chamadas promocionais e institucionais com impacto.", color: "purple", order_position: 2 },
    { id: '3', title: "Som de Rua", description: "Locução e captação para som de rua, alto impacto local.", color: "blue", order_position: 3 },

    // Novos serviços extraídos das imagens
    { id: '5', title: "Podcasts", description: "Locução e produção para podcasts e séries de áudio.", color: "indigo", order_position: 5 },
    { id: '6', title: "Rádios", description: "Locuções para emissoras e programações diárias.", color: "blue", order_position: 6 },
    { id: '7', title: "TV", description: "Locuções para peças e chamadas de televisão.", color: "yellow", order_position: 7 },
    { id: '8', title: "Agências de Publicidade", description: "Gravações e spots sob demanda para agências.", color: "pink", order_position: 8 },
    { id: '9', title: "Empresas", description: "Locuções corporativas e institucionais.", color: "teal", order_position: 9 },
    { id: '10', title: "Rádios Corporativas", description: "Locução para rádios internas e comunicação corporativa.", color: "cyan", order_position: 10 },
    { id: '11', title: "Narrações de Documentários", description: "Narrações para documentários e conteúdos audiovisuais.", color: "slate", order_position: 11 },
    { id: '12', title: "Notícias", description: "Leitura e produção de boletins informativos.", color: "red", order_position: 12 },
    { id: '13', title: "Programas", description: "Apresentação e chamadas para programas diversos.", color: "violet", order_position: 13 },
    { id: '14', title: "Projetos", description: "Produção de áudio personalizada para projetos especiais.", color: "emerald", order_position: 14 },

    // Mantemos URA (não está na imagem, mas é um serviço oferecido)
    { id: '4', title: "Espera Telefônica (URA)", description: "Mensagens profissionais para URA e atendimento automático.", color: "green", order_position: 4 },
  ]
};

// Funções para gerenciar dados locais
export const saveDataToLocalStorage = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getDataFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Erro ao ler dados do localStorage:', error);
    return defaultValue;
  }
};

export const initializeLocalData = () => {
  // Inicializar dados se não existirem
  if (!getDataFromLocalStorage('siteTexts', null)) {
    saveDataToLocalStorage('siteTexts', defaultSiteData.texts);
  }
  if (!getDataFromLocalStorage('siteConfigs', null)) {
    saveDataToLocalStorage('siteConfigs', defaultSiteData.configs);
  }
  if (!getDataFromLocalStorage('siteStatistics', null)) {
    saveDataToLocalStorage('siteStatistics', defaultSiteData.statistics);
  }
  if (!getDataFromLocalStorage('siteAudios', null)) {
    saveDataToLocalStorage('siteAudios', defaultSiteData.audios);
  }
  if (!getDataFromLocalStorage('siteClients', null)) {
    saveDataToLocalStorage('siteClients', defaultSiteData.clients);
  }
  if (!getDataFromLocalStorage('siteServices', null)) {
    saveDataToLocalStorage('siteServices', defaultSiteData.services);
  }
};