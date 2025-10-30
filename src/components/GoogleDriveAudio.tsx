
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoogleDriveAudioProps {
  title: string;
  driveUrl?: string;
  filePath?: string;
}

const GoogleDriveAudio = ({ title, driveUrl, filePath }: GoogleDriveAudioProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Função para obter a URL de áudio
  const getAudioUrl = () => {
    if (filePath) {
      // Se tem arquivo hospedado, usar a URL do Supabase Storage
      return `https://plwinvyfvrderfovtjsw.supabase.co/storage/v1/object/public/audios/${filePath}`;
    } else if (driveUrl) {
      // Se tem URL do Google Drive, usar a lógica antiga
      const fileId = getFileId(driveUrl);
      return fileId ? `https://docs.google.com/uc?export=download&id=${fileId}` : null;
    }
    return null;
  };

  // Extrair o ID do arquivo do Google Drive
  const getFileId = (url: string) => {
    if (!url) return null;
    // Suporta formatos: /file/d/{ID}/..., ?id={ID}, ou ID puro
    const byPath = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (byPath && byPath[1]) return byPath[1];
    const byQuery = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    if (byQuery && byQuery[1]) return byQuery[1];
    // Se a string parece ser apenas um ID, usa diretamente
    if (/^[a-zA-Z0-9-_]+$/.test(url)) return url;
    return null;
  };

  const audioUrl = getAudioUrl();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setProgress(progressPercent);
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      console.error('Erro ao carregar áudio:', audio.error);
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const handlePlayToggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = clickX / width;
    const newTime = clickPercent * audio.duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(clickPercent * 100);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all duration-300">
      <h3 className="text-white font-semibold mb-4 text-center">{title}</h3>
      
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl}
          preload="metadata"
          crossOrigin="anonymous"
        />
      )}
      
      <div className="flex flex-col space-y-4">
        <Button
          onClick={handlePlayToggle}
          disabled={isLoading}
          variant="outline"
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-500 disabled:opacity-50"
        >
          {isLoading ? (
            <Volume2 className="mr-2 h-5 w-5 animate-pulse" />
          ) : isPlaying ? (
            <Pause className="mr-2 h-5 w-5" />
          ) : (
            <Play className="mr-2 h-5 w-5" />
          )}
          {isLoading ? "Carregando..." : isPlaying ? "Pausar" : "Reproduzir"}
        </Button>

        {/* Barra de progresso e controles */}
        <div className="space-y-2">
          <div 
            className="w-full bg-white/20 rounded-full h-2 relative cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-200" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-blue-200 text-xs">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
          </div>
          {isPlaying && (
            <p className="text-blue-200 text-xs text-center animate-pulse">♪ Reproduzindo...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveAudio;
