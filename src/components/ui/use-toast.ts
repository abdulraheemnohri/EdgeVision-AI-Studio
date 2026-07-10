import { useCallback, useState } from 'react';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  action?: ToastAction;
}

interface ToastState {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => string;
  dismissToast: (id: string) => void;
}

const useToastStore = (): ToastState => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = String(Math.random().toString(36).substring(2) + Date.now().toString(36));
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
};

interface UseToastReturn {
  toasts: ToastData[];
  toast: (props: Omit<ToastData, 'id'>) => string;
  dismiss: (id: string) => void;
}

export function useToast(): UseToastReturn {
  const { toasts, addToast, dismissToast } = useToastStore();

  const toast = useCallback((props: Omit<ToastData, 'id'>) => {
    return addToast({ duration: 4000, ...props });
  }, [addToast]);

  const dismiss = useCallback(dismissToast, [dismissToast]);

  return { toasts, toast, dismiss };
}
