import { useEffect, useRef, useState } from "react";

const WebStack = () => {
    const [viewState, setViewState] = useState<'hidden-bottom' | 'visible' | 'hidden-top'>('hidden-bottom');
    const sectionRef = useRef<HTMLElement>(null);

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
        <section ref={sectionRef} className="relative w-full h-screen bg-transparent flex items-center justify-center snap-start pointer-events-none">

            {/* ПРАВАЯ ЧАСТЬ (Web Development) - СПРАВА */}
            {/* ИЗМЕНЕНИЕ ЗДЕСЬ: поменяли md:max-w-xl на md:max-w-2xl */}
            <div className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 z-20 w-full max-w-sm md:max-w-2xl pointer-events-auto">
                <div className={`transition-all duration-1000 ease-out ${getAnimClasses('delay-300')}`}>
                    
                    <h2 className="text-4xl md:text-5xl font-gdblack text-white leading-tight [text-shadow:-0.5px_0.5px_0px_#8A2BE2,_-1px_1px_0px_#FF1493,_-1.5px_1.5px_0px_#FF0000]">
                        Web <br /> Development.
                    </h2>
                    
                    <p className="mt-6 text-sm md:text-base text-white font-gdmed leading-relaxed">
                        I create fast, secure and scalable websites and web applications. I can take care of the frontend, backend, database, server, API, security, optimization, and everything in between. I have experience with a wide range of technologies and frameworks, and I can adapt to any project requirements.
                    </p>
                    
                </div>
            </div>

        </section>
    );
};

export default WebStack;