import type { FC } from 'react';

interface ScrollArrowProps {
  isVisible: boolean;
  onScrollDown: () => void;
}

const ScrollArrow: FC<ScrollArrowProps> = ({ isVisible, onScrollDown }) => {
  return (
    <div
      onClick={isVisible ? onScrollDown : undefined} // Кликаем только если видна
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 overflow-hidden h-12 w-12 flex justify-center items-center transition-all duration-500 ease-out delay-500 
        ${isVisible ? 'opacity-100 cursor-pointer pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <svg className="animate-drop w-7 h-7 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  );
};

export default ScrollArrow;