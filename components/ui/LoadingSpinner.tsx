import React from "react";

export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex space-x-2 mb-4">
        <span className="dot bg-blue-500" />
        <span className="dot bg-blue-400" />
        <span className="dot bg-blue-300" />
      </div>
      <div className="text-lg font-semibold text-blue-600 drop-shadow-sm">{text}</div>
      <style jsx>{`
        .dot {
          display: inline-block;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          animation: bounce 1.2s infinite ease-in-out;
        }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.7; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
