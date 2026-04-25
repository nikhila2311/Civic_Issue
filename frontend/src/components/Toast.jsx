import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  const colors = {
    success: 'bg-emerald-600',
    error:   'bg-red-500',
    info:    'bg-blue-600',
    warning: 'bg-amber-500'
  }

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={`${colors[t.type]} text-white px-4 py-3 rounded-xl 
              shadow-lg text-sm font-semibold flex items-center gap-2 
              animate-scale-in min-w-[260px] max-w-sm pointer-events-auto`}>
            <span>{icons[t.type]}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)