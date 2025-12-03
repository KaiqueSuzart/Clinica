import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  duration?: number;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Sucesso!",
  message = "Operação realizada com sucesso!",
  duration = 3000
}) => {
  React.useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 opacity-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Success icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </p>

          {/* Progress bar */}
          {duration > 0 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-4 overflow-hidden">
              <div 
                className="bg-green-500 h-1 rounded-full transition-all ease-linear"
                style={{
                  width: '100%',
                  animation: `shrink ${duration}ms linear forwards`
                }}
              />
            </div>
          )}

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Entendi
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;
