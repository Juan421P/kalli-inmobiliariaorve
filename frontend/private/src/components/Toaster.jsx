import { Toaster as Sonner } from 'sonner'
import { TOAST_DURATION } from '@/components/toastCard'
const Toaster = () => (
    <Sonner
        position='top-right'
        duration={TOAST_DURATION}
        visibleToasts={5}
        toastOptions={{ unstyled: true, classNames: { toast: 'w-full' }, }}
    />
)
export default Toaster