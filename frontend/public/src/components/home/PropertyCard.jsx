import { useState } from 'react';
import { Home as HomeIcon, Building2, MapPin, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
const TYPE_ICONS = { house: HomeIcon, apartment: Building2, land: MapPin };
const timeAgo = (iso) => {
    const h = Math.floor((Date.now() - new Date(iso)) / 3_600_000)
    if (h < 1) return 'hace menos de 1 hora'
    if (h < 24) return `hace ${h} hora${h > 1 ? 's' : ''}`
    const d = Math.floor(h / 24)
    return `hace ${d} día${d > 1 ? 's' : ''}`
};
const formatPrice = (v) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
const PropertyCard = ({ property }) => {
    const [imgIdx, setImgIdx] = useState(0)
    const imgs = property.pictures ?? []
    const src = imgs[imgIdx]?.picture ?? `https://picsum.photos/seed/${property._id}/300/420`
    const Icon = TYPE_ICONS[property.property_type] ?? HomeIcon
    const total = imgs.length
    return (
        <div className='relative w-64 h-80 rounded-2xl overflow-hidden shrink-0 cursor-pointer group'>
            <img src={src} alt={property.title} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' />
            <div className='absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent' />
            <div className='absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl p-1.5 shadow-sm'>
                <Icon className='w-3.5 h-3.5 text-orve-teal' />
            </div>
            <div className='absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-xl px-2 py-1 shadow-sm'>
                <Clock className='w-3 h-3 text-orve-teal/60' />
                <span className='text-[10px] font-medium text-orve-teal/80 whitespace-nowrap'>
                    Publicada {timeAgo(property.createdAt)}
                </span>
            </div>
            {total > 1 && (
                <>
                    <button
                        onClick={e => { e.stopPropagation(); setImgIdx(i => Math.max(0, i - 1)) }}
                        className='absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/25 hover:bg-white/50 flex items-center justify-center transition-colors'
                    >
                        <ChevronLeft className='w-4 h-4 text-white' />
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); setImgIdx(i => Math.min(total - 1, i + 1)) }}
                        className='absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/25 hover:bg-white/50 flex items-center justify-center transition-colors'
                    >
                        <ChevronRight className='w-4 h-4 text-white' />
                    </button>
                </>
            )}
            <div className='absolute bottom-3 left-4'>
                <p className='text-white font-bold text-xl leading-none'>{formatPrice(property.price)}</p>
            </div>
        </div>
    )
};
export default PropertyCard;