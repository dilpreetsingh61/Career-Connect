import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [confirmPrompt, setConfirmPrompt] = useState(null);

  const showAlert = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setAlerts((prev) => prev.filter(alert => alert.id !== id));
    }, 4000);
  }, []);

  const showConfirm = useCallback((message, onConfirm) => {
    setConfirmPrompt({ message, onConfirm });
  }, []);

  const closeConfirm = () => setConfirmPrompt(null);

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter(alert => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* Toasts Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {alerts.map((alert) => (
          <div key={alert.id} className={`flex items-center gap-3 px-4 py-3 rounded shadow-lg text-sm font-medium animate-slide-up border ${
            alert.type === 'error' ? 'bg-red-900/90 text-red-100 border-red-500/50' :
            alert.type === 'success' ? 'bg-[#10b981]/90 text-white border-[#10b981]/50' :
            'bg-slate-800/90 text-white border-white/10'
          }`}>
            {alert.type === 'error' && <AlertCircle size={16} />}
            {alert.type === 'success' && <CheckCircle size={16} />}
            {alert.type === 'info' && <Info size={16} />}
            <span>{alert.message}</span>
            <button onClick={() => removeAlert(alert.id)} className="ml-auto pl-2 opacity-70 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Modal (Small centered div as requested) */}
      {confirmPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 p-5 rounded shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-white text-sm font-bold mb-4">{confirmPrompt.message}</h3>
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors"
                onClick={closeConfirm}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-1.5 rounded bg-[#10b981] hover:bg-[#059669] text-xs font-bold text-white transition-colors"
                onClick={() => {
                  confirmPrompt.onConfirm();
                  closeConfirm();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
