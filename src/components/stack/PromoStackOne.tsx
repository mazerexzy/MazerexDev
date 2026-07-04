import { useState, useEffect, useRef } from 'react';

const PromoStackOne = () => {
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
        <section ref={sectionRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center">
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none transition-all ease-out 
                ${textState === 'visible' 
                    ? 'opacity-100 translate-y-0 blur-0 duration-[1200ms] delay-[500ms]' 
                    : textState === 'hidden-top' 
                        ? 'opacity-0 -translate-y-[80vh] blur-md duration-[500ms] delay-0' 
                        : 'opacity-0 translate-y-[80vh] blur-md duration-[500ms] delay-0'}`}>
                {/* Текст как на скрине */}
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-gdblack [text-shadow:-0.5px_0.5px_0px_#8A2BE2,_-1px_1px_0px_#FF1493,_-1.5px_1.5px_0px_#FF0000] text-white text-center leading-tight tracking-wide">
                    I don't have bugs, I just create<br/>features. ↯
                </h2>
            </div>
        </section>
    );
};

export default PromoStackOne;