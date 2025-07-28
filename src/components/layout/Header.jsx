// src/components/layout/Header.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import logoImage from '../../assets/images/logo.png';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <nav className="hidden lg:flex space-x-6 xl:space-x-8"> {/* Добавлен xl:space-x-8 для больших экранов */}
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary font-medium transition-colors text-sm xl:text-base whitespace-nowrap" // text-sm по умолчанию, xl:text-base для больших
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Кнопка CTA - также скрывается на lg и меньше */}
          <button className="hidden lg:block btn-primary text-sm">
            Получить консультацию
          </button>

          {/* Мобильное меню кнопка - теперь показывается на lg и меньше */}
          <button
            className="lg:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
            <div className="space-y-3"> {/* Уменьшено расстояние между пунктами */}
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-gray-700 hover:text-primary font-medium py-2 px-2" // Добавлен px-2 для лучшего вида
                  onClick={() => {
                    setIsMenuOpen(false);
                    // Плавная прокрутка для мобильных тоже
                    setTimeout(() => {
                      const element = document.querySelector(item.href);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100); // Небольшая задержка, чтобы меню успело закрыться
                  }}
                >
                  {item.name}
                </a>
              ))}
              <button
                className="w-full btn-primary mt-2" // Добавлен отступ сверху
                onClick={() => {
                  setIsMenuOpen(false);
                  // Прокрутка к форме контактов
                  setTimeout(() => {
                    const contactSection = document.getElementById('contact');
                    contactSection?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                Получить консультацию
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};