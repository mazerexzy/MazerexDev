import { useEffect, useRef, useState } from "react";
import useSound from 'use-sound';
import hoverSound from '../assets/sounds/hover.mp3';
import clickSound from "../assets/sounds/click.mp3";
import { useT } from '../i18n/useT';

const FullChaos = ({ onNavigate }: { onNavigate: () => void }) => {
    const t = useT();
    const [viewState, setViewState] = useState<'hidden-bottom' | 'visible' | 'hidden-top'>('hidden-bottom');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    
    const [playHover] = useSound(hoverSound, {
        volume: 1,
        sprite: { trimmedClick: [100, 2000] },
    });

     const [playClick] = useSound(clickSound, {
        volume: 1,
        sprite: { trimmedClick: [100, 2000] },
    });

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setViewState('visible');
                } else {
                    if (entry.boundingClientRect.y > 0) {
                        setViewState('hidden-bottom');
                    } else {
                        setViewState('hidden-top');
                    }
                }
            },
            { threshold: 0.4 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }
        return () => observer.disconnect();
    }, []);

    const getAnimClasses = (delayClass = '') => {
        if (isTransitioning) return `opacity-0 blur-3xl translate-y-0 scale-[15] duration-[1200ms] ease-in`;
        if (viewState === 'visible') return `opacity-100 blur-0 translate-y-0 scale-100 ${delayClass}`;
        if (viewState === 'hidden-bottom') return `opacity-0 blur-xl translate-y-32 scale-90 ${delayClass}`;
        if (viewState === 'hidden-top') return `opacity-0 blur-xl -translate-y-32 scale-90 ${delayClass}`;
        return 'opacity-0 blur-xl translate-y-32 scale-90';
    };

    const handleChaosClick = () => {
        playClick({ id: 'trimmedClick' });
        setIsTransitioning(true);
        
        window.dispatchEvent(new Event('hyperspace-jump'));
        
        setTimeout(() => {
            onNavigate();
        }, 1200);
    };

    return (
        <section ref={sectionRef} className="relative w-full h-[100dvh] pointer-events-none snap-start overflow-hidden flex flex-col items-center justify-center">
            <div className={`relative mt-16 md:mt-0 transition-all duration-1000 ease-out z-20 flex flex-col items-center justify-center w-[90%] md:w-full px-4 md:px-0 pointer-events-auto scale-90 md:scale-100 ${getAnimClasses('delay-300')}`}>
                <h2 className="text-5xl md:text-6xl font-gdblack text-white leading-tight text-center mb-10 tracking-tight [text-shadow:0px_0px_20px_rgba(255,0,255,0.5)]">
                    {t('chaosTitle')}
                </h2>

                <button 
                    onMouseEnter={() => playHover({ id: 'trimmedClick' })} 
                    onClick={handleChaosClick}
                    className={`bg-white cursor-pointer text-[#483D8B] px-10 py-5 rounded-full font-gdblack text-xl shadow-[0_0_30px_white] hover:text-white hover:bg-[#483D8B] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]
                        ${isTransitioning ? 'scale-[4] opacity-0 blur-sm transition-all duration-1000 ease-in' : 'transition-all duration-300'}`}
                >
                    {t('chaosCta')}
                </button>
            </div>
        </section>
    );
}

export default FullChaos;