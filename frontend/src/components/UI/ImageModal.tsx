import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  onDownload?: () => void;
}

export default function ImageModal({ isOpen, onClose, imageUrl, imageName, onDownload }: ImageModalProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  console.log('ImageModal render:', { isOpen, imageUrl, imageName });

  if (!isOpen) {
    console.log('Modal não está aberto, retornando null');
    return null;
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  console.log('ImageModal renderizando modal visível');

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
        style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{imageName}</h3>
              <p className="text-sm text-gray-500">Zoom: {zoom}%</p>
            </div>
            
            {/* Controles */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Diminuir zoom"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Aumentar zoom"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleRotate}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Rotacionar"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleReset}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Resetar"
              >
                Reset
              </button>
              
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Conteúdo da imagem */}
          <div className="relative overflow-auto max-h-[70vh] bg-gray-100">
            <div className="flex items-center justify-center min-h-[400px] p-4">
              <img
                src={imageUrl}
                alt={imageName}
                className="max-w-none transition-transform duration-200"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
                onLoad={() => {
                  // Resetar zoom e rotação quando carregar nova imagem
                  setZoom(100);
                  setRotation(0);
                }}
              />
            </div>
          </div>
          
          {/* Footer com informações */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Use os controles acima para ajustar a visualização</span>
              <span>ESC para fechar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para controlar o modal
export function useImageModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageData, setImageData] = useState<{
    url: string;
    name: string;
    onDownload?: () => void;
  } | null>(null);

  const openModal = (url: string, name: string, onDownload?: () => void) => {
    console.log('openModal chamado com:', { url, name });
    setImageData({ url, name, onDownload });
    setIsOpen(true);
    console.log('Modal aberto, isOpen:', true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setImageData(null);
  };

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  const ImageModalComponent = () => {
    console.log('ImageModalComponent render, isOpen:', isOpen, 'imageData:', imageData);
    
    if (!isOpen || !imageData) {
      return null;
    }

    return (
      <ImageModal
        isOpen={isOpen}
        onClose={closeModal}
        imageUrl={imageData.url}
        imageName={imageData.name}
        onDownload={imageData.onDownload}
      />
    );
  };

  return {
    openModal,
    closeModal,
    ImageModalComponent
  };
}
