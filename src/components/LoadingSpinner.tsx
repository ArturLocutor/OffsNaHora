import { Mic } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  showIcon?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  text = "Carregando...", 
  showIcon = true 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Spinner principal */}
        <div className={`${sizeClasses[size]} border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin`} />
        
        {/* Spinner secundário */}
        <div className={`${sizeClasses[size]} border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin absolute top-0 left-0`} 
             style={{ animationDelay: '-0.5s', animationDuration: '1.5s' }} />
        
        {/* Ícone central */}
        {showIcon && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Mic className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} text-blue-400 animate-pulse`} />
          </div>
        )}
      </div>
      
      {text && (
        <div className={`text-blue-200 font-medium ${textSizes[size]} animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner; 