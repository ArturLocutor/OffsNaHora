import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SpeakerContextType {
  selectedSpeaker: string;
  setSelectedSpeaker: (speaker: string) => void;
}

const SpeakerContext = createContext<SpeakerContextType | undefined>(undefined);

interface SpeakerProviderProps {
  children: ReactNode;
}

export const SpeakerProvider: React.FC<SpeakerProviderProps> = ({ children }) => {
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('Todos');

  return (
    <SpeakerContext.Provider value={{ selectedSpeaker, setSelectedSpeaker }}>
      {children}
    </SpeakerContext.Provider>
  );
};

export const useSpeaker = () => {
  const context = useContext(SpeakerContext);
  if (context === undefined) {
    throw new Error('useSpeaker must be used within a SpeakerProvider');
  }
  return context;
};