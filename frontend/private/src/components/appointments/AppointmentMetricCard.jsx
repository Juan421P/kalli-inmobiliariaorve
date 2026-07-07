import { cn } from '@/lib/utils'
import { panel } from '@/lib/styles'

const AppointmentMetricCard = ({ icon: Icon, label, value, caption, highlight = false }) => (
    <div className={cn(panel, 'flex flex-col gap-3')}>
        <div className='flex items-center gap-2.5 text-orve-teal'>
            <div className='p-2 bg-orve-teal/10 rounded-lg'>
                <Icon className='w-4 h-4' />
            </div>
            <span className='text-sm font-medium'>{label}</span>
        </div>
        <div className='flex items-baseline gap-2'>
            <span className={cn('text-3xl font-bold leading-none', highlight ? 'text-orve-red' : 'text-orve-darker-teal')}>
                {value}
            </span>
            {caption && <span className='text-xs text-orve-teal/50'>{caption}</span>}
        </div>
    </div>
)

export default AppointmentMetricCard
