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
import bgmSound1 from "./assets/sounds/Aphex Twin - Heliosphan (SPOTISAVER).mp3";
import bgmSound2 from "./assets/sounds/Aphex Twin - Heliosphan (SPOTISAVER).mp3"; 
import Header from "./components/Header"; 

import FrontendDev from "./components/stack/FrontendDev";
import BackendDev from "./components/stack/BackendDev"; 
import DatabasesDev from "./components/stack/DatabasesDev"; 
import DevOpsDev from "./components/stack/DevOpsDev"; 
import ApiIntegrationDev from "./components/stack/ApiIntegrationDev";
import PromoStackOne from "./components/stack/PromoStackOne"; // 🔥 ИМПОРТ 1
import PromoStackTwo from "./components/stack/PromoStackTwo"; // 🔥 ИМПОРТ 2
import StackBg from "./components/stack/StackBg";

import * as THREE from 'three'; 
import { GLTFLoader } from 'three-stdlib';

import laptopPath from './assets/models/laptop.glb?url';
import platformPath from './assets/models/platform3.glb?url';
import serverPath from './assets/models/server.glb?url'; 
import databasesPath from './assets/models/databases.glb?url';
import devopsPath from './assets/models/devops.glb?url';
import apiPath from './assets/models/ApiIntegration.glb?url'; 

const ASSET_PATHS = [
  laptopPath, 
  platformPath,
  serverPath, 
  databasesPath,
  devopsPath,
  apiPath, 
  '/models/earth_globe.glb' 
];

