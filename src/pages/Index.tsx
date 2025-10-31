import { Phone, Instagram, Mail, Mic, Radio, Building, Users, Wrench, ArrowDown, Star, Award, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import PublicAudioPlayer from "@/components/PublicAudioPlayer";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import AnimatedCounter from "@/components/AnimatedCounter";
import ScrollToTop from "@/components/ScrollToTop";
import AudioWaveIcon from "@/components/AudioWaveIcon";
import { useLocalSiteData } from "@/hooks/useLocalSiteData";
import { getAudiosForPortfolio, getTotalAudiosCount } from "@/utils/audioSync";
import studioBackground from "@/assets/studio-background.jpg";
import soundWaves from "@/assets/sound-waves.jpg";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import * as LucideIcons from 'lucide-react';
// Mapeamento de nomes de ícones para componentes Lucide React
const iconMap = Object.keys(LucideIcons).reduce((acc, key) => {
  const IconComponent = (LucideIcons as any)[key];
  if (typeof IconComponent === 'function' && IconComponent.displayName !== 'createLucideIcon') {
    (acc as any)[key] = IconComponent;
  }
  return acc;
}, {} as Record<string, any>);

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

// Lista de gradientes válidos e função que retorna um aleatório a cada render
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

const Index = () => {
  const { texts, audios, configs, clients, loading, services: dynamicServices } = useLocalSiteData();
  const [displayedAudios, setDisplayedAudios] = useState<any[]>([]);
  const [displayedCount, setDisplayedCount] = useState(6); // Mudança: começar com 6 áudios
  const [totalAudiosCount, setTotalAudiosCount] = useState(0);

  // Carregar áudios do portfólio quando os áudios mudarem
  useEffect(() => {
    const portfolioAudios = getAudiosForPortfolio(displayedCount);
    const totalCount = getTotalAudiosCount();
    setDisplayedAudios(portfolioAudios);
    setTotalAudiosCount(totalCount);
  }, [audios, displayedCount]);

  // Função para mostrar mais áudios
  const handleShowMore = () => {
    const newCount = Math.min(displayedCount + 6, totalAudiosCount);
    setDisplayedCount(newCount);
  };

  const services = [
    { icon: Wrench, title: "Gravação e Produção Personalizada", description: "Serviço completo de gravação e produção de áudio sob medida.", color: "from-orange-500 to-orange-600" },
    { icon: Mic, title: "Chamadas Impactantes", description: "Produção de chamadas promocionais e institucionais com impacto.", color: "from-purple-500 to-purple-600" },
    { icon: Radio, title: "Som de Rua", description: "Locução e captação para som de rua, alto impacto local.", color: "from-blue-500 to-blue-600" },
    { icon: Mic, title: "Podcasts", description: "Locução e produção para podcasts e séries de áudio.", color: "from-indigo-500 to-indigo-600" },
    { icon: Radio, title: "Rádios", description: "Locuções para emissoras e programações diárias.", color: "from-blue-600 to-blue-700" },
    { icon: Award, title: "TV", description: "Locuções para peças e chamadas de televisão.", color: "from-yellow-500 to-orange-500" },
    { icon: Building, title: "Agências de Publicidade", description: "Gravações e spots sob demanda para agências.", color: "from-pink-500 to-rose-600" },
    { icon: Users, title: "Empresas", description: "Locuções corporativas e institucionais.", color: "from-teal-500 to-teal-600" },
    { icon: Radio, title: "Rádios Corporativas", description: "Locução para rádios internas e comunicação corporativa.", color: "from-cyan-500 to-cyan-600" },
    { icon: Mic, title: "Narrações de Documentários", description: "Narrações para documentários e conteúdos audiovisuais.", color: "from-slate-500 to-slate-600" },
    { icon: Mic, title: "Notícias", description: "Leitura e produção de boletins informativos.", color: "from-red-500 to-red-600" },
    { icon: Radio, title: "Programas", description: "Apresentação e chamadas para programas diversos.", color: "from-violet-500 to-violet-600" },
    { icon: Wrench, title: "Projetos", description: "Produção de áudio personalizada para projetos especiais.", color: "from-emerald-500 to-emerald-600" },
    { icon: Phone, title: "Espera Telefônica (URA)", description: "Mensagens profissionais para URA e atendimento automático.", color: "from-green-500 to-green-600" },
  ];

  if (loading) {
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
      <section className="relative overflow-hidden pt-16" style={{backgroundImage: `url(${studioBackground})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-gradient-move opacity-90" />
        <div className="absolute inset-0" style={{backgroundImage: `url(${soundWaves})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3}} />
        <div className="container mx-auto px-4 py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 relative">
              <div className="w-32 h-32 mx-auto flex items-center justify-center mb-6">
                <AudioWaveIcon size="lg" className="animate-pulse" />
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-blue-400/30 rounded-full animate-ping" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-blue-400/20 rounded-full animate-pulse" />
            </div>
            
            <Reveal>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Offs Na Hora
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-300 mb-6">
                Locução Profissional
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed font-semibold">
                OFFS NA HORA • QUALIDADE GARANTIDA • ENTREGA RÁPIDA
              </p>
            </Reveal>
            
            {/* CTA Buttons */}
            <Reveal delay={220}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300 shadow-xl hover-float pressable cta-pulse"
              >
                <Mic className="mr-2 h-6 w-6" />
                Solicitar Orçamento
              </Button>
              <Button
                onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white border border-slate-600 px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300 shadow-xl hover-float pressable cta-pulse"
              >
                <ArrowDown className="mr-2 h-6 w-6" />
                Ver Portfólio
              </Button>
            </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {texts['portfolio-title'] || 'Portfólio de Locuções'}
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Confira uma seleção dos melhores trabalhos realizados para rádios, eventos e projetos comerciais
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
            {displayedAudios.length > 0 ? (
              displayedAudios.map((audio) => (
                <PublicAudioPlayer
                  key={audio.id}
                  title={audio.title}
                  fileName={audio.fileName}
                  description={audio.description || undefined}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                  <Music className="h-16 w-16 mx-auto mb-4 text-blue-300" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhum áudio carregado
                  </h3>
                  <p className="text-blue-200 mb-4">
                    Os áudios serão carregados automaticamente quando o servidor estiver disponível.
                  </p>
                  <p className="text-sm text-blue-300">
                    Verifique se o servidor está rodando e tente recarregar a página.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Botão Ver Mais */}
          {displayedCount < totalAudiosCount && (
            <div className="text-center">
              <Button 
                onClick={handleShowMore}
                variant="outline" 
                className="border-blue-400 text-blue-300 hover:bg-blue-400/10 text-lg px-8 py-3"
              >
                <ArrowDown className="mr-2 h-5 w-5" />
                Ver Mais ({totalAudiosCount - displayedCount} áudios restantes)
              </Button>
            </div>
          )}
          
          {/* Google Drive Link */}
          <div className="text-center mt-12">
            <Button 
              onClick={() => window.open(configs['google_drive_link'] || 'https://drive.google.com/drive/folders/18aPWiGwGPA99nwVsEp9gGGAslCzFvFq8', '_blank')}
              variant="outline" 
              className="border-green-400 text-green-300 hover:bg-green-400/10 text-lg px-8 py-3"
            >
              <Building className="mr-2 h-5 w-5" />
              Veja Outras Locuções no Google Drive
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {texts['about-title'] || 'Sobre o locutor'}
              </h2>
              <p className="text-xl text-blue-200 max-w-3xl mx-auto">
                Conheça um pouco mais sobre minha trajetória e paixão pela locução
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left space-y-6">
                <p className="text-lg text-blue-100 leading-relaxed uppercase font-medium">
                  {texts['about-content'] || 'MUITO PRAZER, MEU NOME É ARTUR SUTTO, UM JOVEM QUE AMA O RÁDIO, A COMUNICAÇÃO, E TODO ESSE UNIVERSO. SEMPRE BUSCANDO COLABORAR CADA VEZ MAIS COM ESSE MEIO DE COMUNICAÇÃO TÃO FANTÁSTICO, ESTAMOS TRAZENDO MAIS UMA OPÇÃO DE SERVIÇO DE GRAVAÇÕES DE OFFS PARA VOCÊS, NOSSOS TÃO AMADOS E IMPORTANTES CLIENTES. SEJAM BEM-VINDOS AO OFFS NA HORA.'}
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      <AnimatedCounter end={100} suffix="+" />
                    </div>
                    <div className="text-sm text-blue-200">Projetos Realizados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      <AnimatedCounter end={50} suffix="+" />
                    </div>
                    <div className="text-sm text-blue-200">Clientes Satisfeitos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">24h</div>
                    <div className="text-sm text-blue-200">Prazo de Entrega</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <img 
                    src={configs['profile_image'] || "https://i.imgur.com/5H6o9S0.jpeg"} 
                    alt="Offs Na Hora - Locução Profissional" 
                    className="rounded-2xl shadow-2xl max-w-sm w-full h-auto border-4 border-white/20 transform hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Profissional
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {texts['services-title'] || 'Serviços'}
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Ofereço uma ampla gama de serviços de locução profissional para atender suas necessidades
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {dynamicServices.map((service) => {
              const serviceColorClass = getRandomServiceGradient();
              return (
                <HoverCard key={service.id} openDelay={150} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <Card
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('selectService', { detail: service.title }));
                        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={cn(
                        "bg-slate-900/80 border-slate-800 shadow-xl hover:border-slate-700 transition-all duration-300", 
                        "hover:shadow-lg hover:shadow-blue-500/10"
                      )}
                    >
                      <CardHeader>
                        <CardTitle className={cn(
                          "text-xl font-bold mt-3",
                          "bg-gradient-to-br",
                          serviceColorClass,
                          "bg-clip-text text-transparent"
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {texts['testimonials-title'] || 'O que dizem sobre meu trabalho'}
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Depoimentos de clientes satisfeitos com a qualidade do meu trabalho
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {clients.map((client) => (
              <Card key={client.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 hover:border-slate-600 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-bold">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{client.name}</h3>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-blue-200 mb-4 italic text-xs sm:text-sm md:text-base">"{client.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {texts['cta-title'] || 'Peça seu off agora mesmo!'}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {texts['cta-subtitle'] || 'Preencha o formulário abaixo para receber seu orçamento personalizado'}
            </p>
          </div>
          {/* Lista de serviços removida para reduzir poluição visual */}
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900/50 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-blue-400/30 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Offs Na Hora</h3>
                  <p className="text-blue-100">Locução Profissional</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <a 
                href={`mailto:${configs['email'] || 'ARTURSCURCIATTO@gmail.com'}`}
                className="text-blue-100 hover:text-white transition-colors flex items-center group"
              >
                <Mail className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                {configs['email'] || 'ARTURSCURCIATTO@gmail.com'}
              </a>
              
              <div className="flex space-x-4">
                {configs['instagram_url'] && (
                  <a 
                    href={configs['instagram_url']}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-100 hover:text-white transition-colors hover:scale-110 transform"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
                <a 
                  href={`https://wa.me/${configs['whatsapp_number']?.replace(/[^\d]/g, '') || '5517981925660'}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-white transition-colors hover:scale-110 transform"
                >
                  <Phone className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-8 border-t border-white/10">
            <p className="text-blue-100/70">
              © 2024 Offs Na Hora. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;