import { toast as sonnerToast } from 'sonner'
import { Info, CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
export const TOAST_DURATION = 4000
const VARIANTS = {
    default: {
        icon: Info,
        iconColor: 'text-orve-teal',
        accent: 'bg-orve-teal',
        tint: 'bg-orve-teal/5',
        bar: 'bg-orve-teal',
        ring: 'ring-orve-teal/15',
    },
    success: {
        icon: CheckCircle2,
        iconColor: 'text-orve-green',
        accent: 'bg-orve-green',
        tint: 'bg-orve-green/5',
        bar: 'bg-orve-green',
        ring: 'ring-orve-green/15',
    },
    error: {
        icon: XCircle,
        iconColor: 'text-orve-red',
        accent: 'bg-orve-red',
        tint: 'bg-orve-red/5',
        bar: 'bg-orve-red',
        ring: 'ring-orve-red/15',
    },
}
const ToastCard = ({ id, title, description, variant = 'default' }) => {
    const v = VARIANTS[variant] ?? VARIANTS.default
    const Icon = v.icon
    return (
        <div className={cn(
            'relative flex items-start w-full min-w-80 max-w-md overflow-hidden',
            'rounded-r-xl shadow-xl ring-1',
            'bg-white/95 backdrop-blur-md',
            v.ring
        )}>
            <div className={cn('w-1.5 shrink-0 self-stretch', v.accent)} />
            <div className={cn('mt-4 ml-4 shrink-0', v.iconColor)}>
                <Icon className='w-6 h-6' />
            </div>
            <div className='flex-1 px-4 py-4 min-w-0'>
                {title && (
                    <p className='text-base font-semibold text-orve-black/80 leading-snug select-none'>
                        {title}
                    </p>
                )}
                {description && (
                    <p className='text-sm text-orve-black/50 mt-1 leading-snug select-none'>
                        {description}
                    </p>
                )}
            </div>
            <button
                type='button'
                onClick={() => sonnerToast.dismiss(id)}
                className='mt-3.5 mr-3.5 shrink-0 p-1 rounded-lg text-orve-black/20 hover:text-orve-black/60 hover:bg-orve-black/5 transition-colors cursor-pointer'
            >
                <X className='w-4 h-4' />
            </button>
            <div
                className={cn('absolute bottom-0 left-0 right-0 h-0.75', v.bar)}
                style={{
                    opacity: 0.25,
                    animation: `toast-shrink ${TOAST_DURATION}ms linear forwards`,
                }}
            />
        </div>
    )
}
export default ToastCard