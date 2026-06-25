import { useEffect, useRef, useState } from "react";

const TgBotsStack = () => {
    // Стейт для блюра и выезда
    const [viewState, setViewState] = useState<'hidden-bottom' | 'visible' | 'hidden-top'>('hidden-bottom');
    const sectionRef = useRef<HTMLElement>(null);

    // Отслежка скролла
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
        if (viewState === 'visible') return `opacity-100 blur-0 translate-y-0 ${delayClass}`;
        if (viewState === 'hidden-bottom') return `opacity-0 blur-md translate-y-32 ${delayClass}`;
        if (viewState === 'hidden-top') return `opacity-0 blur-md -translate-y-32 ${delayClass}`;
        return 'opacity-0 blur-md translate-y-32';
    };

    return (
        <section ref={sectionRef} className="relative w-full h-screen pointer-events-none snap-start overflow-hidden flex items-center">

            <div className="absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:left-12 lg:left-24 top-1/2 -translate-y-1/2 z-20 w-[90%] max-w-sm md:max-w-2xl pointer-events-auto">

                <div className={`transition-all duration-1000 ease-out ${getAnimClasses('delay-300')}`}>

                    <h2 className="text-5xl md:text-7xl font-gdblack text-white leading-tight [text-shadow:-0.5px_0.5px_0px_#8A2BE2,_-1px_1px_0px_#FF1493,_-1.5px_1.5px_0px_#FF0000]">
                        Telegram Bots.
                    </h2>

                    <p className="mt-6 text-base md:text-lg text-white font-gdmed leading-relaxed max-w-xl">
                        Complex logic: payments, API, FSM Bot infrastructure (server, storage, logic). Integration with 3rd party services (payment systems, exchanges, etc.). I can create a bot for any task you need.
                    </p>

                </div>
            </div>
        </section>
    );
}

export default TgBotsStack;