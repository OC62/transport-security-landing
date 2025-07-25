// src/components/sections/Licenses.jsx
import { motion } from 'framer-motion';

export const Licenses = () => {
  // Массив с лицензиями и свидетельствами
  const licenses = [
    {
      id: 1,
      title: "Свидетельство об аккредитации в качестве подразделения транспортной безопасности",
      number: "№ 61-2-5-00011-24",
      issuedBy: "Федеральное дорожное агентство",
      issueDate: "17.05.2024",
      expiryDate: "16.05.2029",
      image: "/images/Выписка.jpg", // Заглушка
      description: "Дает право на оказание услуг по обеспечению транспортной безопасности в сфере дорожноего хозяйства, автомобильного транспорта и городского наземного электрического транспорта"
    },
    {
      id: 2,
      title: "Лицензия на осуществление деятельности в области использования источников ионизирующего излучения",
      number: "№61.РЦ.10.002.Л.00009.12.19",
      issuedBy: "Федеральная служба по надзору в сфере защиты прав потребителей и благополучия человека. Управление Федеральной службы о надзору в сфере защиты прав потребителей и благополучия человека по Ростовской области",
      issueDate: "12.12.2019",
      expiryDate: "бессрочно",
      image: "/images/Licenses.jpg", // Заглушка
      description: "Дает право на оказание услуг (выполнение работ) связанных с эксплуатацией источников ионизирующего излучения"
    },
  ];

  return (
    <section id="licenses" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Лицензии и свидетельства
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Наличие всех необходимых разрешений и сертификатов подтверждает наш профессионализм и надежность
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {licenses.map((license, index) => (
            <motion.div
              key={license.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Изображение документа */}
                <div className="md:w-1/3 flex items-center justify-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center">
                    <img
                      src={license.image}
                      alt={license.title}
                      className="max-h-44 w-auto object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        // Создаем элемент с иконкой, если изображение не загрузилось
                        const iconElement = document.createElement('div');
                        iconElement.className = 'text-4xl';
                        iconElement.innerHTML = '📄';
                        e.target.parentNode.appendChild(iconElement);
                      }}
                    />
                  </div>
                </div>
                
                {/* Информация о документе */}
                <div className="md:w-2/3">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {license.title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Номер:</span> {license.number}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Выдано:</span> {license.issuedBy}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Дата выдачи:</span> {license.issueDate}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Действует до:</span> {license.expiryDate}
                    </p>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {license.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Блок с предложением дополнительной информации */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Хотите увидеть оригиналы документов?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Мы готовы предоставить полный пакет лицензий и свидетельств по запросу. 
              Наши документы регулярно проходят проверку контролирующими органами.
            </p>
            <button 
              onClick={() => {
                const contactSection = document.getElementById('contact');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary inline-flex items-center"
            >
              Запросить документы
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};