import { useState, useEffect } from "react";
import Grid from '../assets/grid.png';
import useSound from 'use-sound';
import clickSound from "../assets/sounds/click.mp3";

const Preloader = ({ onStartTransition, onComplete }: { onStartTransition: () => void, onComplete: () => void }) => {
    const [phase, setPhase] = useState('loading');
    const [progress, setProgress] = useState(0);

    // Два раздельных состояния для цепочки анимации
    const [isBumping, setIsBumping] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [playClick] = useSound(clickSound, {
        volume: 1,
        sprite: {
            // Название спрайта: [старт в мс, длительность в мс]
            trimmedClick: [100, 2000],
        },
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setPhase('zooming');
                        setTimeout(() => setPhase('ready'), 500);
                    }, 500);
                    return 100;
                }
                return prev + 2;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const handleEnter = () => {
        // 1. Сначала делаем "удар" (увеличение кнопки)
        setIsBumping(true);

        // 2. Ждем 150мс, пока она увеличивается, затем запускаем исчезновение
        setTimeout(() => {
            setIsExiting(true);
            onStartTransition(); // Стартуем пролётку планеты

            // 3. Ждем 800мс, пока сетка зумится (кнопка исчезнет намного раньше)
            setTimeout(() => {
                onComplete();
            }, 800);
        }, 150);
    };

    return (
        /* ИСПОЛЬЗУЕМ h-[100dvh] для идеального центрирования на мобилках */
        <div className={`fixed top-0 left-0 w-full h-[100dvh] z-50 flex items-center justify-center overflow-hidden transition-colors duration-700 ease-in-out ${isExiting ? 'bg-transparent pointer-events-none' : 'bg-black'}`}>

            {/* СЕТКА (Длительность 700мс) */}
            <div className={`absolute inset-0 bg-repeat z-0 transition-all duration-700 ease-in-out ${isExiting ? 'scale-[4] opacity-0' : 'scale-100 opacity-100'}`} style={{
                backgroundImage: `url(${Grid})`,
                backgroundRepeat: 'repeat',
                backgroundSize: '55px 55px'
            }} />

            <div className="z-10 flex items-center justify-center">
                {phase !== 'ready' ? (
                    /* ДОБАВЛЕНЫ py-2 и leading-normal, чтобы градиент не обрезал шрифт */
                    <p className={`text-6xl font-gdblack leading-normal py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-[length:200%_auto] text-transparent bg-clip-text animate-gradient-x transition-all duration-500 ease-in-out
                        ${phase === 'zooming' ? 'scale-[2] opacity-0' : 'scale-50 opacity-100'}`}>
                        {progress}%
                    </p>
                ) : (
                    /* КНОПКА (При isExiting длительность 300мс, чтобы исчезла мгновенно) */
                    <button
                        onClick={() => {
                            handleEnter();
                            playClick({ id: 'trimmedClick' }); // Запуск обрезанной версии
                        }}
                        className={`animate-pop-in cursor-pointer font-gdblack text-white text-sm flex items-center justify-center px-6 py-2 rounded-full bg-[#9370DB] 
                        ${isExiting ? 'transition-all duration-300 ease-in scale-0 opacity-0' :
                                isBumping ? 'transition-all duration-150 ease-out scale-[1.5] bg-[#8A2BE2]' :
                                    'transition-all duration-500 ease-in-out scale-100 opacity-100 hover:tracking-wide hover:scale-130 hover:bg-[#8A2BE2]'}`}
                    >
                        enter
                    </button>
                )}
            </div>
        </div>
    );
}

export default Preloader;