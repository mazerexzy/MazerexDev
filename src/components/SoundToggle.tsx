import { useState } from 'react';
import { Howler } from 'howler';
import useSound from 'use-sound';
import clickSound from "../assets/sounds/click.mp3";
import hoverSound from '../assets/sounds/hover.mp3';

export default function SoundToggle() {
  const [isMuted, setIsMuted] = useState(false);

  const [playClick] = useSound(clickSound, {
    volume: 1,
    sprite: {
      // Название спрайта: [старт в мс, длительность в мс]
      trimmedClick: [100, 2000],
    },
  });

  const [playHover] = useSound(hoverSound, {
    volume: 1,
    sprite: {
      // Название спрайта: [старт в мс, длительность в мс]
      trimmedClick: [100, 2000],
    },
  });

  const toggleSound = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    Howler.mute(newState);
  };

  return (
    <button
      onClick={() => {
        toggleSound();
        playClick({ id: 'trimmedClick' });
      }}
      onMouseEnter={() => playHover({ id: 'trimmedClick' })}
      // Кнопка фиксированного размера, чтобы кликабельная зона не уменьшалась
      className="fixed bottom-6 left-6 z-50 flex items-end h-6 cursor-pointer"
    >
      {/* КОНТЕЙНЕР-МАСКА: плавно меняет высоту и скрывает всё, что выше */}
      <div
        className={`flex items-end gap-[3px] overflow-hidden transition-[height] duration-500 ease-in-out ${isMuted ? 'h-[2px]' : 'h-6'
          }`}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            // Убрали rounded-full — теперь углы строгие и острые
            className="w-1 bg-white animate-sound-wave"
            style={{
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </button>
  );
}