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
import usePropertyListing from '@/hooks/usePropertyListing'

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

/**
 * Pagina de listado "Alquilar": misma estructura que BuyProperties
 * (panel de filtros + mapa), comparten toda la logica de datos via
 * usePropertyListing y solo cambia el listingType que se les pasa.
 */
const RentProperties = () => {
    const {
        isLoading, filtered,
        search, setSearch,
        typeFilter, setTypeFilter,
        sortBy, setSortBy,
        view, setView,
    } = usePropertyListing('rent')

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
