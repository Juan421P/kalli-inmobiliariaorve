import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import ListingCard from '@/components/properties/ListingCard'
import PropertiesMap from '@/components/properties/PropertiesMap'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import propertyService from '@/services/property'

// ─── Mock data mientras no hay backend ───────────────────────────────────────
const MOCK = [
    { _id: '1', public_id: 'r1', title: 'Casa en Col. Escalón',          property_type: 'house',     listing_type: 'rent', price: 950,  views: 10, createdAt: new Date(Date.now() - 3_600_000).toISOString(),  address: 'Col. Escalón, San Salvador',   location: { type: 'Point', coordinates: [-89.2350, 13.7020] }, pictures: [{ picture: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80' }] },
    { _id: '2', public_id: 'r2', title: 'Apartamento en Santa Elena',    property_type: 'apartment', listing_type: 'rent', price: 1200, views: 25, createdAt: new Date(Date.now() - 7_200_000).toISOString(),  address: 'Santa Elena, Antiguo Cuscatlán', location: { type: 'Point', coordinates: [-89.2480, 13.6780] }, pictures: [{ picture: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80' }] },
    { _id: '3', public_id: 'r3', title: 'Apartamento en Zona Rosa',      property_type: 'apartment', listing_type: 'rent', price: 1000, views: 18, createdAt: new Date(Date.now() - 86_400_000).toISOString(), address: 'Zona Rosa, San Salvador',       location: { type: 'Point', coordinates: [-89.2280, 13.6950] }, pictures: [{ picture: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80' }] },
    { _id: '4', public_id: 'r4', title: 'Casa en Merliot',               property_type: 'house',     listing_type: 'rent', price: 1760, views: 8,  createdAt: new Date(Date.now() - 172_800_000).toISOString(), address: 'Ciudad Merliot, La Libertad',   location: { type: 'Point', coordinates: [-89.2900, 13.6700] }, pictures: [{ picture: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80' }] },
    { _id: '5', public_id: 'r5', title: 'Casa en San Benito',            property_type: 'house',     listing_type: 'rent', price: 750,  views: 32, createdAt: new Date(Date.now() - 3_600_000).toISOString(),  address: 'Col. San Benito, San Salvador', location: { type: 'Point', coordinates: [-89.2380, 13.7000] }, pictures: [{ picture: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80' }] },
    { _id: '6', public_id: 'r6', title: 'Apartamento en Metrocentro',    property_type: 'apartment', listing_type: 'rent', price: 1500, views: 15, createdAt: new Date(Date.now() - 3_600_000).toISOString(),  address: 'Metrocentro, San Salvador',     location: { type: 'Point', coordinates: [-89.2200, 13.6980] }, pictures: [{ picture: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80' }] },
]

const PROPERTY_TYPES = [
    { value: 'all',       label: 'Todos'          },
    { value: 'house',     label: 'Casas'          },
    { value: 'apartment', label: 'Apartamentos'   },
    { value: 'land',      label: 'Terrenos'       },
]

const SORT_OPTIONS = [
    { value: 'recommended', label: 'Recomendados'     },
    { value: 'price_asc',   label: 'Menor precio'     },
    { value: 'price_desc',  label: 'Mayor precio'     },
    { value: 'newest',      label: 'Más recientes'    },
]

// ─── Skeleton card ────────────────────────────────────────────────────────────
const CardSkeleton = () => (
    <div className='rounded-2xl overflow-hidden'>
        <Skeleton className='h-44 w-full' />
    </div>
)

// ─── Página ───────────────────────────────────────────────────────────────────
const RentProperties = () => {
    const [searchParams] = useSearchParams()
    const [properties,  setProperties]  = useState([])
    const [filtered,    setFiltered]    = useState([])
    const [isLoading,   setIsLoading]   = useState(true)
    const [search,      setSearch]      = useState(searchParams.get('q') ?? '')
    const [typeFilter,  setTypeFilter]  = useState(searchParams.get('type') ?? 'all')
    const [sortBy,      setSortBy]      = useState('recommended')
    const [view,        setView]        = useState('grid') // 'grid' | 'list'

    // ── Fetch ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        propertyService.getAll({ listing_type: 'rent' })
            .then((data) => {
                const list = data.properties ?? data.data ?? data ?? []
                const result = Array.isArray(list) ? list.filter((p) => p.listing_type === 'rent') : []
                setProperties(result.length > 0 ? result : MOCK)
            })
            .catch(() => setProperties(MOCK))
            .finally(() => setIsLoading(false))
    }, [])

    // ── Filtros y orden ───────────────────────────────────────────────────────
    const applyFilters = useCallback(() => {
        let result = [...properties]

        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter((p) =>
                p.title.toLowerCase().includes(q) ||
                (p.address ?? '').toLowerCase().includes(q)
            )
        }

        if (typeFilter !== 'all') {
            result = result.filter((p) => p.property_type === typeFilter)
        }

        if (sortBy === 'price_asc')  result.sort((a, b) => a.price - b.price)
        if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price)
        if (sortBy === 'newest')     result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        setFiltered(result)
    }, [properties, search, typeFilter, sortBy])

    useEffect(() => { applyFilters() }, [applyFilters])

    return (
        <div className='flex flex-col h-screen'>
            <Navbar />

            <div className='flex flex-1 overflow-hidden pt-12'>
                {/* ── Panel izquierdo ── */}
                <div className='w-full md:w-[480px] shrink-0 flex flex-col overflow-hidden'>
                    {/* Header */}
                    <div className='px-5 pt-5 pb-3 flex flex-col gap-3'>
                        <div className='flex items-center justify-between'>
                            <h1 className='text-lg font-semibold text-orve-teal'>Propiedades en alquiler</h1>
                            <button className='p-1.5 rounded-lg text-orve-teal/50 hover:text-orve-teal hover:bg-orve-teal/10 transition-colors'>
                                <SlidersHorizontal className='w-4 h-4' />
                            </button>
                        </div>

                        {/* Buscador */}
                        <div className='flex items-center gap-2 bg-white/70 border border-white rounded-xl px-3 py-2 shadow-sm'>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder='Buscar por ciudad, zona, colonia o lugar'
                                className='flex-1 text-sm text-orve-darker-teal placeholder:text-orve-teal/40 outline-none bg-transparent'
                            />
                            <button className='p-1 rounded-lg bg-orve-teal hover:bg-orve-darker-teal transition-colors'>
                                <Search className='w-3.5 h-3.5 text-white' />
                            </button>
                        </div>

                        {/* Filtros */}
                        <div className='flex items-center justify-between gap-2'>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className='w-44 bg-white/70 border-white text-sm text-orve-teal font-medium shadow-sm'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                    {PROPERTY_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className='flex items-center gap-1 ml-auto'>
                                <button
                                    onClick={() => setView('grid')}
                                    className={cn('p-1.5 rounded-lg transition-colors', view === 'grid' ? 'bg-orve-teal text-white' : 'text-orve-teal/50 hover:text-orve-teal hover:bg-orve-teal/10')}
                                >
                                    <LayoutGrid className='w-4 h-4' />
                                </button>
                                <button
                                    onClick={() => setView('list')}
                                    className={cn('p-1.5 rounded-lg transition-colors', view === 'list' ? 'bg-orve-teal text-white' : 'text-orve-teal/50 hover:text-orve-teal hover:bg-orve-teal/10')}
                                >
                                    <List className='w-4 h-4' />
                                </button>
                            </div>
                        </div>

                        {/* Ordenar */}
                        <div className='flex items-center gap-1.5'>
                            <span className='text-xs text-orve-teal/60'>Ordenar:</span>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className='h-6 border-none shadow-none bg-transparent text-xs text-orve-teal font-medium p-0 focus:ring-0 w-auto gap-1'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position='popper' className='bg-white border border-input shadow-md'>
                                    {SORT_OPTIONS.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Grid / Lista scrolleable */}
                    <div className='flex-1 overflow-y-auto px-5 pb-5'>
                        {isLoading ? (
                            <div className='grid grid-cols-2 gap-3'>
                                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className='flex items-center justify-center py-16 text-sm text-orve-teal/50'>
                                No hay propiedades que coincidan.
                            </div>
                        ) : view === 'grid' ? (
                            <div className='grid grid-cols-2 gap-3'>
                                {filtered.map((p) => <ListingCard key={p._id} property={p} view='grid' />)}
                            </div>
                        ) : (
                            <div className='flex flex-col gap-3'>
                                {filtered.map((p) => <ListingCard key={p._id} property={p} view='list' />)}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Mapa derecho ── */}
                <div className='hidden md:block flex-1 relative'>
                    <PropertiesMap properties={filtered} />
                </div>
            </div>
        </div>
    )
}

export default RentProperties