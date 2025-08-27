interface ErrorStateProps {
  error: string;
  title?: string;
  retryText?: string;
  onRetry?: () => void;
  className?: string;
  showRetry?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title = 'Something went wrong',
  retryText = 'Retry',
  onRetry,
  className = '',
  showRetry = true
}) => {
  return (
    <div className={`p-6 text-center ${className}`}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium mb-2">{title}</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};
