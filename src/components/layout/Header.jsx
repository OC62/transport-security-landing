// src/components/layout/Header.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import logoImage from '../../assets/images/logo.webp';
// Импортируем новый компонент GlassmorphicButton
import { GlassmorphicButton } from '../ui/GlassmorphicButton';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Централизованная функция для плавной прокрутки к секции
  const scrollToSection = (sectionId) => {
    // Закрываем мобильное меню, если оно открыто
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }

    // Небольшая задержка, чтобы меню успело закрыться перед прокруткой (только для мобильного)
    const delay = isMenuOpen ? 100 : 0;
    
    setTimeout(() => {
      // Убедимся, что sectionId начинается с #
      const id = sectionId.startsWith('#') ? sectionId.slice(1) : sectionId;
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, delay);
  };

  const navItems = [
    { name: 'Главная', href: '#hero' },
    { name: 'О нас', href: '#about' },
    { name: 'Услуги', href: '#services' },
    { name: 'Кейсы', href: '#cases' },
    { name: 'Наши вакансии', href: '#careers' },
    { name: 'Лицензии', href: '#licenses' },
    { name: 'Партнеры', href: '#partners' },
    { name: 'Вакансии', href: '#careers' },
    { name: 'Контакты', href: '#contact' }
  ];

  return (
    <header className="fixed w-full bg-white/90 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Логотип */}
          <div className="flex items-center space-x-2">
            <img src={logoImage} alt="Логотип ООО ПТБ-М" className="h-8" />
            {/* Шрифт уменьшается на lg и выше */}
            <span className="text-xl lg:text-base font-bold text-primary">ООО "ПТБ-М"</span>
          </div>

          {/* Навигация для десктопа - теперь скрывается на lg и меньше */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              // Используем button для внутренней навигации
              <button
                key={item.name}
                onClick={(e) => {
                  e.preventDefault(); // На случай, если останется href
                  scrollToSection(item.href);
                }}
                className="text-gray-700 hover:text-primary font-medium transition-colors text-sm xl:text-base whitespace-nowrap"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Кнопка CTA - теперь GlassmorphicButton */}
          <GlassmorphicButton 
            variant="onWhite" 
            size="large"
            onClick={() => scrollToSection('#contact')}
            className="hidden lg:block text-sm"
          >
            Получить консультацию
          </GlassmorphicButton>

          {/* Мобильное меню кнопка - теперь показывается на lg и меньше */}
          <button
            className="lg:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Мобильное меню - теперь показывается на lg и меньше */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden py-4 border-t"
          >
            <div className="space-y-3">
              {navItems.map((item) => (
                // Используем button для внутренней навигации
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block text-gray-700 hover:text-primary font-medium py-2 px-2 w-full text-left"
                >
                  {item.name}
                </button>
              ))}
              {/* Кнопка CTA в мобильном меню - теперь GlassmorphicButton */}
              <GlassmorphicButton
                variant="onWhite"
                size="large"
                onClick={() => scrollToSection('#contact')}
                className="w-full mt-2"
              >
                Получить консультацию
              </GlassmorphicButton>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};