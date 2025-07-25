// src/components/sections/CasesSlider.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

export const CasesSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const cases = [
    {
      id: 1,
      title: "Обеспечение безопасности на ЖД узле в Сибири",
      description: "Комплексное решение для защиты железнодорожного транспорта в условиях экстремальных климатических условий",
      results: "Снижение инцидентов на 85%, экономия 2 млн руб. в год",
      image: "/images/case1.jpg" // Заглушка
    },
    {
      id: 2,
      title: "Система мониторинга для логистической компании",
      description: "Внедрение системы GPS-навигации и трекинга грузов для крупного логистического оператора",
      results: "Повышение эффективности на 40%, уменьшение простоев",
      image: "/images/case2.jpg" // Заглушка
    },
    {
      id: 3,
      title: "Аудит безопасности аэропорта",
      description: "Проведение комплексного аудита системы безопасности международного аэропорта",
      results: "Выявлено 15 критических уязвимостей, разработан план улучшений",
      image: "/images/case3.jpg" // Заглушка
    }
  ];

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

        <div className="relative max-w-6xl mx-auto">
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
                {/* Заглушка для изображения */}
                <div className="w-full h-80 bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-6xl">📊</span>
                </div>
                {/* <img 
                  src={cases[currentSlide].image} 
                  alt={cases[currentSlide].title}
                  className="w-full h-80 object-cover rounded-lg"
                /> */}
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