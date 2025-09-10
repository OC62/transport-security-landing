import React from 'react';
import { useLazyLoading } from '../hooks/useLazyLoading';

// ✅ Исправлено: убран export const
const LazyImage = ({ src, alt, className }) => {
  const imgRef = useLazyLoading({ threshold: 0.1 });
  const placeholderSvg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600' fill='%23f3f4f6'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Cpath d='M400 300L500 200' stroke='%23d1d5db' stroke-width='2'/%3E%3C/svg%3E";

  return (
    <img
      ref={imgRef}
      data-src={src}
      src={placeholderSvg}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
};

export default LazyImage;
