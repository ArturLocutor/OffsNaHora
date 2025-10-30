import React from 'react';

interface WaveProgressBarProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan';
  size?: 'xs' | 'sm' | 'md';
  variant?: 'default' | 'minimal';
}

const WaveProgressBar: React.FC<WaveProgressBarProps> = ({ 
  currentTime, 
  duration, 
  isPlaying, 
  onClick,
  colorScheme = 'blue',
  size = 'md',
  variant = 'default'
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Definir cores para cada esquema
  const colorSchemes = {
    blue: {
      active: 'bg-gradient-to-t from-blue-700 via-blue-500 to-blue-300',
      inactive: 'bg-gradient-to-t from-slate-700 to-slate-500',
      background: 'bg-gradient-to-r from-blue-950/80 to-blue-900/80',
      border: 'border-blue-600/40 hover:border-blue-500/60',
      indicator: 'bg-gradient-to-t from-blue-600 to-blue-300',
      shadow: 'shadow-blue-400/50',
      glow: 'bg-gradient-to-r from-transparent via-blue-400/20 to-transparent'
    },
    green: {
      active: 'bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-300',
      inactive: 'bg-gradient-to-t from-slate-700 to-slate-500',
      background: 'bg-gradient-to-r from-emerald-950/80 to-green-900/80',
      border: 'border-emerald-600/40 hover:border-emerald-500/60',
      indicator: 'bg-gradient-to-t from-emerald-600 to-emerald-300',
      shadow: 'shadow-emerald-400/50',
      glow: 'bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent'
    },
    purple: {
      active: 'bg-gradient-to-t from-purple-700 via-purple-500 to-purple-300',
      inactive: 'bg-gradient-to-t from-slate-700 to-slate-500',
      background: 'bg-gradient-to-r from-purple-950/80 to-violet-900/80',
      border: 'border-purple-600/40 hover:border-purple-500/60',
      indicator: 'bg-gradient-to-t from-purple-600 to-purple-300',
      shadow: 'shadow-purple-400/50',
      glow: 'bg-gradient-to-r from-transparent via-purple-400/20 to-transparent'
    },
    orange: {
      active: 'bg-gradient-to-t from-orange-700 via-orange-500 to-orange-300',
      inactive: 'bg-gradient-to-t from-slate-700 to-slate-500',
      background: 'bg-gradient-to-r from-orange-950/80 to-red-900/80',
      border: 'border-orange-600/40 hover:border-orange-500/60',
      indicator: 'bg-gradient-to-t from-orange-600 to-orange-300',
      shadow: 'shadow-orange-400/50',
      glow: 'bg-gradient-to-r from-transparent via-orange-400/20 to-transparent'
    },
    cyan: {
      active: 'bg-gradient-to-t from-cyan-700 via-cyan-500 to-cyan-300',
      inactive: 'bg-gradient-to-t from-slate-700 to-slate-500',
      background: 'bg-gradient-to-r from-cyan-950/80 to-teal-900/80',
      border: 'border-cyan-600/40 hover:border-cyan-500/60',
      indicator: 'bg-gradient-to-t from-cyan-600 to-cyan-300',
      shadow: 'shadow-cyan-400/50',
      glow: 'bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent'
    }
  };

  const colors = colorSchemes[colorScheme];
  const heightClass = size === 'xs' ? 'h-5' : size === 'sm' ? 'h-6' : 'h-8';
  
  // Gerar barras de onda mais realistas
  const generateWaveBars = () => {
    const bars = [];
    const totalBars = 40; // Reduzido de 60 para 40 para evitar overflow
    
    for (let i = 0; i < totalBars; i++) {
      const barProgress = (i / totalBars) * 100;
      const isActive = barProgress <= progress;
      
      // Criar padrão de onda mais realista
      const wavePattern = Math.sin(i * 0.3) * 0.5 + 0.5; // Onda senoidal
      const randomVariation = Math.random() * 0.3 + 0.7; // Variação aleatória
      const height = (wavePattern * randomVariation * 70) + 15; // Altura entre 15-85%
      
      bars.push(
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-300 cursor-pointer hover:opacity-80 ${
            isActive 
              ? colors.active
              : colors.inactive + ' hover:from-slate-500 hover:to-slate-300'
          }`}
          style={{ 
            height: `${height}%`,
            animation: isPlaying && isActive ? `wave-pulse 1.5s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.03}s`,
            transform: isPlaying && isActive ? 'scaleY(1.1)' : 'scaleY(1)',
          }}
        />
      );
    }
    
    return bars;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Container da barra de progresso */}
      <div 
        className={`wave-container flex items-end justify-between gap-0.5 ${heightClass} cursor-pointer ${variant === 'minimal' ? '' : 'px-1.5 py-1 rounded-lg ' + colors.background + ' backdrop-blur-sm border ' + colors.border + ' transition-all duration-300 overflow-hidden'}`}
        onClick={onClick}
      >
        {generateWaveBars()}
      </div>
      
      {/* Indicador de progresso com glow */}
      {variant !== 'minimal' && (
        <div 
          className={`absolute top-1 bottom-1 w-0.5 ${colors.indicator} rounded-full shadow-lg ${colors.shadow} transition-all duration-200`}
          style={{ 
            left: `calc(${progress}% + 6px)`,
            boxShadow: isPlaying ? `0 0 10px ${colorScheme === 'blue' ? 'rgba(59, 130, 246, 0.8)' : colorScheme === 'green' ? 'rgba(16, 185, 129, 0.8)' : colorScheme === 'purple' ? 'rgba(147, 51, 234, 0.8)' : colorScheme === 'orange' ? 'rgba(249, 115, 22, 0.8)' : 'rgba(6, 182, 212, 0.8)'}` : `0 0 5px ${colorScheme === 'blue' ? 'rgba(59, 130, 246, 0.5)' : colorScheme === 'green' ? 'rgba(16, 185, 129, 0.5)' : colorScheme === 'purple' ? 'rgba(147, 51, 234, 0.5)' : colorScheme === 'orange' ? 'rgba(249, 115, 22, 0.5)' : 'rgba(6, 182, 212, 0.5)'}`
          }}
        />
      )}
      
      {/* Efeito de brilho quando tocando */}
      {isPlaying && variant !== 'minimal' && (
        <div 
          className={`absolute top-0 left-0 h-full ${colors.glow} rounded-lg animate-pulse`}
          style={{ width: `${progress}%` }}
        />
      )}
      
      {/* CSS para animações */}
      <style>{`
        @keyframes wave-pulse {
          0%, 100% { transform: scaleY(1); opacity: 0.8; }
          50% { transform: scaleY(1.3); opacity: 1; }
        }
        
        .wave-container:hover .wave-bar {
          transform: scaleY(1.05);
        }
      `}</style>
    </div>
  );
};

export default WaveProgressBar;