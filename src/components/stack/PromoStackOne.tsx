import { useState, useEffect, useRef } from 'react';
import { useT, splitLines } from '../../i18n/useT';

const PromoStackOne = () => {
    const t = useT();
    const [textState, setTextState] = useState<'hidden-top' | 'hidden-bottom' | 'visible'>('hidden-bottom');
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTextState('visible');
                } else {
                    setTextState(entry.boundingClientRect.top < 0 ? 'hidden-top' : 'hidden-bottom');
                }
            },
            // 🔥 ФИКС 1: Понизили порог до 30%, чтобы 100% срабатывало на мобилках
            { threshold: 0.3 } 
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
    }, []);

    return (
        // 🔥 ФИКС 2: h-[100dvh] вместо h-screen (учитывает адресную строку телефона)
        <section ref={sectionRef} className="relative w-full h-[100dvh] overflow-hidden flex items-center justify-center">
            
            {/* 🔥 ФИКС 3: Снизили дальность отлета до 30vh, добавили px-4 для мобильных отступов */}
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4 transition-all ease-out 
                ${textState === 'visible' 
                    ? 'opacity-100 translate-y-0 blur-0 duration-[1200ms] delay-[500ms]' 
                    : textState === 'hidden-top' 
                        ? 'opacity-0 -translate-y-[30vh] blur-md duration-[500ms] delay-0' 
                        : 'opacity-0 translate-y-[30vh] blur-md duration-[500ms] delay-0'}`}>
                
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-gdblack [text-shadow:-0.5px_0.5px_0px_#8A2BE2,_-1px_1px_0px_#FF1493,_-1.5px_1.5px_0px_#FF0000] text-white text-center leading-tight tracking-wide">
                    {splitLines(t('promoOne')).map((line, i) => (
                        <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                </h2>
            </div>
        </section>
    );
};

export default PromoStackOne;