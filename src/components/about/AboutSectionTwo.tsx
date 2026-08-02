import { motion } from 'framer-motion';
import { useT } from '../../i18n/useT';

const AboutSectionTwo = () => {
    const t = useT();
    return (
        <section className="relative w-full h-[100dvh] overflow-hidden flex items-center justify-end px-8 md:px-20 lg:px-32">
            <motion.div 
                // 🔥 Добавлен variants для ускоряющегося исчезновения
                variants={{
                    hidden: { 
                        opacity: 0, 
                        x: 50, 
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
                <p className="text-[13px] md:text-[14px] lg:text-[15px] text-white font-gdblack [text-shadow:1px_1px_0px_#808080] leading-relaxed tracking-wide">
                    {t('aboutHi')}
                </p>
                
                <p className="text-[13px] md:text-[14px] lg:text-[15px] text-white font-gdblack [text-shadow:1px_1px_0px_#808080] leading-relaxed tracking-wide">
                    {t('aboutHi2')}
                </p>
            </motion.div>
        </section>
    );
};

export default AboutSectionTwo;