// src/components/sections/About.jsx
import { motion } from 'framer-motion';
import TeamImage from '../../assets/images/team.jpg';

export const About = () => {
  const advantages = [
    {
      title: "Более 8 лет на рынке",
      description: "Опыт работы в сфере транспортной безопасности",
      icon: "🏆"
    },
    {
      title: "Аттестованные специалисты",
      description: "Команда профессионалов и",
      icon: "👨‍💼"
    },
    {
      title: "По всей России",
      description: "Уже работаем в 5+ регионах страны",
      icon: "🗺️"
    },
    {
      title: "Комплексный подход",
      description: "Полный спектр услуг под ключ",
      icon: "🔧"
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            О нашей компании
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Мы специализируемся на реализации комплекса мер по обеспечению транспортной безопасности, 
            защищая интересы государственных и частных организаций
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Наша миссия
            </h3>
            <p className="text-gray-600 mb-4">
              Обеспечение транспортной безопасности в сфере дорожного хозяйства 
              за счет внедрения современных технологий и профессиональных решений. 
              Мы гарантируем защиту объектов транспортной инфраструктуры, 
              грузов и пассажиров в строгом соответствии с требованиями Федерального закона № 16-ФЗ 
              «О транспортной безопасности» и иных нормативных актов РФ.
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Наш опыт
            </h3>
            <p className="text-gray-600">
              Уже более 8 лет мы разрабатываем индивидуальные 
              решения для каждого клиента, учитывая особенности его деятельности и 
              актуальные законодательные требования. Наши услуги помогают обеспечить 
              безопасность на всех этапах транспортно-логистических процессов.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
              <img 
                src={TeamImage} 
                alt="Команда ООО ПТБ-М" 
                className="w-full h-full object-cover" // Изменены классы здесь
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Команда сертифицированных специалистов по транспортной безопасности
              </p>
            </div>
          </motion.div>
        </div>

        {/* Преимущества */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{advantage.icon}</div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                {advantage.title}
              </h4>
              <p className="text-gray-600">
                {advantage.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};