import { useEffect, useRef } from 'react';

export const useLazyLoading = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const dataset = img.dataset;

          if (dataset.src) {
            img.src = dataset.src;
            delete dataset.src; // Удаляем, чтобы не срабатывало повторно
          }

          observer.unobserve(img); // Больше не наблюдаем (опционально)
        }
      });
    }, options);

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return ref;
};
