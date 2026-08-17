import { toast as sonner } from 'sonner';
import { createElement, useMemo } from 'react';
import ToastContext from '@/contexts/ToastContext';
import ToastCard, { TOAST_DURATION } from '@/components/ToastCard';
const ToastProvider = ({ children }) => {
    const show = (title, description, variant, options = {}) =>
        sonner.custom((id) => createElement(ToastCard, { id, title, description, variant, }),
            { duration: TOAST_DURATION, ...options, }
        );
    const toast = useMemo(() => ({
        default: (title, options) => show(title, options?.description, 'default', options),
        success: (title, description, options) => show(title, description, 'success', options),
        error: (title, description, options) => show(title, description, 'error', options),
        dismiss: sonner.dismiss,
    }), []);
    return (
        <ToastContext.Provider value={toast}>
            {children}
        </ToastContext.Provider>
    );
};
export default ToastProvider;