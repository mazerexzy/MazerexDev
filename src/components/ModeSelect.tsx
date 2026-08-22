import { useState } from 'react';
import Grid from '../assets/grid.png';
import LogoLoader from '../assets/LogoLoader.png';
import useSound from 'use-sound';
import clickSound from '../assets/sounds/click.mp3';
import hoverSound from '../assets/sounds/hover.mp3';
import { useT } from '../i18n/useT';
import { useLanguage, type Lang } from '../context/LanguageContext';

export type SiteMode = 'full' | 'lite';

/**
 * Оптическое центрирование текста в кнопке.
 *
 * У gdBlack метрики несимметричны: capHeight 783 при ascender 754 и
 * descender −246 (на 1000 em). Браузер центрирует строчный бокс, центр
 * которого лежит на (754−246)/2 = 254 над базовой линией, тогда как
 * зрительный центр заглавных — на 783/2 ≈ 392. Из-за этой разницы под
 * текстом остаётся больше воздуха, чем над ним, и он уезжает вверх —
 * заметнее всего в компактной «пилюле». Опускаем на (392−254)/1000 em.
 *
 * translate работает только на блочном боксе, отсюда block.
 */
const CAP_CENTER = 'block translate-y-[0.1375em]';

/**
 * Экран выбора режима — показывается ПЕРЕД прелоадером.
 *
 * «С моделями» — полноценные 3D-сцены. «Без моделей» — тот же сайт и тексты,
 * но с лёгким CSS-фоном: не грузятся .glb (десятки мегабайт) и не работает
 * WebGL, поэтому вариант живёт на слабых устройствах и медленной сети.
 *
 * Уход повторяет переход прелоадера: контент разлетается (scale 1.4 + fade),
 * сетка раздувается — так два экрана читаются как одна анимация.
 */
export default function ModeSelect({ onPick }: { onPick: (m: SiteMode) => void }) {
    const t = useT();
    const { lang, setLang } = useLanguage();
    const [leaving, setLeaving] = useState(false);

    const [playClick] = useSound(clickSound, { volume: 1, sprite: { trimmedClick: [100, 2000] } });
    const [playHover] = useSound(hoverSound, { volume: 0.5, sprite: { trimmedClick: [100, 2000] } });

    const pick = (m: SiteMode) => {
        if (leaving) return;
        playClick({ id: 'trimmedClick' });
        setLeaving(true);
        setTimeout(() => onPick(m), 620);
    };

    const pickLang = (l: Lang) => {
        if (l === lang) return;
        playClick({ id: 'trimmedClick' });
        setLang(l);
    };

    const langCls = (l: Lang) =>
        `font-gdblack text-[13px] tracking-wider transition-all duration-300 cursor-pointer ${
            lang === l ? 'text-white' : 'text-white/40 hover:text-white/70'
        }`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-black">
            {/* Сетка раздувается на выходе — как в прелоадере */}
            <div
                className={`absolute inset-0 bg-repeat transition-all duration-700 ease-in-out ${
                    leaving ? 'scale-[4] opacity-0' : 'scale-100 opacity-100'
                }`}
                style={{ backgroundImage: `url(${Grid})`, backgroundRepeat: 'repeat', backgroundSize: '55px 55px' }}
            />

            {/* Тёплое свечение позади заголовка */}
            <div
                className={`absolute w-[80vw] h-[80vw] max-w-[760px] max-h-[760px] rounded-full blur-[130px] transition-all duration-700 ${
                    leaving ? 'opacity-0 scale-150' : 'opacity-45 scale-100'
                }`}
                style={{ background: 'radial-gradient(circle, #8A2BE2 0%, #FF1493 45%, transparent 72%)' }}
            />

            {/* Контент уходит увеличением, как loader в прелоадере */}
            <div
                className={`relative z-10 flex flex-col items-center px-6 transition-all duration-500 ease-in-out ${
                    leaving ? 'scale-[1.4] opacity-0' : 'scale-100 opacity-100'
                }`}
            >
                <img
                    src={LogoLoader}
                    alt="Mazerex"
                    draggable={false}
                    className="w-[96px] md:w-[112px] h-auto select-none opacity-90"
                />

                <h1 className="mt-7 text-center font-gdblack text-white text-3xl md:text-5xl leading-none tracking-tight [text-shadow:-0.2px_0.2px_2px_#8A2BE2,_-0.3px_0.3px_0px_#FF1493,_-0.5px_0.5px_0px_#FF0000]">
                    {t('modeTitle')}
                </h1>

                <p className="mt-4 max-w-[440px] text-center text-[12px] md:text-[13px] text-white font-gdmed [text-shadow:1px_1px_0px_#808080] leading-relaxed tracking-wide">
                    {t('modeSub')}
                </p>

                {/* Кнопки в языке сайта: белая «пилюля» с свечением + контурная */}
                <div className="mt-9 flex flex-col sm:flex-row items-center gap-4">
                    <button
                        onClick={() => pick('full')}
                        onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                        className="cursor-pointer bg-white text-[#1a0b2e] px-9 py-3.5 rounded-full font-gdblack text-[15px]
                                   flex items-center justify-center
                                   shadow-[0_0_30px_rgba(255,255,255,0.55)] transition-all duration-300
                                   hover:bg-[#8A2BE2] hover:text-white hover:shadow-[0_0_34px_rgba(184,41,255,0.75)] hover:tracking-wide"
                    >
                        <span className={CAP_CENTER}>{t('modeFull')}</span>
                    </button>

                    <button
                        onClick={() => pick('lite')}
                        onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                        className="cursor-pointer border border-white/35 text-white px-9 py-3.5 rounded-full font-gdblack text-[15px]
                                   flex items-center justify-center
                                   transition-all duration-300 hover:border-white hover:bg-white/10
                                   hover:shadow-[0_0_28px_rgba(255,255,255,0.25)] hover:tracking-wide"
                    >
                        <span className={CAP_CENTER}>{t('modeLite')}</span>
                    </button>
                </div>

                <p className="mt-6 text-[10px] md:text-[11px] text-white/35 font-gdmed text-center">
                    {t('modeHint')}
                </p>

                {/* Язык — тут же, до входа на сайт */}
                <div className="mt-8 flex items-center gap-2 select-none [text-shadow:1px_1px_3px_#000]">
                    <button onClick={() => pickLang('en')} onMouseEnter={() => playHover({ id: 'trimmedClick' })} className={langCls('en')}>
                        EN
                    </button>
                    <span className="w-px h-3 bg-white/25" />
                    <button onClick={() => pickLang('ru')} onMouseEnter={() => playHover({ id: 'trimmedClick' })} className={langCls('ru')}>
                        RU
                    </button>
                </div>
            </div>
        </div>
    );
}
