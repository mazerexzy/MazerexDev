import { useState, useEffect, useRef } from 'react';
import hoverSound from '../../assets/sounds/hover.mp3';
import clickSound from "../../assets/sounds/click.mp3";
import { useSound } from 'use-sound';
import { useT } from '../../i18n/useT';

const PromoStackTwo = () => {
    const t = useT();
    const [textState, setTextState] = useState<'hidden-top' | 'hidden-bottom' | 'visible'>('hidden-bottom');
    const [isExiting, setIsExiting] = useState(false); 
    const sectionRef = useRef<HTMLDivElement>(null);

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
                    setTextState('visible');
                } else {
                    setTextState(entry.boundingClientRect.top < 0 ? 'hidden-top' : 'hidden-bottom');
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
    }, []);

    const handleNavigate = () => {
        setIsExiting(true); 
        window.dispatchEvent(new Event('stack-warp-out')); 
        
        // Быстрый переход после красивой анимации (800мс)
        setTimeout(() => {
            window.dispatchEvent(new Event('navigate-about'));
        }, 800); 
    };

    return (
        <section ref={sectionRef} className="relative w-full h-[100dvh] overflow-hidden flex items-center justify-center">

            {/* 🔥 Теперь текст просто стильно падает вниз и растворяется */}
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4 transition-all ease-in-out 
                ${isExiting ? 'opacity-0 translate-y-10 duration-500' : 
                  textState === 'visible'
                    ? 'opacity-100 translate-y-0 blur-0 duration-[1200ms] delay-[500ms]'
                    : textState === 'hidden-top'
                        ? 'opacity-0 -translate-y-[30vh] blur-md duration-[500ms] delay-0'
                        : 'opacity-0 translate-y-[30vh] blur-md duration-[500ms] delay-0'}`}>

                <h2 className="text-5xl md:text-7xl font-gdblack [text-shadow:-0.5px_0.5px_0px_#8A2BE2,_-1px_1px_0px_#FF1493,_-1.5px_1.5px_0px_#FF0000] text-white text-center leading-tight mb-8 tracking-wide">
                    {t('promoTwoTitle')}
                </h2>

                <button
                    onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                    onClick={() => {
                        handleNavigate();
                        playClick({ id: 'trimmedClick' });
                    }}
                    className="pointer-events-auto bg-white text-[#1a0b2e] px-10 py-4 rounded-full font-gdblack text-xl 
                                hover:bg-[#1a0b2e] hover:text-white cursor-pointer
                               transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(184,41,255,0.8)]"
                >
                    {t('promoTwoCta')}
                </button>
            </div>

            {/* Затухание под конец разгона камеры: включается с задержкой, чтобы
                сначала было видно, как сцена улетает, и только потом гаснет */}
            <div
                className={`fixed inset-0 z-[100] pointer-events-none bg-[#0a0510] transition-opacity ease-in ${
                    isExiting ? 'opacity-100 duration-500 delay-[350ms]' : 'opacity-0 duration-200'
                }`}
            />
        </section>
    );
};

export default PromoStackTwo;