import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Waves, Home } from "lucide-react";
import wavesBg from "@/assets/sound-waves.jpg";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(36, 0, 70, 0.85), rgba(12, 0, 24, 0.95)), url(${wavesBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-violet-700/10 to-black/40" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4 text-violet-300">
            <Waves className="h-6 w-6" />
            <span className="text-sm tracking-wider">Offs Na Hora</span>
          </div>

          <h1 className="text-7xl font-extrabold mb-3 bg-gradient-to-r from-violet-200 via-fuchsia-200 to-pink-200 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-xl text-violet-100/80 mb-8">
            Página não encontrada. O som parou por aqui.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 transition-colors"
            >
              <Home className="h-5 w-5" />
              Voltar ao início
            </Link>
          </div>

          {/* Rodapé removido conforme solicitação: ocultar caminho inválido */}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
