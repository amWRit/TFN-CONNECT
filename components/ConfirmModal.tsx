import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = 'Confirm',
  message,
  confirmText = 'Yes',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  children,
  }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[1px]">
      <div className="relative w-full max-w-md mx-2">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-blue-400 max-h-[90vh] flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4 text-blue-700 text-center">{title}</h2>
          <p className="mb-6 text-gray-700 text-center">{message}</p>
          {children && <div className="mb-6 w-full">{children}</div>}
          <div className="flex gap-4 w-full">
            <button
              className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
              onClick={onConfirm}
              disabled={loading}
            >
              {confirmText}
            </button>
            <button
              className="flex-1 bg-red-100 border-2 border-red-400 text-red-700 font-bold px-6 py-2 rounded-xl shadow transition-all duration-200 text-lg tracking-wide hover:bg-red-200 hover:border-red-600"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
