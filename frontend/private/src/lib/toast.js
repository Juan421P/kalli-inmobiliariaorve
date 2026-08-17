import { toast as sonner } from 'sonner';
import { createElement } from 'react';
import ToastCard from '@/components/ToastCard';
import { TOAST_DURATION } from '@/components/ToastCard';
const show = (title, description, variant, options = {}) =>
    sonner.custom((id) => createElement(ToastCard, { id, title, description, variant }), { duration: TOAST_DURATION, ...options });
const toast = (title, options) => show(title, options?.description, 'default', options);
toast.success = (title, description, options) => show(title, description, 'success', options);
toast.error = (title, description, options) => show(title, description, 'error', options);
toast.dismiss = sonner.dismiss;
export default toast;