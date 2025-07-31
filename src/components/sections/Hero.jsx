// src/components/sections/Hero.jsx
import { motion } from 'framer-motion';
// Импортируем новый компонент GlassmorphicButton
import { GlassmorphicButton } from '../ui/GlassmorphicButton';
import heroVideo from '../../assets/videos/Bridge.webm';

// Локальный компонент Button УДАЛЕН

export const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Фоновое видео */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-800 opacity-70"></div>
      </div>

      {/* Контент */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Обернем весь текст в motion.div для staggering */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2, // Задержка между анимациями дочерних элементов
                delayChildren: 0.3,   // Начальная задержка для дочерних элементов
              }
            }
          }}
          className="max-w-3xl"
        >
          {/* Анимируемый заголовок h1 с градиентным текстом */}
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }} // Используем spring для более "живого" эффекта
            // Добавлены классы для градиентного текста
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-green-300 text-transparent bg-clip-text"
          >
            Обеспечиваем безопасность на объектах дорожного хозяйства с 2017 года
          </motion.h1>

          {/* Анимируемый абзац p с градиентным текстом */}
          <motion.p
            variants={{
              hidden: { opacity: 0, y: -15 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.6 }}
            // Добавлены классы для градиентного текста
            className="text-xl mb-8 bg-gradient-to-r from-blue-100 to-blue-200 text-transparent bg-clip-text"
          >
            ООО "Подразделение транспортной безопасности -М" – профессионалы, которым можно доверять
          </motion.p>

          {/* Анимируемая кнопка (без float-эффекта) */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.5, delay: 0.7 }} // Появляется чуть позже
          >
            {/* Заменено локальное Button на GlassmorphicButton */}
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
    </section>
  );
};