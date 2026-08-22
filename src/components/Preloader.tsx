import { useState, useEffect } from "react";
import Grid from '../assets/grid.png';
import LogoLoader from '../assets/LogoLoader.png';
import useSound from 'use-sound';
import clickSound from "../assets/sounds/click.mp3";
import { useT } from '../i18n/useT';

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Preloader = ({ onStartTransition, onComplete, progress }: { onStartTransition: () => void, onComplete: () => void, progress: number }) => {
    const t = useT();
    const [phase, setPhase] = useState('checking');
    const [isBumping, setIsBumping] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const [playClick] = useSound(clickSound, {
        volume: 1,
        sprite: {
            trimmedClick: [100, 2000],
        },
    });

    useEffect(() => {
        if (progress > 0 && phase === 'checking') {
            setPhase('loading');
        }

        // 🔥 ЖЕСТКИЙ ФИКС БАГА КНОПКИ: Таймер сработает ТОЛЬКО один раз
        if (progress >= 100 && phase === 'loading') {
            setTimeout(() => {
                setPhase('zooming');
                setTimeout(() => setPhase('ready'), 500);
            }, 300);
        }
    }, [progress, phase]);

    const handleEnter = () => {
        setIsBumping(true);

        setTimeout(() => {
            setIsExiting(true);
            onStartTransition();

            setTimeout(() => {
                onComplete();
            }, 800);
        }, 150);
    };

    const showLoader = phase === 'checking' || phase === 'loading' || phase === 'zooming';
    const clamped = Math.max(0, Math.min(100, progress));
    const dashOffset = CIRCUMFERENCE * (1 - clamped / 100);

    return (
        <div className={`fixed top-0 left-0 w-full h-[100dvh] z-50 flex items-center justify-center overflow-hidden transition-colors duration-700 ease-in-out ${isExiting ? 'bg-transparent pointer-events-none' : 'bg-black'}`}>

            {/* Фон-сетка — не трогаем */}
            <div className={`absolute inset-0 bg-repeat z-0 transition-all duration-700 ease-in-out ${isExiting ? 'scale-[4] opacity-0' : 'scale-100 opacity-100'}`} style={{
                backgroundImage: `url(${Grid})`,
                backgroundRepeat: 'repeat',
                backgroundSize: '55px 55px'
            }} />

            <div className="z-10 flex items-center justify-center">
                {showLoader ? (
                    /* Вход — тот же pop-in, что и у кнопки «Enter»: прилетает уменьшением
                       с 1.5 до 1, подхватывая разлёт экрана выбора режима. В фазе zooming
                       класс снимается, иначе анимация (forwards) перебьёт transform у transition. */
                    <div className={`flex flex-col items-center transition-all duration-500 ease-in-out ${phase === 'zooming' ? 'scale-[1.4] opacity-0' : 'scale-100 opacity-100 animate-pop-in'}`}>

                        {/* Кольцо + логотип */}
                        <div className="relative w-[210px] h-[210px] md:w-[250px] md:h-[250px] flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                {/* Фоновое кольцо */}
                                <circle
                                    cx="50" cy="50" r={RADIUS}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.07)"
                                    strokeWidth="0.7"
                                />
                                {/* Прогресс-дуга */}
                                <circle
                                    cx="50" cy="50" r={RADIUS}
                                    fill="none"
                                    stroke="url(#preloaderGrad)"
                                    strokeWidth="1.3"
                                    strokeLinecap="round"
                                    strokeDasharray={CIRCUMFERENCE}
                                    strokeDashoffset={dashOffset}
                                    style={{ transition: 'stroke-dashoffset 0.4s ease-out' }}
                                />
                                <defs>
                                    <linearGradient id="preloaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#9333ea" />
                                        <stop offset="50%" stopColor="#ec4899" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* perspective на контейнере — чтобы вращение читалось объёмным */}
                            <div className="w-[52%] flex items-center justify-center" style={{ perspective: '600px' }}>
                                <img
                                    src={LogoLoader}
                                    alt="Mazerex"
                                    draggable={false}
                                    className="animate-logo-spin-3d w-full h-auto select-none pointer-events-none drop-shadow-[0_0_18px_rgba(236,72,153,0.55)]"
                                />
                            </div>
                        </div>

                        {/* LOADING */}
                        <p className="mt-8 text-[13px] md:text-sm font-gdblack tracking-[0.55em] text-white/70 pl-[0.55em]">
                            {t('loading')}
                        </p>

                        {/* Проценты */}
                        <p className="mt-2 text-xs md:text-sm font-gdmed text-pink-500 tabular-nums">
                            {Math.round(clamped)}%
                        </p>
                    </div>
                ) : phase === 'ready' ? (
                    <button
                        onClick={() => {
                            handleEnter();
                            playClick({ id: 'trimmedClick' });
                        }}
                        className={`animate-pop-in cursor-pointer font-gdblack text-white text-sm flex items-center justify-center px-6 py-2 rounded-full bg-[#9370DB]
                        ${isExiting ? 'transition-all duration-300 ease-in scale-0 opacity-0' :
                                isBumping ? 'transition-all duration-150 ease-out scale-[1.5] bg-[#8A2BE2]' :
                                    'transition-all duration-500 ease-in-out scale-100 opacity-100 hover:tracking-wide hover:scale-130 hover:bg-[#8A2BE2]'}`}
                    >
                        {t('enter')}
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export default Preloader;
