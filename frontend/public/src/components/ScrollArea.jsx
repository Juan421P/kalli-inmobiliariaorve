import { cn } from '@/lib/utils'
const ScrollArea = ({ children, axis = 'both', className }) => (
    <div className={cn(axis === 'x' && 'overflow-x-auto overflow-y-hidden', axis === 'y' && 'overflow-y-auto overflow-x-hidden', axis === 'both' && 'overflow-auto', className)}>
        {children}
    </div>
)
export default ScrollArea