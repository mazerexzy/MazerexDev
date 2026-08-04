import { useState } from 'react';
import { motion } from 'framer-motion';
import useSound from 'use-sound';
import hoverSound from '../../assets/sounds/hover.mp3';
import clickSound from '../../assets/sounds/click.mp3';
import { useT } from '../../i18n/useT';

interface AboutSectionSixProps {
    onNavigateContact: () => void;
}

const AboutSectionSix = ({ onNavigateContact }: AboutSectionSixProps) => {
    const t = useT();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const [playHover] = useSound(hoverSound, {
        volume: 1,
        sprite: { trimmedClick: [100, 2000] },
    });

    const [playClick] = useSound(clickSound, {
        volume: 1,
        sprite: { trimmedClick: [100, 2000] },
    });

    const handleContactClick = () => {
        if (isTransitioning) return;
        playClick({ id: 'trimmedClick' });
        setIsTransitioning(true);
        // Запускаем отдаление камеры в AboutBg (та же схема, что и уход со stack)
        window.dispatchEvent(new Event('about-warp-out'));
        setTimeout(() => onNavigateContact(), 850);
    };

    return (
        <section className="relative w-full h-[100dvh] flex flex-col items-center justify-center text-center px-6 overflow-hidden pointer-events-none">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className={`z-10 flex flex-col items-center gap-5 pointer-events-auto transition-all duration-700 ease-in ${
                    isTransitioning ? 'opacity-0 blur-2xl scale-125' : 'opacity-100 blur-0 scale-100'
                }`}
            >
                {/* Заголовок */}
                <h2 className="text-5xl md:text-7xl font-gdblack text-white [text-shadow:-0.2px_0.2px_2px_#8A2BE2,_-0.3px_0.3px_0px_#FF1493,_-0.5px_0.5px_0px_#FF0000] tracking-tight">
                    {t('aboutMeTitle')}
                </h2>
                
                {/* Подзаголовок (Широкий и с тенью) */}
                <p className="max-w-[950px] text-[14px] md:text-[16.5px] text-gray-100 font-gdblack [text-shadow:1px_1px_3px_#000,_0_0_1px_#000] leading-relaxed mt-1">
                    <strong className="text-white">{t('aboutMeHardcore')}</strong>{t('aboutMeText')}
                </p>
                
                {/* Компактная кнопка со звуками -> ведёт на страницу contact */}
                <button
                    onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                    onClick={handleContactClick}
                    className="mt-2 pointer-events-auto bg-white text-[#483D8B] px-7 py-2.5 rounded-full font-gdblack text-[15px]
                                hover:text-white hover:bg-[#483D8B] cursor-pointer
                                transition-all duration-300 shadow-[0_0_30px_white] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]
                                disabled:cursor-default"
                    disabled={isTransitioning}
                >
                    {t('aboutMeCta')}
                </button>
            </motion.div>

            {/* Лёгкое тёмно-фиолетово-розовое свечение в конце отдаления камеры:
                включается с задержкой, чтобы сначала было видно, как сцена улетает */}
            <div
                className={`fixed inset-0 z-[100] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,47,214,0.30)_0%,rgba(120,32,150,0.34)_45%,rgba(26,10,48,0.52)_100%)] transition-opacity ease-out ${
                    isTransitioning ? 'opacity-100 duration-500 delay-[350ms]' : 'opacity-0 duration-200'
                }`}
            />
        </section>
    );
};

export default AboutSectionSix;