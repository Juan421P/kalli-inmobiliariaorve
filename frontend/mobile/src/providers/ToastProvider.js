import { useCallback, useMemo, useState } from 'react';
import ToastContext from '@/context/ToastContext';
import Toaster from '@/components/Toaster';

const TOAST_DURATION = 3500;
let idCounter = 0;

const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const show = useCallback((title, description, variant) => {
        const id = ++idCounter;
        setToasts((prev) => [...prev, { id, title, description, variant }]);
        setTimeout(() => dismiss(id), TOAST_DURATION);
        return id;
    }, [dismiss]);

    const toast = useMemo(() => ({
        default: (title, description) => show(title, description, 'default'),
        success: (title, description) => show(title, description, 'success'),
        error: (title, description) => show(title, description, 'error'),
        dismiss,
    }), [show, dismiss]);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <Toaster toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
};

export default ToastProvider;
