import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WaveProgressBar from './WaveProgressBar';

interface MiniAudioPlayerProps {
  audioFile: string;
  fileUrl?: string;
  title: string;
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan';
  // Novo: ocultar título interno para evitar duplicação quando já existe título externo
  hideTitle?: boolean;
  // Novo: controlar aparência e tamanho da wavebar
  waveVariant?: 'default' | 'minimal';
  waveSize?: 'xs' | 'sm' | 'md';
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const MiniAudioPlayer: React.FC<MiniAudioPlayerProps> = ({
  audioFile,
  fileUrl,
  title,
  colorScheme = 'blue',
  hideTitle = false,
  waveVariant = 'default',
  waveSize = 'md'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(fileUrl);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setAudioUrl(fileUrl);
    setIsLoading(true);
  }, [fileUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-xl p-4 border border-slate-600/50 backdrop-blur-sm hover:border-slate-500/70 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div className="flex items-center space-x-4">
        <Button
          onClick={togglePlay}
          size="sm"
          className={`
            h-10 w-10 p-0 rounded-full flex-shrink-0 
            bg-gradient-to-br from-blue-500 to-purple-600 
            hover:from-blue-600 hover:to-purple-700 
            text-white shadow-lg hover:shadow-xl 
            transition-all duration-300 transform 
            hover:scale-110 active:scale-95
            ${isPlaying ? 'animate-pulse shadow-blue-400/50' : 'hover:shadow-blue-500/30'}
            relative overflow-hidden
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          {isPlaying ? (
            <Pause className="h-4 w-4 relative z-10" />
          ) : (
            <Play className="h-4 w-4 ml-0.5 relative z-10" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          {!hideTitle && (
            <div className="text-white text-sm font-semibold truncate mb-2 group-hover:text-blue-200 transition-colors duration-300 drop-shadow-lg">
              {title}
            </div>
          )}
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <WaveProgressBar
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                onClick={handleProgressClick}
                colorScheme={colorScheme}
                variant={waveVariant}
                size={waveSize}
              />
            </div>
            <div className="text-slate-100 text-xs flex-shrink-0 font-mono bg-slate-800/70 px-2 py-1 rounded border border-slate-600/30">
              <span className="text-white font-semibold">{formatTime(currentTime)}</span>
              <span className="text-slate-400 mx-1">/</span>
              <span className="text-slate-200">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className={`
          flex-shrink-0 transition-all duration-300 
          ${isPlaying ? 'text-blue-400 animate-bounce' : 'text-slate-300'}
        `}>
          <Volume2 className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default MiniAudioPlayer;