import { useEffect, useRef, useState } from "react";

const DevOpsStack = () => {
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

            {/* ИЗМЕНЕНО: md:-right-8 сдвигает контейнер правее, max-w-2xl дает ширину */}
            <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-right-8 lg:-right-12 top-[42%] md:top-1/2 -translate-y-1/2 z-20 w-[90%] max-w-sm md:max-w-2xl pointer-events-auto scale-[0.85] md:scale-100 md:pr-16">

                {/* Обертка для анимации */}
                <div className={`transition-all duration-1000 ease-out ${getAnimClasses('delay-300')}`}>

                    {/* ИЗМЕНЕНО: текст стал md:text-6xl */}
                    <h2 className="text-5xl md:text-6xl font-gdblack text-white leading-tight [text-shadow:-0.5px_0.5px_0px_#8A2BE2,_-1px_1px_0px_#FF1493,_-1.5px_1.5px_0px_#FF0000]">
                        DevOps & <br /> Server-side.
                    </h2>

                    {/* Место под будущий текст-описание, чтобы тебе не пришлось потом вручную верстать */}
                    <p className="mt-6 text-sm md:text-base text-white font-gdmed leading-relaxed">
                        Building and maintaining scalable infrastructure, CI/CD pipelines, and robust backend systems to keep everything running smoothly.
                    </p>

                </div>

            </div>
        </section>
    );
}

export default DevOpsStack;