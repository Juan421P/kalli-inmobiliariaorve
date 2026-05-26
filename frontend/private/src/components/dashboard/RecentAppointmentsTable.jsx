import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import ScrollArea from '@/components/ScrollArea'
const STATUS_STYLES = {
    Confirmada: 'text-orve-teal font-semibold',
    Pendiente: 'text-orve-red font-semibold',
}
const RecentAppointmentsTable = ({ appointments = [] }) => (
    <div className='bg-orve-teal/15 backdrop-blur-sm rounded-2xl pt-5 shadow-sm flex flex-col gap-4'>
        <div className='px-5 flex items-center gap-4 text-orve-teal font-semibold select-none'>
            <Calendar className='w-5 h-5 mb-1' />
            Citas recientes
        </div>
        <ScrollArea axis='x'>
            <table className='w-full text-sm'>
                <thead>
                    <tr className='border-b border-orve-teal/25'>
                        {['Cliente', 'Propiedad', 'Fecha solicitada', 'Estado', 'Colaborador asignado'].map((col, index) => (
                            <th key={col} className={cn('text-left font-semibold text-orve-teal pb-3 pr-4 whitespace-nowrap', index === 0 && 'pl-5', index === 4 && 'pr-5')}>
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((apt, i) => (
                        <tr key={apt.id ?? i} className='last:border-0 hover:bg-white/50 transition-colors cursor-pointer'>
                            <td className='py-3 pr-4 pl-5 text-orve-teal font-medium whitespace-nowrap'>{apt.client}</td>
                            <td className='py-3 pr-4 text-orve-teal whitespace-nowrap'>{apt.property}</td>
                            <td className='py-3 pr-4 text-orve-teal whitespace-nowrap'>{apt.requestedDate}</td>
                            <td className='py-3 pr-4 whitespace-nowrap'>
                                <span className={cn(STATUS_STYLES[apt.status] ?? 'text-orve-teal')}>
                                    {apt.status}
                                </span>
                            </td>
                            <td className='py-3 pr-5 text-orve-teal whitespace-nowrap'>
                                {apt.assignedCollaborator || <span className='text-orve-teal'>—</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </ScrollArea>
    </div>
)
export default RecentAppointmentsTable