// src/components/sections/CommunitySupport.jsx
import { motion } from 'framer-motion';

// Импортируем изображение (замените путь на реальный)
import footballTeamImage from '../../assets/images/team-football.webp';

export const CommunitySupport = () => {
  return (
    <section id="community" className="relative py-20 bg-gray-50">
      {/* Фоновое изображение */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${footballTeamImage})` }}
        ></div>
        {/* Градиентная маска для улучшения читаемости текста */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-green-800 opacity-80"></div>
      </div>

      {/* Контент */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 text-transparent bg-clip-text">
            Поддержка детского спорта
          </h2>
          <p className="text-lg md:text-xl mb-8 bg-gradient-to-r from-blue-100 to-green-200 text-transparent bg-clip-text leading-relaxed">
            ООО "ПТБ-М" активно участвует в развитии детского и юношеского спорта, 
            поддерживая футбольные команды и спортивные школы в Ростовской области. 
            Мы верим, что здоровое поколение — основа сильной страны.
          </p>
          <p className="text-md md:text-lg mb-10 bg-gradient-to-r from-blue-50 to-green-100 text-transparent bg-clip-text">
            Наша команда помогает юным спортсменам в приобретении формы, инвентаря 
            и организации турниров, внося вклад в будущее региона.
          </p>

          {/* Кнопка (опционально) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={() => {
                const contactSection = document.getElementById('contact');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-blue-900 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
            >
              Поддержать проект
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};