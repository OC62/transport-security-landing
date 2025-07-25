// src/components/layout/Footer.jsx
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
    { name: 'Лицензии', href: '#licenses' },
    { name: 'Партнеры', href: '#partners' }, 
    { name: 'Вакансии', href: '#careers' },
    { name: 'Контакты', href: '#contact' }
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Логотип и описание */}
          <div className="md:col-span-2">
             <div className="flex items-center space-x-2 mb-4">
              <img src="/images/logo.png" alt="Логотип ООО ПТБ-М" className="h-8" />
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
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <div className="space-y-3 text-gray-400">
              <p>📍344019 г. Ростов-на-Дону, ул. Большая Садовая, 102, офис 15</p>
              <p>📞 +7 (917) 619 79 81</p>
              <p>✉️ dtsm.rnd@gmail.com</p>
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