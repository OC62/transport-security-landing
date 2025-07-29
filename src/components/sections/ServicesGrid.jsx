// src/components/sections/ServicesGrid.jsx
import { motion } from 'framer-motion';

export const ServicesGrid = () => {
  const services = [
    {
      id: 1,
      title: "Аудит безопасности",
      description: "Комплексная проверка существующих систем безопасности транспорта и инфраструктуры",
      icon: "🔍",
      features: [
        "Анализ уязвимостей",
        "Проверка соответствия нормам",
        "Рекомендации по улучшению"
      ]
    },
    {
      id: 2,
      title: "Мониторинг угроз",
      description: "Постоянное наблюдение за потенциальными угрозами и реагирование на инциденты",
      icon: "🛡️",
      features: [
        "24/7 мониторинг",
        "Система раннего предупреждения",
        "Оперативное реагирование"
      ]
    },
    {
      id: 3,
      title: "Обучение персонала",
      description: "Повышение квалификации сотрудников в области транспортной безопасности",
      icon: "🎓",
      features: [
        "Программы обучения",
        "Аттестация специалистов",
        "Практические тренинги"
      ]
    },
    {
      id: 4,
      title: "Консультации",
      description: "Экспертные консультации по вопросам транспортной безопасности",
      icon: "💡",
      features: [
        "Индивидуальный подход",
        "Разработка стратегий",
        "Поддержка при сертификации"
      ]
    },
    {
      id: 5,
      title: "Лицензирование",
      description: "Помощь в получении аккредитации на деятельность в сфере транспортной безопасности",
      icon: "📋",
      features: [
        "Подготовка документов",
        "Взаимодействие с органами",
        "Сопровождение процесса"
      ]
    },
    {
      id: 6,
      title: "Техническое оснащение",
      description: "Поставка и установка оборудования для обеспечения безопасности",
      icon: "⚙️",
      features: [
        "Системы видеонаблюдения",
        "Сигнализации и датчики",
        "Комплексные решения"
      ]
    }
  ];

  // Функция для плавной прокрутки к секции контактов
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Наши услуги
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Комплексные решения для обеспечения безопасности на всех этапах транспортного процесса
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="text-5xl mb-6">{service.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {service.description}
              </p>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              {/* Активная кнопка "Узнать больше" */}
              <button 
                onClick={scrollToContact}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Узнать больше
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};