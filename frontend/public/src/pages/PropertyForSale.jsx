import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    MapPin, Eye, Bed, Bath, Car, Maximize2,
    Sofa, PawPrint, Zap, ChevronDown, Calendar, Tag,
    Layers, Star, Images
} from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon   from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import Navbar from '@/components/Navbar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import propertyService from '@/services/property'
import useAuth from '@/hooks/useAuth'
import LoginToOfferModal from '@/components/properties/LoginToOfferModal'

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

const Accordion = ({ icon: Icon, title, children }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className='bg-white/50 backdrop-blur-sm border border-white rounded-xl overflow-hidden'>
            <button
                onClick={() => setOpen((v) => !v)}
                className='w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-orve-teal hover:bg-orve-teal/5 transition-colors'
            >
                <div className='flex items-center gap-2.5'>
                    <Icon className='w-4 h-4 text-orve-teal/60' />
                    {title}
                </div>
                <ChevronDown className={cn('w-4 h-4 text-orve-teal/40 transition-transform duration-200', open && 'rotate-180')} />
            </button>
            {open && (
                <div className='px-5 pb-4 pt-1 flex flex-wrap gap-2 border-t border-orve-teal/10'>
                    {children}
                </div>
            )}
        </div>
    )
}

const Chip = ({ label }) => (
    <span className='inline-flex items-center px-3 py-1.5 rounded-full bg-orve-teal/12 text-orve-darker-teal text-xs font-medium border border-orve-teal/15'>
        {label}
    </span>
)

