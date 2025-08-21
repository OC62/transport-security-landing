// src/components/sections/About.jsx
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// Импорт стилей Swiper (если не подключены глобально — раскомментируйте)
// import 'swiper/css';
// import 'swiper/css/autoplay';

// Импортируем изображения команды
import TeamImage1 from '../../assets/images/team1.webp';
import TeamImage2 from '../../assets/images/team2.webp';
import TeamImage3 from '../../assets/images/team3.webp';
import TeamImage4 from '../../assets/images/team4.webp';
import TeamImage5 from '../../assets/images/team5.webp';
import TeamImage6 from '../../assets/images/team6.webp';
import TeamImage7 from '../../assets/images/team7.webp';
import TeamImage8 from '../../assets/images/team8.webp';

export const About = () => {
  // Обновлённый список преимуществ с упором на реальные достижения
  const advantages = [
    {
      title: "Более 8 лет на рынке",
      description: "Опыт в проектировании и строительстве объектов дорожной инфраструктуры",
      icon: "🏆"
    },
    {
      title: "Аттестованные специалисты",
      description: "Команда сертифицированных экспертов, прошедших подготовку по требованиям ФЗ-16",
      icon: "👨‍💼"
    },
    {
      title: "Работа с госзаказчиками",
      description: "Сотрудничаем с ФКУ Упрдор, администрациями регионов и ГКУ",
      icon: "🏛️"
    },
    {
      title: "Комплексный подход",
      description: "Полный цикл работ: от разработки проекта до сдачи объекта",
      icon: "🔧"
    }
  ];

  const teamPhotos = [
    {
      src: TeamImage1,
      name: "Группа быстрого реагирования",
      position: "Автомобиль ГБР в режиме ожидания"
    },
    {
      src: TeamImage2,
      name: "Дежурная смена",
      position: "Коллектив перед заступлением на дежурство"
    },
    {
      src: TeamImage3,
      name: "Группа быстрого реагирования",
      position: "Инструктаж перед выездом на объект"
    },
    {
      src: TeamImage4,
      name: "Группа быстрого реагирования",
      position: "Выезд на проверку объекта транспортной безопасности"
    },
    {
      src: TeamImage5,
      name: "Сотрудники дежурной смены",
      position: "В полной экипировке перед началом дежурства"
    },
    {
      src: TeamImage6,
      name: "Специалисты ТСО",
      position: "Настройка и диагностика технических средств охраны"
    },
    {
      src: TeamImage7,
      name: "Группа быстрого реагирования",
      position: "Проверка объекта транспортной безопасности"
    },
    {
      src: TeamImage8,
      name: "Дежурная смена",
      position: "Тренировка и инструктаж перед заступлением на дежурство"
    },
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
              Уже более 8 лет мы участвуем в реализации крупных инфраструктурных проектов 
              в сотрудничестве с ФКУ Упрдор, администрациями Ростовской и Волгоградской областей. 
              Наша команда отвечает за безопасность на всех этапах строительства и эксплуатации 
              объектов транспортной инфраструктуры.
            </p>
          </motion.div>

          {/* Слайдер с фото команды */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <div className="w-full h-64 rounded-lg mb-6 overflow-hidden">
              <Swiper
                modules={[Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                }}
                className="team-swiper"
              >
                {teamPhotos.map((member, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative w-full h-64">
                      <img
                        src={member.src}
                        alt={`Фото: ${member.position}`}
                        className="w-full h-full object-cover"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-black/50 flex flex-col justify-end p-4 text-white"
                      >
                        <p className="font-semibold text-sm sm:text-base">{member.name}</p>
                        <p className="text-xs sm:text-sm text-gray-200">{member.position}</p>
                      </motion.div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Команда аттестованных специалистов по транспортной безопасности
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