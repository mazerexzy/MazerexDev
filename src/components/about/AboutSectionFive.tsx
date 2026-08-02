// src/components/about/AboutSectionFive.tsx
import { motion } from 'framer-motion';
import { useT, splitLines } from '../../i18n/useT';

const AboutSectionFive = () => {
    const t = useT();
    return (
        <section className="relative w-full h-screen flex items-center justify-end px-8 md:px-20 lg:px-32 overflow-hidden pointer-events-none">
            <div className="w-full md:max-w-[450px] lg:max-w-[500px] flex flex-col justify-center gap-6 z-10 pointer-events-auto text-left">
                
                <motion.h2 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-4xl md:text-5xl font-gdblack [text-shadow:-0.2px_0.2px_2px_#8A2BE2,_-0.3px_0.3px_0px_#FF1493,_-0.5px_0.5px_0px_#FF0000] text-white leading-tight tracking-wide"
                >
                    {splitLines(t('aboutPhilosophyTitle')).map((line, i) => (
                        <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                </motion.h2>

                <motion.p 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="text-[13px] md:text-[14px] lg:text-[15px] text-white font-gdmed [text-shadow:1px_1px_0px_#808080] leading-relaxed tracking-wide"
                >
                    <strong className="font-gdblack">{t('philRealSolutions')}</strong>{t('philRealSolutionsText')}<strong className="font-gdblack">{t('philOwnership')}</strong>{t('philOwnershipText')}<strong className="font-gdblack">{t('philUserFirst')}</strong>{t('philUserFirstText')}<strong className="font-gdblack">{t('philCurious')}</strong>{t('philCuriousText')}
                </motion.p>

            </div>
        </section>
    );
};

export default AboutSectionFive;