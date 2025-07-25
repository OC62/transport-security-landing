// src/components/sections/Hero.jsx
import { motion } from 'framer-motion';

const Button = ({ children, variant, size, onClick, className = '', ...props }) => {
  const baseClasses = "font-medium rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = variant === 'primary' 
    ? "bg-green-900 hover:bg-green-800 text-white focus:ring-green-500" 
    : "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500";
  const sizeClasses = size === 'large' 
    ? "py-3 px-6 text-base" 
    : "py-2 px-4 text-sm";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Фоновое изображение (замените на видео, если нужно) */}
       <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/Bridge.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-800 opacity-70"></div>
      </div>

      {/* Контент */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Обеспечиваем безопасность на объектах дорожного хозяйства с 2017 года
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            ООО "Подразделение транспортной безопасности -М" – профессионалы, которым можно доверять
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="primary" 
              size="large"
              onClick={() => {
                const contactSection = document.getElementById('contact');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Получить консультацию
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};