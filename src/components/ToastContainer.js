'use client';

import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import styles from './ToastContainer.module.css';

export default function ToastContainer() {
  const { toasts } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`${styles.toast} ${
            toast.type === 'error' 
              ? styles.error 
              : toast.type === 'warning' 
                ? styles.warning 
                : styles.success
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={20} className={styles.icon} />
          ) : (
            <CheckCircle2 size={20} className={styles.icon} />
          )}
          <span className={styles.message}>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
