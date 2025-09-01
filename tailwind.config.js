/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9ACD32', // Зеленый фон
        secondary: '#000000', // Черный
        accent: '#FFFFFF', // Белый
        'green-900/80': 'rgba(154, 205, 50, 0.8)', // Прозрачный зеленый
        'green-800/60': 'rgba(154, 205, 50, 0.6)', // Прозрачный зеленый
        // Добавляем цвета для градиентов в CommunitySupport
        'blue-900': '#1e3a8a',
        'blue-800': '#1e40af',
        'green-800': '#065f46',
      },
      screens: {
        // Добавляем кастомные breakpoints для всех разрешений
        'xs': '425px',
        'xxs': '375px',
        'xxxs': '325px',
        'xxxxs': '320px', // Новая точка останова для 320px
        'lg-md': '1024px',
        'xl-md': '1280px',
      },
      fontSize: {
        // Добавляем кастомные размеры шрифтов для адаптации
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        // Добавляем очень маленький размер шрифта для xs экранов
        'xs-sm': ['0.65rem', { lineHeight: '1rem' }],
        'xxxxs': ['0.45rem', { lineHeight: '1.1rem' }], // Новый размер для 320px
      },
      // Добавляем поддержку шрифта Inter
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      // Добавляем анимации из index.css
      animation: {
        'spin-slow': 'logo-spin 20s linear infinite',
      },
      keyframes: {
        'logo-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' }
        }
      },
      borderRadius: {
        // Добавляем кастомные радиусы для бордеров
        'xs': '0.125rem',
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      }
    },
  },
  plugins: [],
  // Расширяем safelist для всех необходимых классов
  safelist: [
    // Классы Swiper
    'swiper-button-next',
    'swiper-button-prev',
    'swiper-button-disabled',
    'swiper-slide-shadow-prev',
    'swiper-slide-shadow-next',
    
    // Классы GlassmorphicButton
    'glassmorphic-btn',
    'glassmorphic-btn:hover',
    'glassmorphic-btn:active',
    
    // Классы для анимаций
    'animate-spin-slow',
    
    // Классы для line-clamp (оставляем в safelist, так как они используются)
    'line-clamp-1',
    'line-clamp-2',
    'line-clamp-3',
    
    // Классы для адаптации под разные разрешения
    'xs:hidden',
    'xs:flex',
    'xs:block',
    'xs:text-xs',
    'xs:text-sm',
    'xs:text-base',
    'xs:text-[0.65rem]',
    'xxs:hidden',
    'xxs:flex',
    'xxs:block',
    'xxs:text-xs',
    'xxs:text-sm',
    'xxs:text-base',
    'xxs:text-[0.85rem]',
    'xxxs:hidden',
    'xxxs:flex',
    'xxxs:block',
    'xxxs:text-xs',
    'xxxs:text-sm',
    'xxxs:text-base',
    'xxxs:text-[0.75rem]',
    'xxxs:text-[0.55rem]',
    'xxxxs:hidden',
    'xxxxs:flex',
    'xxxxs:block',
    'xxxxs:text-xs',
    'xxxxs:text-sm',
    'xxxxs:text-base',
    'xxxxs:text-[0.65rem]',
    'xxxxs:text-[0.45rem]',
    'lg-md:hidden',
    'lg-md:flex',
    'lg-md:block',
    
    // Классы для градиентов
    'bg-gradient-to-r',
    'from-white',
    'to-blue-100',
    'text-transparent',
    'bg-clip-text',
    'from-blue-100',
    'to-green-200',
    'from-blue-50',
    'to-green-100',
    
    // Классы для скругления углов
    'rounded-t-xl',
    'rounded-b-xl',
    'rounded-xl',
    'rounded-lg',
    'rounded-md',
    'rounded-sm',
    'overflow-hidden',
    
    // Классы для адаптивной высоты
    'h-[400px]',
    'md:h-[500px]',
    'min-h-[300px]',
    'min-h-[380px]',
    'md:min-h-[500px]',
    'h-[70vw]',
    
    // Классы для обрезки изображений
    'object-contain',
    'max-h-full',
    'max-w-full',
    
    // Классы для фона
    'bg-cover',
    'bg-center',
    
    // Классы для статусов
    'bg-red-500/20',
    'border-red-500',
    
    // Классы для z-index
    'z-0',
    'z-10',
    'z-20',
    'z-30',
    'z-40',
    'z-50',
    
    // Классы для теней
    'shadow-sm',
    'shadow-md',
    'shadow-lg',
    'shadow-xl',
    'shadow-2xl',
    
    // Классы для прозрачности
    'opacity-60',
    'opacity-80',
    'bg-black/50',
    
    // Классы для адаптации текста
    'text-xs',
    'sm:text-xs',
    'sm:text-sm',
    'md:text-sm',
    'lg:text-sm',
    'xl:text-base',
    'xs:text-xs-sm',
    
    // Классы для бордер радиуса
    'rounded',
    'rounded-t',
    'rounded-b',
    'rounded-l',
    'rounded-r',
    'rounded-tl',
    'rounded-tr',
    'rounded-br',
    'rounded-bl',
  ],
}