import type { Lang } from '../context/LanguageContext';

/**
 * Словари текстов сайта. Ключи сгруппированы по страницам/секциям.
 * Значения могут содержать \n — компонент сам решает, как разбивать строки
 * (обычно на <br /> в нужных местах).
 */
export const dict = {
    en: {
        // ── HOME ──────────────────────────────────────────────────────────
        heroRole: 'FullStack Developer.',
        heroName: "Yo, i'm Mark.",
        heroSub: "My code works, I don't know why",
        heroCta: 'TAKE A SPIN',

        webTitle: 'Web \nDevelopment.',
        webText:
            'I create fast, secure and scalable websites and web applications. I can take care of the frontend, backend, database, server, API, security, optimization, and everything in between. I have experience with a wide range of technologies and frameworks, and I can adapt to any project requirements.',

        devopsTitle: 'DevOps & \nServer-side.',
        devopsText:
            'Building and maintaining scalable infrastructure, CI/CD pipelines, and robust backend systems to keep everything running smoothly.',

        botsTitle: 'Telegram Bots.',
        botsText:
            'Complex logic: payments, API, FSM Bot infrastructure (server, storage, logic). Integration with 3rd party services (payment systems, exchanges, etc.). I can create a bot for any task you need.',

        optTitle: 'Optimization & \nSecurity.',
        optText:
            'Caching, lazy-loading, image compression. Protection against basic vulnerabilities (XSS, CSRF, SQLi).',

        chaosTitle: 'Full stack, full chaos ↯',
        chaosCta: 'Discover the stack',

        // ── STACK ─────────────────────────────────────────────────────────
        frontendTitle: 'Frontend Development.',
        backendTitle: 'Backend Development.',
        databasesTitle: 'Databases.',
        devopsPageTitle: 'DevOps.',
        apiTitle: 'API / Integration.',

        promoOne: "I don't have bugs, I just create\nfeatures. ↯",
        promoTwoTitle: "What's the secret?",
        promoTwoCta: 'Learn more',

        // ── ABOUT ─────────────────────────────────────────────────────────
        aboutQuote1: '"I write code that\'s not embarrassing to \nshow — and a pleasure to maintain."',

        aboutHi:
            "Hey! I'm Mark (Mazerex), a developer who believes that code is an art form and bugs are just hidden features. I build websites, web apps, backend architectures, and automate everything that can be automated.",
        aboutHi2:
            'In my work, I mix creativity, common sense, and a healthy dose of perfectionism. I turn deadlines into lifelines — delivering fast without losing quality.',

        aboutQuote2: 'Clean code — so even if I wake up at \n3am, I can still read it without crying.',

        aboutProjectsTitle: 'What My Projects \nSay About Me',
        aboutProjectsText:
            "I love weird, tricky tasks and pick up new tech fast. I can solo hard, but I vibe just as well with a team. Feedback? Changes? Bring it on — as long as the end result shines. Details matter to me, whether it's a tiny CSS margin or a full database design. I keep my cool even when everything's on fire 🔥.",

        aboutPhilosophyTitle: 'My Philosophy\nFor Development',
        philRealSolutions: 'Real solutions',
        philRealSolutionsText: ' — no overengineering or pointless complexity. ',
        philOwnership: 'Ownership',
        philOwnershipText: " — I don't leave projects half-baked. I see them through. ",
        philUserFirst: 'User-first mindset',
        philUserFirstText: ' — tech should serve people, not the other way around. ',
        philCurious: 'Stay curious',
        philCuriousText: ' — I never stop learning because tech never stops changing.',

        aboutMeTitle: 'A Little Bit About Me',
        aboutMeHardcore: 'Hardcore',
        aboutMeText:
            " coffee lover, tech enthusiast, and a minimalist — at least in code 😅. I believe a great developer thinks about users first, not just their own ego. I live for tough challenges — easy ones get boring way too fast. Big fan of late-night coding sessions with lo-fi beats. Always down for building side projects just for fun. If it can be automated — I'll probably automate it.",
        aboutMeCta: 'Get in touch',

        // ── CONTACT ───────────────────────────────────────────────────────
        contactTitle: "Let's talk ...",
        contactText:
            "I turn ideas into powerful digital projects: clean code, smart solutions, and a touch of creative chaos. Need a website, a Telegram bot, or a custom backend setup? Easy. Let's build something bold, functional, and unforgettable — drop me a message!",
        contactTelegram: 'Telegram:',
        contactReviewsLink: 'What They Say About Me? ↯',
        contactRights: '© Mazerex LTD. 2026 All Rights Reserved.',
        contactHours: 'MON - FRI 9:00AM - 1:00PM (UTC +3)',
        phoneCopied: 'Number copied!',

        // ── REVIEWS ───────────────────────────────────────────────────────
        reviewsTitle: 'Customer Reviews!',
        reviewsSub: 'They came, they ordered, they laughed, they conquered.',
        reviewsWhat: 'What They Say About Me',
        review1Name: 'Chad Thunderfist',
        review1Text:
            "I asked for a landing page, and he built a portal to an alternate reality. I'm scared to refresh the page.",
        review2Name: 'Karen McDrama',
        review2Text: 'His code is so clean my mom asked for his number to help her clean the kitchen.',
        review3Name: "Bob '404 Error' Johnson",
        review3Text:
            "My mom still doesn't believe I made the website myself... I had to admit it was Mazerex. Now she's his biggest fan.",
        review4Name: "Lil' Debugger",
        review4Text:
            'If code were food, his projects would be Michelin-starred restaurants. Mom approved. Dad too.',

        // ── UI ────────────────────────────────────────────────────────────
        loading: 'LOADING',
        enter: 'enter',

        // ── ВЫБОР РЕЖИМА ──────────────────────────────────────────────────
        modeTitle: 'CHOOSE YOUR EXPERIENCE',
        modeSub: 'Interactive 3D scenes with physics and effects — or the same site on a light animated background.',
        modeFull: 'With 3D models',
        modeLite: 'Without models',
        modeHint: 'You can reload the page to switch modes.',
    },

    ru: {
        // ── HOME ──────────────────────────────────────────────────────────
        heroRole: 'FullStack-разработчик.',
        heroName: 'Йоу, я Марк.',
        heroSub: 'Мой код работает, и я не знаю почему',
        heroCta: 'ПОГНАЛИ',

        webTitle: 'Веб-\nразработка.',
        webText:
            'Создаю быстрые, безопасные и масштабируемые сайты и веб-приложения. Беру на себя фронтенд, бэкенд, базу данных, сервер, API, безопасность, оптимизацию и всё, что между ними. Работал с широким набором технологий и фреймворков и подстроюсь под любые требования проекта.',

        devopsTitle: 'DevOps и \nсерверная часть.',
        devopsText:
            'Строю и поддерживаю масштабируемую инфраструктуру, CI/CD-пайплайны и надёжные бэкенд-системы, чтобы всё работало как часы.',

        botsTitle: 'Telegram-боты.',
        botsText:
            'Сложная логика: платежи, API, FSM. Инфраструктура бота (сервер, хранилище, логика). Интеграция со сторонними сервисами (платёжные системы, биржи и т.д.). Сделаю бота под любую задачу.',

        optTitle: 'Оптимизация и \nбезопасность.',
        optText:
            'Кеширование, ленивая загрузка, сжатие изображений. Защита от базовых уязвимостей (XSS, CSRF, SQLi).',

        chaosTitle: 'Full stack, full chaos ↯',
        chaosCta: 'Посмотреть стек',

        // ── STACK ─────────────────────────────────────────────────────────
        frontendTitle: 'Frontend-разработка.',
        backendTitle: 'Backend-разработка.',
        databasesTitle: 'Базы данных.',
        devopsPageTitle: 'DevOps.',
        apiTitle: 'API / Интеграции.',

        promoOne: 'У меня не баги, я просто делаю\nфичи. ↯',
        promoTwoTitle: 'В чём секрет?',
        promoTwoCta: 'Узнать больше',

        // ── ABOUT ─────────────────────────────────────────────────────────
        aboutQuote1: '«Пишу код, который не стыдно \nпоказать — и приятно поддерживать.»',

        aboutHi:
            'Привет! Я Марк (Mazerex), разработчик, который считает, что код — это искусство, а баги — просто скрытые фичи. Делаю сайты, веб-приложения, бэкенд-архитектуру и автоматизирую всё, что можно автоматизировать.',
        aboutHi2:
            'В работе смешиваю креатив, здравый смысл и здоровую дозу перфекционизма. Превращаю дедлайны в точки роста — делаю быстро, не теряя качества.',

        aboutQuote2: 'Чистый код — чтобы даже проснувшись \nв 3 ночи, я прочитал его без слёз.',

        aboutProjectsTitle: 'Что мои проекты \nговорят обо мне',
        aboutProjectsText:
            'Люблю странные и заковыристые задачи, быстро осваиваю новые технологии. Могу тащить в одиночку, но и в команде мне комфортно. Фидбек? Правки? Давайте — лишь бы результат сиял. Мне важны детали: хоть крошечный CSS-отступ, хоть проектирование базы целиком. Сохраняю спокойствие, даже когда всё горит 🔥.',

        aboutPhilosophyTitle: 'Моя философия\nразработки',
        philRealSolutions: 'Реальные решения',
        philRealSolutionsText: ' — без оверинжиниринга и бессмысленной сложности. ',
        philOwnership: 'Ответственность',
        philOwnershipText: ' — не бросаю проекты на полпути, довожу до конца. ',
        philUserFirst: 'Сначала пользователь',
        philUserFirstText: ' — технологии должны служить людям, а не наоборот. ',
        philCurious: 'Не переставать учиться',
        philCuriousText: ' — я учусь постоянно, потому что технологии не стоят на месте.',

        aboutMeTitle: 'Немного обо мне',
        aboutMeHardcore: 'Хардкорный',
        aboutMeText:
            ' любитель кофе, технофанат и минималист — по крайней мере в коде 😅. Считаю, что хороший разработчик думает в первую очередь о пользователях, а не о своём эго. Живу ради сложных задач — лёгкие надоедают слишком быстро. Обожаю ночные сессии кодинга под lo-fi. Всегда за пет-проекты просто ради удовольствия. Если что-то можно автоматизировать — я это автоматизирую.',
        aboutMeCta: 'Связаться',

        // ── CONTACT ───────────────────────────────────────────────────────
        contactTitle: 'Давай поговорим ...',
        contactText:
            'Превращаю идеи в мощные digital-проекты: чистый код, умные решения и щепотка креативного хаоса. Нужен сайт, Telegram-бот или свой бэкенд? Легко. Давай сделаем что-то смелое, функциональное и запоминающееся — напиши мне!',
        contactTelegram: 'Telegram:',
        contactReviewsLink: 'Что обо мне говорят? ↯',
        contactRights: '© Mazerex LTD. 2026 Все права защищены.',
        contactHours: 'ПН - ПТ 9:00 - 13:00 (UTC +3)',
        phoneCopied: 'Номер скопирован!',

        // ── REVIEWS ───────────────────────────────────────────────────────
        reviewsTitle: 'Отзывы клиентов!',
        reviewsSub: 'Они пришли, заказали, посмеялись и победили.',
        reviewsWhat: 'Что обо мне говорят',
        review1Name: 'Чад Тандерфист',
        review1Text:
            'Я попросил лендинг, а он построил портал в альтернативную реальность. Теперь боюсь обновлять страницу.',
        review2Name: 'Карен МакДрама',
        review2Text: 'Его код настолько чистый, что мама попросила его номер — помочь убраться на кухне.',
        review3Name: 'Боб «404 Error» Джонсон',
        review3Text:
            'Мама до сих пор не верит, что я сделал сайт сам... Пришлось признаться, что это Mazerex. Теперь она его главная фанатка.',
        review4Name: 'Мелкий Дебаггер',
        review4Text:
            'Если бы код был едой, его проекты были бы ресторанами со звездой Мишлен. Мама одобрила. Папа тоже.',

        // ── UI ────────────────────────────────────────────────────────────
        loading: 'ЗАГРУЗКА',
        enter: 'войти',

        // ── ВЫБОР РЕЖИМА ──────────────────────────────────────────────────
        modeTitle: 'ВЫБЕРИТЕ РЕЖИМ',
        modeSub: 'Интерактивные 3D-сцены с физикой и эффектами — или тот же сайт на лёгком анимированном фоне.',
        modeFull: 'С 3D-моделями',
        modeLite: 'Без моделей',
        modeHint: 'Чтобы сменить режим, перезагрузите страницу.',
    },
} as const;

export type TKey = keyof typeof dict.en;

/** Достаёт строку для языка. */
export function t(lang: Lang, key: TKey): string {
    return dict[lang][key];
}
