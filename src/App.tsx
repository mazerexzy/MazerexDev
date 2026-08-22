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
import LanguageToggle from "./components/LanguageToggle";
import bgmMusic from "./assets/sounds/music.mp3";
import cityHdr from "./assets/hdri/potsdamer_platz_1k.hdr?url";
import nightHdr from "./assets/hdri/dikhololo_night_1k.hdr?url";
import Header from "./components/Header"; 

import FrontendDev from "./components/stack/FrontendDev";
import BackendDev from "./components/stack/BackendDev"; 
import DatabasesDev from "./components/stack/DatabasesDev"; 
import DevOpsDev from "./components/stack/DevOpsDev"; 
import ApiIntegrationDev from "./components/stack/ApiIntegrationDev";
import PromoStackOne from "./components/stack/PromoStackOne"; 
import PromoStackTwo from "./components/stack/PromoStackTwo"; 
import StackBg from "./components/stack/StackBg";

import AboutBg from "./components/about/AboutBg";
import AboutSectionOne from "./components/about/AboutSectionOne";
import AboutSectionTwo from "./components/about/AboutSectionTwo";
import AboutSectionThree from "./components/about/AboutSectionThree"; 
import AboutSectionFour from "./components/about/AboutSectionFour";
import AboutSectionFive from "./components/about/AboutSectionFive"; 
import AboutSectionSix from "./components/about/AboutSectionSix";

import ContactBg from "./components/contact/ContactBg";
import ContactSection from "./components/contact/ContactSection";

import ReviewsBg from "./components/reviews/ReviewsBg";
import ReviewsSection from "./components/reviews/ReviewsSection";
import SceneErrorBoundary from "./components/reviews/SceneErrorBoundary";
import ModeSelect, { type SiteMode } from "./components/ModeSelect";
import LiteBackground from "./components/LiteBackground";
import { ModeProvider } from "./context/ModeContext";
import CustomCursor from "./components/reviews/CustomCursor";

import { useProgress, useGLTF, useEnvironment } from '@react-three/drei';

import laptopPath from './assets/models/laptop.glb?url';
import platformPath from './assets/models/platform.glb?url';
import serverPath from './assets/models/server.glb?url'; 
import databasesPath from './assets/models/databases.glb?url';
import devopsPath from './assets/models/devops.glb?url';
import apiPath from './assets/models/ApiIntegration.glb?url'; 
import spaceFirePath from './assets/models/spaceFire.glb?url'; 
import islandPath from './assets/models/NeonIsland.glb?url';
import skyPath from './assets/models/Sky.glb?url';
import batPath from './assets/models/AnimatedBat.glb?url';
import galaxyPhonePath from './assets/models/galaxyphone.glb?url';
import ghostPath from './assets/models/gostly.glb?url';

// Все .glb, которые реально используются на страницах. Раньше здесь не было
// gostly.glb (8.8 МБ, призрак на About) — он качался лениво при заходе на
// страницу и давал лаг; а '/models/earth_globe.glb' был битым путём (404).
const ASSET_PATHS = [
  laptopPath, platformPath, serverPath, databasesPath, devopsPath,
  apiPath, spaceFirePath, islandPath, skyPath, batPath, galaxyPhonePath, ghostPath
];

// Окружения сцен. Лежат локально, а не тянутся из preset'ов drei с
// raw.githack.com: сторонний CDN добавлял в переход лишний round-trip.
const HDRI_PATHS = [cityHdr, nightHdr];

/** Громкость фоновой музыки — она подложка под клики/ховеры, а не первый план. */
const BGM_VOLUME = 0.15;

