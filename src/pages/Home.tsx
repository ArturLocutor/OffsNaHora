import { useState, useEffect, useMemo } from "react";
import { Phone, Instagram, Mail, Mic, Radio, Building, Users, Wrench, ArrowDown, Star, Award, Music, Volume2, Headphones, Zap, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import PublicAudioPlayer from "@/components/PublicAudioPlayer";
import MiniAudioPlayer from "@/components/MiniAudioPlayer";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import AnimatedCounter from "@/components/AnimatedCounter";
import ScrollToTop from "@/components/ScrollToTop";
import AudioWaveIcon from "@/components/AudioWaveIcon";
// Removido uso de imagens de fundo no Hero
import { getAvailableAudioFiles, getAudioUrl, formatAudioTitle, onSiteAudiosUpdated, groupAudiosBySpeaker } from "@/utils/publicAudioManager";
import { extractDriveId } from "@/utils/driveUtils";
import { useLocalSiteData } from "@/hooks/useLocalSiteData";
import { useSpeaker } from "@/contexts/SpeakerContext";

import { recordEvent } from "../utils/metrics";
import studioBackground from "@/assets/studio-background.jpg";
import soundWaves from "@/assets/sound-waves.jpg";
import { cn, formatBrPhone } from "@/lib/utils";

interface Audio {
  id: string;
  title: string;
  description: string;
  fileName: string;
  order_position: number; // Alterado de orderPosition para order_position
  file_path?: string;
  file_url?: string;
  driveUrl?: string;
  speaker?: string; // Nome do locutor
  speakerFolder?: string; // Pasta do locutor
}

interface Speaker {
  name: string;
  folder: string;
  audios: Audio[];
  bio?: string;
  contact?: string;
}

interface Client {
  id: string;
  name: string;
  quote: string;
  order_position: number; // Alterado de orderPosition para order_position
}



const Home = () => {
  const { statistics, configs, audios: siteAudios, services, loading: siteLoading } = useLocalSiteData();
  const { setSelectedSpeaker: setSpeakerInForm } = useSpeaker();
  const [audios, setAudios] = useState<Audio[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('Todos');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedAudios, setDisplayedAudios] = useState<Audio[]>([]);
  const [displayedCount, setDisplayedCount] = useState(3); // Mostrar apenas 3 inicialmente
  const [totalAudiosCount, setTotalAudiosCount] = useState(0);
  // Serviços serão exibidos na ordem vinda do painel (order_position)

  // Removida a randomização: usaremos os dados reais do painel
  
  // Dados padrão dos clientes
  const defaultClients: Client[] = [
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
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      quote: 'Superou todas as expectativas. Recomendo!',
      order_position: 3 // Alterado de orderPosition para order_position
    }
  ];

  useEffect(() => {
    // Carregar áudios organizados por locutor
    const initLocalAudios = async () => {
      try {
        // Carregar locutores e seus áudios
        const speakersData = await groupAudiosBySpeaker();
        
        // Embaralhar a ordem dos locutores para exibição aleatória
        const shuffledSpeakers = [...speakersData].sort(() => Math.random() - 0.5);
        setSpeakers(shuffledSpeakers);
        
        // Combinar todos os áudios de todos os locutores
        const allAudios = shuffledSpeakers.flatMap(speaker => speaker.audios);
        
        setAudios(allAudios);
        setClients(defaultClients);
        setTotalAudiosCount(allAudios.length);
        setDisplayedAudios(allAudios.slice(0, displayedCount));
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar áudios locais:', error);
        setLoading(false);
      }
    };

    initLocalAudios();
  }, [displayedCount]);

  // Atualizar automaticamente quando Admin sincronizar a pasta
  useEffect(() => {
    const unsubscribe = onSiteAudiosUpdated((updated) => {
      const list = updated.map((a, index) => ({
        id: a.id || `local_${index + 1}`,
        title: formatAudioTitle(a.title || a.fileName),
        description: "",
        fileName: a.fileName,
        file_url: getAudioUrl(a.fileName),
        order_position: a.order_position || index + 1, // Alterado de orderPosition para order_position
      }));
      setAudios(list);
      setTotalAudiosCount(list.length);
      setDisplayedAudios(list.slice(0, displayedCount));
    });
    return unsubscribe;
  }, [displayedCount]);

  useEffect(() => {
    setDisplayedAudios(audios.slice(0, displayedCount));
  }, [audios, displayedCount]);

  // Priorizar serviços com tags (Mais Vendido/Recomendado) e embaralhar os demais
  const prioritizedServices = useMemo(() => {
    const list = (services || []).slice();
    const tagged = list
      .filter((s: any) => s?.is_best_seller || s?.is_recommended)
      .sort((a: any, b: any) => {
        const ao = typeof a.order_position === 'number' ? a.order_position : 9999;
        const bo = typeof b.order_position === 'number' ? b.order_position : 9999;
        return ao - bo;
      });
    const others = list.filter((s: any) => !(s?.is_best_seller || s?.is_recommended));
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    return [...tagged, ...others];
  }, [services]);

  // Sistema de cores harmoniosas e equilibradas para cada locutor (baseado no hash do nome)
  const getSpeakerColors = (speakerName: string) => {
    // Paleta de cores harmoniosas com melhor equilíbrio e contraste
    const colorSchemes = [
      {
        name: 'blue',
        gradient: 'from-blue-500 via-blue-600 to-indigo-600',
        cardBg: 'bg-gradient-to-br from-slate-800/90 via-blue-900/80 to-slate-900/95 backdrop-blur-sm',
        border: 'border-blue-400/50 hover:border-blue-300/70',
        text: 'text-blue-50 font-semibold drop-shadow-lg',
        textSecondary: 'text-blue-200/90 font-medium',
        button: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300',
        miniPlayerBg: 'bg-gradient-to-r from-slate-800/80 to-blue-900/70 backdrop-blur-sm border border-blue-400/40',
        shadow: 'shadow-lg shadow-blue-500/25',
        glow: 'shadow-xl shadow-blue-500/40 hover:shadow-blue-400/60 transition-shadow duration-300',
        icon: 'text-blue-300/80',
        accent: 'bg-blue-500'
      },
      {
        name: 'emerald',
        gradient: 'from-emerald-500 via-teal-600 to-green-600',
        cardBg: 'bg-gradient-to-br from-slate-800/90 via-emerald-900/80 to-slate-900/95 backdrop-blur-sm',
        border: 'border-emerald-400/50 hover:border-emerald-300/70',
        text: 'text-emerald-50 font-semibold drop-shadow-lg',
        textSecondary: 'text-emerald-200/90 font-medium',
        button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-300',
        miniPlayerBg: 'bg-gradient-to-r from-slate-800/80 to-emerald-900/70 backdrop-blur-sm border border-emerald-400/40',
        shadow: 'shadow-lg shadow-emerald-500/25',
        glow: 'shadow-xl shadow-emerald-500/40 hover:shadow-emerald-400/60 transition-shadow duration-300',
        icon: 'text-emerald-300/80',
        accent: 'bg-emerald-500'
      },
      {
        name: 'purple',
        gradient: 'from-purple-500 via-violet-600 to-fuchsia-600',
        cardBg: 'bg-gradient-to-br from-slate-800/90 via-purple-900/80 to-slate-900/95 backdrop-blur-sm',
        border: 'border-purple-400/50 hover:border-purple-300/70',
        text: 'text-purple-50 font-semibold drop-shadow-lg',
        textSecondary: 'text-purple-200/90 font-medium',
        button: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 transform hover:scale-105 transition-all duration-300',
        miniPlayerBg: 'bg-gradient-to-r from-slate-800/80 to-purple-900/70 backdrop-blur-sm border border-purple-400/40',
        shadow: 'shadow-lg shadow-purple-500/25',
        glow: 'shadow-xl shadow-purple-500/40 hover:shadow-purple-400/60 transition-shadow duration-300',
        icon: 'text-purple-300/80',
        accent: 'bg-purple-500'
      },
      {
        name: 'orange',
        gradient: 'from-orange-500 via-amber-600 to-red-600',
        cardBg: 'bg-gradient-to-br from-slate-800/90 via-orange-900/80 to-slate-900/95 backdrop-blur-sm',
        border: 'border-orange-400/50 hover:border-orange-300/70',
        text: 'text-orange-50 font-semibold drop-shadow-lg',
        textSecondary: 'text-orange-200/90 font-medium',
        button: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 transform hover:scale-105 transition-all duration-300',
        miniPlayerBg: 'bg-gradient-to-r from-slate-800/80 to-orange-900/70 backdrop-blur-sm border border-orange-400/40',
        shadow: 'shadow-lg shadow-orange-500/25',
        glow: 'shadow-xl shadow-orange-500/40 hover:shadow-orange-400/60 transition-shadow duration-300',
        icon: 'text-orange-300/80',
        accent: 'bg-orange-500'
      },
      {
        name: 'cyan',
        gradient: 'from-cyan-500 via-sky-600 to-blue-600',
        cardBg: 'bg-gradient-to-br from-slate-800/90 via-cyan-900/80 to-slate-900/95 backdrop-blur-sm',
        border: 'border-cyan-400/50 hover:border-cyan-300/70',
        text: 'text-cyan-50 font-semibold drop-shadow-lg',
        textSecondary: 'text-cyan-200/90 font-medium',
        button: 'bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 transform hover:scale-105 transition-all duration-300',
        miniPlayerBg: 'bg-gradient-to-r from-slate-800/80 to-cyan-900/70 backdrop-blur-sm border border-cyan-400/40',
        shadow: 'shadow-lg shadow-cyan-500/25',
        glow: 'shadow-xl shadow-cyan-500/40 hover:shadow-cyan-400/60 transition-shadow duration-300',
        icon: 'text-cyan-300/80',
        accent: 'bg-cyan-500'
      },
      {
        name: 'rose',
        gradient: 'from-rose-500 via-pink-600 to-red-600',
        cardBg: 'bg-gradient-to-br from-slate-800/90 via-rose-900/80 to-slate-900/95 backdrop-blur-sm',
        border: 'border-rose-400/50 hover:border-rose-300/70',
        text: 'text-rose-50 font-semibold drop-shadow-lg',
        textSecondary: 'text-rose-200/90 font-medium',
        button: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300',
        miniPlayerBg: 'bg-gradient-to-r from-slate-800/80 to-rose-900/70 backdrop-blur-sm border border-rose-400/40',
        shadow: 'shadow-lg shadow-rose-500/25',
        glow: 'shadow-xl shadow-rose-500/40 hover:shadow-rose-400/60 transition-shadow duration-300',
        icon: 'text-rose-300/80',
        accent: 'bg-rose-500'
      }
    ];

    // Gera um hash simples baseado no nome do locutor para garantir consistência
    let hash = 0;
    for (let i = 0; i < speakerName.length; i++) {
      const char = speakerName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converte para 32bit integer
    }
    
    // Usa o hash para selecionar um esquema de cores de forma determinística mas aparentemente aleatória
    const colorIndex = Math.abs(hash) % colorSchemes.length;
    return colorSchemes[colorIndex];
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Removido o array de serviços hardcoded, agora virá do Supabase via `services` do hook `useLocalSiteData`

  // Função para obter a cor baseada no nome da cor
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'from-blue-500/20 to-blue-600/20',
          border: 'border-blue-400/30',
          hoverBorder: 'hover:border-blue-400/50',
          hoverBg: 'hover:bg-blue-500/30',
          iconBg: 'from-blue-400 to-blue-600',
          text: 'text-blue-400',
          label: 'text-blue-300',
          description: 'text-blue-200'
        };
      case 'green':
        return {
          bg: 'from-green-500/20 to-green-600/20',
          border: 'border-green-400/30',
          hoverBorder: 'hover:border-green-400/50',
          hoverBg: 'hover:bg-green-500/30',
          iconBg: 'from-green-400 to-green-600',
          text: 'text-green-400',
          label: 'text-green-300',
          description: 'text-green-200'
        };
      case 'purple':
        return {
          bg: 'from-purple-500/20 to-purple-600/20',
          border: 'border-purple-400/30',
          hoverBorder: 'hover:border-purple-400/50',
          hoverBg: 'hover:bg-purple-500/30',
          iconBg: 'from-purple-400 to-purple-600',
          text: 'text-purple-400',
          label: 'text-purple-300',
          description: 'text-purple-200'
        };
      case 'orange':
        return {
          bg: 'from-orange-500/20 to-orange-600/20',
          border: 'border-orange-400/30',
          hoverBorder: 'hover:border-orange-400/50',
          hoverBg: 'hover:bg-orange-500/30',
          iconBg: 'from-orange-400 to-orange-600',
          text: 'text-orange-400',
          label: 'text-orange-300',
          description: 'text-orange-200'
        };
      default:
        return {
          bg: 'from-blue-500/20 to-blue-600/20',
          border: 'border-blue-400/30',
          hoverBorder: 'hover:border-blue-400/50',
          hoverBg: 'hover:bg-blue-500/30',
          iconBg: 'from-blue-400 to-blue-600',
          text: 'text-blue-400',
          label: 'text-blue-300',
          description: 'text-blue-200'
        };
    }
  };

  // Gradiente estático para títulos de serviços (evita classes dinâmicas)
  const getServiceGradient = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'green': return 'from-green-500 to-green-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      case 'orange': return 'from-orange-500 to-orange-600';
      case 'red': return 'from-red-500 to-red-600';
      case 'yellow': return 'from-yellow-400 to-orange-500';
      case 'teal': return 'from-teal-500 to-teal-600';
      case 'cyan': return 'from-cyan-500 to-cyan-600';
      case 'indigo': return 'from-indigo-500 to-indigo-600';
      case 'violet': return 'from-violet-500 to-violet-600';
      case 'pink': return 'from-pink-500 to-rose-600';
      case 'slate': return 'from-slate-500 to-slate-600';
      case 'emerald': return 'from-emerald-500 to-emerald-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  // Lista de gradientes válidos e função para pegar um aleatório a cada render
  const SERVICE_GRADIENTS = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-red-500 to-red-600',
    'from-yellow-400 to-orange-500',
    'from-teal-500 to-teal-600',
    'from-cyan-500 to-cyan-600',
    'from-indigo-500 to-indigo-600',
    'from-violet-500 to-violet-600',
    'from-pink-500 to-rose-600',
    'from-slate-500 to-slate-600',
    'from-emerald-500 to-emerald-600',
  ];
  const getRandomServiceGradient = () => SERVICE_GRADIENTS[Math.floor(Math.random() * SERVICE_GRADIENTS.length)];

  if (loading || siteLoading) { // Adicionado siteLoading para esperar os dados do Supabase
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando portfólio..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      <ScrollToTop />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        {/* Imagem de fundo com blur suave e escala para cobrir bordas do blur */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${studioBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(3px)',
            transform: 'scale(1.04)',
            opacity: 0.28,
          }}
        />
        {/* Gradiente animado suave para harmonizar com a paleta */}
        <div className="absolute inset-0 bg-gradient-move opacity-55" />
        {/* Overlay de linhas/ondas mais visível para reduzir a imagem de fundo */}
        <div className="absolute inset-0" style={{backgroundImage: `url(${soundWaves})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.22}} />
        <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6 sm:mb-8 relative">
              <div className="mx-auto flex items-center justify-center mb-4 sm:mb-6">
                <img
                  src="/logo.png"
                  alt="Logo Offs Na Hora"
                  loading="lazy"
                  className="h-16 sm:h-20 md:h-24 w-auto drop-shadow-xl"
                />
              </div>
              {/* Anéis que crescem a partir do centro da logo */}
              <div className="hero-ring" aria-hidden="true" />
              <div className="hero-ring hero-ring--inner" aria-hidden="true" />
              <div className="hero-ring hero-ring--mid" aria-hidden="true" />
              <div className="hero-ring hero-ring--outer" aria-hidden="true" />
            </div>

            {/* Título removido para evitar repetição com o logo */}
            {/* Subtítulo removido para evitar repetição */}
            <Reveal delay={140}>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-blue-100 mb-6 sm:mb-8 leading-relaxed font-semibold px-2">
                Qualidade de estúdio • Entrega rápida • Atendimento ágil
              </p>
            </Reveal>
            
            <Reveal delay={220}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 cursor-pointer hover-float pressable cta-pulse"
                  aria-label="Solicitar orçamento - ir ao formulário de contato"
                  title="Solicitar orçamento"
                  onClick={() => { recordEvent('cta_contact_click'); scrollToSection("contact"); }}
                >
                  <Phone className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Solicitar Orçamento
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-blue-400 text-blue-300 hover:bg-blue-400/10 text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 cursor-pointer hover-float pressable cta-pulse"
                  aria-label="Ouvir Demonstrativos - ir para os áudios"
                  title="Ouvir Demonstrativos"
                  onClick={() => { recordEvent('cta_portfolio_click'); scrollToSection("portfolio"); }}
                >
                  <Music className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Ouvir Demonstrativos
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Portfolio Section - Primeira seção */}
      <section id="portfolio" className="py-12 sm:py-16 bg-slate-800/30">
        <div className="container mx-auto px-4">
          {/* Cards dos Locutores */}
          {selectedSpeaker === 'Todos' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {speakers.map((speaker, index) => {
                const colors = getSpeakerColors(speaker.name);
                return (
                  <Card 
                    key={speaker.name} 
                    className={`
                      ${colors.cardBg} 
                      border-2 ${colors.border} 
                      ${colors.glow} 
                      transition-all duration-300 
                      transform hover:scale-[1.02] 
                      hover:-translate-y-1 
                      group cursor-pointer
                      animate-fade-in-up
                      relative overflow-hidden
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => {
                      // Selecionar o locutor no formulário
                      setSpeakerInForm(speaker.name);
                      // Navegar para o formulário
                      const contactSection = document.getElementById('contact');
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                      }
                      recordEvent('speaker_selected', { speaker: speaker.name });
                    }}
                  >
                    <CardHeader className="relative overflow-hidden p-6">
                      {/* Background pattern decorativo */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                      </div>
                      
                      {/* Efeito de brilho animado */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <div className={`${colors.text} text-lg sm:text-xl md:text-2xl flex items-center gap-4 relative z-10 font-bold`}>
                        <div className={`
                          w-16 h-16 bg-gradient-to-br ${colors.gradient} 
                          rounded-2xl flex items-center justify-center 
                          ${colors.shadow} 
                          transform group-hover:rotate-6 group-hover:scale-110
                          transition-all duration-300
                          relative overflow-hidden
                          border-2 border-white/20
                        `}>
                          {/* Efeito de brilho no avatar */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <Mic className="w-8 h-8 text-white relative z-10" />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <div className={`${colors.text} group-hover:${colors.text} transition-colors duration-300 flex items-center gap-2`}>
                            {speaker.name}
                            <Star className={`w-4 h-4 ${colors.icon} opacity-80`} />
                          </div>
                          <div className={`text-sm ${colors.textSecondary} opacity-90 font-normal flex items-center gap-2`}>
                            <Radio className={`w-3 h-3 ${colors.icon}`} />
                            Locutor Profissional
                          </div>
                        </div>
                        {/* Botão Escolher este Locutor - Quadrado ao lado com texto */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Usar o contexto para selecionar o locutor no formulário
                              setSpeakerInForm(speaker.name);
                              // Navegar para o formulário
                              const contactSection = document.getElementById('contact');
                              if (contactSection) {
                                contactSection.scrollIntoView({ behavior: 'smooth' });
                              }
                              recordEvent('speaker_selected', { speaker: speaker.name });
                            }}
                            size="sm"
                            className={`
                              w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 
                              hover:from-green-600 hover:to-emerald-700 
                              text-white rounded-xl p-0
                              font-semibold text-xs 
                              transform transition-all duration-300 
                              hover:scale-105 hover:shadow-lg 
                              active:scale-95
                              relative overflow-hidden
                              group/select
                              border border-white/10
                              flex items-center justify-center
                            `}
                          >
                            {/* Efeito de brilho no botão */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/select:translate-x-full transition-transform duration-700"></div>
                            
                            <Users className="h-5 w-5 relative z-10" />
                          </Button>
                          <span className={`text-xs ${colors.textSecondary} text-center leading-tight`}>
                            Escolher
                          </span>
                        </div>
                      </div>
                      
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Mini Player - único demostrativo */}
                      {speaker.audios && speaker.audios[0] ? (
                        <div 
                          key={speaker.audios[0].id} 
                          className={`
                            ${colors.miniPlayerBg} 
                            rounded-xl p-4 
                            border border-white/10 
                            hover:border-white/20 
                            transition-all duration-300 
                            hover:transform hover:scale-[1.02]
                            animate-fade-in-up
                            relative overflow-hidden
                            group/mini
                          `}
                          style={{ animationDelay: `${index * 120}ms` }}
                        >
                          {/* Efeito de onda sonora decorativo */}
                          <div className="absolute top-1 right-2 opacity-10 group-hover/mini:opacity-20 transition-opacity duration-300">
                            <Music className="h-4 w-4 text-white" />
                          </div>
                          
                          <MiniAudioPlayer 
                            audioFile={speaker.audios[0].fileName}
                            fileUrl={speaker.audios[0].file_url}
                            title={speaker.audios[0].title}
                            colorScheme={
                              getSpeakerColors(speaker.name).name === 'emerald' ? 'green' :
                              getSpeakerColors(speaker.name).name === 'rose' ? 'purple' :
                              getSpeakerColors(speaker.name).name as 'blue' | 'green' | 'purple' | 'orange' | 'cyan'
                            }
                            hideTitle
                            waveVariant="minimal"
                            waveSize="xs"
                          />
                        </div>
                      ) : (
                        <div className="text-blue-200 text-sm">Nenhum demonstrativo disponível.</div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <>
              {/* Botão Voltar */}
              <div className="mb-6">
                <Button
                  onClick={() => {
                    setSelectedSpeaker('Todos');
                    const allAudios = speakers.flatMap(speaker => speaker.audios);
                    setDisplayedAudios(allAudios.slice(0, displayedCount));
                  }}
                  variant="outline"
                  className="border-blue-400 text-blue-300 hover:bg-blue-400/10"
                >
                  ← Voltar para Todos os Locutores
                </Button>
              </div>

              {/* Título do Locutor Selecionado */}
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                  Áudios de {selectedSpeaker}
                </h3>
                {/* Removido contador de áudios para simplificar a visualização */}
                
                {/* Botão para Escolher este Locutor */}
                <Button
                  onClick={() => {
                    // Usar o contexto para selecionar o locutor no formulário
                    setSpeakerInForm(selectedSpeaker);
                    // Navegar para o formulário
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    recordEvent('speaker_selected', { speaker: selectedSpeaker });
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 relative overflow-hidden group/select border border-white/10"
                >
                  {/* Efeito de brilho no botão */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/select:translate-x-full transition-transform duration-700"></div>
                  
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Users className="h-4 w-4" />
                    Escolher {selectedSpeaker}
                  </span>
                </Button>
              </div>

              {/* Grid de Áudios do Locutor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedAudios.slice(0, 1).map((audio) => (
                  <PublicAudioPlayer 
                    key={audio.id}
                    audioFile={audio.fileName} 
                    fileUrl={audio.file_url} 
                    compact
                    extraCompact
                    title={audio.title}
                    description={undefined}
                    hideTitle
                  />
                ))}
              </div>

              {/* Removido botão de ver todos os áudios para manter um demonstrativo único */}
            </>
          )}
        </div>
      </section>

      {/* About Section - Segunda seção */}
      <section id="about" className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Nossa História - Centralizada */}
            <div className="text-center mb-16 sm:mb-20">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 rounded-3xl p-8 sm:p-12 lg:p-16">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8">Nossa História</h3>
                <p className="text-blue-200 text-base sm:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto">
                  O Offs na Hora nasceu com um propósito claro: tornar o processo de gravação de offs rápido, profissional e acessível 
                  para todos que trabalham com comunicação. Sabemos que, no ritmo acelerado do rádio, da publicidade e da produção de conteúdo, 
                  agilidade e qualidade fazem toda a diferença. Por isso, criamos uma plataforma onde você pode solicitar gravações de voz profissionais 
                  de forma prática e segura, sem burocracia e com entrega rápida — tudo 100% online. Nosso compromisso é oferecer voz, emoção e presença, 
                  entregues com a eficiência que o seu projeto precisa. <strong className="text-blue-100">Offs na Hora — sua voz, pronta quando você precisa.</strong>
                </p>
              </div>
            </div>

            {/* Diferenciais - Grid centralizado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-6 sm:p-8 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <Award className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-white font-semibold text-lg sm:text-xl mb-3">Qualidade Garantida</h4>
                <p className="text-green-200 text-sm sm:text-base">Áudio profissional com equipamentos de alta qualidade</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-6 sm:p-8 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <Wrench className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-white font-semibold text-lg sm:text-xl mb-3">Entrega Rápida</h4>
                <p className="text-purple-200 text-sm sm:text-base">Prazos respeitados e entregas no tempo combinado</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-6 sm:p-8 text-center sm:col-span-2 lg:col-span-1 hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-white font-semibold text-lg sm:text-xl mb-3">Atendimento Personalizado</h4>
                <p className="text-blue-200 text-sm sm:text-base">Cada projeto é único e tratado com dedicação</p>
              </div>
            </div>
            
            {/* Nossos Serviços Detalhados */}
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 sm:mb-12">
                Nossos Serviços Detalhados
              </h3>
              <p className="text-base sm:text-lg md:text-xl text-blue-200 max-w-5xl mx-auto">
                🎯 Se você quer que sua empresa tenha mais visibilidade, atinja novos públicos e conquiste resultados concretos, fale com a gente! 
                Vamos juntos descobrir a melhor forma de destacar o seu negócio no mercado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 xl:gap-14">
              {/* Produção de Áudio Profissional */}
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-400/30 rounded-3xl p-8 md:p-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-white">Produção de Áudio Profissional</h4>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-900/30 rounded-lg p-4">
                    <h5 className="text-blue-300 font-semibold mb-2">🎙️ Locução e Produção Especializada</h5>
                    <p className="text-blue-100 text-sm">
                      Procura por edição e produção de áudio com locutor e produtor especializados? Trabalhamos com som de rua, 
                      podcasts, rádios, TV, agências de publicidade, empresas, rádios corporativas, narrações de documentários, 
                      notícias, programas, projetos e muito mais.
                    </p>
                  </div>
                  <div className="bg-blue-900/30 rounded-lg p-4">
                    <h5 className="text-blue-300 font-semibold mb-2">🏪 Som para Lojas e Comércios</h5>
                    <p className="text-blue-100 text-sm">
                      Sua loja ou comércio precisa vender mais? Criamos e produzimos o som ideal para seu porta de loja, 
                      com programação completa, incluindo falas e músicas. Basta apenas colocar para tocar e atrair novos clientes!
                    </p>
                  </div>
                  <div className="bg-blue-900/30 rounded-lg p-4">
                    <h5 className="text-blue-300 font-semibold mb-2">📻 Serviços para Emissoras</h5>
                    <p className="text-blue-100 text-sm">
                      Precisa de uma voz diferente para os projetos de sua emissora? Produzimos, gravamos e editamos desde notícias, 
                      comerciais e programas, até conteúdos para folguistas, com edições e produções de áudio de alta qualidade.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rádios Corporativas */}
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-400/30 rounded-3xl p-8 md:p-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <Radio className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-white">Rádios Corporativas e Personalizadas</h4>
                </div>
                <div className="space-y-4">
                  <div className="bg-purple-900/30 rounded-lg p-4">
                    <h5 className="text-purple-300 font-semibold mb-2">🏢 Rádio Personalizada para sua Marca</h5>
                    <p className="text-purple-100 text-sm">
                      Sua empresa, marca ou produto precisa estar sempre em destaque, certo? Venda muito mais criando uma rádio 
                      personalizada para sua marca! Atraia mais atenção com uma rádio corporativa, ou uma rádio própria para sua 
                      empresa, escola, hospital, consultório ou qualquer área de serviços.
                    </p>
                  </div>
                  <div className="bg-purple-900/30 rounded-lg p-4">
                    <h5 className="text-purple-300 font-semibold mb-2">🎵 Acervo Musical Completo</h5>
                    <p className="text-purple-100 text-sm">
                      Cansado das mesmas músicas? Temos o maior acervo de músicas de todos os estilos para agradar a todos os gostos! 
                      Recarregue seu cartão de memória ou pen drive com suas músicas preferidas. Faça sua lista de faixas e traga para a gente!
                    </p>
                  </div>
                  <div className="bg-purple-900/30 rounded-lg p-4">
                    <h5 className="text-purple-300 font-semibold mb-2">🔄 Serviço de Locução Folguista</h5>
                    <p className="text-purple-100 text-sm">
                      Sua rádio está com dificuldade para conceder férias à equipe? Oferecemos serviço de locução folguista, 
                      com programas produzidos no estilo "ao vivo", especialmente para a sua emissora, mantendo a identidade da sua rádio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Marketing e Comunicação */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-400/30 rounded-3xl p-8 md:p-10 md:col-span-2 xl:col-span-1 xl:row-span-2">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-white">Marketing e Comunicação</h4>
                </div>
                <div className="space-y-4">
                  <div className="bg-green-900/30 rounded-lg p-4">
                    <h5 className="text-green-300 font-semibold mb-2">📈 Estratégias de Comunicação</h5>
                    <p className="text-green-100 text-sm">
                      Estúdio Rones Carvalho e DM Impulse Digital — comunicação criativa, estratégica e com resultados reais. 
                      Desenvolvemos estratégias personalizadas para destacar seu negócio no mercado.
                    </p>
                  </div>
                  <div className="bg-green-900/30 rounded-lg p-4">
                    <h5 className="text-green-300 font-semibold mb-2">🛍️ Som de Rua Personalizado</h5>
                    <p className="text-green-100 text-sm">
                      Oferecemos serviços de locução no estilo "ao vivo", com playlist musical personalizada para você colocar 
                      na frente da sua loja ou comércio. Essa estratégia chama a atenção dos clientes, atrai mais público e aumenta suas vendas!
                    </p>
                  </div>
                  <div className="bg-green-900/30 rounded-lg p-4">
                    <h5 className="text-green-300 font-semibold mb-2">🎯 Gravação para Aumentar Vendas</h5>
                    <p className="text-green-100 text-sm">
                      No Estúdio Carvalho, oferecemos gravação e produção de áudio personalizado, com chamadas impactantes 
                      e som de rua, para ajudar sua empresa a vender mais e potencializar suas vendas.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - DESABILITADO TEMPORARIAMENTE */}
      {/* <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-800/60 via-blue-900/40 to-slate-800/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-purple-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-1/4 w-24 h-24 bg-green-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Números que Falam por Si
            </h2>
            <p className="text-blue-200 text-lg">
              Resultados que comprovam nossa excelência
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {statistics.map((statistic) => {
              const colors = getColorClasses(statistic.color);
              return (
                <div key={statistic.id} className="group relative stats-card">
                  <div className={`bg-gradient-to-br ${colors.bg} backdrop-blur-sm border ${colors.border} rounded-2xl p-6 sm:p-8 ${colors.hoverBorder} ${colors.hoverBg} transition-all duration-500 hover:scale-105`}>
                    <div className={`absolute top-0 right-0 w-16 h-16 bg-${statistic.color}-400/20 rounded-full blur-xl group-hover:bg-${statistic.color}-400/30 transition-all duration-500 stats-glow`}></div>
                    <div className="relative z-10 text-center">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gradient-to-br ${colors.iconBg} rounded-full flex items-center justify-center shadow-lg stats-icon`}>
                        <Music className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div className="mb-2">
                        <span className={`text-sm sm:text-base font-medium ${colors.label}`}>{statistic.suffix}</span>
                        <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${colors.text}`}>
                          <AnimatedCounter end={statistic.value} className="inline" />
                        </div>
                      </div>
                      <p className={`${colors.description} text-sm sm:text-base font-medium`}>{statistic.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section> */}

      {/* Serviços */}
      <section id="services" className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Serviços</h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80">Categorias oferecidas em locução e produção</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 auto-rows-fr">
            {prioritizedServices.map((service: any) => {
              const getGradientForTitle = (title: string) => {
                const t = (title || '').toLowerCase();
                const map: { keys: string[]; gradient: string }[] = [
                  { keys: ['rádio','emissora','tv'], gradient: 'from-indigo-500 to-blue-600' },
                  { keys: ['social','instagram','rede','conteúdo'], gradient: 'from-pink-500 to-rose-600' },
                  { keys: ['documentário','cinema','vídeo'], gradient: 'from-purple-500 to-violet-600' },
                  { keys: ['campanha','promoções','marketing','projeto'], gradient: 'from-emerald-500 to-teal-600' },
                  { keys: ['notícia','jornal'], gradient: 'from-orange-500 to-red-600' },
                  { keys: ['podcast'], gradient: 'from-cyan-500 to-sky-600' },
                  { keys: ['corporativa','empresa','institucional'], gradient: 'from-blue-500 to-indigo-600' },
                  { keys: ['espera telefônica','ura'], gradient: 'from-yellow-400 to-amber-500' },
                ];
                for (const m of map) {
                  if (m.keys.some(k => t.includes(k))) return m.gradient;
                }
                const SERVICE_GRADIENTS = [
                  'from-blue-500 to-blue-600','from-green-500 to-green-600','from-purple-500 to-purple-600',
                  'from-orange-500 to-orange-600','from-red-500 to-red-600','from-yellow-400 to-orange-500',
                  'from-teal-500 to-teal-600','from-cyan-500 to-cyan-600','from-indigo-500 to-indigo-600',
                  'from-violet-500 to-violet-600','from-pink-500 to-rose-600','from-slate-500 to-slate-600','from-emerald-500 to-emerald-600'];
                let hash = 0; for (let i = 0; i < t.length; i++) hash = (hash * 31 + t.charCodeAt(i)) >>> 0;
                return SERVICE_GRADIENTS[hash % SERVICE_GRADIENTS.length];
              };
              const serviceColorClass = getGradientForTitle(service.title || '');
              const theme = (() => {
                const g = serviceColorClass || '';
                if (g.includes('emerald') || g.includes('teal') || g.includes('green')) {
                  return { border: 'border-emerald-400/50 hover:border-emerald-300/70', glow: 'shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/50' };
                }
                if (g.includes('indigo') || g.includes('blue') || g.includes('cyan')) {
                  return { border: 'border-blue-400/50 hover:border-blue-300/70', glow: 'shadow-lg shadow-blue-500/25 hover:shadow-blue-400/50' };
                }
                if (g.includes('violet') || g.includes('purple')) {
                  return { border: 'border-violet-400/50 hover:border-violet-300/70', glow: 'shadow-lg shadow-violet-500/25 hover:shadow-violet-400/50' };
                }
                if (g.includes('pink') || g.includes('rose')) {
                  return { border: 'border-pink-400/50 hover:border-pink-300/70', glow: 'shadow-lg shadow-pink-500/25 hover:shadow-pink-400/50' };
                }
                if (g.includes('orange') || g.includes('amber') || g.includes('red') || g.includes('yellow')) {
                  return { border: 'border-orange-400/50 hover:border-orange-300/70', glow: 'shadow-lg shadow-orange-500/25 hover:shadow-orange-400/50' };
                }
                return { border: 'border-slate-400/50 hover:border-slate-300/70', glow: 'shadow-lg shadow-slate-500/25 hover:shadow-slate-400/50' };
              })();
              const themeOverlayAndText = (() => {
                const g = serviceColorClass || '';
                if (g.includes('emerald') || g.includes('teal') || g.includes('green')) {
                  return { bg: 'from-emerald-500/10 to-teal-600/10', text: 'text-emerald-200' };
                }
                if (g.includes('indigo') || g.includes('blue') || g.includes('cyan')) {
                  return { bg: 'from-blue-500/10 to-indigo-600/10', text: 'text-blue-200' };
                }
                if (g.includes('violet') || g.includes('purple')) {
                  return { bg: 'from-violet-500/10 to-purple-600/10', text: 'text-violet-200' };
                }
                if (g.includes('pink') || g.includes('rose')) {
                  return { bg: 'from-pink-500/10 to-rose-600/10', text: 'text-pink-200' };
                }
                if (g.includes('orange') || g.includes('amber') || g.includes('red') || g.includes('yellow')) {
                  return { bg: 'from-orange-500/10 to-red-600/10', text: 'text-orange-200' };
                }
                return { bg: 'from-slate-500/10 to-slate-700/10', text: 'text-slate-200' };
              })();
              const isBest = !!service.is_best_seller;
              const isRec = !!service.is_recommended;
              const titleLen = (service.title || '').length;
              const badgeSizeClass = titleLen > 28 ? 'text-[10px]' : titleLen > 18 ? 'text-[11px]' : 'text-[12px]';
              const badgePadXClass = titleLen > 28 ? 'px-1.5' : titleLen > 18 ? 'px-2' : 'px-2.5';
              return (
                <HoverCard key={service.id} openDelay={150} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <Card
                      onClick={() => {
                        recordEvent('service_card_click', { title: service.title });
                        window.dispatchEvent(new CustomEvent('selectService', { detail: service.title }));
                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e.currentTarget as HTMLElement).click(); }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Selecionar serviço ${service.title}`}
                      className={cn(
                        "relative bg-transparent",
                        "border", theme.border,
                        "transition-all duration-200",
                        "cursor-pointer group overflow-visible",
                        "flex items-center justify-center",
                        "min-h-[64px] sm:min-h-[80px] md:min-h-[96px]"
                      )}
                    >
                      {/* Fundo temático sutil alinhado aos cards de locutores */}
                      <div className={cn("absolute inset-0 bg-gradient-to-br", themeOverlayAndText.bg)} />
                      {(isBest || isRec) && (
                        <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 md:-top-4 md:-right-4 z-20 flex gap-2 pointer-events-none">
                          {isBest && (
                            <div className="relative">
                              <div className="absolute inset-0 -z-10 blur-md opacity-70 animate-badge-pulse bg-yellow-300/20 rounded-md" />
                              <div className={`bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 font-bold rounded-md shadow ring-1 ring-white/40 animate-float-slow whitespace-nowrap ${badgeSizeClass} ${badgePadXClass} py-1`}>
                                Mais Vendido
                              </div>
                            </div>
                          )}
                          {isRec && (
                            <div className="relative">
                              <div className="absolute inset-0 -z-10 blur-md opacity-70 animate-badge-pulse bg-indigo-300/20 rounded-md" />
                              <div className={`bg-gradient-to-r from-indigo-400 to-violet-500 text-white font-bold rounded-md shadow ring-1 ring-white/40 animate-float-slow whitespace-nowrap ${badgeSizeClass} ${badgePadXClass} py-1`}>
                                Recomendado
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <CardHeader className="text-center p-2 sm:p-3 relative z-10">
                        <CardTitle className={cn(
                          "text-base sm:text-lg md:text-xl font-semibold",
                          "text-white"
                        )}>
                          {service.title}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </HoverCardTrigger>
                </HoverCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section - DESABILITADO TEMPORARIAMENTE */}
      {/* <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">O que dizem sobre meu trabalho</h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-200">Depoimentos de clientes satisfeitos</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {clients.map((client) => (
              <Card key={client.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-blue-200 mb-4 italic text-xs sm:text-sm md:text-base">"{client.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">{client.name}</p>
                      <p className="text-blue-300 text-xs sm:text-sm">Cliente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Peça seu off agora mesmo!</h2>
            <p className="text-xl text-blue-200">Preencha o formulário abaixo para receber seu orçamento personalizado</p>
          </div>
          {/* Lista de serviços removida para reduzir poluição visual */}
          
          <div className="max-w-2xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <img
                  src="/logo.png"
                  alt="Logo Offs Na Hora"
                  loading="lazy"
                  className="h-10 w-auto drop-shadow-md"
                />
                <div>
                  <h3 className="text-xl font-semibold text-white">Offs Na Hora</h3>
                  {/* Texto repetitivo removido: Locução Profissional */}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <a href={`mailto:${configs.email || 'contato@offsnahora.com.br'}`} className="flex items-center text-blue-300 hover:text-blue-400 transition-colors">
                <Mail className="h-5 w-5 mr-2" />
              <span className="text-sm">{configs.email || 'contato@offsnahora.com.br'}</span>
              </a>
            {(() => {
              const whatsappDigits = ('17991598169').replace(/[^\d]/g, '');
              const formatted = formatBrPhone(whatsappDigits);
              return (
                <a href={`https://wa.me/${whatsappDigits}`} className="flex items-center text-green-300 hover:text-green-400 transition-colors">
                  <Phone className="h-5 w-5 mr-2" />
                  <span className="text-sm">{formatted}</span>
                </a>
              );
            })()}
              {configs.instagram_url && (
                <a href={configs.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-pink-300 hover:text-pink-400 transition-colors">
                  <Instagram className="h-5 w-5 mr-2" />
                  <span className="text-sm">Instagram</span>
                </a>
              )}
            </div>
          </div>
          
          <div className="text-center mt-8 pt-8 border-t border-white/10">
            <p className="text-blue-200">&copy; 2025 Offs Na Hora. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
  // formatBrPhone movida para utilitário compartilhado