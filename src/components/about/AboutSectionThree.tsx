import { motion } from 'framer-motion';
import { useT, splitLines } from '../../i18n/useT';

const AboutSectionThree = () => {
    const t = useT();
    return (
        <section className="relative w-full h-[100dvh] overflow-hidden flex items-center justify-center">
            <motion.div
                // 🔥 Ускорение при скролле вниз
                variants={{
                    hidden: { 
                        opacity: 0, 
                        y: 40, 
                        transition: { duration: 0.4, ease: "easeIn" } 
                    },
                    visible: { 
                        opacity: 1, 
                        y: 0, 
                        transition: { duration: 0.9, ease: [0.65, 0, 0.35, 1] } 
                    }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4"
            >
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-gdblack text-white text-center leading-tight [text-shadow:-0.2px_0.2px_2px_#8A2BE2,_-0.3px_0.3px_0px_#FF1493,_-0.5px_0.5px_0px_#FF0000]">
                    {splitLines(t('aboutQuote2')).map((line, i) => (
                        <span key={i}>{line}{i === 0 && <br className="hidden md:block" />}</span>
                    ))}
                </h2>
            </motion.div>
        </section>
    );
};

export default AboutSectionThree;