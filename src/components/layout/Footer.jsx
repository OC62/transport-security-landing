// src/components/layout/Footer.jsx
import logoImage from '../../assets/images/logo.webp'; // Импорт логотипа

export const Footer = () => {
  // Обновленный список социальных ссылок с SVG иконками
  const socialLinks = [
     { 
      name: 'VK', 
      url: 'https://vk.com/ptbm_rnd', // Замените на вашу реальную ссылку
      // Используем предоставленный SVG-код
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M21.579 6.855c.14-.465 0-.806-.662-.806h-2.193c-.558 0-.813.295-.953.619c0 0-1.115 2.719-2.695 4.482c-.51.513-.743.675-1.021.675c-.139 0-.341-.162-.341-.627V6.855c0-.558-.161-.806-.626-.806H9.642c-.348 0-.558.258-.558.504c0 .528.79.65.871 2.138v3.228c0 .707-.127.836-.407.836c-.743 0-2.551-2.729-3.624-5.853c-.209-.607-.42-.852-.98-.852H2.752c-.627 0-.752.295-.752.619c0 .582.743 3.462 3.461 7.271c1.812 2.601 4.363 4.011 6.687 4.011c1.393 0 1.565-.313 1.565-.853v-1.966c0-.626.133-.752.574-.752c.324 0 .882.164 2.183 1.417c1.486 1.486 1.732 2.153 2.567 2.153h2.192c.626 0 .939-.313.759-.931c-.197-.615-.907-1.51-1.849-2.569c-.512-.604-1.277-1.254-1.51-1.579c-.325-.419-.231-.604 0-.976c.001.001 2.672-3.761 2.95-5.04"/>
        </svg>
      )
    },
    { 
      name: 'Telegram', 
      url: 'https://t.me/ptbm_rnd', // Замените на вашу реальную ссылку
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.14.14-.26.26-.429.26l.213-3.053 5.52-5.022c.24-.213-.054-.334-.373-.12l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.136-.954l11.57-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
      )
    },
    { 
      name: 'WhatsApp', 
      url: 'https://wa.me/79176197981', // Замените на ваш номер
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      )
    }
  ];

  const quickLinks = [
    { name: 'О компании', href: '#about' },
    { name: 'Услуги', href: '#services' },
    { name: 'Кейсы', href: '#cases' },
    { name: 'Наши вакансии', href: '#careers' },
    { name: 'Лицензии', href: '#licenses' },
    { name: 'Партнеры', href: '#partners' },
    { name: 'Растим чемпионов', href: '#community' },
    { name: 'Вакансии', href: '#careers' },
    { name: 'Контакты', href: '#contact' }
  ];

  // Функция для плавной прокрутки к секции
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Функция для открытия почтового клиента
  const handleEmailClick = (e) => {
    e.preventDefault();
    window.location.href = 'mailto:dtsm.rnd@gmail.com';
  };

  // Функция для звонка
  const handlePhoneClick = (e) => {
    e.preventDefault();
    window.location.href = 'tel:+79176197981';
  };

  // Функция для открытия карты
  const handleAddressClick = (e) => {
    e.preventDefault();
    // Открывает Яндекс.Карты с адресом
    window.open('https://yandex.ru/maps/?text=Ростов-на-Дону, ул. Большая Садовая, 102', '_blank');
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Логотип и описание */}
          <div className="md:col-span-2">
             <div className="flex items-center space-x-2 mb-4">
              <img src={logoImage} alt="Логотип ООО ПТБ-М" className="h-8" />
              <span className="text-2xl font-bold">ООО "ПТБ-М"</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Обеспечиваем безопасность на объектах дорожного хозяйства с 2017 года
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  aria-label={social.name}
                >
                  {social.icon} {/* Используем SVG иконку */}
                </a>
              ))}
            </div>
          </div>

          {/* Быстрые ссылки */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {/* Используем button для внутренней навигации */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="text-gray-400 hover:text-white transition-colors text-left w-full"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <div className="space-y-3 text-gray-400">
              {/* Адрес с переходом на карту */}
              <p>
                <button
                  onClick={handleAddressClick}
                  className="text-gray-400 hover:text-white transition-colors text-left cursor-pointer flex items-start"
                >
                  <span className="mr-2">📍</span>
                  <span>344019 г. Ростов-на-Дону, ул. Большая Садовая, 102, офис 15</span>
                </button>
              </p>
              {/* Телефон с возможностью звонка */}
              <p>
                <a
                  href="tel:+79176197981"
                  onClick={handlePhoneClick}
                  className="text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  <span className="mr-2">📞</span>
                  <span>+7 (909) 407 23 74</span>
                </a>
              </p>
              {/* Email с возможностью отправки письма */}
              <p>
                <a
                  href="mailto:dtsm.rnd@gmail.com"
                  onClick={handleEmailClick}
                  className="text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  <span className="mr-2">✉️</span>
                  <span>dtsm.rnd@gmail.com</span>
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; 2025 ООО "ПТБ-М". Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};