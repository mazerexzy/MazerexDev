import { motion } from 'framer-motion';
import { useT } from '../../i18n/useT';

// Текст ждёт удара метеорита: до него — состояние hidden, после — выезжает
// с небольшой задержкой, чтобы не спорить со вспышкой и тряской.
const fadeUp = {
    hidden: { opacity: 0, y: 26, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeIn' as const } },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, delay: 0.45, ease: [0.65, 0, 0.35, 1] as const } },
    exiting: { opacity: 0, y: 0, filter: 'blur(16px)', transition: { duration: 0.4, ease: 'easeOut' as const } },
};

interface ReviewsSectionProps {
    isClosing?: boolean;
    /** true — метеорит уже упал, можно показывать текст */
    revealed?: boolean;
}

const ReviewsSection = ({ isClosing = false, revealed = false }: ReviewsSectionProps) => {
    const t = useT();
    const REVIEWS = [
        { name: t('review1Name'), text: t('review1Text') },
        { name: t('review2Name'), text: t('review2Text') },
        { name: t('review3Name'), text: t('review3Text') },
        { name: t('review4Name'), text: t('review4Text') },
    ];
    const animateState = isClosing ? 'exiting' : revealed ? 'visible' : 'hidden';

    return (
        // items-start + отступ сверху на ВСЕХ брейкпоинтах: блок высокий, и при
        // items-center он центрировался, вылезая вверх под логотип. Отдельно
        // важно не гасить отступ через md:py-0 (как на contact) — там текст
        // короткий, а здесь это и приводило к наезду на десктопе.
        // pointer-events-none — в блоке нет интерактивных элементов, а по высоте
        // он перекрывает пол-экрана и иначе съедает тапы по шапке/тумблерам
        <section className="relative w-full h-[100dvh] overflow-hidden flex items-start px-6 md:px-20 pt-28 md:pt-32 pb-10 pointer-events-none">
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate={animateState}
                className="relative z-10 flex flex-col max-w-2xl"
            >
                {/* whitespace-nowrap + размер под ширину контейнера: заголовок
                    держим в одну строку, иначе он съедает вторую строку высоты
                    и нижние отзывы уходят за нижний край экрана */}
                <h1 className="whitespace-nowrap font-gdblack text-[1.7rem] sm:text-4xl md:text-5xl lg:text-6xl text-white leading-none [text-shadow:-0.2px_0.2px_2px_#8A2BE2,_-0.3px_0.3px_0px_#FF1493,_-0.5px_0.5px_0px_#FF0000] tracking-tight">
                    {t('reviewsTitle')}
                </h1>

                <p className="mt-3 text-[12px] md:text-[15px] text-white font-gdmed [text-shadow:1px_1px_0px_#808080] tracking-wide">
                    {t('reviewsSub')}
                </p>

                <h2 className="mt-6 md:mt-9 font-gdblack text-2xl sm:text-3xl md:text-4xl text-white leading-none [text-shadow:-0.2px_0.2px_2px_#8A2BE2,_-0.3px_0.3px_0px_#FF1493] tracking-tight">
                    {t('reviewsWhat')}
                </h2>

                <div className="mt-4 md:mt-5 flex flex-col gap-3.5 md:gap-4 max-w-[560px]">
                    {REVIEWS.map((r) => (
                        <div key={r.name}>
                            <p className="font-gdblack text-white text-[13px] md:text-base">{r.name}</p>
                            <p className="mt-1 text-[11px] md:text-[13.5px] text-white/85 font-gdmed [text-shadow:1px_1px_0px_#808080] leading-relaxed">
                                {r.text}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default ReviewsSection;
