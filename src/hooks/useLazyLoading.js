import { useEffect, useRef } from 'react';

export const useLazyLoading = (options = {}) => {
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (ref.current?.src) {
          ref.current.src = ref.current.dataset.src;
        }
        observer.disconnect();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return ref;
};