
// Gerador de áudios sintéticos para demonstração
interface AudioContextType {
  new (): AudioContext;
}

export const generateSampleAudio = (type: 'commercial' | 'institutional' | 'phone'): HTMLAudioElement => {
  // Criar contexto de áudio
  const AudioContextClass = (window.AudioContext || (window as unknown as { webkitAudioContext: AudioContextType }).webkitAudioContext) as AudioContextType;
  const audioContext = new AudioContextClass();
  
  // Criar buffer de áudio
  const duration = type === 'phone' ? 3 : type === 'commercial' ? 5 : 4;
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
  const data = buffer.getChannelData(0);
  
  // Gerar padrões diferentes para cada tipo
  for (let i = 0; i < data.length; i++) {
    const time = i / sampleRate;
    
    switch (type) {
      case 'commercial':
        // Som mais dinâmico e variado para comercial
        data[i] = Math.sin(220 * 2 * Math.PI * time + Math.sin(3 * time)) * 0.3 * Math.exp(-time * 0.5);
        break;
      case 'institutional':
        // Som mais suave e constante para institucional
        data[i] = Math.sin(200 * 2 * Math.PI * time) * 0.2 * Math.exp(-time * 0.3);
        break;
      case 'phone':
        // Som mais curto e claro para telefone
        data[i] = Math.sin(250 * 2 * Math.PI * time) * 0.25 * Math.exp(-time * 0.8);
        break;
    }
  }
  
  // Converter buffer para blob e criar URL de áudio
  const offlineContext = new OfflineAudioContext(1, buffer.length, sampleRate);
  const source = offlineContext.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineContext.destination);
  source.start();
  
  // Criar elemento de áudio fictício com dados gerados
  const audio = new Audio();
  
  // Para demonstração, vamos usar um tom de teste simples
  // Em um projeto real, você carregaria arquivos de áudio reais
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const dataURL = canvas.toDataURL('audio/wav');
  audio.src = dataURL;
  
  return audio;
};

// URLs de áudios de exemplo (simulados)
export const sampleAudios = {
  commercial: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IAAAAAEAAQBAHwAAQB8AAAABAAhkYXRhAgAAAAEA',
  institutional: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IAAAAAEAAQBAHwAAQB8AAAABAAhkYXRhAgAAAAEA',
  phone: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IAAAAAEAAQBAHwAAQB8AAAABAAhkYXRhAgAAAAEA'
};
