// src/components/sections/Partners.jsx
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

// Импорт стилей Swiper
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';

export const Partners = () => {
  // Список партнеров с очищенными URL
  const partners = [
    { 
      id: 1, 
      name: "ООО 'Ростдонавтокозал'", 
      logo: "/images/logo_rda.webp", 
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
      logo: "/images/GBUVolgograd.webp", 
      url: "https://vokzal-avto.ru" 
    },
    { 
      id: 4, 
      name: "ООО Т-Транс", 
      logo: "/images/Ttrans.webp", 
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
      name: "МКУ 'Комитет внешнего благоустройства Казани'", 
      logo: "/images/logoKazan.webp", 
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
    logo: "/images/LogoDonavto.webp", 
    url: "https://donavto.ru" 
  },
  ];

  return (
    <section id="partners" className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Наши партнеры
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            С нами сотрудничают ведущие компании и организации России
          </p>
        </motion.div>

        {/* Слайдер с адаптивными кнопками */}
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={20}
            slidesPerView={2}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            breakpoints={{
              // Мобильные
              320: { slidesPerView: 2, spaceBetween: 15 },
              480: { slidesPerView: 3, spaceBetween: 20 },
              // Планшет
              768: { slidesPerView: 4, spaceBetween: 24 },
              // Десктоп
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
                    className={`block bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all ${
                      isValidUrl 
                        ? 'cursor-pointer transform hover:scale-105' 
                        : 'cursor-default pointer-events-none'
                    }`}
                    title={partner.name}
                  >
                    <div className="flex items-center justify-center mb-3 w-full h-20 sm:h-24">
                      <img
                        src={partner.logo}
                        alt={`${partner.name} логотип`}
                        className="max-h-16 sm:max-h-20 w-auto object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 leading-tight px-1 line-clamp-2">
                      {partner.name}
                    </p>
                  </motion.a>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Кнопки навигации — видны только с md (768px) и выше */}
          <div className="swiper-button-prev hidden md:flex absolute top-1/2 -translate-y-1/2 left-2 md:left-4 w-10 h-10 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 items-center justify-center z-10 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="swiper-button-next hidden md:flex absolute top-1/2 -translate-y-1/2 right-2 md:right-4 w-10 h-10 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 items-center justify-center z-10 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};