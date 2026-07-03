import React from 'react';
import useSound from 'use-sound';

// 🔥 ЗАМЕНИ ПУТИ К ЗВУКАМ НА СВОИ (КАК В FULLCHAOS)
import hoverSound from '../assets/sounds/hover.mp3'; // Звук наведения
import clickSound from '../assets/sounds/click.mp3'; // Звук клика

interface HeaderProps {
  isVisible: boolean;
  onHomeClick: () => void;
  onStackClick: () => void;
}

export default function Header({ isVisible, onHomeClick, onStackClick }: HeaderProps) {
  const [playHover] = useSound(hoverSound, { volume: 0.5, sprite: { trimmedClick: [100, 2000] } });
  const [playClick] = useSound(clickSound, { volume: 0.8, sprite: { trimmedClick: [100, 2000] } });

  // Обертки для кликов, чтобы сначала играл звук, а потом шла логика
  const handleHomeClick = () => {
    playClick({ id: 'trimmedClick' });
    onHomeClick();
  };

  const handleStackClick = () => {
    playClick({ id: 'trimmedClick' });
    onStackClick();
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      }`}
    >
      <div className="w-full px-6 md:px-16 pt-12 pb-6 flex justify-between items-center">
        
        {/* Кнопка HOME (SVG Домик) */}
        <button
          onClick={handleHomeClick}
          onMouseEnter={() => playHover({ id: 'trimmedClick' })}
          className="text-white hover:text-[#00FFFF] transition-colors duration-300 cursor-pointer drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>

        <nav className="flex space-x-8 text-white font-gdblack tracking-wider">
          <button 
            onClick={handleStackClick} 
            onMouseEnter={() => playHover({ id: 'trimmedClick' })}
            className="hover:text-[#b829ff] transition-colors duration-300 cursor-pointer uppercase text-sm drop-shadow-[0_0_8px_rgba(184,41,255,0.5)]"
          >
            Stack
          </button>
          <button 
            onMouseEnter={() => playHover({ id: 'trimmedClick' })}
            className="text-gray-500 uppercase cursor-pointer text-sm" 
            title="В разработке"
          >
            About
          </button>
          <button 
            onMouseEnter={() => playHover({ id: 'trimmedClick' })}
            className="text-gray-500 uppercase cursor-pointer text-sm" 
            title="В разработке"
          >
            Contact
          </button>
        </nav>
      </div>
    </header>
  );
}