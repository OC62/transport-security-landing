// src/components/sections/CasesSlider.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// Импорт стилей Swiper
import 'swiper/css';
import 'swiper/css/autoplay';

// Изображения
import BusstationsImage from '../../assets/images/Main_Bus_Station.webp';
import BreadgeImage from '../../assets/images/Rost_Sea.webp';
import OtiImage from '../../assets/images/bg_Hero.webp';

export const CasesSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const sliderRef = useRef(null);

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

  // Обработчик свайпа
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!sliderRef.current) return;
    const touchX = e.touches[0].clientX;
    const diffX = touchStartX.current - touchX;
    if (Math.abs(diffX) > 10) e.preventDefault();
  };

  const handleTouchEnd = useCallback((e) => {
    if (!sliderRef.current || !e.changedTouches.length) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;
    const minSwipeDistance = 50;

    if (diffX > minSwipeDistance) {
      setCurrentSlide((prev) => (prev === cases.length - 1 ? 0 : prev + 1));
    } else if (diffX < -minSwipeDistance) {
      setCurrentSlide((prev) => (prev === 0 ? cases.length - 1 : prev - 1));
    }
  }, [cases.length]);

  useEffect(() => {
    const sliderElement = sliderRef.current;
    if (!sliderElement) return;

    sliderElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    sliderElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    sliderElement.addEventListener('touchend', handleTouchEnd);

    return () => {
      sliderElement.removeEventListener('touchstart', handleTouchStart);
      sliderElement.removeEventListener('touchmove', handleTouchMove);
      sliderElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchEnd]);

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

        {/* Слайдер с текстом и изображением */}
        <div className="max-w-6xl mx-auto bg-gray-800 rounded-xl overflow-hidden">
          <Swiper
            ref={sliderRef}
            modules={[Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
            className="min-h-[380px]"
          >
            {cases.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
                  {/* Текстовая часть */}
                  <div className="flex flex-col justify-center">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 mb-6 text-base md:text-lg">
                      {item.description}
                    </p>
                    <div className="bg-red-500/20 border-l-4 border-red-500 p-4 rounded">
                      <p className="font-semibold text-sm md:text-base">
                        Результаты: {item.results}
                      </p>
                    </div>
                  </div>

                  {/* Изображение */}
                  <div className="flex items-center justify-center md:justify-end">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="max-w-full h-auto max-h-[300px] md:max-h-[400px] object-contain rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Индикаторы слайдов */}
          <div className="flex justify-center mt-4 pb-6">
            {cases.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const swiperEl = sliderRef.current?.swiper;
                  if (swiperEl) swiperEl.slideToLoop(index);
                }}
                aria-label={`Перейти к слайду ${index + 1}`}
                className={`w-3 h-3 rounded-full transition-colors mx-1 ${
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