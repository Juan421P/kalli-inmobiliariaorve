import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, Home as HomeIcon, Building2, Map, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Navbar from '@/components/Navbar'
import ScrollArea from '@/components/ScrollArea'
import useHome from '@/hooks/useHome'
import horseAgent from '@/assets/horse-agent.png'
import houseBg from '@/assets/beautiful-background-for-the-home-page.png'


// Formatea numeros a moneda USD sin decimales, ej: 125000 -> "$125,000".
const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

// Convierte una fecha a un texto relativo corto ("Hace 3h", "Hace 2d")
// para el badge de "Publicado hace..." de cada tarjeta de propiedad.
const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / 3_600_000)
    if (hours < 1)  return 'Hace menos de 1 hora'
    if (hours < 24) return `Hace ${hours}h`
    return `Hace ${Math.floor(hours / 24)}d`
}

const PROPERTY_ICONS = {
    house:     HomeIcon,
    apartment: Building2,
    land:      Map,
}

// ─── Property Card ────────────────────────────────────────────────────────────
const PropertyCard = ({ property }) => {
    const [imgIndex, setImgIndex] = useState(0)
    const pictures = property.pictures ?? []
    const Icon = PROPERTY_ICONS[property.property_type] ?? HomeIcon

    // preventDefault: la tarjeta entera es un <Link>, sin esto el click en las
    // flechas tambien navegaria a la propiedad en vez de solo cambiar la foto.
    const prev = (e) => { e.preventDefault(); setImgIndex((i) => Math.max(0, i - 1)) }
    const next = (e) => { e.preventDefault(); setImgIndex((i) => Math.min(pictures.length - 1, i + 1)) }

    return (
        <Link
            to={`/property/${property.public_id}`}
            className='group relative shrink-0 w-56 rounded-2xl overflow-hidden bg-white/20 shadow-sm hover:shadow-md transition-shadow'
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
                    <div className='w-full h-full flex items-center justify-center text-orve-teal/30 text-xs'>
                        Sin imagen
                    </div>
                )}

                {/* Ícono tipo propiedad — arriba izquierda */}
                <div className='absolute top-2 left-2 w-7 h-7 bg-white/85 backdrop-blur-sm rounded-lg flex items-center justify-center'>
                    <Icon className='w-3.5 h-3.5 text-orve-teal' />
                </div>

                {/* Badge tiempo — arriba derecha */}
                <div className='absolute top-2 right-2 bg-white/85 backdrop-blur-sm text-orve-teal text-[10px] font-medium px-2 py-0.5 rounded-full'>
                    Publicado {timeAgo(property.createdAt)}
                </div>

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

                {/* Info — abajo izquierda (junto al precio) */}
                <div className='absolute bottom-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center'>
                    <Info className='w-3.5 h-3.5 text-orve-teal' />
                </div>
            </div>
        </Link>
    )
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
const PropertyCardSkeleton = () => (
    <div className='shrink-0 w-56 rounded-2xl overflow-hidden'>
        <Skeleton className='h-44 w-full' />
    </div>
)

