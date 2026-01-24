import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, className = "" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className={`relative w-full max-w-md mx-2 ${className}`}> 
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-400 max-h-[90vh] flex flex-col min-h-[320px]">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-emerald-600 text-2xl font-bold z-10"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
          <div className="overflow-y-auto p-4 flex-1 w-full flex flex-col items-center rounded-2xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
