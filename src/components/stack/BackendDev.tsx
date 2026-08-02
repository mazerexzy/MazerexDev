import { useState, useEffect, useRef } from 'react';
import { useT } from '../../i18n/useT';

const BackendDev = () => {
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
            { threshold: 0.6 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
    }, []);

    return (
        <section ref={sectionRef} className="relative w-full h-screen overflow-hidden">
            <div className={`absolute inset-0 md:left-1/2 z-10 flex flex-col items-center justify-center pointer-events-none px-4 text-center transition-all ease-out 
                ${textState === 'visible' 
                    ? 'opacity-100 translate-y-0 blur-0 duration-[1200ms] delay-[500ms]' 
                    : textState === 'hidden-top' 
                        ? 'opacity-0 -translate-y-[80vh] blur-md duration-[500ms] delay-0' 
                        : 'opacity-0 translate-y-[80vh] blur-md duration-[500ms] delay-0'}`}>
                <h2 className="text-4xl md:text-5xl font-gdblack text-white leading-tight [text-shadow:-0.5px_0.5px_0px_#8A2BE2,_-1px_1px_0px_#FF1493,_-1.5px_1.5px_0px_#FF0000]">
                    {t('backendTitle')}
                </h2>
            </div>
        </section>
    );
};

export default BackendDev;