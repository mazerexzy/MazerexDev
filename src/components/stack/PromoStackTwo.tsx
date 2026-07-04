import { useState, useEffect, useRef } from 'react';
import hoverSound from '../../assets/sounds/hover.mp3';
import clickSound from "../../assets/sounds/click.mp3";
import { useSound } from 'use-sound';

const PromoStackTwo = () => {
    const [textState, setTextState] = useState<'hidden-top' | 'hidden-bottom' | 'visible'>('hidden-bottom');
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
            { threshold: 0.6 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
    }, []);

    // Функция-заглушка для перехода (потом подключим тут логику смены страниц)
    const handleNavigate = () => {
        console.log('Бро, летим на страницу About!');
        // В будущем тут будет что-то типа: setCurrentPage('about') или window.dispatchEvent(...)
    };

    return (
        <section ref={sectionRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center">

            {/* Контейнер прозрачный для кликов (pointer-events-none) */}
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none transition-all ease-out 
                ${textState === 'visible'
                    ? 'opacity-100 translate-y-0 blur-0 duration-[1200ms] delay-[500ms]'
                    : textState === 'hidden-top'
                        ? 'opacity-0 -translate-y-[80vh] blur-md duration-[500ms] delay-0'
                        : 'opacity-0 translate-y-[80vh] blur-md duration-[500ms] delay-0'}`}>

                <h2 className="text-5xl md:text-7xl font-gdblack [text-shadow:-0.5px_0.5px_0px_#8A2BE2,_-1px_1px_0px_#FF1493,_-1.5px_1.5px_0px_#FF0000] text-white text-center leading-tight mb-8 tracking-wide">
                    What's the secret?
                </h2>

                {/* А вот сама кнопка ловит клики (pointer-events-auto) */}
                <button
                    onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                    onClick={() => {
                            handleNavigate();
                            playClick({ id: 'trimmedClick' }); 
                        }}
                    className="pointer-events-auto bg-white text-[#1a0b2e] px-10 py-4 rounded-full font-gdblack text-xl 
                                hover:bg-[#1a0b2e] hover:text-white cursor-pointer
                               transition-all duration-300"
                >
                    Learn more
                </button>

            </div>
        </section>
    );
};

export default PromoStackTwo;