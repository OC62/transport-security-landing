// src/components/layout/Footer.jsx
import logoImage from '../../assets/images/logo.png';

export const Footer = () => {
  const socialLinks = [
    { name: 'VK', url: '#' },
    { name: 'Telegram', url: '#' },
    { name: 'Instagram', url: '#' }
  ];

  const quickLinks = [
    { name: 'О компании', href: '#about' },
    { name: 'Услуги', href: '#services' },
    { name: 'Кейсы', href: '#cases' },
    { name: 'Наши вакансии', href: '#careers' },
    { name: 'Лицензии', href: '#licenses' },
    { name: 'Партнеры', href: '#partners' }, 
    { name: 'Вакансии', href: '#careers' },
    { name: 'Контакты', href: '#contact' }
  ];

  // Функция для плавной прокрутки к секции
  const scrollToSection = (sectionId) => {
    // Убедимся, что sectionId начинается с #
    const id = sectionId.startsWith('#') ? sectionId.slice(1) : sectionId;
    const element = document.getElementById(id);
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

  // Функция для открытия карты (координаты Ростова-на-Дону, можно уточнить)
  const handleAddressClick = (e) => {
    e.preventDefault();
    // Открывает Google Maps или Яндекс.Карты с координатами
    // Вы можете заменить координаты на точные для вашего адреса
    window.open('https://yandex.ru/maps/?text=Ростов-на-Дону, ул. Большая Садовая, 102', '_blank');
    // Или Google Maps:
    // window.open('https://www.google.com/maps/search/?api=1&query=Ростов-на-Дону, ул. Большая Садовая, 102', '_blank');
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
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label={social.name}
                >
                  {social.name[0]}
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
                  className="text-gray-400 hover:text-white transition-colors text-left cursor-pointer"
                >
                  📍344019 г. Ростов-на-Дону, ул. Большая Садовая, 102, офис 15
                </button>
              </p>
              {/* Телефон с возможностью звонка */}
              <p>
                <a
                  href="tel:+79176197981"
                  onClick={handlePhoneClick}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  📞 +7 (917) 619 79 81
                </a>
              </p>
              {/* Email с возможностью отправки письма */}
              <p>
                <a
                  href="mailto:dtsm.rnd@gmail.com"
                  onClick={handleEmailClick}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✉️ dtsm.rnd@gmail.com
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