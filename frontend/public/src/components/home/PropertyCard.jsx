import { Link } from 'react-router-dom'
import { MapPin, Bed, Bath, Square } from 'lucide-react'
import houseBg from '@/assets/house-bg.png'

const PropertyCard = ({ property }) => {
    const img = property.pictures?.[0]?.picture ?? houseBg
    const price = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
    }).format(property.price || 0)

    return (
        <Link
            to={`/property/${property._id}`}
            className='group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow'
        >
            {/* Imagen */}
            <div className='relative h-48 overflow-hidden bg-orve-teal/10'>
                <img
                    src={img}
                    alt={property.title || 'Propiedad'}
                    className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                />
                {/* Badge de tipo de operación */}
                {property.operation_type && (
                    <span className='absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-orve-darker-teal text-xs font-medium px-2 py-1 rounded-lg'>
                        {property.operation_type === 'sale' ? 'Venta' : 'Renta'}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className='px-3 py-2.5 flex flex-col gap-1.5'>
                {/* Precio */}
                <p className='text-base font-bold text-orve-darker-teal'>
                    {price}
                </p>

                {/* Ubicación */}
                {property.location?.address && (
                    <div className='flex items-center gap-1 text-xs text-orve-teal/60'>
                        <MapPin className='w-3 h-3 shrink-0' />
                        <span className='truncate'>{property.location.address}</span>
                    </div>
                )}

                {/* Características */}
                <div className='flex items-center gap-3 text-xs text-orve-teal/60 mt-1'>
                    {property.rooms?.bedrooms > 0 && (
                        <div className='flex items-center gap-1'>
                            <Bed className='w-3 h-3' />
                            <span>{property.rooms.bedrooms}</span>
                        </div>
                    )}
                    {property.rooms?.bathrooms > 0 && (
                        <div className='flex items-center gap-1'>
                            <Bath className='w-3 h-3' />
                            <span>{property.rooms.bathrooms}</span>
                        </div>
                    )}
                    {property.area?.total > 0 && (
                        <div className='flex items-center gap-1'>
                            <Square className='w-3 h-3' />
                            <span>{property.area.total}m²</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default PropertyCard
