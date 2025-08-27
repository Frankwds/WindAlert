interface ErrorDisplayProps {
  error: string;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, className = '' }) => {
  return (
    <div className={`p-6 text-center ${className}`}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Failed to load map</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    </div>
  );
};
