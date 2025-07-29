// src/components/sections/CasesSlider.jsx
import { useState, useRef, useEffect } from 'react'; // Добавлены useRef и useEffect
import { motion } from 'framer-motion';
import BusstationsImage from '../../assets/images/Main_Bus_Station.png';
import BreadgeImage from '../../assets/images/Rost_Sea.png';
import OtiImage from '../../assets/images/bg_Hero.png';

export const CasesSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0); // useRef для хранения начальной координаты касания
  const sliderRef = useRef(null); // useRef для получения ссылки на контейнер слайдера

  const cases = [
    {
      id: 1,
      title: "Реализация комплексной системы транспортной безопасности на автовокзалах",
      description: "Комплексное решение для защиты автовокзалов",
      results: "Снижение инцидентов на 85%, экономия 2 млн руб. в год",
      image: BusstationsImage,
    },
    {
      id: 2,
      title: "Реализация комплексной системы транспортной безопасности на строящихся объектах транспортной инфраструктуры (СОТИ)",
      description: "Комплексное решение для защиты СОТИ",
      results: "Снижение инцидентов на 90%, экономия 2 млн руб. в год",
      image: BreadgeImage,
    },
    {
      id: 3,
      title: "Реализация комплексной системы транспортной безопасности на действующих объектах транспортной инфраструктуры (ОТИ)",
      description: "Проведение комплексного аудита системы безопасности ОТИ",
      results: "Выявлено 15 критических уязвимостей, разработан план улучшений",
      image: OtiImage,
    }
  ];

  // Функция для обработки начала касания
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  // Функция для обработки движения пальца
  const handleTouchMove = (e) => {
    // Предотвращаем стандартное поведение (прокрутку страницы), если палец движется горизонтально
    if (!sliderRef.current) return;
    const touchX = e.touches[0].clientX;
    const diffX = touchStartX.current - touchX;

    // Порог чувствительности (например, 10px)
    if (Math.abs(diffX) > 10) {
      e.preventDefault(); // Предотвращаем вертикальную прокрутку при горизонтальном свайпе
    }
  };

  // Функция для обработки окончания касания
  const handleTouchEnd = (e) => {
    if (!sliderRef.current || !e.changedTouches.length) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // Минимальная дистанция свайпа для переключения (например, 50px)
    const minSwipeDistance = 50;

    if (diffX > minSwipeDistance) {
      // Свайп влево - следующий слайд
      setCurrentSlide((prev) => (prev === cases.length - 1 ? 0 : prev + 1));
    } else if (diffX < -minSwipeDistance) {
      // Свайп вправо - предыдущий слайд
      setCurrentSlide((prev) => (prev === 0 ? cases.length - 1 : prev - 1));
    }
    // Если дистанция меньше порога, ничего не делаем
  };

  // useEffect для добавления/удаления обработчиков событий
  useEffect(() => {
    const sliderElement = sliderRef.current;
    if (!sliderElement) return;

    // Добавляем обработчики событий касания
    sliderElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    sliderElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    sliderElement.addEventListener('touchend', handleTouchEnd);

    // Функция для очистки (удаления обработчиков при размонтировании компонента)
    return () => {
      sliderElement.removeEventListener('touchstart', handleTouchStart);
      sliderElement.removeEventListener('touchmove', handleTouchMove);
      sliderElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [cases.length]); // Зависимость от длины массива cases

  return (
    <section id="cases" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Наши кейсы
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Успешные проекты по обеспечению транспортной безопасности по всей России
          </p>
        </div>

        {/* Контейнер слайдера с ref для отслеживания касаний */}
        <div
          ref={sliderRef} // Добавлен ref
          className="relative max-w-6xl mx-auto"
        >
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-xl p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  {cases[currentSlide].title}
                </h3>
                <p className="text-gray-300 mb-6 text-lg">
                  {cases[currentSlide].description}
                </p>
                <div className="bg-red-500/20 border-l-4 border-red-500 p-4 rounded">
                  <p className="font-semibold">
                    Результаты: {cases[currentSlide].results}
                  </p>
                </div>
              </div>
              <div>
                <img
                  src={cases[currentSlide].image}
                  alt={cases[currentSlide].title}
                  className="w-full h-80 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    // Создаем элемент с иконкой, если изображение не загрузилось
                    const iconElement = document.createElement('div');
                    iconElement.className = 'w-full h-80 bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg flex items-center justify-center';
                    iconElement.innerHTML = '<span class="text-6xl">📊</span>';
                    e.target.parentNode.appendChild(iconElement);
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Навигация */}
          <div className="flex justify-center mt-8 space-x-4">
            {cases.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Перейти к слайду ${index + 1}`}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-red-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};