const Gallery = ({ pictures = [] }) => {
    const [active, setActive] = useState(0)
    const main   = pictures[active]
    const thumbs = pictures.slice(0, 4)

    return (
        <div className='flex flex-col gap-2'>
            <div className='relative h-72 md:h-80 rounded-2xl overflow-hidden bg-orve-teal/10'>
                {main ? (
                    <img src={main.picture} alt='Propiedad' className='w-full h-full object-cover' />
                ) : (
                    <div className='w-full h-full flex items-center justify-center text-orve-teal/30 text-sm'>Sin imagen</div>
                )}
                {pictures.length > 4 && (
                    <button className='absolute top-3 right-3 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm text-orve-teal text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm hover:bg-white transition-colors'>
                        <Images className='w-3.5 h-3.5' />
                        Ver mas fotos
                    </button>
                )}
            </div>
            {pictures.length > 1 && (
                <div className='grid grid-cols-4 gap-2'>
                    {thumbs.map((pic, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={cn(
                                'h-20 rounded-xl overflow-hidden border-2 transition-colors',
                                i === active ? 'border-orve-teal' : 'border-transparent hover:border-orve-teal/40'
                            )}
                        >
                            <img src={pic.picture} alt='' className='w-full h-full object-cover' />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

const PropertyForSale = () => {
    const { public_id } = useParams()
    const [property,  setProperty]  = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [notFound,  setNotFound]  = useState(false)
    const [showOfferModal, setShowOfferModal] = useState(false)
    const { isAuthenticated } = useAuth()

    useEffect(() => {
        propertyService.getByPublicId(public_id)
            .then((data) => setProperty(data.property ?? data))
            .catch(() => setNotFound(true))
            .finally(() => setIsLoading(false))
    }, [public_id])

    const navigate = useNavigate()

    const handleOfferClick = () => {
        if (!isAuthenticated) {
            setShowOfferModal(true)
        } else {
            navigate(`/property/${public_id}/offer`)
        }
    }

    const coords = property?.location?.coordinates
    const hasMap = coords?.length === 2
    const coverImage = property?.pictures?.[0]?.picture ?? null

    return (
        <div>
            <Navbar />
            <div className='max-w-5xl mx-auto px-4 py-8'>
                {isLoading ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        <div className='flex flex-col gap-4'>
                            <Skeleton className='h-8 w-3/4' />
                            <Skeleton className='h-4 w-1/2' />
                            <Skeleton className='h-6 w-1/3' />
                            <Skeleton className='h-72 w-full rounded-2xl' />
                        </div>
                        <Skeleton className='h-96 rounded-2xl' />
                    </div>
                ) : notFound ? (
                    <div className='flex flex-col items-center justify-center py-24 gap-3'>
                        <p className='text-orve-teal/50 text-lg'>Propiedad no encontrada.</p>
                        <Link to='/' className='text-sm text-orve-teal underline'>Volver al inicio</Link>
                    </div>
                ) : property && (
                    <div className='flex flex-col gap-8'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-start'>
                            <div className='flex flex-col gap-4'>
                                <div>
                                    <h1 className='text-2xl md:text-3xl font-bold text-orve-darker-teal leading-tight'>
                                        {property.title}
                                    </h1>
                                    {property.address && (
                                        <div className='flex items-center gap-1.5 mt-2 text-sm text-orve-teal/70'>
                                            <MapPin className='w-3.5 h-3.5 shrink-0' />
                                            <span className='truncate'>{property.address}</span>
                                        </div>
                                    )}
                                    <div className='flex items-center gap-1 text-xs text-orve-teal/50 mt-2'>
                                        <Eye className='w-3.5 h-3.5' />
                                        {property.views ?? 0} vistas
                                    </div>
                                </div>

                                <div className='h-px bg-orve-teal/10' />

                                <div>
                                    <p className='text-xs text-orve-teal/60 uppercase tracking-widest font-medium'>
                                        {property.listing_type === 'rent' ? 'Alquiler de' : 'Precio de venta'}
                                    </p>
                                    <p className='text-2xl font-bold text-orve-teal mt-0.5'>
                                        {formatPrice(property.price)}
                                        {property.listing_type === 'rent' && (
                                            <span className='text-sm font-normal text-orve-teal/60 ml-1'>/ mes</span>
                                        )}
                                    </p>
                                </div>

                                <div className='grid grid-cols-3 gap-3'>
                                    {[
                                        { icon: Bed,       label: `${property.bedrooms ?? 0} habitaciones` },
                                        { icon: Bath,      label: `${property.bathrooms ?? 0} banos` },
                                        { icon: Car,       label: `${property.parking_spaces ?? 0} parqueos` },
                                        { icon: Maximize2, label: `${property.area?.number ?? 0} ${property.area?.unit ?? 'm2'} totales` },
                                        { icon: Sofa,      label: property.furnished ? 'Amueblado' : 'No amueblado' },
                                        { icon: Zap,       label: 'Sin linea electrica' },
                                    ].map(({ icon: Icon, label }) => (
                                        <div key={label} className='flex items-center gap-1.5 text-xs text-orve-teal/80'>
                                            <Icon className='w-3.5 h-3.5 text-orve-teal/50 shrink-0' />
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                    {property.allows_pets && (
                                        <div className='flex items-center gap-1.5 text-xs text-orve-teal/80'>
                                            <PawPrint className='w-3.5 h-3.5 text-orve-teal/50 shrink-0' />
                                            <span>Admite mascotas</span>
                                        </div>
                                    )}
                                </div>

                                <div className='flex gap-3 mt-2'>
                                    <button className='flex-1 flex items-center justify-center gap-2 bg-orve-teal hover:bg-orve-darker-teal text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors'>
                                        <Calendar className='w-4 h-4 shrink-0' strokeWidth={1.5} />
                                        Agendar cita
                                    </button>
                                    <button
                                        onClick={handleOfferClick}
                                        className='flex-1 flex items-center justify-center gap-2 bg-orve-darker-teal hover:bg-orve-teal text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors'
                                    >
                                        <Star className='w-4 h-4 shrink-0' strokeWidth={1.5} />
                                        Hacer una oferta
                                    </button>
                                </div>
                            </div>

                            <Gallery pictures={property.pictures ?? []} />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <Accordion icon={Star} title='Amenidades'>
                                {property.amenities?.length > 0
                                    ? property.amenities.map((a) => <Chip key={a._id ?? a} label={a.name ?? a} />)
                                    : <p className='text-xs text-orve-teal/40'>Sin amenidades registradas.</p>
                                }
                            </Accordion>
                            <Accordion icon={Zap} title='Electrodomesticos'>
                                {property.appliances?.length > 0
                                    ? property.appliances.map((a) => <Chip key={a._id ?? a} label={a.name ?? a} />)
                                    : <p className='text-xs text-orve-teal/40'>Sin electrodomesticos registrados.</p>
                                }
                            </Accordion>
                            <Accordion icon={Tag} title='Etiquetas'>
                                {property.tags?.length > 0
                                    ? property.tags.map((t) => <Chip key={t._id ?? t} label={t.name ?? t} />)
                                    : <p className='text-xs text-orve-teal/40'>Sin etiquetas registradas.</p>
                                }
                            </Accordion>
                            <Accordion icon={Layers} title='Caracteristicas'>
                                {property.features?.length > 0
                                    ? property.features.map((f) => <Chip key={f._id ?? f} label={f.name ?? f} />)
                                    : <p className='text-xs text-orve-teal/40'>Sin caracteristicas registradas.</p>
                                }
                            </Accordion>
                        </div>

                        {hasMap && (
                            <div className='h-72 rounded-2xl overflow-hidden border border-white shadow-sm relative z-0'>
                                <MapContainer
                                    center={[coords[1], coords[0]]}
                                    zoom={15}
                                    scrollWheelZoom={false}
                                    className='h-full w-full'
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                    />
                                    <Marker position={[coords[1], coords[0]]} />
                                </MapContainer>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showOfferModal && (
                <LoginToOfferModal
                    propertyTitle={property?.title}
                    coverImage={coverImage}
                    onClose={() => setShowOfferModal(false)}
                />
            )}
        </div>
    )
}

export default PropertyForSale
