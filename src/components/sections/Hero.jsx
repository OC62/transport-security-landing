import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import GlassmorphicButton from '../ui/GlassmorphicButton';
import heroVideo from '../../assets/videos/Bridge.mp4';

// Встроенный SVG placeholder для видео
const videoPosterSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080' fill='%23f3f4f6'%3E%3Crect width='1920' height='1080' fill='%233a3a3a'/%3E%3Cpath d='M960 540L1160 380' stroke='%23d1d5db' stroke-width='2'/%3E%3C/svg%3E";

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
    >
      {/* Фоновое видео */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={videoPosterSvg}
          className="w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
          <img
            src={videoPosterSvg}
            alt="Фон: дорожный объект, мост"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Полупрозрачный градиент для улучшения читаемости текста */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900 to-transparent opacity-80"></div>
      </div>

      {/* Основной контент */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
              },
            },
          }}
          className="max-w-3xl"
        >
          {/* Заголовок с градиентным текста */}
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 12 }}
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-green-200 text-transparent bg-clip-text leading-tight"
          >
            Комплексное обеспечение транспортной безопасности для объектов
            дорожного хозяйства с 2017 года.
          </motion.h1>

          {/* Подзаголовок */}
          <motion.p
            variants={{
              hidden: { opacity: 0, y: -15 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6 }}
            className="text-lg md:text-xl mb-8 bg-gradient-to-r from-blue-100 to-blue-200 text-transparent bg-clip-text"
          >
            ООО "Подразделение транспортной безопасности -М" – профессионалы,
            которым можно доверять
          </motion.p>

          {/* Кнопка */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <GlassmorphicButton
              variant="primary"
              size="large"
              onClick={() => {
                const contactSection = document.getElementById('contact');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Получить консультацию
            </GlassmorphicButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Индикатор прокрутки вниз */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
