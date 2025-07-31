// src/components/Breadcrumbs.jsx
import { useState, useEffect } from 'react';

// Определяем список секций с их ID и названиями
const sections = [
  { id: 'hero', name: 'Главная' },
  { id: 'about', name: 'О нас' },
  { id: 'services', name: 'Услуги' },
  { id: 'cases', name: 'Кейсы' },
  { id: 'careers', name: 'Вакансии' },
  { id: 'licenses', name: 'Лицензии' },
  { id: 'contact', name: 'Контакты' },
];

export const Breadcrumbs = () => {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    let observer = null;

    // Функция для обработки пересечений секций с вьюпортом
    const handleIntersection = (entries) => {
      // Находим все секции, которые пересекаются более чем на 40%
      const visibleSections = entries
        .filter(entry => entry.isIntersecting && entry.intersectionRatio >= 0.4)
        .map(entry => ({
          id: entry.target.id,
          ratio: entry.intersectionRatio,
          top: entry.boundingClientRect.top
        }));

      if (visibleSections.length > 0) {
        // Сортируем по степени видимости (от большей к меньшей)
        visibleSections.sort((a, b) => b.ratio - a.ratio);
        // Если степень видимости одинаковая, выбираем ту, что выше на экране
        if (Math.abs(visibleSections[0].ratio - visibleSections[1]?.ratio) < 0.01) {
            visibleSections.sort((a, b) => a.top - b.top);
        }
        // Устанавливаем самую "видимую" секцию как активную
        setActiveSection(visibleSections[0].id);
      } else if (entries.length > 0) {
        // Если нет секций с >40% видимости, найдем ту, которая ближе всего к верху экрана
        const allEntries = entries.map(entry => ({
          id: entry.target.id,
          top: entry.boundingClientRect.top
        }));
        allEntries.sort((a, b) => Math.abs(a.top) - Math.abs(b.top));
        setActiveSection(allEntries[0].id);
      }
    };

    // Опции для IntersectionObserver
    const options = {
      root: null, // Относительно вьюпорта
      rootMargin: '0px',
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], // Срабатывает при разных уровнях видимости
    };

    // Создаем наблюдатель
    observer = new IntersectionObserver(handleIntersection, options);

    // Наблюдаем за каждой секцией
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    // Функция очистки
    return () => {
      if (observer) {
        sections.forEach((section) => {
          const element = document.getElementById(section.id);
          if (element) {
            observer.unobserve(element);
          }
        });
      }
    };
  }, []); // Пустой массив зависимостей - эффект запускается один раз после монтирования

  // Функция для плавной прокрутки к секции
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav aria-label="Навигационная цепочка" className="bg-gray-100 py-2 px-4 text-sm hidden md:block border-b"> {/* Скрыто на мобильных */}
      <ol className="list-none p-0 inline-flex flex-wrap">
        {sections.map((section, index) => (
          <li key={section.id} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-500">/</span>}
            {section.id === activeSection ? (
              <span className="text-blue-600 font-medium" aria-current="page">
                {section.name}
              </span>
            ) : (
              // Используем button вместо <a> для внутренней навигации по странице
              <button
                onClick={() => scrollToSection(section.id)}
                className="text-gray-600 hover:text-blue-800 transition-colors"
              >
                {section.name}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};