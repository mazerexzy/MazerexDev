import { useState, useEffect, useRef } from "react";
import Preloader from "./components/Preloader";
import Hero from "./components/Hero";
import WebStack from "./components/WebStack";
import DevOpsStack from "./components/DevOpsStack";
import BgPlanet3D from "./components/BgPlanet3D";
import Lenis from 'lenis';
import TgBotsStack from "./components/TgBotsStack";
import ScrollArrow from "./components/ScrollArrow";
import OptimizationSec from "./components/OptimizationSec";
import FullChaos from "./components/FullChaos";
import useSound from 'use-sound';
import scrollSound from "./assets/sounds/scroll.mp3";
import SoundToggle from "./components/SoundToggle";

function App() {
  const [startHero, setStartHero] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isImpacted, setIsImpacted] = useState(false);
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  // НОВОЕ СОСТОЯНИЕ: Следим за текущей секцией для UI
  const [currentSection, setCurrentSection] = useState(0);

  const isAnimationDoneRef = useRef(false);
  const cooldownRef = useRef(false);

  const lenisRef = useRef<Lenis | null>(null);
  const isScrollingAnimatingRef = useRef(false);

  const [playScroll] = useSound(scrollSound, {
    volume: 1,
    sprite: {
      trimmedClick: [250, 3000],
    },
  });

  // Состояние: мобилка это или нет (меньше 768px ширина)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const playScrollRef = useRef(playScroll);

  useEffect(() => {
    playScrollRef.current = playScroll;
  }, [playScroll]);

  // НОВЫЙ USEEFFECT: Обновляем стейт currentSection при любом скролле
  useEffect(() => {
    const handleScrollState = () => {
      const index = Math.round(window.scrollY / window.innerHeight);
      setCurrentSection(index);
    };

    window.addEventListener('scroll', handleScrollState);
    return () => window.removeEventListener('scroll', handleScrollState);
  }, []);

  useEffect(() => {
    if (isImpacted) {
      const timer = setTimeout(() => {
        setIsAnimationDone(true);
        isAnimationDoneRef.current = true;
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isImpacted]);

  const scrollToSection = (targetIndex: number) => {
    if (!lenisRef.current || !isAnimationDoneRef.current || isScrollingAnimatingRef.current || cooldownRef.current) {
      return;
    }

    isScrollingAnimatingRef.current = true;

    lenisRef.current.scrollTo(targetIndex * window.innerHeight, {
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lock: true,
      onComplete: () => {
        unlockScroll();
      }
    });

    setTimeout(() => {
      unlockScroll();
    }, 1600);

    function unlockScroll() {
      if (isScrollingAnimatingRef.current) {
        isScrollingAnimatingRef.current = false;
        cooldownRef.current = true;
        setTimeout(() => { cooldownRef.current = false; }, 600);
      }
    }
  };

  useEffect(() => {
    lenisRef.current = new Lenis({ smoothWheel: false });

    function raf(time: number) {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // --- ДЕСКТОП: ОБРАБОТКА КОЛЕСИКА МЫШИ ---
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrollingAnimatingRef.current || cooldownRef.current) {
        e.stopImmediatePropagation();
        return;
      }

      const currentIndex = Math.round(window.scrollY / window.innerHeight);
      const totalSections = 6;

      if (e.deltaY > 0 && currentIndex < totalSections - 1) {
        playScrollRef.current({ id: 'trimmedClick' });
        scrollToSection(currentIndex + 1);
      }
      else if (e.deltaY < 0 && currentIndex > 0) {
        playScrollRef.current({ id: 'trimmedClick' });
        scrollToSection(currentIndex - 1);
      }
    };

    // --- МОБИЛКИ: ОБРАБОТКА СВАЙПОВ ---
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // Запоминаем координату Y, где палец коснулся экрана
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // КРИТИЧЕСКИ ВАЖНО: Глушим нативный мобильный скролл
      // Это не даст экрану застревать между секциями
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollingAnimatingRef.current || cooldownRef.current) return;

      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY; // Вычисляем длину и направление свайпа

      // Порог в 50px (чтобы легкое дрожание пальца не переключало секцию)
      if (Math.abs(deltaY) > 50) {
        const currentIndex = Math.round(window.scrollY / window.innerHeight);
        const totalSections = 6;

        if (deltaY > 0 && currentIndex < totalSections - 1) {
          // Свайпнули вверх (хотим листать вниз)
          playScrollRef.current({ id: 'trimmedClick' });
          scrollToSection(currentIndex + 1);
        } else if (deltaY < 0 && currentIndex > 0) {
          // Свайпнули вниз (хотим листать вверх)
          playScrollRef.current({ id: 'trimmedClick' });
          scrollToSection(currentIndex - 1);
        }
      }
    };

    // Вешаем слушатели событий (passive: false нужно, чтобы работал preventDefault)
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      lenisRef.current?.destroy();
    };
  }, []);

  return (
    <div className="relative w-full bg-black">

      {startHero && <BgPlanet3D onImpact={() => setIsImpacted(true)} isMobile={isMobile} />}
      {startHero && <SoundToggle />}

      {startHero && (
        <div className="relative z-10">
          <Hero isImpacted={isImpacted} />
          <WebStack />
          <DevOpsStack />
          <TgBotsStack />
          <OptimizationSec />
          <FullChaos />
        </div>
      )}

      {startHero && (
        <ScrollArrow
          // ИЗМЕНЕНО: Стрелка видна только если мы еще не дошли до последней секции (индекс 5)
          isVisible={isImpacted && isAnimationDone && currentSection < 5}
          onScrollDown={() => {
            const currentIndex = Math.round(window.scrollY / window.innerHeight);
            const totalSections = 6;
            if (currentIndex < totalSections - 1) {
              playScroll({ id: 'trimmedClick' });
              scrollToSection(currentIndex + 1);
            }
          }}
        />
      )}

      {showPreloader && (
        <Preloader
          onStartTransition={() => setStartHero(true)}
          onComplete={() => setShowPreloader(false)}
        />
      )}

    </div>
  );
}

export default App;