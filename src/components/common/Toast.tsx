import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

interface SingleToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<SingleToastProps> = ({
  message,
  type = 'success',
  isVisible,
  onClose,
}) => {
  if (!isVisible || !message) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 pointer-events-none animate-slideUp">
      <div className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md bg-[#0B1325]/95 text-white border-[#D4AF37]/50 max-w-sm">
        {type === 'success' && (
          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
        )}
        {type === 'error' && (
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
        )}
        {type === 'info' && (
          <Info className="w-5 h-5 text-blue-400 shrink-0" />
        )}

        <div className="text-xs font-semibold text-white flex-1">{message}</div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
