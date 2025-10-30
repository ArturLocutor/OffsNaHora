import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { getAudioUrl } from '@/utils/publicAudioManager';
import { recordEvent } from '../utils/metrics';
import WaveProgressBar from './WaveProgressBar';
import AudioWaveIcon from './AudioWaveIcon';

interface PublicAudioPlayerProps {
  title?: string;
  fileName?: string;
  audioFile?: string;
  description?: string;
  fileUrl?: string; // URL direta do Supabase
  compact?: boolean;
  extraCompact?: boolean;
}

const PublicAudioPlayer: React.FC<PublicAudioPlayerProps> = ({ title, fileName, audioFile, description, fileUrl, compact, extraCompact }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Prioridade: 1. fileUrl (Supabase), 2. audioFile, 3. fileName
  const audioFileName = audioFile || fileName;
  const audioUrl = fileUrl || (audioFileName ? getAudioUrl(audioFileName) : null);

  // Atualizar tempo do áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleLoadedData = () => {
      setIsLoading(false);
      setError(false);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        setError(true);
      });
      try {
        recordEvent('audio_play', {
          title: title || 'Áudio',
          file: audioFileName,
          source: audioUrl?.includes('supabase') ? 'supabase' : 'local'
        });
      } catch {}
      setIsPlaying(true);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAudioError = () => {
    setError(true);
    setIsPlaying(false);
    setIsLoading(false);
  };

  // Formatar tempo em MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Controlar progresso do áudio
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Controlar volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // Alternar mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };



  // Se não houver URL resolvida, mostra placeholder
  if (!audioUrl) {
    return (
      <Card className="w-full bg-gradient-to-br from-slate-900/98 to-slate-800/95 backdrop-blur-sm border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:bg-slate-800/80 group shadow-lg">
        <CardContent className={`text-center ${extraCompact ? 'p-3' : compact ? 'p-4' : 'p-6'}`}>
          <h3 className={`text-white ${extraCompact ? 'text-xs mb-2' : compact ? 'text-sm mb-3' : 'text-base mb-4'} font-bold truncate drop-shadow-md`}>{title}</h3>
          <div className={`${extraCompact ? 'w-10 h-10' : compact ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3`}>
            <div className={`${extraCompact ? 'w-5 h-5' : compact ? 'w-6 h-6' : 'w-8 h-8'} bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center`}>
              <span className="text-white text-[10px] font-bold">AS</span>
            </div>
          </div>
          <p className="text-slate-100 text-xs opacity-95 font-medium">Nenhum áudio selecionado</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-gradient-to-br from-slate-900/98 to-red-900/30 backdrop-blur-sm border border-red-500/40 shadow-lg">
        <CardContent className={`text-center ${extraCompact ? 'p-3' : compact ? 'p-4' : 'p-6'}`}>
          <h3 className={`text-white ${extraCompact ? 'text-xs mb-2' : compact ? 'text-sm mb-3' : 'text-base mb-4'} font-bold truncate drop-shadow-md`}>{title}</h3>
          <div className={`${extraCompact ? 'w-10 h-10' : compact ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-3`}>
            <span className="text-red-400 text-xl">⚠️</span>
          </div>
          <p className="text-red-200 text-xs font-medium">Erro ao carregar áudio</p>
        </CardContent>
      </Card>
    );
  }

      return (
      <Card className="w-full bg-gradient-to-br from-slate-900/98 to-slate-800/95 backdrop-blur-sm border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300 hover:bg-slate-800/80 group hover:shadow-xl hover:shadow-blue-500/20 shadow-lg">
        <CardContent className={`text-center ${extraCompact ? 'p-3' : compact ? 'p-4' : 'p-6'}`}>
          <h3 className={`text-white font-bold truncate group-hover:text-blue-100 transition-colors drop-shadow-md ${extraCompact ? 'text-xs mb-2' : compact ? 'text-sm mb-3' : 'text-base mb-4'}`}>
            {title}
          </h3>
          {description && !description.includes(title || '') && (
            <p className={`text-slate-100 text-xs text-center ${extraCompact ? 'mb-2' : compact ? 'mb-3' : 'mb-4'} opacity-95 line-clamp-2 group-hover:opacity-100 transition-opacity drop-shadow-sm font-medium`}>
              {description}
            </p>
          )}
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnd}
          onError={handleAudioError}
          preload="metadata"
        />
        
        <div className={extraCompact ? 'space-y-2' : compact ? 'space-y-3' : 'space-y-4'}>
          {/* Botão de play/pause com animação */}
          <div className="flex justify-center">
            <Button
              onClick={togglePlay}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none rounded-full ${extraCompact ? 'w-10 h-10' : compact ? 'w-12 h-12' : 'w-16 h-16'} p-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${
                isPlaying ? 'animate-pulse' : ''
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className={`${extraCompact ? 'w-4 h-4' : compact ? 'w-5 h-5' : 'w-6 h-6'} border-2 border-white/30 border-t-white rounded-full animate-spin`} />
              ) : isPlaying ? (
                <Pause className={`${extraCompact ? 'h-4 w-4' : compact ? 'h-5 w-5' : 'h-6 w-6'}`} />
              ) : (
                <Play className={`${extraCompact ? 'h-4 w-4' : compact ? 'h-5 w-5' : 'h-6 w-6'} ml-1`} />
              )}
            </Button>
          </div>
          
          {/* Ícone de onda de áudio animado */}
          <div className={`${extraCompact ? 'mt-1' : 'mt-2'} flex justify-center`}>
            <AudioWaveIcon isPlaying={isPlaying} size="sm" />
          </div>
          
          {/* Barra de progresso com onda */}
          <WaveProgressBar
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onClick={handleProgressClick}
            size={extraCompact ? 'xs' : compact ? 'sm' : 'md'}
            variant={(extraCompact || compact) ? 'minimal' : 'default'}
          />
          
          {/* Controles de tempo e volume */}
          <div className="flex justify-between items-center text-xs text-slate-300">
            <span className="font-mono">{formatTime(currentTime)}</span>
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="sm"
                className={`p-1 ${extraCompact ? 'h-5 w-5' : 'h-6 w-6'} text-slate-300 hover:text-white hover:bg-white/10 rounded-full`}
              >
                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-12 h-1 bg-slate-600 rounded-full appearance-none cursor-pointer slider"
              />
            </div>
            <span className="font-mono">{formatTime(duration)}</span>
          </div>


        </div>
      </CardContent>
    </Card>
  );
};

export default PublicAudioPlayer;