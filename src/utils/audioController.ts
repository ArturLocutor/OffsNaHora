// Controlador global de players de áudio: garante reprodução única

const audioRegistry = new Set<HTMLAudioElement>();

export const registerAudio = (el: HTMLAudioElement | null) => {
  if (el) audioRegistry.add(el);
};

export const unregisterAudio = (el: HTMLAudioElement | null) => {
  if (el) audioRegistry.delete(el);
};

export const pauseAllExcept = (el?: HTMLAudioElement | null) => {
  audioRegistry.forEach((a) => {
    if (!el || a !== el) {
      try {
        a.pause();
      } catch {}
    }
  });
};

export const getRegisteredAudiosCount = () => audioRegistry.size;