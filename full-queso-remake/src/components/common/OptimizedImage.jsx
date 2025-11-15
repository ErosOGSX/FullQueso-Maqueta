import { useLazyImage } from '../../hooks/useLazyImage';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  priority = 'normal',
  placeholder,
  onLoad,
  onError,
  ...props 
}) => {
  const { imgRef, src: optimizedSrc, isLoading, error } = useLazyImage(src, {
    priority,
    placeholder
  });

  const handleLoad = (e) => {
    onLoad?.(e);
  };

  const handleError = (e) => {
    onError?.(e);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        className={`
          w-full h-full object-cover transition-all duration-300
          ${isLoading ? 'blur-sm scale-105' : 'blur-0 scale-100'}
          ${error ? 'opacity-50' : 'opacity-100'}
        `}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
        {...props}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm text-center p-4">
            <div className="mb-2">⚠️</div>
            <div>Error al cargar imagen</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;