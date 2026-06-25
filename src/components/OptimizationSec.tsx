import { useEffect, useRef, useState } from "react";

const OptimizationSec = () => {
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
        <section ref={sectionRef} className="relative w-full h-screen pointer-events-none snap-start overflow-hidden flex items-center">
            
            <div className="absolute left-4 md:left-12 lg:left-24 top-1/2 -translate-y-1/2 z-20 w-full max-w-sm md:max-w-3xl pointer-events-auto pr-4 md:pr-0">
                
                <div className={`transition-all duration-1000 ease-out ${getAnimClasses('delay-300')}`}>
                    
                    <h2 className="text-5xl md:text-7xl font-gdblack text-white leading-tight [text-shadow:-0.5px_0.5px_0px_#8A2BE2,_-1px_1px_0px_#FF1493,_-1.5px_1.5px_0px_#FF0000]">
                        Optimization & <br />  Security.
                    </h2>

                    <p className="mt-6 text-base md:text-lg text-white font-gdmed leading-relaxed max-w-xl">
                        Caching, lazy-loading, image compression. Protection against basic vulnerabilities (XSS, CSRF, SQLi).
                    </p>

                </div>
            </div>
        </section>
    );
}

export default OptimizationSec;