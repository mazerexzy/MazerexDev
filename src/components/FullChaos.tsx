import { useEffect, useRef, useState } from "react";
import useSound from 'use-sound';
import hoverSound from '../assets/sounds/hover.mp3';

const FullChaos = () => {
    const [viewState, setViewState] = useState<'hidden-bottom' | 'visible' | 'hidden-top'>('hidden-bottom');
    const sectionRef = useRef<HTMLElement>(null);
    const [playHover] = useSound(hoverSound, {
        volume: 1,
        sprite: {
            // Название спрайта: [старт в мс, длительность в мс]
            trimmedClick: [100, 2000],
        },
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
        if (viewState === 'visible') return `opacity-100 blur-0 translate-y-0 scale-100 ${delayClass}`;
        if (viewState === 'hidden-bottom') return `opacity-0 blur-xl translate-y-32 scale-90 ${delayClass}`;
        if (viewState === 'hidden-top') return `opacity-0 blur-xl -translate-y-32 scale-90 ${delayClass}`;
        return 'opacity-0 blur-xl translate-y-32 scale-90';
    };

    return (
        <section ref={sectionRef} className="relative w-full h-screen pointer-events-none snap-start overflow-hidden flex flex-col items-center justify-center">

            {/* ИЗМЕНЕНИЯ ЗДЕСЬ: Убраны top-12 и md: префиксы для позиционирования. Теперь всегда top-1/2 и -translate-y-1/2 */}
            <div className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-20 flex flex-col items-center justify-center w-[90%] md:w-full px-4 md:px-0 pointer-events-auto scale-90 md:scale-100 ${getAnimClasses('delay-300')}`}>

                <h2 className="text-5xl md:text-6xl font-gdblack text-white leading-tight text-center mb-10 tracking-tight [text-shadow:0px_0px_20px_rgba(255,0,255,0.5)]">
                    Full stack, full chaos ↯
                </h2>

                <button onMouseEnter={() => playHover({ id: 'trimmedClick' })} className="bg-white cursor-pointer text-[#483D8B] px-10 py-5 rounded-full font-gdblack text-xl transition-all duration-300 hover:text-white hover:bg-[#483D8B] shadow-[0_0_30px_white] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    Discover the stack
                </button>

            </div>
        </section>
    );
}

export default FullChaos;