// src/components/ui/GlassmorphicButton.jsx
import { forwardRef } from 'react';

// Используем forwardRef, чтобы можно было передавать ref, как в обычную кнопку
const GlassmorphicButton = forwardRef(({ children, variant = 'primary', size = 'medium', className = '', ...props }, ref) => {
  // Базовые классы для стеклянного эффекта
  const baseClasses = "font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-md border";

  // Варианты кнопок
  const variantClasses = {
    // Primary: зеленый акцент (для темных фонов)
    primary: "bg-white/20 border-white/30 text-white hover:bg-white/30 focus:ring-green-500/50 focus:ring-offset-gray-900",
    // Secondary/default: синий/серый акцент (для темных фонов)
    secondary: "bg-white/20 border-white/30 text-white hover:bg-white/30 focus:ring-blue-500/50 focus:ring-offset-gray-900",
    // НОВЫЙ ВАРИАНТ: для светлых фонов
    onLight: "bg-black/5 border-black/10 text-gray-800 hover:bg-black/10 focus:ring-gray-500/50 focus:ring-offset-white",
    // ЕЩЕ ОДИН НОВЫЙ ВАРИАНТ: для очень светлых или белых фонов (еще более контрастный)
    onWhite: "bg-gray-800/10 border-gray-800/20 text-gray-900 hover:bg-gray-800/20 focus:ring-gray-600/50 focus:ring-offset-white"
  }[variant];

  // Размеры кнопок
  const sizeClasses = {
    small: "py-1.5 px-3 text-xs",
    medium: "py-2 px-4 text-sm",
    large: "py-3 px-6 text-base",
  }[size];

  // Объединяем все классы
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;

  return (
    <button
      ref={ref}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
});

// Для отладки в React DevTools
GlassmorphicButton.displayName = 'GlassmorphicButton';

export { GlassmorphicButton };