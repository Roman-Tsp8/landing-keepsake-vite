# landing-keepsake-vite

Лендінг студії **Keepsake**, зібраний за професійним фронтенд-процесом: **Vite + Pug + SCSS**, PostCSS (Autoprefixer + Browserslist), адаптивні зображення AVIF/WebP/JPEG, автоматичний контроль якості (Prettier, Stylelint, husky, lint-staged, commitlint) і деплой на GitHub Pages через GitHub Actions.

**Демо:** https://Roman-Tsp8.github.io/landing-keepsake-vite/

> Без фреймворків і UI-бібліотек: лише Pug, SCSS і трохи нативного JS (мобільне меню).

---

## Вимоги до середовища

- **Node.js 22.22.2 або новіший** (див. `.nvmrc`, `engines` у `package.json`). Це жорсткіша вимога, ніж «LTS не нижче 20» з методички: `stylelint@18` і `lint-staged@17` не підтримують Node 20.
- npm 10+
- Git

Перевірка версій:

```bash
node -v
npm -v
```

## Швидкий старт

```bash
git clone https://github.com/Roman-Tsp8/landing-keepsake-vite.git
cd landing-keepsake-vite
npm install
npm run dev
```

Dev-сервер відкриється на `http://localhost:5173/`.

## Команди

