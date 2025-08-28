// src/components/layout/Header.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import logoImage from '../../assets/images/logo.webp';
import { GlassmorphicButton } from '../ui/GlassmorphicButton';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Определяем тип устройства на основе ширины экрана
  useEffect(() => {
    const checkMobileView = () => {
      // 1024px - граница lg в Tailwind
      setIsMobileView(window.innerWidth < 1024);
    };
    
    // Проверяем при монтировании
    checkMobileView();
    
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', checkMobileView);
    
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const scrollToSection = (sectionId) => {
    // Закрываем мобильное меню при переходе
    setIsMenuOpen(false);
    
    setTimeout(() => {
      const id = sectionId.startsWith('#') ? sectionId.slice(1) : sectionId;
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
            <span className="text-xl lg:text-base font-bold text-primary">ООО "ПТБ-М"</span>
          </div>

          {/* Навигация для десктопа */}
          <nav className={`${isMobileView ? 'hidden' : 'flex'} space-x-2 overflow-x-auto pb-2`}>
            <div className="flex space-x-2 min-w-max">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  className="text-gray-700 hover:text-primary font-medium transition-colors text-xs lg:text-sm whitespace-nowrap py-2 px-2"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </nav>

          {/* Кнопка CTA для десктопа */}
          <GlassmorphicButton 
            variant="onWhite" 
            size="large"
            onClick={() => scrollToSection('#contact')}
            className={`${isMobileView ? 'hidden' : 'block'} text-xs`}
          >
            Получить консультацию
          </GlassmorphicButton>

          {/* Кнопка мобильного меню */}
          <button
            className={`${isMobileView ? 'block' : 'hidden'} text-gray-700`}
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

        {/* Мобильное меню */}
        {isMenuOpen && isMobileView && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="py-4 border-t"
          >
            <div className="space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block text-gray-700 hover:text-primary font-medium py-2 px-2 w-full text-left"
                >
                  {item.name}
                </button>
              ))}
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