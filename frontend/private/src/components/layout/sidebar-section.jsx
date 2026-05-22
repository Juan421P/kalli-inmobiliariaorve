import { cn } from '@/lib/utils'
const SidebarSection = ({ title, children, className }) => {
    return (
        <div className={cn('space-y-3', className)}>
            <div className='flex items-center gap-4 px-2'>
                <span className='text-xs font-semibold tracking-widest text-white/60 whitespace-nowrap'>
                    {title}
                </span>
                <div className='h-px w-full bg-white/20' />
            </div>
            <div className='space-y-2'>
                {children}
            </div>
        </div>
    )
}
export default SidebarSection