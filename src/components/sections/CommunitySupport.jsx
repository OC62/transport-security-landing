import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import GlassmorphicButton from '../ui/GlassmorphicButton';

// Импортируем изображение
import footballTeamImage from '../../assets/images/team-football.webp';

const CommunitySupport = () => {
  return (
    <section id="community" className="relative py-32 md:py-40 bg-gray-50">
      {/* Фоновое изображение */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full min-h-[500px] md:min-h-[600px] bg-cover bg-center"
          style={{ backgroundImage: `url(${footballTeamImage})` }}
        ></div>
        {/* Градиентная маска для улучшения читаемости текста */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-green-800 opacity-60"></div>
      </div>

      {/* Контент */}
      <div className="container mx-auto px-4 relative z-10 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 text-transparent bg-clip-text">
            Поддержка детского спорта
          </h2>
          <p className="text-lg md:text-xl mb-8 bg-gradient-to-r from-blue-100 to-green-200 text-transparent bg-clip-text leading-relaxed">
            ООО "ПТБ-М" активно участвует в развитии детского и юношеского
            спорта, поддерживая футбольные команды и спортивные школы в
            Ростовской области. Мы верим, что здоровое поколение — основа
            сильной страны.
          </p>
          <p className="text-md md:text-lg mb-10 bg-gradient-to-r from-blue-50 to-green-100 text-transparent bg-clip-text">
            Наша команда помогает юным спортсменам в приобретении формы,
            инвентаря и организации турниров, внося вклад в будущее региона.
          </p>

          {/* Кнопка с белым текстом */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.3 }}
          >
            <GlassmorphicButton
              variant="onLight"
              size="large"
              onClick={() => {
                const contactSection = document.getElementById('contact');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-4 text-white"
            >
              Связаться с нами
            </GlassmorphicButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunitySupport;
