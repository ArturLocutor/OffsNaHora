
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Send, CheckCircle, User } from "lucide-react";
import { useLocalSiteData } from "@/hooks/useLocalSiteData";
import { useSpeaker } from "@/contexts/SpeakerContext";
import { recordEvent } from "../utils/metrics";
import { getAvailableSpeakers } from "@/utils/publicAudioManager";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    locationType: '',
    duration: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { services } = useLocalSiteData();
  const { selectedSpeaker, setSelectedSpeaker } = useSpeaker();
  const [availableSpeakers, setAvailableSpeakers] = useState<string[]>(['Todos']);

  // Carregar locutores disponíveis dinamicamente
  useEffect(() => {
    const loadSpeakers = async () => {
      try {
        const speakers = await getAvailableSpeakers();
        setAvailableSpeakers(['Todos', ...speakers]);
      } catch (error) {
        console.error('Erro ao carregar locutores:', error);
        // Fallback para lista estática
        setAvailableSpeakers(['Todos', 'Locutor Principal', 'João Silva']);
      }
    };
    
    loadSpeakers();
  }, []);

  useEffect(() => {
    const handleSelectService = (e: any) => {
      const selectedTitle = e?.detail as string;
      if (selectedTitle) {
        setFormData(prev => ({ ...prev, locationType: selectedTitle }));
      }
    };
    window.addEventListener('selectService', handleSelectService as any);
    return () => window.removeEventListener('selectService', handleSelectService as any);
  }, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWhatsAppContact = async () => {
    setIsSubmitting(true);
    
    // Simular delay para melhor UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const message = `*SOLICITAÇÃO DE ORÇAMENTO - ARTUR SUTTO*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*INFORMAÇÕES DO CLIENTE*
• Nome: ${formData.name}
• Email: ${formData.email}

*DETALHES DO PROJETO*
• Serviço: ${formData.locationType}
• Duração estimada: ${formData.duration}
${selectedSpeaker && selectedSpeaker !== 'Todos' ? `• Locutor preferido: ${selectedSpeaker}` : ''}

*DESCRIÇÃO DO PROJETO*
${formData.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aguardo seu retorno com o orçamento personalizado!

*Offs na Hora - Qualidade Garantida*`;

    const encodedMessage = encodeURIComponent(message);
    recordEvent('whatsapp_contact_sent', { service: formData.locationType, duration: formData.duration });
    window.open(`https://wa.me/5517981925660?text=${encodedMessage}`, "_blank");
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        locationType: '',
        duration: '',
        description: ''
      });
      setShowSuccess(false);
    }, 3000);
  };

  const isFormValid = formData.name && formData.email && formData.locationType && formData.duration && formData.description;

  return (
    <div className="relative">
      <Card className="bg-gradient-to-br from-slate-950/90 to-slate-900/80 backdrop-blur-sm border border-slate-800 max-w-2xl mx-auto hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Phone className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-white text-3xl font-bold">
            Solicitar Orçamento
          </CardTitle>
          <CardDescription className="text-slate-200 text-lg mt-2">
            Preencha as informações abaixo para receber seu orçamento personalizado
          </CardDescription>
          {selectedSpeaker && selectedSpeaker !== 'Todos' && (
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-center gap-2 text-blue-200">
                <User className="w-5 h-5" />
                <span className="font-semibold text-base">Locutor selecionado: {selectedSpeaker}</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-blue-300 text-sm">Este locutor será incluído no seu orçamento</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-white font-medium flex items-center gap-2">
                Nome completo
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                autoComplete="name"
                aria-invalid={!formData.name}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200 h-12"
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-white font-medium flex items-center gap-2">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                aria-invalid={!formData.email}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200 h-12"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="locationType" className="text-white font-medium flex items-center gap-2">
                Serviços
              </Label>
              <select
                id="locationType"
                name="locationType"
                value={formData.locationType}
                onChange={handleInputChange}
                required
                aria-invalid={!formData.locationType}
                className="w-full h-12 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
              >
                <option value="" className="text-slate-800">Selecione o serviço</option>
                {services.map((s) => (
                  <option key={s.id} value={s.title} className="text-slate-800">{s.title}</option>
                ))}
                <option value="Outros" className="text-slate-800">Outros</option>
              </select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="duration" className="text-white font-medium flex items-center gap-2">
                Duração estimada
              </Label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                aria-invalid={!formData.duration}
                className="w-full h-12 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
              >
                <option value="" className="text-slate-800">Selecione a duração</option>
                <option value="30 segundos" className="text-slate-800">30 segundos</option>
                <option value="1 minuto" className="text-slate-800">1 minuto</option>
                <option value="1 a 2 minutos" className="text-slate-800">1 a 2 minutos</option>
                <option value="2 a 3 minutos" className="text-slate-800">2 a 3 minutos</option>
                <option value="3 a 5 minutos" className="text-slate-800">3 a 5 minutos</option>
                <option value="5+ minutos" className="text-slate-800">5+ minutos</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-white font-medium flex items-center gap-2">
              Descrição do projeto
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              aria-invalid={!formData.description}
              rows={4}
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200 resize-none"
              placeholder="Descreva seu projeto, necessidades específicas, tom desejado, etc."
            />
          </div>

          {/* Status de sucesso */}
          {showSuccess && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center space-x-3" aria-live="polite">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-200 font-medium">
                ✅ Solicitação enviada com sucesso! Redirecionando para o WhatsApp...
              </span>
            </div>
          )}

          <Button 
            onClick={handleWhatsAppContact}
            disabled={!isFormValid || isSubmitting}
            aria-busy={isSubmitting}
            aria-label="Enviar solicitação pelo WhatsApp"
            className={`w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cta-pulse ${
              isSubmitting ? 'animate-pulse' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-3 h-6 w-6" />
                📱 Enviar solicitação pelo WhatsApp
              </>
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-slate-300 text-sm opacity-80">
              💬 Seu orçamento será enviado diretamente para o WhatsApp do Artur Sutto
            </p>
            <div className="flex justify-center items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span>⚡</span> Resposta Rápida
              </span>
              <span className="flex items-center gap-1">
                <span>💎</span> Qualidade Garantida
              </span>
              <span className="flex items-center gap-1">
                <span>🎯</span> Orçamento Personalizado
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactForm;
