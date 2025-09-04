import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import GlassmorphicButton from '../ui/GlassmorphicButton';

const schema = yup.object({
  name: yup.string().required('Имя обязательно'),
  email: yup.string().email('Неверный формат email').required('Email обязателен'),
  phone: yup.string().required('Телефон обязателен'),
  message: yup.string().required('Сообщение обязательно')
}).required();

const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;
const CAPTCHA_SITE_KEY = import.meta.env.VITE_CAPTCHA_SITE_KEY;

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [captchaLoaded, setCaptchaLoaded] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);
  const captchaContainerRef = useRef(null);
  const captchaWidgetId = useRef(null);
  const initializationAttempts = useRef(0);

  const {
    handleSubmit,
    reset
  } = useForm({
    resolver: yupResolver(schema)
  });

  // Функция инициализации капчи
  const initializeCaptcha = useCallback(() => {
    if (!captchaContainerRef.current) return;
    
    // Очищаем предыдущую капчу
    captchaContainerRef.current.innerHTML = '';
    
    // Проверяем, доступен ли объект smartCaptcha
    if (typeof window.smartCaptcha === 'undefined') {
      console.log('smartCaptcha not available, waiting...');
      
      if (initializationAttempts.current < 5) {
        initializationAttempts.current += 1;
        setTimeout(initializeCaptcha, 1000);
      } else {
        setCaptchaError('Не удалось загрузить капчу. Пожалуйста, обновите страницу.');
      }
      return;
    }

    try {
      // Создаем контейнер для капчи
      const container = document.createElement('div');
      captchaContainerRef.current.appendChild(container);

      // Инициализируем капчу
      captchaWidgetId.current = window.smartCaptcha.init(container, {
        sitekey: CAPTCHA_SITE_KEY,
        hl: 'ru',
        callback: (token) => {
          setCaptchaToken(token);
          setCaptchaError('');
        },
        'error-callback': (error) => {
          console.error('Yandex Captcha error:', error);
          setCaptchaError('Ошибка капчи. Пожалуйста, обновите страницу.');
        }
      });

      setCaptchaLoaded(true);
      setCaptchaError('');
      initializationAttempts.current = 0;
    } catch (error) {
      console.error('Error initializing Yandex Captcha:', error);
      setCaptchaError('Ошибка инициализации капчи. Пожалуйста, обновите страницу.');
      
      if (initializationAttempts.current < 3) {
        initializationAttempts.current += 1;
        setTimeout(initializeCaptcha, 2000);
      }
    }
  }, [CAPTCHA_SITE_KEY]);

  // Эффект для инициализации капчи
  useEffect(() => {
    // Добавляем глобальные колбэки для обработки загрузки скрипта
    if (!window.captchaLoadCallbacks) {
      window.captchaLoadCallbacks = [];
    }
    if (!window.captchaErrorCallbacks) {
      window.captchaErrorCallbacks = [];
    }
    
    const onCaptchaLoad = () => {
      console.log('Captcha script loaded, initializing...');
      initializeCaptcha();
    };
    
    const onCaptchaError = () => {
      console.error('Captcha script failed to load');
      setCaptchaError('Не удалось загрузить капчу. Пожалуйста, обновите страницу.');
    };
    
    window.captchaLoadCallbacks.push(onCaptchaLoad);
    window.captchaErrorCallbacks.push(onCaptchaError);
    
    // Если скрипт уже загружен, инициализируем сразу
    if (window.yandexCaptchaLoaded) {
      initializeCaptcha();
    }
    
    // Таймаут для инициализации на случай, если скрипт не загрузился
    const timeoutId = setTimeout(() => {
      if (!captchaLoaded && initializationAttempts.current === 0) {
        initializeCaptcha();
      }
    }, 3000);
    
    return () => {
      // Очистка
      clearTimeout(timeoutId);
      
      if (window.captchaLoadCallbacks) {
        window.captchaLoadCallbacks = window.captchaLoadCallbacks.filter(cb => cb !== onCaptchaLoad);
      }
      
      if (window.captchaErrorCallbacks) {
        window.captchaErrorCallbacks = window.captchaErrorCallbacks.filter(cb => cb !== onCaptchaError);
      }
      
      // Уничтожаем виджет капчи при размонтировании
      if (captchaWidgetId.current && window.smartCaptcha) {
        try {
          window.smartCaptcha.destroy(captchaWidgetId.current);
        } catch (error) {
          console.error('Error destroying captcha:', error);
        }
      }
    };
  }, [initializeCaptcha, captchaLoaded]);

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
    setCaptchaError('');

    if (!captchaToken) {
      setCaptchaError('Подтвердите, что вы не робот');
      setIsSubmitting(false);
      return;
    }

    await sendFormData(data);
    setIsSubmitting(false);
    setCaptchaToken('');
  };

  const reloadCaptcha = () => {
    setCaptchaKey(prev => prev + 1);
    setCaptchaLoaded(false);
    setCaptchaError('');
    setCaptchaToken('');
    initializationAttempts.current = 0;
    
    // Даем время для обновления DOM перед повторной инициализацией
    setTimeout(initializeCaptcha, 100);
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

                {/* ... поля формы ... */}

                <div className="mt-4">
                  <div ref={captchaContainerRef} className="captcha-container"></div>
                  
                  {captchaError && (
                    <div className="mt-2">
                      <p className="text-red-500 text-sm mb-2">
                        {captchaError}
                      </p>
                      <button
                        type="button"
                        onClick={reloadCaptcha}
                        className="text-blue-500 text-sm underline hover:text-blue-700"
                      >
                        Обновить капчу
                      </button>
                    </div>
                  )}
                  
                  {!captchaLoaded && !captchaError && (
                    <p className="text-gray-500 text-sm mt-2">
                      Загрузка капчи...
                    </p>
                  )}
                  
                  {captchaLoaded && !captchaToken && !captchaError && (
                    <p className="text-gray-500 text-sm mt-2">
                      Пожалуйста, подтвердите, что вы не робот
                    </p>
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