function App() {
  const [startHero, setStartHero] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isImpacted, setIsImpacted] = useState(false);
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  
  const [currentPage, setCurrentPage] = useState<'home' | 'stack' | 'about' | 'contact' | 'reviews'>('home');
  const [isReturnTrip, setIsReturnTrip] = useState(false);
  const [isContactClosing, setIsContactClosing] = useState(false);
  const [contactInstanceKey] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  // На reviews текст появляется только после падения метеорита
  const [reviewsImpacted, setReviewsImpacted] = useState(false);
  // Режим сайта выбирается ДО прелоадера. null — экран выбора ещё открыт.
  const [mode, setMode] = useState<SiteMode | null>(null);
  const isLite = mode === 'lite';

  const { progress, active } = useProgress();
  const [smoothProgress, setSmoothProgress] = useState(0);
  const loadingStartedRef = useRef(false);

  const isAnimationDoneRef = useRef(false);
  const cooldownRef = useRef(false);
  const lenisRef = useRef<Lenis | null>(null);
  const isScrollingAnimatingRef = useRef(false);
  
  // Фоновая музыка запускается один раз за сессию — ref держит этот факт,
  // чтобы переходы между страницами не перезапускали трек с начала.
  const bgmStartedRef = useRef(false);

  const [playScroll] = useSound(scrollSound, {
    volume: 1,
    sprite: { trimmedClick: [250, 3000] },
  });

  // Одна дорожка на весь сайт, зациклена. Через use-sound (Howler) — значит
  // кнопка звука глушит её вместе с остальным.
  const [playBgm, { stop: stopBgm }] = useSound(bgmMusic, { volume: BGM_VOLUME, loop: true });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const playScrollRef = useRef(playScroll);

  useEffect(() => { playScrollRef.current = playScroll; }, [playScroll]);

  // В lite-режиме .glb не нужны вообще — не тратим трафик и память.
  // Ждём выбора режима, иначе предзагрузка стартует до него.
  useEffect(() => {
    if (mode !== 'full') return;
    ASSET_PATHS.forEach((path) => useGLTF.preload(path));
    // HDRI-окружения тянем здесь же. Иначе 1.5-1.7 МБ качались и разбирались
    // в момент перехода на stack/about — то есть ровно тогда, когда экран
    // должен анимироваться. Тут пользователь и так ждёт прелоудер.
    HDRI_PATHS.forEach((files) => useEnvironment.preload({ files }));
  }, [mode]);

  // Прогресс реальный (backed drei-менеджером), но с защитой от преждевременных
  // 100%: показываем максимум 99, пока менеджер ещё активно грузит, и отдаём
  // 100 только когда загрузка реально СТАРТОВАЛА и завершилась.
  useEffect(() => {
    if (active) loadingStartedRef.current = true;
    setSmoothProgress((prev) => {
      const p = Math.round(progress);
      if (loadingStartedRef.current && !active && progress >= 100) return 100;
      return Math.max(prev, Math.min(99, p));
    });
  }, [progress, active]);

  // Кэш-случай: если за 800мс ничего не начало грузиться (всё уже в кэше),
  // менеджер может вообще не сработать — тогда просто завершаем прелоудер.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!loadingStartedRef.current) setSmoothProgress(100);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  // ── LITE: подменяем сигналы, которые обычно шлют 3D-сцены ───────────────
  // Без них тексты просто не появятся: Hero ждёт удара планеты, первая секция
  // stack — события от StackBg, reviews — падения метеорита.
  useEffect(() => {
    if (!isLite || showPreloader || !startHero) return;

    if (currentPage === 'home' && !isImpacted) {
      const t = setTimeout(() => setIsImpacted(true), 250);
      return () => clearTimeout(t);
    }
    if (currentPage === 'stack') {
      const t = setTimeout(() => window.dispatchEvent(new Event('show-frontend-text')), 450);
      return () => clearTimeout(t);
    }
    if (currentPage === 'reviews' && !reviewsImpacted) {
      const t = setTimeout(() => setReviewsImpacted(true), 350);
      return () => clearTimeout(t);
    }
  }, [isLite, showPreloader, startHero, currentPage, isImpacted, reviewsImpacted]);

  useEffect(() => {
      const handleNavAbout = () => {
          setCurrentPage('about');
          setCurrentSection(0);
          window.scrollTo(0, 0);
      };
      window.addEventListener('navigate-about', handleNavAbout);
      return () => window.removeEventListener('navigate-about', handleNavAbout);
  }, []);

  // Музыка одна на весь сайт: стартует при входе и играет по кругу до закрытия
  // вкладки. Намеренно не завязана на currentPage — иначе трек рвался бы на
  // каждом переходе. Старт после клика Enter (startHero) ещё и обходит запрет
  // автоплея: браузеру нужен жест пользователя.
  useEffect(() => {
    if (showPreloader || !startHero || bgmStartedRef.current) return;
    bgmStartedRef.current = true;
    playBgm();
  }, [showPreloader, startHero, playBgm]);

  useEffect(() => () => stopBgm(), [stopBgm]);

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

  // Возвращает true, только если скролл реально начался. Нужно, чтобы звук
  // проигрывался строго вместе со скроллом: раньше стрелка играла его ДО вызова
  // и он срабатывал даже когда функция выходила по guard'ам (идёт анимация,
  // кулдаун, не доиграла интро-анимация главной).
  const scrollToSection = (targetIndex: number): boolean => {
    if (!lenisRef.current || isScrollingAnimatingRef.current || cooldownRef.current) return false;
    if (currentPage === 'home' && !isAnimationDoneRef.current) return false;

    isScrollingAnimatingRef.current = true;

    // Вот здесь и была «резкость»: home/stack прокручиваются за 1.5с с
    // easeOutExpo — он стартует рывком. У about 2.5с и easeInOutCubic: мягкий
    // разгон и торможение. В lite-режиме везде берём подачу about.
    const aboutLike = currentPage === 'about' || isLite;
    const duration = aboutLike ? 2.5 : 1.5;
    const easingFunc = aboutLike
        ? (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        : (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

    lenisRef.current.scrollTo(targetIndex * window.innerHeight, {
      duration: duration,
      easing: easingFunc,
      lock: true,
      onComplete: () => { unlockScroll(); }
    });

    setTimeout(() => { unlockScroll(); }, duration * 1000 + 100);

    function unlockScroll() {
      if (isScrollingAnimatingRef.current) {
        isScrollingAnimatingRef.current = false;
        cooldownRef.current = true;
        setTimeout(() => { cooldownRef.current = false; }, 600);
      }
    }

    return true;
  };

  useEffect(() => {
    if (showPreloader) return;

    lenisRef.current = new Lenis({ smoothWheel: false });
    function raf(time: number) { lenisRef.current?.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollingAnimatingRef.current || cooldownRef.current) { e.stopImmediatePropagation(); return; }
      const currentIndex = Math.round(window.scrollY / window.innerHeight);
      
      const totalSections = currentPage === 'home' ? 6 : currentPage === 'stack' ? 7 : currentPage === 'about' ? 6 : 1;

      if (e.deltaY > 0 && currentIndex < totalSections - 1) {
        if (scrollToSection(currentIndex + 1)) playScrollRef.current({ id: 'trimmedClick' });
      } else if (e.deltaY < 0 && currentIndex > 0) {
        if (scrollToSection(currentIndex - 1)) playScrollRef.current({ id: 'trimmedClick' });
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
        
        const totalSections = currentPage === 'home' ? 6 : currentPage === 'stack' ? 7 : currentPage === 'about' ? 6 : 1; 

        if (deltaY > 0 && currentIndex < totalSections - 1) {
          if (scrollToSection(currentIndex + 1)) playScrollRef.current({ id: 'trimmedClick' });
        } else if (deltaY < 0 && currentIndex > 0) {
          if (scrollToSection(currentIndex - 1)) playScrollRef.current({ id: 'trimmedClick' });
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

  // 🔥 Уход через ХЭДЭР одинаковый на всех страницах: текст просто размывается
  // и гаснет, полсекунды паузы — и страница меняется. Кинематографичные уходы
  // (закрытие телефона на contact, отлёт камеры на stack/about) остались за
  // кнопками внутри самих страниц.
  const HEADER_EXIT_MS = 500;

  const navigateTo = (page: 'home' | 'stack' | 'about' | 'contact' | 'reviews') => {
    if (currentPage === page || isContactClosing || isExiting) return;

    const applyPage = () => {
      if (page === 'home') {
        setIsImpacted(false); setIsAnimationDone(false); isAnimationDoneRef.current = false; setIsReturnTrip(true);
      }
      // сбрасываем, чтобы при следующем заходе на reviews текст снова ждал удара
      setReviewsImpacted(false);
      setCurrentPage(page);
      setCurrentSection(0);
      window.scrollTo(0, 0);
    };

    setIsExiting(true);
    setTimeout(() => {
      applyPage();
      setIsExiting(false);
    }, HEADER_EXIT_MS);
  };

  const handleNavigateToStack = () => navigateTo('stack');
  const handleNavigateToAbout = () => navigateTo('about');
  const handleNavigateToContact = () => navigateTo('contact');
  const handleNavigateToHome = () => navigateTo('home');
  const handleNavigateToReviews = () => navigateTo('reviews');

  // Клик "What They Say About Me?" на contact — кинематографичный уход
  // (крышка телефона + искажение объектива), затем переход на reviews.
  const CONTACT_CINEMATIC_EXIT_MS = 1500; // закрытие крышки (~1.21s) + искажение, с запасом

  const handleContactReviewsPreview = () => {
    if (isContactClosing || isExiting) return;
    setIsContactClosing(true);
    setTimeout(() => {
      setIsContactClosing(false);
      setReviewsImpacted(false); // текст на reviews снова ждёт удара
      setCurrentPage('reviews');
      setCurrentSection(0);
      window.scrollTo(0, 0);
    }, CONTACT_CINEMATIC_EXIT_MS);
  };

  const isHeaderVisible = startHero && (currentPage !== 'home' || currentSection > 0);

  // Размытие контента при уходе через хэдэр (фон/3D не трогаем — только тексты)
  const exitFx = `transition-all duration-500 ease-in ${isExiting ? 'opacity-0 blur-lg' : 'opacity-100 blur-0'}`;

  // Пока режим не выбран — только экран выбора. Прелоадер и сайт не монтируем,
  // иначе 3D-сцены начнут инициализироваться до решения пользователя.
  if (!mode) {
    return (
      <div className="relative w-full bg-black min-h-screen select-none">
        <ModeSelect onPick={setMode} />
      </div>
    );
  }

  return (
    <ModeProvider mode={mode}>
    <div className="relative w-full bg-black min-h-screen select-none">
      {/* В lite-режиме единый CSS-фон под всеми страницами */}
      {isLite && startHero && <LiteBackground page={currentPage} />}

      {showPreloader && <Preloader onStartTransition={() => setStartHero(true)} onComplete={() => setShowPreloader(false)} progress={smoothProgress} />}
      
      {startHero && <SoundToggle />}
      {startHero && <LanguageToggle />}
      
      {/* 🔥 ИСПРАВЛЕНИЕ: Передали currentPage в Header */}
      <Header 
        isVisible={isHeaderVisible} 
        currentPage={currentPage}
        onHomeClick={handleNavigateToHome} 
        onStackClick={handleNavigateToStack}
        onAboutClick={handleNavigateToAbout}
        onContactClick={handleNavigateToContact}
        onReviewsClick={handleNavigateToReviews}
      />

      {currentPage === 'home' && startHero && (
        <>
          {!isLite && <BgPlanet3D onImpact={() => setIsImpacted(true)} isMobile={isMobile} isReturnTrip={isReturnTrip} />}
          <div className={`relative z-10 ${exitFx}`}>
            <Hero isImpacted={isImpacted} />
            <WebStack /> <DevOpsStack /> <TgBotsStack /> <OptimizationSec /> <FullChaos onNavigate={handleNavigateToStack} />
          </div>
          <ScrollArrow isVisible={isImpacted && isAnimationDone && currentSection < 5} onScrollDown={() => {
              const currentIndex = Math.round(window.scrollY / window.innerHeight);
              if (currentIndex < 5) { if (scrollToSection(currentIndex + 1)) playScroll({ id: 'trimmedClick' }); }
            }}
          />
        </>
      )}

      {currentPage === 'stack' && (
        <>
          {!isLite && <StackBg />}
          <div className={`relative z-10 w-full flex flex-col ${exitFx}`}>
            <FrontendDev /> <BackendDev /> <DatabasesDev /> <DevOpsDev /> <ApiIntegrationDev /> <PromoStackOne /> <PromoStackTwo /> 
          </div>
          <ScrollArrow isVisible={currentSection < 6} onScrollDown={() => {
              const currentIndex = Math.round(window.scrollY / window.innerHeight);
              if (currentIndex < 6) { if (scrollToSection(currentIndex + 1)) playScroll({ id: 'trimmedClick' }); }
            }}
          />
        </>
      )}

      {currentPage === 'about' && (
        <>
          {!isLite && <AboutBg />}
          <div className={`relative z-10 w-full flex flex-col ${exitFx}`}>
            <AboutSectionOne /> <AboutSectionTwo /> <AboutSectionThree /> <AboutSectionFour /> <AboutSectionFive /> <AboutSectionSix onNavigateContact={handleNavigateToContact} />
          </div>
          <ScrollArrow isVisible={currentSection < 5} onScrollDown={() => {
              const currentIndex = Math.round(window.scrollY / window.innerHeight);
              if (currentIndex < 5) { if (scrollToSection(currentIndex + 1)) playScroll({ id: 'trimmedClick' }); }
            }}
          />
        </>
      )}

      {(currentPage === 'contact' || isContactClosing) && (
        <>
          {!isLite && <ContactBg key={contactInstanceKey} isClosing={isContactClosing} />}
          <div className={`relative z-10 w-full flex flex-col ${exitFx}`}>
            <ContactSection isClosing={isContactClosing} onReviewsClick={handleContactReviewsPreview} />
          </div>
        </>
      )}

      {currentPage === 'reviews' && (
        <>
          {!isLite && (
            <>
              <SceneErrorBoundary>
                <ReviewsBg onImpact={() => setReviewsImpacted(true)} />
              </SceneErrorBoundary>
              <CustomCursor />
            </>
          )}
          <div className={`relative z-10 w-full flex flex-col ${exitFx}`}>
            <ReviewsSection isClosing={isExiting} revealed={reviewsImpacted} />
          </div>
        </>
      )}

    </div>
    </ModeProvider>
  );
}

export default App;