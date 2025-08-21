// src/components/sections/Hero.jsx
import { motion } from 'framer-motion';
import { GlassmorphicButton } from '../ui/GlassmorphicButton';
import heroVideo from '../../assets/videos/Bridge.mp4'; // Теперь только MP4

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
          preload="metadata"
          className="w-full h-full object-cover"
        >
          {/* Основной источник — MP4 (поддерживается везде, включая Safari) */}
          <source src={heroVideo} type="video/mp4" />
          
          {/* Резервное изображение, если видео не поддерживается */}
          <img 
            src="/images/hero-fallback.jpg" 
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
                staggerChildren: 0.2,   // Задержка между появлением элементов
                delayChildren: 0.3,     // Задержка перед началом анимации
              }
            }
          }}
          className="max-w-3xl"
        >
          {/* Заголовок с градиентным текстом */}
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }}
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-green-200 text-transparent bg-clip-text leading-tight"
          >
            Обеспечиваем безопасность на объектах дорожного хозяйства с 2017 года
          </motion.h1>

          {/* Подзаголовок */}
          <motion.p
            variants={{
              hidden: { opacity: 0, y: -15 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.6 }}
            className="text-lg md:text-xl mb-8 bg-gradient-to-r from-blue-100 to-blue-200 text-transparent bg-clip-text"
          >
            ООО "Подразделение транспортной безопасности -М" – профессионалы, которым можно доверять
          </motion.p>

          {/* Кнопка */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
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
    </section>
  );
};