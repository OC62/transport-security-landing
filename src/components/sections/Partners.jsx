// src/components/sections/Partners.jsx
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// Импорт стилей Swiper
import 'swiper/css';
import 'swiper/css/autoplay';

export const Partners = () => {
  const partners = [
    { 
      id: 1, 
      name: "ООО 'Ростдонавтокозал'", 
      logo: "/images/logo_rda.png", 
      url: "https://rostdonavtokozal.ru" 
    },
    { 
      id: 2, 
      name: "ФКУ УПРДОР МОСКВА-ВОЛГОГРАД", 
      logo: "/images/fkuLogo.svg", 
      url: "https://mv.rosavtodor.gov.ru" 
    },
    { 
      id: 3, 
      name: "ГБУ Вокзал-Авто", 
      logo: "/images/GBUVolgograd.png", 
      url: "https://vokzal-avto.ru" 
    },
    { 
      id: 4, 
      name: "ООО Т-Транс", 
      logo: "/images/Ttrans.png", 
      url: "https://t-trans61.ru" 
    },
    { 
      id: 5, 
      name: "ГКУ Транспортная дирекция РБ", 
      logo: "/images/logoBashkiria.webp", 
      url: "https://tdrb.bashkortostan.ru" 
    },
    { 
      id: 6, 
      name: "МКУ 'КОМИТЕТ ВНЕШНЕГО БЛАГОУСТРОЙСТВА ГОРОДА КАЗАНИ'", 
      logo: "/images/logoKazan.png", 
      url: "https://kzn.ru/meriya/ispolnitelnyy-komitet/komitet-vneshnego-blagoustroystva" 
    },
    { 
      id: 7, 
      name: "СК Автодор-Казань", 
      logo: "/images/logoAvtodor.webp", 
      url: "https://skavtodor.ru" 
    },
    { 
      id: 8, 
      name: "АО Донавтовокзал", 
      logo: "/images/LogoDonavto.png", 
      url: "https://donavto.ru" 
    },
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

        {/* Слайдер */}
        <div className="relative">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={30}
            slidesPerView={2}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
              1280: { slidesPerView: 6 },
            }}
            className="partners-swiper"
          >
            {partners.map((partner) => {
              const cleanUrl = partner.url?.trim();
              const isValidUrl = cleanUrl && /^https?:\/\//i.test(cleanUrl);

              return (
                <SwiperSlide key={partner.id}>
                  <motion.a
                    href={isValidUrl ? cleanUrl : undefined}
                    target={isValidUrl ? "_blank" : undefined}
                    rel={isValidUrl ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                    className={`block bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all ${
                      isValidUrl ? 'cursor-pointer transform hover:scale-105' : 'cursor-default'
                    }`}
                    title={partner.name}
                  >
                    <div className="flex items-center justify-center mb-3 w-full h-24">
                      <img
                        src={partner.logo}
                        alt={`${partner.name} логотип`}
                        className="max-h-20 w-auto object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-700 text-center break-words leading-tight px-1">
                      {partner.name}
                    </p>
                  </motion.a>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
};