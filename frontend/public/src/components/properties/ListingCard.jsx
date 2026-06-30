import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Home as HomeIcon, Building2, Map, Info, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

const PROPERTY_ICONS = {
    house:     HomeIcon,
    apartment: Building2,
    land:      Map,
}

const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / 3_600_000)
    if (hours < 1)  return 'Hace menos de 1 hora'
    if (hours < 24) return `Hace ${hours}h`
    return `Hace ${Math.floor(hours / 24)}d`
}

const ListingCard = ({ property, view = 'grid' }) => {
    const [imgIndex, setImgIndex] = useState(0)
    const pictures = property.pictures ?? []
    const Icon = PROPERTY_ICONS[property.property_type] ?? HomeIcon

    const prev = (e) => { e.preventDefault(); setImgIndex((i) => Math.max(0, i - 1)) }
    const next = (e) => { e.preventDefault(); setImgIndex((i) => Math.min(pictures.length - 1, i + 1)) }

    if (view === 'list') {
        return (
            <Link
                to={`/property/${property.public_id}`}
                className='flex gap-3 bg-white/60 backdrop-blur-sm border border-white rounded-xl overflow-hidden hover:shadow-md transition-shadow'
            >
                <div className='relative w-36 shrink-0'>
                    {pictures.length > 0 ? (
                        <img src={pictures[0]?.picture} alt={property.title} className='w-full h-full object-cover' />
                    ) : (
                        <div className='w-full h-full bg-orve-teal/10 flex items-center justify-center'>
                            <Icon className='w-6 h-6 text-orve-teal/30' />
                        </div>
                    )}
                </div>
                <div className='flex-1 py-3 pr-3'>
                    <p className='text-sm font-semibold text-orve-darker-teal truncate'>{property.title}</p>
                    <p className='text-xs text-orve-teal/60 mt-0.5 truncate'>{property.address ?? 'Sin dirección'}</p>
                    <p className='text-base font-bold text-orve-teal mt-1'>{formatPrice(property.price)}</p>
                </div>
            </Link>
        )
    }

    return (
        <Link
            to={`/property/${property.public_id}`}
            className='group block rounded-2xl overflow-hidden bg-white/60 backdrop-blur-sm border border-white shadow-sm hover:shadow-md transition-shadow'
        >
            {/* Imagen */}
            <div className='relative h-44 bg-orve-teal/10 overflow-hidden'>
                {pictures.length > 0 ? (
                    <img
                        src={pictures[imgIndex]?.picture}
                        alt={property.title}
                        className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                        <Icon className='w-8 h-8 text-orve-teal/20' />
                    </div>
                )}

                {/* Ícono tipo — arriba izquierda */}
                <div className='absolute top-2 left-2 w-7 h-7 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm'>
                    <Icon className='w-3.5 h-3.5 text-orve-teal' />
                </div>

                {/* Favorito — arriba derecha */}
                <button
                    onClick={(e) => e.preventDefault()}
                    className='absolute top-2 right-2 w-7 h-7 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors'
                >
                    <Star className='w-3.5 h-3.5 text-orve-teal/60' />
                </button>

                {/* Flechas carrusel */}
                {imgIndex > 0 && (
                    <button onClick={prev} className='absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors'>
                        <ChevronLeft className='w-3.5 h-3.5 text-orve-teal' />
                    </button>
                )}
                {imgIndex < pictures.length - 1 && (
                    <button onClick={next} className='absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors'>
                        <ChevronRight className='w-3.5 h-3.5 text-orve-teal' />
                    </button>
                )}

                {/* Precio — abajo izquierda */}
                <div className='absolute bottom-2 left-2 bg-black/55 text-white text-sm font-bold px-2.5 py-0.5 rounded-lg backdrop-blur-sm'>
                    {formatPrice(property.price)}
                </div>

                {/* Info — abajo derecha */}
                <div className='absolute bottom-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center'>
                    <Info className='w-3 h-3 text-orve-teal' />
                </div>
            </div>
        </Link>
    )
}

export default ListingCard