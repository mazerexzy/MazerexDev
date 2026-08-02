import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useT, splitLines } from '../../i18n/useT';

const AboutSectionOne = () => {
    const t = useT();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoad(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="relative w-full h-[100dvh] overflow-hidden flex items-center justify-center">
            <motion.div 
                // 🔥 Разделили анимации. Уход (hidden) теперь использует easeIn для эффекта ускорения
                variants={{
                    hidden: { 
                        opacity: 0, 
                        y: 30, 
                        transition: { duration: 0.4, ease: "easeIn" } 
                    },
                    visible: { 
                        opacity: 1, 
                        y: 0, 
                        transition: { 
                            duration: 0.9, 
                            delay: isInitialLoad ? 2.2 : 0, 
                            ease: [0.65, 0, 0.35, 1] 
                        } 
                    }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4"
            >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-gdblack text-white text-center leading-tight [text-shadow:-0.2px_0.2px_2px_#8A2BE2,_-0.3px_0.3px_0px_#FF1493,_-0.5px_0.5px_0px_#FF0000]">
                    {splitLines(t('aboutQuote1')).map((line, i) => (
                        <span key={i}>{line}{i === 0 && <br className="hidden md:block" />}</span>
                    ))}
                </h2>
            </motion.div>
        </section>
    );
};

export default AboutSectionOne;