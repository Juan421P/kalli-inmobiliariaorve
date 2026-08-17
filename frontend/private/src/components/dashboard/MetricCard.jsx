import { TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
const MetricCard = ({ icon: Icon, title, value, trend, trendUp, to, className }) => {
    const inner = (
        <>
            <div className='flex items-center gap-3 text-orve-teal'>
                <div className='p-2.5 bg-white/70 rounded-xl'>
                    <Icon className='w-5 h-5' />
                </div>
                <span className='text-sm font-medium'>{title}</span>
            </div>
            <div className='flex items-end gap-3 px-3 pb-3'>
                <span className='text-5xl font-bold tracking-tight text-orve-darker-teal leading-none'>
                    {value}
                </span>
                {trend && (
                    <span className={cn(
                        'text-xs font-semibold mb-1 flex items-center gap-1',
                        trendUp ? 'text-orve-green' : 'text-orve-red'
                    )}>
                        {trendUp
                            ? <TrendingUp className='w-3.5 h-3.5' />
                            : <TrendingDown className='w-3.5 h-3.5' />
                        }
                        {trend} desde ayer
                    </span>
                )}
            </div>
        </>
    )
    const base = cn('bg-orve-teal/15 backdrop-blur-sm rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3 select-none overflow-hidden isolate', to && 'cursor-pointer hover:bg-orve-teal/20 transition-colors', className)
    return to ? <Link to={to} className={base}>{inner}</Link> : <div className={base}>{inner}</div>
}
export default MetricCard