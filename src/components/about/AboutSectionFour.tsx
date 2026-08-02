// src/components/about/AboutSectionFour.tsx
import { motion } from 'framer-motion';
import { useT, splitLines } from '../../i18n/useT';

const AboutSectionFour = () => {
    const t = useT();
    return (
        <section className="relative w-full h-[100dvh] overflow-hidden flex items-center justify-start px-8 md:px-20 lg:px-32">
            <motion.div 
                variants={{
                    hidden: { 
                        opacity: 0, 
                        x: -50, // Выезжает слева
                        transition: { duration: 0.4, ease: "easeIn" } 
                    },
                    visible: { 
                        opacity: 1, 
                        x: 0, 
                        transition: { duration: 0.9, ease: [0.65, 0, 0.35, 1] } 
                    }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className="z-10 flex flex-col max-w-[320px] md:max-w-[450px] lg:max-w-[500px] text-left pointer-events-auto gap-6"
            >
                <h2 className="text-4xl md:text-5xl font-gdblack [text-shadow:-0.2px_0.2px_2px_#8A2BE2,_-0.3px_0.3px_0px_#FF1493,_-0.5px_0.5px_0px_#FF0000] text-white leading-tight mb-2 tracking-wide">
                    {splitLines(t('aboutProjectsTitle')).map((line, i) => (
                        <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                </h2>

                <p className="text-[13px] md:text-[14px] lg:text-[15px] text-white font-gdmed [text-shadow:1px_1px_0px_#808080] leading-relaxed tracking-wide">
                    {t('aboutProjectsText')}
                </p>
            </motion.div>
        </section>
    );
};

export default AboutSectionFour;