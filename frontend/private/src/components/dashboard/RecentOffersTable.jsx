import { Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import ScrollArea from '@/components/ScrollArea'
const STATUS_STYLES = {
    Confirmada: 'text-orve-teal font-semibold',
    Pendiente: 'text-orve-red font-semibold',
}
const formatCurrency = (value) =>
    typeof value === 'number'
        ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
        : value
const RecentOffersTable = ({ offers = [] }) => (
    <div className='bg-orve-teal/15 backdrop-blur-sm rounded-2xl pt-5 shadow-sm flex flex-col gap-4'>
        <div className='pl-5 flex items-center gap-4 text-orve-teal font-semibold select-none'>
            <Briefcase className='w-5 h-5 mb-1' />
            Ofertas recientes
        </div>
        <ScrollArea>
            <table className='w-full text-sm'>
                <thead>
                    <tr className='border-b border-orve-teal/25'>
                        {['Cliente', 'Propiedad', 'Oferta monetaria', 'Estado', 'Fecha de la oferta'].map((col, index) => (
                            <th key={col} className={cn('text-left font-semibold text-orve-teal pb-3 pr-4 whitespace-nowrap', index === 0 && 'pl-5', index === 4 && 'pr-5')}>
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {offers.map((offer, i) => (
                        <tr key={offer.id ?? i} className='last:border-0 hover:bg-white/50 transition-colors cursor-pointer'>
                            <td className='py-3 pr-4 pl-5 text-orve-teal font-medium whitespace-nowrap'>{offer.client}</td>
                            <td className='py-3 pr-4 text-orve-teal whitespace-nowrap'>{offer.property}</td>
                            <td className='py-3 pr-4 text-orve-teal font-semibold whitespace-nowrap'>
                                {formatCurrency(offer.monetaryOffer)}
                            </td>
                            <td className='py-3 pr-4 whitespace-nowrap'>
                                <span className={cn(STATUS_STYLES[offer.status] ?? 'text-orve-teal')}>
                                    {offer.status}
                                </span>
                            </td>
                            <td className='py-3 pr-5 text-orve-teal whitespace-nowrap'>{offer.offerDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </ScrollArea>
    </div>
)
export default RecentOffersTable