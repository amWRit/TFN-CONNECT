import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, className = "", hideCloseButton = false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
      <div className={`relative w-full max-w-md mx-2 ${className}`}> 
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-400 max-h-[90vh] flex flex-col min-h-[320px] relative">
          {!hideCloseButton && (
            <button
              className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-emerald-600 z-10 rounded-full transition bg-white border border-emerald-200 shadow-sm"
              onClick={onClose}
              aria-label="Close modal"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
              <X className="w-6 h-6" />
            </button>
          )}
          <div className="overflow-y-auto p-4 flex-1 w-full flex flex-col items-center rounded-2xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