// ─── Sección de propiedades con tabs + scroll horizontal ──────────────────────
const PropertiesSection = ({ properties, isLoading }) => {
    // "Recientes" confia en el orden que ya devuelve el backend (mas nuevo primero).
    const recent  = properties.slice(0, 10)
    // "Populares": copiamos el array antes de sort() porque muta in-place,
    // y no queremos alterar el orden original que usa "Recientes".
    const popular = [...properties].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 10)

    const Row = ({ items }) => {
        if (!isLoading && items.length === 0) {
            return (
                <div className='flex flex-col items-center justify-center py-12 gap-2 text-center'>
                    <p className='text-orve-teal/50 text-sm'>No hay propiedades disponibles por el momento.</p>
                    <p className='text-orve-teal/30 text-xs'>Volvé a intentarlo más tarde.</p>
                </div>
            )
        }
        return (
            <ScrollArea axis='x' className='pb-3'>
                <div className='flex gap-3 w-max'>
                    {isLoading
                        ? Array.from({ length: 5 }).map((_, i) => <PropertyCardSkeleton key={i} />)
                        : items.map((p) => <PropertyCard key={p._id} property={p} />)
                    }
                </div>
            </ScrollArea>
        )
    }

    return (
        <section className='max-w-7xl mx-auto px-4 py-8'>
            <Tabs defaultValue='recent'>
                <TabsList className='mb-4 bg-white/60 backdrop-blur-sm border border-white shadow-sm rounded-lg p-0.5 w-fit'>
                    {[
                        { value: 'recent',  label: 'Recientes'   },
                        { value: 'popular', label: 'Populares'   },
                        { value: 'nearby',  label: 'Cerca de ti' },
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className='text-sm px-4 py-1.5 rounded-md data-[state=active]:bg-orve-teal data-[state=active]:text-white text-orve-teal/60 hover:text-orve-teal transition-colors'
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value='recent'><Row items={recent} /></TabsContent>
                <TabsContent value='popular'><Row items={popular} /></TabsContent>
                <TabsContent value='nearby'>
                    <div className='flex items-center justify-center py-12 text-sm text-orve-teal/50'>
                        Activa tu ubicación para ver propiedades cercanas.
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    )
}

// ─── Categorías ───────────────────────────────────────────────────────────────
const CATEGORIES = [
    { label: 'Explorar viviendas',    href: '/buy?type=house',     img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80' },
    { label: 'Explorar apartamentos', href: '/buy?type=apartment', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80' },
    { label: 'Explorar terrenos',     href: '/buy?type=land',      img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80' },
]

const CategoriesSection = () => (
    <section className='max-w-7xl mx-auto px-4 pb-10'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {CATEGORIES.map((cat) => (
                <Link
                    key={cat.href}
                    to={cat.href}
                    className='group relative h-52 rounded-2xl overflow-hidden shadow-sm'
                >
                    <div
                        className='absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105'
                        style={{ backgroundImage: `url(${cat.img})` }}
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
                    <div className='absolute bottom-4 left-4'>
                        <span className='inline-flex items-center bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium px-3 py-1.5 rounded-lg'>
                            {cat.label}
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    </section>
)

// ─── CTA propietarios ─────────────────────────────────────────────────────────
const OwnersSection = () => (
    <section className='max-w-7xl mx-auto px-4 pb-12'>
        <div
            className='relative rounded-2xl overflow-hidden'
            style={{ backgroundImage: `url(${houseBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <div className='absolute inset-0 bg-white/75 backdrop-blur-sm' />
            <div className='relative grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-orve-teal/15'>
                {/* Alquilar */}
                <div className='flex items-center justify-between gap-4 p-8'>
                    <div className='flex flex-col gap-3'>
                        <div>
                            <h3 className='text-xl font-bold text-orve-darker-teal leading-tight'>
                                ¿Quiere alquilar su propiedad?
                            </h3>
                            <p className='text-sm text-orve-teal/70 mt-1'>¡Nosotros le asesoramos!</p>
                        </div>
                        <div className='flex flex-col gap-1.5'>
                            <Link to='/owners/rent' className='text-xs text-orve-teal/60 hover:text-orve-teal transition-colors flex items-center gap-1'>
                                Más información <ArrowRight className='w-3 h-3' />
                            </Link>
                            <Link to='/owners/rent' className='self-start bg-orve-teal hover:bg-orve-darker-teal text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors'>
                                Alquile ya
                            </Link>
                        </div>
                    </div>
                    <img src={horseAgent} alt='Agente ORVE' className='w-28 h-28 object-contain shrink-0 select-none' />
                </div>
                {/* Vender */}
                <div className='flex items-center justify-between gap-4 p-8'>
                    <img src={horseAgent} alt='Agente ORVE' className='w-28 h-28 object-contain shrink-0 select-none scale-x-[-1]' />
                    <div className='flex flex-col gap-3 items-end text-right'>
                        <div>
                            <h3 className='text-xl font-bold text-orve-darker-teal leading-tight'>
                                ¿Quiere vender su propiedad?
                            </h3>
                            <p className='text-sm text-orve-teal/70 mt-1'>¡Nosotros le asesoramos!</p>
                        </div>
                        <div className='flex flex-col gap-1.5 items-end'>
                            <Link to='/owners/sell' className='text-xs text-orve-teal/60 hover:text-orve-teal transition-colors flex items-center gap-1'>
                                Más información <ArrowRight className='w-3 h-3' />
                            </Link>
                            <Link to='/owners/sell' className='self-end bg-orve-darker-teal hover:bg-orve-teal text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors'>
                                Venda ya
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
)

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = ({ search, onSearch, onSubmit }) => (
    <section className='relative h-72 md:h-96 flex items-center overflow-hidden'>
        <div className='absolute inset-0 bg-cover bg-center' style={{ backgroundImage: `url(${houseBg})` }} />
        <div className='absolute inset-0 bg-gradient-to-r from-orve-teal/70 via-orve-teal/30 to-transparent' />
        <div className='relative z-10 w-full max-w-7xl mx-auto px-8'>
            <h1 className='text-4xl md:text-5xl font-bold text-white leading-tight mb-6 drop-shadow-md'>
                A un clic de tu<br />próximo hogar
            </h1>
            <div className='flex items-center gap-2 bg-white rounded-xl shadow-lg px-4 py-2.5 max-w-lg'>
                <Search className='w-4 h-4 text-orve-teal/40 shrink-0' />
                <input
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                    placeholder='Buscar por ciudad, zona, colonia o lugar'
                    className='flex-1 text-sm text-orve-darker-teal placeholder:text-orve-teal/40 outline-none bg-transparent'
                />
                <button onClick={onSubmit} className='bg-orve-teal hover:bg-orve-darker-teal text-white p-1.5 rounded-lg transition-colors shrink-0'>
                    <Search className='w-4 h-4' />
                </button>
            </div>
        </div>
    </section>
)

// ─── Página ───────────────────────────────────────────────────────────────────
const Home = () => {
    const { search, setSearch, properties, isLoading, handleSearch } = useHome()

    return (
        <div className='min-h-screen'>
            <Navbar />
            <Hero search={search} onSearch={setSearch} onSubmit={handleSearch} />
            <PropertiesSection properties={properties} isLoading={isLoading} />
            <CategoriesSection />
            <OwnersSection />
        </div>
    )
}

export default Home