| Команда               | Що робить                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npm install`         | Встановлює залежності та вмикає git-хуки (скрипт `prepare` запускає husky)                                 |
| `npm run dev`         | Dev-сервер Vite з гарячим перезавантаженням (Pug і SCSS компілюються на льоту)                             |
| `npm run build`       | Продакшн-збірка в `dist/`: HTML з Pug, CSS з SCSS + PostCSS, хешовані ассети                               |
| `npm run preview`     | Локальний перегляд збірки з `dist/` (на адресі з `base`, тобто `/landing-keepsake-vite/`)                  |
| `npm run format`      | Форматує весь проєкт Prettier-ом                                                                           |
| `npm run lint`        | `lint:styles` (Stylelint по `src/**/*.scss`) + `lint:format` (`prettier --check .`). Очікується 0 помилок. |
| `npm run lint:styles` | Лише Stylelint                                                                                             |
| `npm run lint:format` | Лише перевірка Prettier                                                                                    |
| `npm run images`      | sharp: `images-src/*` → `src/assets/images/<name>-<width>.{avif,webp,jpg}` (400/800/1200 px)               |

### Як замінити зображення

У `images-src/` лежать **згенеровані плейсхолдери** (абстрактні композиції), а не реальні фото. Щоб підставити свої:

1. Покладіть JPG/PNG у `images-src/` з тими самими назвами (`hero.jpg`, `work-01.jpg` … `work-06.jpg`, `journal-01.jpg` … `journal-03.jpg`). Бажані пропорції: роботи ≈ 800×632, журнал ≈ 800×500, hero ≈ 4:3.
2. Запустіть `npm run images`.
3. Оновіть `alt` у `src/data/*.pug`, а якщо змінилися пропорції, то `ratio` у відповідному міксині (див. нижче).

## Структура проєкту

```text
landing-keepsake-vite/
├── .github/workflows/deploy.yml   # CI: lint + build + деплой на GitHub Pages
├── .husky/
│   ├── pre-commit                 # npx lint-staged
│   └── commit-msg                 # commitlint (Conventional Commits)
├── images-src/                    # вихідні зображення для npm run images
├── scripts/
│   ├── images.js                  # sharp: AVIF/WebP/JPEG у кількох ширинах
│   └── make-placeholders.js       # одноразовий генератор плейсхолдерів
├── src/
│   ├── assets/
│   │   ├── images/                # результат npm run images (комітиться)
│   │   └── fonts/                 # Inter Variable, WOFF2 (latin + cyrillic)
│   ├── components/                # header.pug, footer.pug, sections/*.pug
│   ├── data/                      # дані секцій: масиви об'єктів у Pug
│   ├── includes/                  # logo.pug
│   ├── layouts/main.pug           # базовий макет (extends/block)
│   ├── mixins/                    # Pug-міксини
│   ├── pages/index.pug            # сторінка: extends + перевизначення блоків
│   ├── scripts/main.js            # мобільне меню
│   └── styles/
│       ├── abstracts/             # змінні, map-и, функції, міксини, mq
│       ├── base/                  # шрифти, :root, reset, типографіка
│       ├── layout/                # container, section, header, footer
│       ├── components/            # один БЕМ-блок: один файл
│       └── main.scss              # єдина точка входу
├── .browserslistrc
├── .editorconfig
├── .lintstagedrc.json
├── .nvmrc
├── .prettierrc / .prettierignore
├── .stylelintrc.json
├── commitlint.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## Архітектура Pug

Уся розмітка генерується з Pug: у `dist/index.html` немає жодного рядка, написаного вручну.

- **Наслідування.** `layouts/main.pug` задає каркас і блоки `meta`, `title`, `styles`, `content`, `scripts`. `pages/index.pug` робить `extends` і перевизначає `title` та `content`.
- **`append` / `prepend`.** `append meta` додає description та Open Graph; `append styles` додає `preload` шрифтів; `prepend scripts` ставить JSON-LD перед основним скриптом. Вміст блоку макета при цьому не втрачається.
- **`include`.** Шапка, футер і кожна секція — окремі файли; логотип — `includes/logo.pug`.
- **Дані.** Повторювані блоки (навігація, категорії, роботи, послуги, статистика, журнал, колонки футера, соцмережі) лежать у `src/data/*.pug` як масиви об'єктів. Дані й міксини підключаються в макеті, тому доступні всюди.
- **`each` з індексом.** Усе повторюване виводиться через `each item, i in items`, розмітка картки пишеться один раз. Радіокнопки та чипси фільтра теж генеруються з масиву `categories`.
- **Міксини** (`src/mixins/`):

  | Міксин                                    | Особливості                                                                     |
  | ----------------------------------------- | ------------------------------------------------------------------------------- |
  | `+btn(label, href, variant)`              | `case/when` для варіанта; довільні атрибути через `&attributes`                 |
  | `+icon(name)`                             | `case/when` вибирає SVG-контур; `&attributes`                                   |
  | `+picture({...})`                         | `<picture>` з AVIF/WebP, `srcset`/`sizes`, `width`/`height`; `if/else` для lazy |
  | `+work-card(work)`                        | Картка роботи, всередині викликає `+picture`                                    |
  | `+section(id, title)`                     | Приймає вкладений вміст через **`block`**, атрибути через `&attributes`         |
  | `+service-card`, `+stat`, `+journal-card` | Інші картки; `journal-card` ставить клас за умовою (`class={...}`)              |

- **Умови.** `if/else` для активного пункту меню й `+picture` (lazy для всього, крім першого екрана), `if category` для необов'язкового поля.
- **Інтерполяція** `#{…}` у тексті, шаблонні рядки `${…}` в атрибутах, `//-` для службових коментарів (у HTML не потрапляють).

### Як працює фільтр робіт (без JS)

Радіокнопки `input.works__radio` є **сусідами** блоку чипсів і сітки, тому CSS може вибрати їх через `:checked ~`. У `components/_works.scss` цикл `@each` по `$filter-ids` генерує правила для кожної категорії.

> Якщо додаєте категорію, оновіть і `categories` у `src/data/works.pug`, і `$filter-ids` у `src/styles/abstracts/_variables.scss`.

## Архітектура SCSS

- **Лише `@use` / `@forward`**, `@import` не використовується. Кожна папка має `_index.scss`, що реекспортує partials через `@forward`; компоненти підключають абстракції через `@use '../abstracts' as *`. `main.scss` — єдина точка входу, підключена в `layouts/main.pug`.
- **Токени.** Кольори, шрифти, відступи й брейкпоінти — SCSS-змінні та map-и в `abstracts/`. Кольори з map-а `$colors` через `@each` перетворюються на CSS custom properties `--color-*` у `:root` (`base/_root.scss`), у компонентах використовуються через `var(--color-…)`.
- **Mobile first.** Міксин `mq($bp)` у `abstracts/_breakpoints.scss` бере значення з map-а `$breakpoints` (`sass:map`) і містить лише `min-width`. «Сирих» `@media (min-width: …)` у компонентах немає (єдиний виняток: `prefers-reduced-motion` у reset).
- **Функції.** `rem($px)` на `math.div` і `space($key)` для відступів із map-а.
- **Міксини.** `visually-hidden`, `focus-ring($color, $offset)` (з параметрами за замовчуванням), `flex-center($direction)`, `button-reset`.
- **БЕМ.** `&__element`, `&--modifier`, стани через `&:hover`, `&:focus-visible`, `.is-open`. Вкладеність ≤ 3, без `id` у селекторах і без `!important` (це перевіряє Stylelint).
- **Вендорні префікси** вручну не пишуться; їх додає Autoprefixer.

## Використані інструменти

| Інструмент                                       | Навіщо                                                                                    |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **Vite**                                         | Dev-сервер і збірка: хешування файлів, переписування шляхів у `url()` та `srcset`, `base` |
| **Pug** (`vituum` + `@vituum/vite-plugin-pug`)   | Шаблонізатор: компіляція `.pug` у HTML під час dev та build                               |
| **Sass (Dart Sass)**                             | Препроцесор: змінні, map-и, міксини, функції, модулі; Vite компілює `.scss` сам           |
| **PostCSS + Autoprefixer**                       | Постпроцесор: додає вендорні префікси за списком Browserslist                             |
| **Browserslist**                                 | Список цільових браузерів (`.browserslistrc`)                                             |
| **sharp**                                        | `npm run images`: конвертація й ресайз у AVIF/WebP/JPEG                                   |
| **Prettier** + `@prettier/plugin-pug`            | Єдине форматування SCSS, Pug, JS, JSON, MD                                                |
| **Stylelint** + `stylelint-config-standard-scss` | Лінтинг SCSS: БЕМ-шаблон класів, вкладеність ≤ 3, без id та `!important`                  |
| **husky**                                        | Git-хуки `pre-commit` і `commit-msg`                                                      |
| **lint-staged**                                  | Запускає лінтери лише на файлах, що потрапили в коміт                                     |
| **commitlint** (`config-conventional`)           | Перевірка повідомлень комітів за Conventional Commits                                     |
| **GitHub Actions**                               | `npm ci` → `lint` → `build` → деплой на GitHub Pages                                      |

Усі збиральні залежності (`vite`, `sass`, `vituum`, `@vituum/vite-plugin-pug`, `sharp`, лінтери) лежать у **devDependencies**: у браузер потрапляє лише зібраний `dist/`, самі пакети на продакшні не виконуються.

## Цільові браузери (Browserslist)

`.browserslistrc`:

```text
last 2 Chrome versions
last 2 Firefox versions
last 2 Edge versions
last 2 Safari versions
last 2 iOS versions
```

Переглянути фактичний список і те, що префіксуватиме Autoprefixer:

```bash
npx browserslist
npx autoprefixer --info
```

У збірці це видно, наприклад, на `text-size-adjust`: вихідний SCSS містить лише `text-size-adjust: 100%;`, а в `dist/assets/main-*.css` з'являються `-webkit-text-size-adjust` і `-moz-text-size-adjust`.

### Що саме мініфікує CSS

У `npm run build` CSS мініфікується **самим Vite** (окремий `cssnano` не потрібен). У поточній мажорній версії (Vite 8) значення за замовчуванням для `build.cssMinify` — `lightningcss`; у старіших версіях це був `esbuild`. Autoprefixer при цьому потрібен: мініфікатор Vite орієнтується на `build.target`, а не на Browserslist.

## Оптимізація: до / після

> ⚠️ Зображення в репозиторії — це **згенеровані плейсхолдери** (плавні градієнти й прості фігури), які стискаються набагато краще за фото. Значення нижче показують механіку й порядок співвідношень, а не результат для реальних фотографій. Після заміни зображень перерахуйте таблицю (`npm run images` виводить загальні розміри).

**CSS** (повний `main.scss`):

| Варіант                                 | Розмір  | gzip   |
| --------------------------------------- | ------- | ------ |
| Вихід Sass (до PostCSS і мініфікації)   | 12.6 KB | 2.6 KB |
| `dist/assets/main-*.css` (після збірки) | 10.2 KB | 2.5 KB |

**Зображення** (приклад: `work-01`, ширина 800 px):

| Формат        | Розмір  | Від вихідного JPEG (1600 px) |
| ------------- | ------- | ---------------------------- |
| Вихідний JPEG | 36.7 KB | 100 %                        |
| JPEG 800 px   | 6.7 KB  | 18 %                         |
| WebP 800 px   | 4.4 KB  | 12 %                         |
| AVIF 800 px   | 2.7 KB  | 7 %                          |

Браузер завантажує один файл: AVIF, якщо підтримує, інакше WebP, інакше JPEG. Потрібну ширину він вибирає за `srcset` і `sizes`.

## Git: коміти й хуки

- Історія комітів відображає хід роботи; повідомлення пишуться за [Conventional Commits](https://www.conventionalcommits.org/) (`feat: …`, `fix: …`, `chore: …`, `style: …`). Інакше `commit-msg` хук відхилить коміт.
- `pre-commit` запускає `lint-staged`: для `.scss` — `stylelint --fix` і `prettier --write`; для `.pug`, `.js`, `.json`, `.md` — `prettier --write`. Коміт із помилкою Stylelint (наприклад, клас `.Card_Title` або порожній блок) **блокується**.
- Хук можна обійти (`--no-verify`), тому той самий `npm run lint` виконується ще й у CI.

## Публікація на GitHub Pages

1. Створіть репозиторій `landing-keepsake-vite` на GitHub і запуште гілку `main`.
2. У **Settings → Pages → Build and deployment → Source** виберіть **GitHub Actions**.
3. Кожен пуш у `main` запускає `.github/workflows/deploy.yml`: `npm ci` → `npm run lint` → `npm run build` → публікація `dist/`.
4. Папка `dist` у репозиторій **не комітиться**: її збирає workflow.

У `vite.config.js` задано `base: '/landing-keepsake-vite/'` для збірки (`command === 'build'`), інакше стилі й зображення не завантажаться за адресою `https://Roman-Tsp8.github.io/landing-keepsake-vite/`. У dev-режимі `base` дорівнює `/`.

> Якщо назва репозиторію чи акаунт інші — змініть `base` у `vite.config.js` і посилання на демо вгорі цього файлу.

## Ліцензії

Шрифт **Inter Variable** розповсюджується за ліцензією SIL Open Font License 1.1.
