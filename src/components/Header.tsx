import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Instagram, Mail, Menu, X, Mic } from "lucide-react";
import { useLocalSiteData } from "@/hooks/useLocalSiteData";
import { formatBrPhone } from "@/lib/utils";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { configs } = useLocalSiteData();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-900/95 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={scrollToTop}
          >
            <img
              src="/logo.png"
              alt="Offs Na Hora — Locução Profissional"
              loading="lazy"
              className="h-8 sm:h-10 w-auto drop-shadow-md"
            />
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-sm sm:text-lg">Offs Na Hora</h1>
              <p className="text-white/80 text-xs">Locução Profissional</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <button
              onClick={() => scrollToSection("portfolio")}
              className="text-white hover:text-blue-300 transition-colors font-medium text-sm lg:text-base cursor-pointer"
            >
              Portfólio
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-white hover:text-blue-300 transition-colors font-medium text-sm lg:text-base cursor-pointer"
            >
              Sobre
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-white hover:text-blue-300 transition-colors font-medium text-sm lg:text-base cursor-pointer"
            >
              Serviços
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-white hover:text-blue-300 transition-colors font-medium text-sm lg:text-base cursor-pointer"
            >
              Contato
            </button>
            
            {/* Contact Buttons */}
            {(() => {
              const whatsappDigits = ('17991598169').replace(/[^\d]/g, '');
              const whatsappLabel = formatBrPhone(whatsappDigits);
              return (
                <div className="flex items-center space-x-2 sm:space-x-4 ml-4 lg:ml-8">
                  <a
                    href={`https://wa.me/${whatsappDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-1 sm:space-x-2"
                  >
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">WhatsApp • {whatsappLabel}</span>
                    <span className="sm:hidden">WhatsApp</span>
                  </a>
                </div>
              );
            })()}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-1.5 sm:p-2"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-white/10">
            <nav className="py-3 sm:py-4 space-y-2 sm:space-y-4">
              <button
                onClick={() => scrollToSection("portfolio")}
                className="block w-full text-left text-white hover:text-blue-300 transition-colors font-medium px-4 py-2 text-sm sm:text-base cursor-pointer"
              >
                Portfólio
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="block w-full text-left text-white hover:text-blue-300 transition-colors font-medium px-4 py-2 text-sm sm:text-base cursor-pointer"
              >
                Sobre
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="block w-full text-left text-white hover:text-blue-300 transition-colors font-medium px-4 py-2 text-sm sm:text-base cursor-pointer"
              >
                Serviços
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block w-full text-left text-white hover:text-blue-300 transition-colors font-medium px-4 py-2 text-sm sm:text-base cursor-pointer"
              >
                Contato
              </button>
              
              {(() => {
                const whatsappDigits = ('17991598169').replace(/[^\d]/g, '');
                const whatsappLabel = formatBrPhone(whatsappDigits);
                return (
                  <div className="px-4 pt-3 sm:pt-4 border-t border-white/10">
                    <a
                      href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2 w-full justify-center"
                >
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>WhatsApp • {whatsappLabel}</span>
                    </a>
                  </div>
                );
              })()}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;