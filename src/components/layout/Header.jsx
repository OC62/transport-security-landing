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
    { name: 'Растим чемпионов', href: '#community' },
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

          {/* Навигация для десктопа - исправлено для работы на 1024px */}
          <nav className="hidden xl-md:flex space-x-2 overflow-x-auto pb-2">
            <div className="flex space-x-2 min-w-max">
              {navItems.map((item) => (
                // Используем button для внутренней навигации
                <button
                  key={item.name}
                  onClick={(e) => {
                    e.preventDefault(); // На случай, если останется href
                    scrollToSection(item.href);
                  }}
                  className="text-gray-700 hover:text-primary font-medium transition-colors text-xs lg:text-sm whitespace-nowrap py-2 px-2"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </nav>

          {/* Кнопка CTA - исправлено для работы на 1024px */}
          <GlassmorphicButton 
            variant="onWhite" 
            size="large"
            onClick={() => scrollToSection('#contact')}
            className="hidden lg:block text-xs lg:text-sm"
          >
            Получить консультацию
          </GlassmorphicButton>

          {/* Мобильное меню кнопка - исправлено для работы на 1024px */}
          <button
            className="xl-md:hidden text-gray-700"
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

        {/* Мобильное меню - исправлено для работы на 1024px */}
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