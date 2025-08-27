interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10 ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-2"></div>
        <p className="text-[var(--foreground)]/70">Loading map...</p>
      </div>
    </div>
  );
};
