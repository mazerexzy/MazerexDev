import useSound from 'use-sound';

// 🔥 ЗАМЕНИ ПУТИ К ЗВУКАМ НА СВОИ
import hoverSound from '../assets/sounds/hover.mp3';
import clickSound from '../assets/sounds/click.mp3';
import MobileMenu from './MobileMenu';

type Page = 'home' | 'stack' | 'about' | 'contact' | 'reviews';

interface HeaderProps {
    isVisible: boolean;
    currentPage: Page;
    onHomeClick: () => void;
    onStackClick: () => void;
    onAboutClick: () => void;
    onContactClick: () => void;
    onReviewsClick: () => void;
}

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.png`;

export default function Header({ isVisible, currentPage, onHomeClick, onStackClick, onAboutClick, onContactClick, onReviewsClick }: HeaderProps) {
    const [playHover] = useSound(hoverSound, { volume: 0.5, sprite: { trimmedClick: [100, 2000] } });
    const [playClick] = useSound(clickSound, { volume: 0.8, sprite: { trimmedClick: [100, 2000] } });

    const handleHomeClick = () => {
        playClick({ id: 'trimmedClick' });
        onHomeClick();
    };

    const handleStackClick = () => {
        playClick({ id: 'trimmedClick' });
        onStackClick();
    };

    const handleAboutClick = () => {
        playClick({ id: 'trimmedClick' });
        onAboutClick();
    };

    const handleContactClick = () => {
        playClick({ id: 'trimmedClick' });
        onContactClick();
    };

    const handleReviewsClick = () => {
        playClick({ id: 'trimmedClick' });
        onReviewsClick();
    };

    // 🔥 Базовые стили: увеличил до text-lg, добавил transition-all для плавного изменения прозрачности и размера
    const navItemBase = "font-gdblack tracking-wider text-lg [text-shadow:1px_1px_3px_#000,_0_0_1px_#000] transition-all duration-300 cursor-pointer pointer-events-auto block transform";
    
    // 🔥 Функция для динамических классов (Stack, About, Contact)
    const getNavClass = (page: Page) => {
        const isActive = currentPage === page;
        // Если активна: сероватая, полупрозрачная (opacity-75) и чуть больше (scale-105)
        // Если нет: белая, но при ховере становится как активная
        return `${navItemBase} ${
            isActive 
            ? 'text-neutral-400 opacity-65 scale-105' 
            : 'text-white hover:text-neutral-400 hover:opacity-65 hover:scale-105'
        }`;
    };

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out pointer-events-none ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
            }`}
        >
            <div className="w-full px-6 md:px-16 pt-12 pb-6 flex justify-between items-center">

                {/* 🔥 Кнопка HOME (логотип) */}
                <button
                    onClick={handleHomeClick}
                    onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                    // Без isActive: логотип всегда белый и всегда реагирует на
                    // ховер, в том числе на главной. Ховер как у пунктов меню, без scale.
                    className="transition-all duration-300 cursor-pointer pointer-events-auto opacity-100 hover:opacity-65 -ml-1 md:-ml-3"
                    aria-label="На главную"
                >
                    <span className="relative block">
                        <img
                            src={LOGO_SRC}
                            alt="Mazerex"
                            className="h-4 md:h-[23px] w-auto block select-none pointer-events-none"
                            draggable={false}
                        />
                        {/* Очень лёгкий серебристый градиент по левому и правому краю.
                            Накладывается по маске самого лого, иначе подкрасился бы
                            прямоугольник вокруг надписи, а не она сама.
                            Градиент задан инлайном, а не классом bg-[...]: произвольные
                            значения зависят от сканирования классов Tailwind, инлайн
                            применяется всегда. */}
                        <span
                            aria-hidden
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background:
                                    'linear-gradient(90deg, rgba(188,194,206,0.55) 0%, rgba(188,194,206,0) 26%, rgba(188,194,206,0) 74%, rgba(188,194,206,0.55) 100%)',
                                maskImage: `url(${LOGO_SRC})`,
                                WebkitMaskImage: `url(${LOGO_SRC})`,
                                maskSize: '100% 100%',
                                WebkitMaskSize: '100% 100%',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                            }}
                        />
                    </span>
                </button>

                {/* Бургер — только на мобильных (рендерится порталом в body) */}
                <MobileMenu
                    isVisible={isVisible}
                    currentPage={currentPage}
                    onStackClick={onStackClick}
                    onAboutClick={onAboutClick}
                    onContactClick={onContactClick}
                    onReviewsClick={onReviewsClick}
                />

                {/* Обычное меню — от md и шире */}
                <nav className="hidden md:flex space-x-8 text-white items-center">
                    {/* Кнопка Stack */}
                    <button
                        onClick={handleStackClick}
                        onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                        className={getNavClass('stack')}
                    >
                        stack
                    </button>

                    {/* Кнопка About */}
                    <button
                        onClick={handleAboutClick}
                        onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                        className={getNavClass('about')}
                    >
                        about
                    </button>

                    {/* Кнопка Contact */}
                    <button
                        onClick={handleContactClick}
                        onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                        className={getNavClass('contact')}
                    >
                        contact
                    </button>

                    {/* Кнопка Reviews */}
                    <button
                        onClick={handleReviewsClick}
                        onMouseEnter={() => playHover({ id: 'trimmedClick' })}
                        className={getNavClass('reviews')}
                    >
                        reviews
                    </button>
                </nav>
            </div>
        </header>
    );
}