function App() {
  const [startHero, setStartHero] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isImpacted, setIsImpacted] = useState(false);
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentPage, setCurrentPage] = useState<'home' | 'stack'>('home');

  const [honestLoadProgress, setHonestLoadProgress] = useState(0);
  const [isReturnTrip, setIsReturnTrip] = useState(false);

  const isAnimationDoneRef = useRef(false);
  const cooldownRef = useRef(false);
  const lenisRef = useRef<Lenis | null>(null);
  const isScrollingAnimatingRef = useRef(false);
  
  const currentTrackRef = useRef<'none' | 'home' | 'stack'>('none');

  const [playScroll] = useSound(scrollSound, {
    volume: 1,
    sprite: { trimmedClick: [250, 3000] },
  });

  const [playBgm1, { stop: stopBgm1 }] = useSound(bgmSound1, { volume: 0.02, loop: true });
  const [playBgm2, { stop: stopBgm2 }] = useSound(bgmSound2, { volume: 0.02, loop: true });

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

  useEffect(() => {
    if (!showPreloader && startHero) {
      if (currentPage === 'home' && currentTrackRef.current !== 'home') {
        stopBgm2(); playBgm1(); currentTrackRef.current = 'home';
      } else if (currentPage === 'stack' && currentTrackRef.current !== 'stack') {
        stopBgm1(); playBgm2(); currentTrackRef.current = 'stack';
      }
    }
  }, [showPreloader, startHero, currentPage, playBgm1, stopBgm1, playBgm2, stopBgm2]);

  useEffect(() => {
    THREE.DefaultLoadingManager.onStart = () => setHonestLoadProgress(1);
    THREE.DefaultLoadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
        setHonestLoadProgress(Math.max(1, Math.round((itemsLoaded / itemsTotal) * 100)));
    };
    THREE.DefaultLoadingManager.onLoad = () => setHonestLoadProgress(100);
    THREE.DefaultLoadingManager.onError = () => setHonestLoadProgress(100);

    const loader = new GLTFLoader();
    ASSET_PATHS.forEach((path) => loader.load(path, () => {}));
  }, []);

  useEffect(() => {
    const handleScrollState = () => {
      if (!lenisRef.current) return;
      if (currentPage === 'home' && !isAnimationDoneRef.current) return;
      const index = Math.round(window.scrollY / window.innerHeight);
      setCurrentSection(index);
    };
    window.addEventListener('scroll', handleScrollState);
    return () => window.removeEventListener('scroll', handleScrollState);
  }, [currentPage]);

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
    if (!lenisRef.current || isScrollingAnimatingRef.current || cooldownRef.current) return;
    if (currentPage === 'home' && !isAnimationDoneRef.current) return;

    isScrollingAnimatingRef.current = true;

    lenisRef.current.scrollTo(targetIndex * window.innerHeight, {
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lock: true,
      onComplete: () => { unlockScroll(); }
    });

    setTimeout(() => { unlockScroll(); }, 1600);

    function unlockScroll() {
      if (isScrollingAnimatingRef.current) {
        isScrollingAnimatingRef.current = false;
        cooldownRef.current = true;
        setTimeout(() => { cooldownRef.current = false; }, 600);
      }
    }
  };

  useEffect(() => {
    if (showPreloader) return;

    lenisRef.current = new Lenis({ smoothWheel: false });

    function raf(time: number) { lenisRef.current?.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollingAnimatingRef.current || cooldownRef.current) {
        e.stopImmediatePropagation(); return;
      }
      const currentIndex = Math.round(window.scrollY / window.innerHeight);
      // 🔥 ТЕПЕРЬ 7 СЕКЦИЙ НА СТРАНИЦЕ СТЕКА
      const totalSections = currentPage === 'home' ? 6 : 7; 

      if (e.deltaY > 0 && currentIndex < totalSections - 1) {
        playScrollRef.current({ id: 'trimmedClick' }); scrollToSection(currentIndex + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        playScrollRef.current({ id: 'trimmedClick' }); scrollToSection(currentIndex - 1);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const handleTouchMove = (e: TouchEvent) => { e.preventDefault(); };
    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollingAnimatingRef.current || cooldownRef.current) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      if (Math.abs(deltaY) > 50) {
        const currentIndex = Math.round(window.scrollY / window.innerHeight);
        const totalSections = currentPage === 'home' ? 6 : 7; // 🔥 ТЕПЕРЬ 7 СЕКЦИЙ

        if (deltaY > 0 && currentIndex < totalSections - 1) {
          playScrollRef.current({ id: 'trimmedClick' }); scrollToSection(currentIndex + 1);
        } else if (deltaY < 0 && currentIndex > 0) {
          playScrollRef.current({ id: 'trimmedClick' }); scrollToSection(currentIndex - 1);
        }
      }
    };

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
  }, [currentPage, showPreloader]);

  const handleNavigateToStack = () => {
    if (currentPage !== 'stack') { setCurrentPage('stack'); setCurrentSection(0); window.scrollTo(0, 0); }
  };

  const handleNavigateToHome = () => {
    if (currentPage === 'home') { return; } else {
      setIsImpacted(false); setIsAnimationDone(false); isAnimationDoneRef.current = false; setIsReturnTrip(true); setCurrentPage('home'); setCurrentSection(0); window.scrollTo(0, 0);
    }
  };

  const isHeaderVisible = startHero && (currentPage !== 'home' || currentSection > 0);

  return (
    <div className="relative w-full bg-black min-h-screen">
      {showPreloader && <Preloader onStartTransition={() => setStartHero(true)} onComplete={() => setShowPreloader(false)} progress={honestLoadProgress} />}
      {startHero && <SoundToggle />}
      <Header isVisible={isHeaderVisible} onHomeClick={handleNavigateToHome} onStackClick={handleNavigateToStack} />

      {currentPage === 'home' && startHero && (
        <>
          <BgPlanet3D onImpact={() => setIsImpacted(true)} isMobile={isMobile} isReturnTrip={isReturnTrip} />
          <div className="relative z-10">
            <Hero isImpacted={isImpacted} />
            <WebStack />
            <DevOpsStack />
            <TgBotsStack />
            <OptimizationSec />
            <FullChaos onNavigate={handleNavigateToStack} />
          </div>
          <ScrollArrow isVisible={isImpacted && isAnimationDone && currentSection < 5} onScrollDown={() => {
              const currentIndex = Math.round(window.scrollY / window.innerHeight);
              if (currentIndex < 5) { playScroll({ id: 'trimmedClick' }); scrollToSection(currentIndex + 1); }
            }}
          />
        </>
      )}

      {currentPage === 'stack' && (
        <>
          <StackBg />
          
          <div className="relative z-10 w-full flex flex-col">
            <FrontendDev />
            <BackendDev />
            <DatabasesDev />
            <DevOpsDev /> 
            <ApiIntegrationDev />
            <PromoStackOne /> {/* 🔥 ДОБАВИЛИ ФИНАЛЬНЫЙ ЭКРАН 1 */}
            <PromoStackTwo /> {/* 🔥 ДОБАВИЛИ ФИНАЛЬНЫЙ ЭКРАН 2 */}
          </div>

          <ScrollArrow
            isVisible={currentSection < 6} // 🔥 СТРЕЛОЧКА ИСЧЕЗАЕТ ТОЛЬКО НА ПОСЛЕДНЕЙ (7-Й) СЕКЦИИ
            onScrollDown={() => {
              const currentIndex = Math.round(window.scrollY / window.innerHeight);
              if (currentIndex < 6) {
                playScroll({ id: 'trimmedClick' });
                scrollToSection(currentIndex + 1);
              }
            }}
          />
        </>
      )}
    </div>
  );
}

export default App;