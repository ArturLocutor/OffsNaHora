import { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';

interface AudioWaveIconProps {
  isPlaying?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AudioWaveIcon: React.FC<AudioWaveIconProps> = ({ 
  isPlaying = false, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {/* Círculo de fundo com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 rounded-full flex items-center justify-center">
        <Mic className={`${iconSizes[size]} text-white`} />
      </div>
      
      {/* Círculo pulsante externo */}
      <div className={`absolute inset-0 border-2 border-blue-400/30 rounded-full ${
        isPlaying ? 'animate-ping' : 'animate-pulse'
      }`} />
      
      {/* Círculo pulsante secundário */}
      <div className={`absolute inset-0 border border-blue-400/20 rounded-full ${
        isPlaying ? 'animate-pulse' : ''
      }`} />
      
      {/* Círculo pulsante terciário */}
      <div className={`absolute inset-0 border border-blue-400/10 rounded-full ${
        isPlaying ? 'animate-pulse' : ''
      }`} style={{ animationDelay: '0.5s' }} />
    </div>
  );
};

export default AudioWaveIcon; 