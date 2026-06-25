import { useState, useEffect } from "react";

const Hero = ({ isImpacted }: { isImpacted: boolean }) => {
    // 0 это типо скрыто, 1 = удар по центру, 2 = сдвиг вверх и енеми текст
    const [phase, setPhase] = useState(0);
    // Отслеживаем, начал ли тип скроллить вниз
    const [isScrolledOut, setIsScrolledOut] = useState(false);

    useEffect(() => {
        if (isImpacted) {
            setPhase(1);
            setTimeout(() => {
                setPhase(2);
            }, 1000);
        }
    }, [isImpacted]);

    // Наблюдатель за скроллом
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolledOut(window.scrollY > 5);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className="relative w-full h-screen bg-transparent flex items-center justify-center snap-start">

            <div 
                className={`relative z-10 flex flex-col items-center justify-center pointer-events-none select-none transition-all duration-1000 ease-out
                ${isScrolledOut ? 'opacity-0 blur-md -translate-y-32' : 'opacity-100 blur-0 translate-y-0'}`}
            >
                
                <h1 className={`relative z-20 text-7xl md:text-8xl font-gdblack uppercase tracking-wider 
                    bg-[linear-gradient(to_right,#8A2BE2,#FF1493,#FF0000,#FFA500,#FFFF00)] text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(255,0,255,0.4)]
                    ${phase === 0 ? 'opacity-0 scale-50 translate-y-0 transition-none' : ''}
                    ${phase === 1 ? 'opacity-100 scale-100 translate-y-12 transition-all duration-200 ease-out' : ''} 
                    ${phase === 2 ? 'opacity-100 scale-100 -translate-y-12 transition-all duration-500 ease-in-out' : ''}
                `}>
                    MAZEREX
                </h1>

                <div className="relative z-10 flex flex-col items-center space-y-3 mt-4">
                    <p className={`text-4xl md:text-6xl font-gdblack text-white tracking-tight transition-all duration-500 ease-out
                    [text-shadow:-0.5px_0.5px_0px_#8A2BE2,_-1px_1px_0px_#FF1493,_-1.5px_1.5px_0px_#FF0000]
                        ${phase === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'}`}>
                        FullStack Developer.
                    </p>

                    <p className={`text-4xl md:text-6xl font-gdblack text-white tracking-tight transition-all duration-500 ease-out delay-100
                    [text-shadow:-0.5px_0.5px_0px_#8A2BE2,_-1px_1px_0px_#FF1493,_-1.5px_1.5px_0px_#FF0000]
                        ${phase === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'}`}>
                        Yo, i'm Mark.
                    </p>

                    <p className={`text-sm md:text-base font-gdmed text-white mt-6 transition-all duration-500 ease-out delay-200
                        ${phase === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'}`}>
                        My code works, I don't know why
                    </p>

                    <p className={`text-sm md:text-base font-gdblack text-white mt-6 transition-all duration-500 ease-out delay-200
                        ${phase === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'}`}>
                        TAKE A SPIN
                    </p>
                </div>

            </div>
        </section>
    );
};

export default Hero;