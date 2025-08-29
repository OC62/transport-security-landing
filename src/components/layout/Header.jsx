// src/components/layout/Header.jsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import logoImage from '../../assets/images/logo.webp';
import { GlassmorphicButton } from '../ui/GlassmorphicButton';

// Компонент выпадающего меню
const DropdownMenu = ({ item, scrollToSection, setIsMenuOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ vertical: 'bottom', horizontal: 'left' });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100); // Уменьшено до 100ms
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current && buttonRef.current) {
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const buttonRect = buttonRef.current.getBoundingClientRect();
      
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      const verticalPosition = spaceBelow < dropdownRect.height && spaceAbove > dropdownRect.height ? 'top' : 'bottom';
      
      const spaceRight = window.innerWidth - buttonRect.left;
      const spaceLeft = buttonRect.right;
      
      let horizontalPosition = 'left';
      if (spaceRight < dropdownRect.width && spaceLeft > dropdownRect.width) {
        horizontalPosition = 'right';
      }
      
      setPosition({ vertical: verticalPosition, horizontal: horizontalPosition });
    }
  }, [isOpen]);

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        ref={buttonRef}
        className="flex items-center text-gray-700 hover:text-primary font-medium transition-colors text-xs lg:text-sm whitespace-nowrap py-2 px-2 group"
      >
        {item.name}
        <svg 
          className="ml-1 w-3 h-3 transition-transform duration-200 group-hover:rotate-180" 
          viewBox="0 0 12 12" 
          fill="currentColor"
        >
          <path d="M6 8.5L2.5 5l.7-.7L6 7.1l2.8-2.8.7.7L6 8.5z"/>
        </svg>
      </button>
      
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: position.vertical === 'bottom' ? -10 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          className={`absolute w-56 bg-white rounded-md shadow-xl py-1 z-[9999] border border-gray-100 ${
            position.vertical === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
          } ${
            position.horizontal === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{ 
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {item.submenu.map((subItem, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                scrollToSection(subItem.href);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors whitespace-normal"
            >
              {subItem.name}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  useEffect(() => {
    if (isMenuOpen && isMobileView) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isMobileView]);

  const scrollToSection = (sectionId) => {
    setIsMenuOpen(false);
    
    setTimeout(() => {
      const id = sectionId.startsWith('#') ? sectionId.slice(1) : sectionId;
      const element = document.getElementById(id);
      if (element) {
        const headerHeight = headerRef.current?.offsetHeight || 0;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 100);
  };

  const navItems = [
    { name: 'Главная', href: '#hero' },
    { 
      name: 'О компании', 
      href: '#about',
      submenu: [
        { name: 'О нас', href: '#about' },
        { name: 'Преимущества', href: '#about' },
        { name: 'Лицензии', href: '#licenses' },
        { name: 'Партнеры', href: '#partners' }
      ]
    },
    { 
      name: 'Услуги', 
      href: '#services',
      submenu: [
        { name: 'Все услуги', href: '#services' },
        { name: 'Аудит безопасности', href: '#services' },
        { name: 'Мониторинг угроз', href: '#services' },
        { name: 'Обучение персонала', href: '#services' },
        { name: 'Техническое оснащение', href: '#services' }
      ]
    },
    { 
      name: 'Проекты', 
      href: '#cases',
      submenu: [
        { name: 'Наши кейсы', href: '#cases' },
        { name: 'Реализованные проекты', href: '#cases' },
        { name: 'Социальная ответственность', href: '#community' }
      ]
    },
    { 
      name: 'Вакансии', 
      href: '#careers',
      submenu: [
        { name: 'Текущие вакансии', href: '#careers' },
        { name: 'Карьера в компании', href: '#careers' }
      ]
    },
    { name: 'Контакты', href: '#contact' }
  ];

  return (
    <header 
      ref={headerRef}
      className="fixed w-full bg-white/90 backdrop-blur-sm shadow-sm z-50"
      style={{ overflow: 'visible' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Логотип */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => scrollToSection('#hero')}
          >
            <img src={logoImage} alt="Логотип ООО ПТБ-М" className="h-8" />
            <span className="text-xl lg:text-base font-bold text-primary">ООО "ПТБ-М"</span>
          </div>

          {/* Навигация для десктопа */}
          <nav className={`${isMobileView ? 'hidden' : 'flex'} items-center space-x-2`}>
            <div className="flex space-x-2">
              {navItems.map((item, index) => (
                item.submenu ? (
                  <DropdownMenu 
                    key={index} 
                    item={item} 
                    scrollToSection={scrollToSection}
                    setIsMenuOpen={setIsMenuOpen}
                  />
                ) : (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.href);
                    }}
                    className="text-gray-700 hover:text-primary font-medium transition-colors text-xs lg:text-sm whitespace-nowrap py-2 px-2"
                  >
                    {item.name}
                  </button>
                )
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
            className={`${isMobileView ? 'block' : 'hidden'} text-gray-700 hover:text-primary transition-colors`}
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
            className="py-4 border-t border-gray-200"
            style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}
          >
            <div className="space-y-3">
              {navItems.map((item, index) => (
                <div key={index}>
                  {item.submenu ? (
                    <div>
                      <button 
                        className="flex items-center w-full text-left px-2 py-2 text-gray-700 hover:text-primary font-medium transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(item.href);
                        }}
                      >
                        {item.name}
                        <svg 
                          className="ml-1 w-3 h-3" 
                          viewBox="0 0 12 12" 
                          fill="currentColor"
                        >
                          <path d="M6 8.5L2.5 5l.7-.7L6 7.1l2.8-2.8.7.7L6 8.5z"/>
                        </svg>
                      </button>
                      <div className="pl-4 space-y-2">
                        {item.submenu.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            onClick={(e) => {
                              e.preventDefault();
                              scrollToSection(subItem.href);
                            }}
                            className="block text-gray-600 hover:text-primary font-medium py-1 px-2 w-full text-left text-sm transition-colors"
                          >
                            {subItem.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(item.href);
                      }}
                      className="block text-gray-700 hover:text-primary font-medium py-2 px-2 w-full text-left transition-colors"
                    >
                      {item.name}
                    </button>
                  )}
                </div>
              ))}
              <GlassmorphicButton
                variant="onWhite"
                size="large"
                onClick={() => scrollToSection('#contact')}
                className="w-full mt-4"
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