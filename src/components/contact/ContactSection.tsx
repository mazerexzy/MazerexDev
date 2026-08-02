import { useState } from 'react';
import { motion } from 'framer-motion';
import useSound from 'use-sound';
import hoverSound from '../../assets/sounds/hover.mp3';
import clickSound from '../../assets/sounds/click.mp3';
import { useT } from '../../i18n/useT';

const TELEGRAM_URL = 'https://t.me/asyncDevXD';

// Один источник правды для номера: как показываем и как звоним (E.164).
const PHONE_DISPLAY = '+7 (777) 777 777';
const PHONE_E164 = '+77777777777';

// delay совпадает с ContactBg.REVEAL_DELAY (INTRO_ZOOM_DURATION 1.1s + SHAKE_DURATION
// 0.6s = 1.7s) — контент появляется только после того, как камера подъедет и
// отыграет тряска. Уход при любом переходе одинаковый: текст просто размывается,
// в паре с закрытием крышки телефона и отдалением камеры в ContactBg.
const fadeUp = {
    hidden: { opacity: 0, y: 30, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeIn' as const } },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, delay: 1.8, ease: [0.65, 0, 0.35, 1] as const } },
    // Уход: текст быстро уходит в прозрачность + размытие (easeOut — резко в начале)
    exiting: { opacity: 0, y: 0, filter: 'blur(18px)', transition: { duration: 0.3, ease: 'easeOut' as const } },
};

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

interface ContactSectionProps {
    isClosing?: boolean;
    onReviewsClick?: () => void;
}

const ContactSection = ({ isClosing = false, onReviewsClick }: ContactSectionProps) => {
    const t = useT();
    const [playHover] = useSound(hoverSound, { volume: 0.5, sprite: { trimmedClick: [100, 2000] } });
    const [playClick] = useSound(clickSound, { volume: 0.8, sprite: { trimmedClick: [100, 2000] } });

    // Управляем состоянием напрямую через animate. Раньше был whileInView="visible",
    // но он (как жест) перебивал animate="exiting", пока элемент в зоне видимости —
    // а тут он всегда в ней, поэтому уход не срабатывал.
    const animateState = isClosing ? 'exiting' : 'visible';

    const handleReviewsClick = () => {
        playClick({ id: 'trimmedClick' });
        onReviewsClick?.();
    };

    // На телефоне tel: открывает звонилку. На десктопе такой ссылке обычно
    // некому ответить, поэтому там копируем номер в буфер и показываем это.
    const [copied, setCopied] = useState(false);
    const handlePhoneClick = (e: React.MouseEvent) => {
        playClick({ id: 'trimmedClick' });
        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        if (isTouch) return; // не мешаем нативному звонку

        e.preventDefault();
        navigator.clipboard?.writeText(PHONE_E164).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        }).catch(() => {});
    };

    return (
        <section className="relative w-full h-[100dvh] overflow-hidden flex flex-col md:flex-row items-center justify-between px-6 md:px-20 pt-28 pb-10 md:py-0 gap-10 md:gap-0">
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate={animateState}
                className="relative z-10 flex flex-col gap-6 max-w-2xl"
            >
                <h1 className="w-fit font-gdblack text-5xl md:text-6xl lg:text-7xl text-white leading-none [text-shadow:-0.2px_0.2px_2px_#8A2BE2,_-0.3px_0.3px_0px_#FF1493,_-0.5px_0.5px_0px_#FF0000] tracking-tight">
                    {t('contactTitle')}
                </h1>

                {/* Подзаголовок ~в 2 раза шире заголовка и мельче — как на референсе */}
                <p className="text-[11px] md:text-[12px] lg:text-[12.5px] text-white font-gdmed [text-shadow:1px_1px_0px_#808080] leading-relaxed tracking-wide max-w-[560px]">
                    {t('contactText')}
                </p>

                <div className="flex flex-col gap-1">
                    <p className="font-gdblack text-white text-base">
                        {t('contactTelegram')}{' '}
                        <a
                            href={TELEGRAM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                            onClick={() => playClick({ id: 'trimmedClick' })}
                            className="text-[#c9a6ff] hover:text-[#ff2fd6] transition-colors"
                        >
                            @asyncDevXD
                        </a>
                    </p>
                    <button
                        onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                        onClick={handleReviewsClick}
                        className="font-gdblack text-left w-fit text-base text-[#c9a6ff] hover:text-[#ff2fd6] transition-colors cursor-pointer"
                    >
                        {t('contactReviewsLink')}
                    </button>
                </div>

                <p className="text-white/40 text-xs md:text-sm">{t('contactRights')}</p>
            </motion.div>

            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate={animateState}
                className="relative z-10 flex flex-col gap-2 text-white md:-translate-x-[32vw] lg:-translate-x-[35vw] md:translate-y-14"
            >
                <p className="font-gdblack text-[13px] leading-snug">
                    London
                    <br />
                    1337-1338 Meme Street
                    <br />
                    5th Floor
                    <br />
                    Island of Dogs
                    <br />
                    Eldorado
                </p>

                <p className="font-gdmed text-[11px] text-white/70">{t('contactHours')}</p>

                <a
                    href={`tel:${PHONE_E164}`}
                    onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                    onClick={handlePhoneClick}
                    title={PHONE_E164}
                    className="flex items-center gap-2 font-gdblack text-[13px] text-[#c9a6ff] hover:text-[#ff2fd6] transition-colors cursor-pointer"
                >
                    <PhoneIcon />
                    {copied ? (t('phoneCopied') as string) : PHONE_DISPLAY}
                </a>
            </motion.div>
        </section>
    );
};

export default ContactSection;
