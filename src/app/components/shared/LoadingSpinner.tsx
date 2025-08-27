interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading...',
  className = '',
  overlay = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinner = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-[var(--accent)] ${sizeClasses[size]}`}></div>
      {text && <div className={`text-[var(--foreground)] ${textSizes[size]}`}>{text}</div>}
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
        <div className="text-center">
          <div className={`animate-spin rounded-full border-b-2 border-[var(--accent)] ${sizeClasses[size]} mx-auto mb-2`}></div>
          {text && <p className={`text-[var(--foreground)]/70 ${textSizes[size]}`}>{text}</p>}
        </div>
      </div>
    );
  }

  return spinner;
};
