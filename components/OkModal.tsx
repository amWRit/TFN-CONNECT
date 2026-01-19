import React from 'react';

interface OkModalProps {
  open: boolean;
  title?: string;
  message: string;
  okText?: string;
  onOk: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

export const OkModal: React.FC<OkModalProps> = ({
  open,
  title = 'Notice',
  message,
  okText = 'OK',
  onOk,
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
          <div className="flex gap-4 w-full justify-center">
            <button
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all duration-200 text-lg tracking-wide"
              onClick={onOk}
              disabled={loading}
            >
              {okText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OkModal;
