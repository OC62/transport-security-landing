// src/components/sections/Partners.jsx
import { motion } from 'framer-motion';

export const Partners = () => {
  // Массив с логотипами партнеров (в реальном проекте замените на реальные изображения)
  const partners = [
    { id: 1, name: "ООО 'Ростдонавтокозал'", logo: "/images/logo_rda.png" },
    { id: 2, name: "ФКУ УПРДОР МОСКВА-ВОЛГОГРАД", logo: "/images/fkuLogo.svg" },
    { id: 3, name: "ГБУ Вокзал-Авто", logo: "/images/GBUVolgograd.png" },
    { id: 4, name: "ООО Т-Транс", logo: "/images/Ttrans.png" },
    { id: 5, name: "СК Автодор-Казань", logo: "/images/logoAvtodor.svg" },
    { id: 6, name: "АО Донавтовокзал", logo: "/images/LogoDonavto.png" },
  ];

  return (
    <section id="partners" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Наши партнеры
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            С нами сотрудничают ведущие компании и организации России
          </p>
        </motion.div>

       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow"
            >
              {/* Контейнер для логотипа - центрирован */}
              <div className="flex items-center justify-center mb-3 w-full h-24">
                <img
                  src={partner.logo}
                  alt={`${partner.name} логотип`}
                  className="max-h-20 w-auto object-contain"
                  onError={(e) => {
                    // Если изображение не загрузилось, скрываем его
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              
              {/* Наименование партнера под логотипом - центрировано */}
              <p className="text-xs font-medium text-gray-700 text-center break-words leading-tight px-1">
                {partner.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};