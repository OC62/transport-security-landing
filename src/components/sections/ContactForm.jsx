import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import GlassmorphicButton from '../ui/GlassmorphicButton';

// Валидация формы
const schema = yup.object({
  name: yup.string().required('Имя обязательно'),
  email: yup.string().email('Неверный формат email').required('Email обязателен'),
  phone: yup.string().required('Телефон обязателен'),
  message: yup.string().required('Сообщение обязательно')
}).required();

// Получаем ключ из .env (должен начинаться с VITE_)
const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;
const CAPTCHA_SITE_KEY = import.meta.env.VITE_CAPTCHA_SITE_KEY;

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const captchaContainerRef = useRef(null);
  const widgetId = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema)
  });

  // Логируем ключ (только для отладки, можно убрать в продакшене)
  useEffect(() => {
    console.log('🔑 CAPTCHA_SITE_KEY:', CAPTCHA_SITE_KEY);
    if (!CAPTCHA_SITE_KEY || CAPTCHA_SITE_KEY.trim() === '') {
      setCaptchaError('Ошибка конфигурации: отсутствует sitekey');
    }
  }, []);

  // Перезагрузка капчи
  const reloadCaptcha = useCallback(() => {
    if (widgetId.current && window.smartCaptcha) {
      try {
        window.smartCaptcha.destroy(widgetId.current);
      } catch (e) {
        console.warn('Failed to destroy captcha widget', e);
      }
    }
    widgetId.current = null;
    setCaptchaToken('');
    setCaptchaError('');
  }, []);

  // Инициализация капчи
  const initializeCaptcha = useCallback(() => {
    if (!captchaContainerRef.current) {
      setCaptchaError('Контейнер капчи не найден');
      return;
    }

    if (!window.smartCaptcha) {
      setCaptchaError('Скрипт капчи не загрузился');
      return;
    }

    if (!CAPTCHA_SITE_KEY || CAPTCHA_SITE_KEY.trim() === '') {
      setCaptchaError('Ключ sitekey не задан');
      return;
    }

    // Очищаем предыдущую капчу
    reloadCaptcha();

    try {
      widgetId.current = window.smartCaptcha.render(captchaContainerRef.current, {
        sitekey: CAPTCHA_SITE_KEY,
        hl: 'ru',
        callback: (token) => {
          setCaptchaToken(token);
          setCaptchaError('');
        },
        'error-callback': (error) => {
          console.error('Yandex SmartCaptcha error:', error);
          setCaptchaError('Ошибка капчи. Пожалуйста, обновите страницу.');
        }
      });
    } catch (error) {
      console.error('Failed to initialize SmartCaptcha:', error);
      setCaptchaError('Не удалось загрузить капчу. Проверьте соединение.');
    }
  }, [CAPTCHA_SITE_KEY, reloadCaptcha]);

  // Загрузка капчи при монтировании
  useEffect(() => {
    const load = () => {
      if (window.smartCaptcha) {
        initializeCaptcha();
      } else {
        // Ждём события готовности
        window.addEventListener('smartcaptcha-ready', initializeCaptcha);
        // На случай, если событие уже прошло
        setTimeout(() => {
          if (!widgetId.current) initializeCaptcha();
        }, 1000);
      }
    };

    load();

    return () => {
      window.removeEventListener('smartcaptcha-ready', initializeCaptcha);
      reloadCaptcha();
    };
  }, [initializeCaptcha, reloadCaptcha]);

  // Отправка формы
  const sendFormData = async (formData) => {
    try {
      const response = await fetch(BACKEND_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          smartcaptcha_token: captchaToken
        }),
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        setSubmitSuccess(true);
        reset();
        setTimeout(() => setSubmitSuccess(false), 5000);
        reloadCaptcha(); // сбрасываем капчу
        return true;
      } else {
        throw new Error(result.message || 'Ошибка сервера');
      }
    } catch (error) {
      console.error('Ошибка отправки формы:', error);
      if (error.message.includes('Failed to fetch')) {
        setSubmitError('Нет соединения с сервером. Проверьте интернет.');
      } else if (error.message.includes('JSON')) {
        setSubmitError('Ошибка ответа сервера. Повторите позже.');
      } else {
        setSubmitError(error.message || 'Произошла ошибка');
      }
      return false;
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    if (!captchaToken) {
      setCaptchaError('Подтвердите, что вы не робот');
      setIsSubmitting(false);
      return;
    }

    await sendFormData(data);
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Свяжитесь с нами
            </h2>
            <p className="text-xl text-gray-600">
              Получите консультацию специалиста по транспортной безопасности
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 md:p-12">
            {submitSuccess ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 text-green-500">✓</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Спасибо за заявку!
                </h3>
                <p className="text-gray-600">
                  Мы свяжемся с вами в ближайшее время.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {submitError && (
                  <div className="bg-red-50 border-l-4 border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{submitError}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                      Имя *
                    </label>
                    <input
                      id="name"
                      {...register('name')}
                      autoComplete="name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите ваше имя"
                    />
                    {errors.name && (
                      <p className="mt-1 text-red-500 text-sm">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      autoComplete="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-red-500 text-sm">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                    Телефон *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    autoComplete="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+7 (___) ___-__-__"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-red-500 text-sm">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                    Сообщение *
                  </label>
                  <textarea
                    id="message"
                    {...register('message')}
                    rows={5}
                    autoComplete="off"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Расскажите о вашем проекте..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-red-500 text-sm">{errors.message.message}</p>
                  )}
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="privacy"
                    required
                    className="mt-1 mr-2 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="privacy" className="text-gray-600 text-sm">
                    Согласен с обработкой персональных данных *
                  </label>
                </div>

                <div className="mt-4">
                  <div ref={captchaContainerRef} className="captcha-container"></div>

                  {captchaError && (
                    <div className="mt-2">
                      <p className="text-red-500 text-sm mb-2">{captchaError}</p>
                      <button
                        type="button"
                        onClick={reloadCaptcha}
                        className="text-blue-500 text-sm underline hover:text-blue-700"
                      >
                        Обновить капчу
                      </button>
                    </div>
                  )}
                </div>

                <GlassmorphicButton
                  type="submit"
                  variant="onLight"
                  size="large"
                  disabled={isSubmitting || !captchaToken}
                  className="w-full flex items-center justify-center mt-6"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Отправка...
                    </>
                  ) : (
                    'Отправить заявку'
                  )}
                </GlassmorphicButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;