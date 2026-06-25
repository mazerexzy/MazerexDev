import { useState } from 'react';
import { Howler } from 'howler';

export default function SoundToggle() {
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    Howler.mute(newState); // Глобальное управление звуком
  };

  return (
    <button 
      onClick={toggleSound}
      className="fixed bottom-6 left-6 z-50 flex items-end gap-1 h-6 w-8"
    >
      {/* 4 полоски эквалайзера */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-white rounded-full ${isMuted ? 'h-2' : 'animate-sound-wave'}`}
          style={{ 
            animationDelay: `${i * 0.15}s`,
            height: isMuted ? '8px' : undefined 
          }}
        />
      ))}
    </button>
  );
}