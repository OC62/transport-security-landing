// src/components/sections/Partners.jsx
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

// Импорт стилей Swiper
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';

export const Partners = () => {
  const partners = [
    { 
      id: 1, 
      name: "ООО 'Ростдонавтовокзал'", 
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
    { 
      id: 9, 
      name: "Ассоциация 'Транспортная безопасность'", 
      logo: "/images/logoAsTb.webp", 
      url: "https://atb-tsa.ru/#" 
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

        {/* Контейнер с уменьшенной на 20% высотой */}
        <div className="relative h-[256px] md:h-[288px]">
          <div className="h-full">
            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={20}
              slidesPerView={2}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              breakpoints={{
                320: { 
                  slidesPerView: 2, 
                  spaceBetween: 15,
                  navigation: { enabled: false }
                },
                480: { 
                  slidesPerView: 3, 
                  spaceBetween: 20,
                  navigation: { enabled: false }
                },
                768: { 
                  slidesPerView: 4, 
                  spaceBetween: 24,
                  navigation: { enabled: false }
                },
                1024: { 
                  slidesPerView: 5,
                  navigation: { enabled: true }
                },
                1280: { 
                  slidesPerView: 6,
                  navigation: { enabled: true }
                },
              }}
              className="h-full"
              touchMoveStopPropagation={false}
              grabCursor={true}
            >
              {partners.map((partner) => {
                const cleanUrl = partner.url?.trim();
                const isValidUrl = cleanUrl && /^https?:\/\//i.test(cleanUrl);

                return (
                  <SwiperSlide key={partner.id} className="h-full">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      <a
                        href={isValidUrl ? cleanUrl : undefined}
                        target={isValidUrl ? "_blank" : undefined}
                        rel={isValidUrl ? "noopener noreferrer" : undefined}
                        className={`h-full w-full flex flex-col justify-center items-center bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-all duration-300 ${
                          isValidUrl 
                            ? 'cursor-pointer transform hover:scale-105' 
                            : 'cursor-default pointer-events-none'
                        }`}
                        title={partner.name}
                      >
                        <div className="flex items-center justify-center w-full h-16 sm:h-20 mb-2">
                          <img
                            src={partner.logo}
                            alt={`${partner.name} логотип`}
                            className="max-h-12 sm:max-h-16 w-auto object-contain transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 leading-tight px-1 w-full">
                          {partner.name}
                        </p>
                      </a>
                    </motion.div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
          
          {/* Кнопки-стрелки, опущенные на 15px ниже (10px + 5px) */}
          <div className="swiper-button-prev hidden lg:flex absolute top-[calc(50%+15px)] -translate-y-1/2 left-2 md:left-4 w-10 h-10 bg-white rounded-full shadow-lg z-10"></div>
          <div className="swiper-button-next hidden lg:flex absolute top-[calc(50%+15px)] -translate-y-1/2 right-2 md:right-4 w-10 h-10 bg-white rounded-full shadow-lg z-10"></div>
        </div>
      </div>
    </section>
  );
};