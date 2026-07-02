import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    Plus, X, ChevronLeft, ChevronRight,
    MapPin, DollarSign, Maximize2, Bed, Bath, Car,
    Star, Zap, Tag, Layers, Calendar, ChevronDown,
    SlidersHorizontal,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { cn } from '@/lib/utils'

const MAX_SLOTS    = 3
const STORAGE_KEY  = 'compare_slots'

const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0)

/* ─── Página principal ─────────────────────────────────────────────── */

const CompareProperties = () => {
    const navigate  = useNavigate()
    const location  = useLocation()

    const [slots, setSlots] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) ?? [] }
        catch { return [] }
    })

    // Al regresar de /compare/select con una propiedad seleccionada
    useEffect(() => {
        const incoming = location.state?.addProperty
        if (!incoming) return
        setSlots(prev => {
            if (prev.find(s => s._id === incoming._id)) return prev
            const next = [...prev, incoming].slice(0, MAX_SLOTS)
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
            return next
        })
        navigate('/compare', { replace: true, state: {} })
    }, [location.state])

    // Sincroniza slots a sessionStorage cuando cambian por otras acciones
    const updateSlots = (next) => {
        setSlots(next)
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }

    const removeProperty = (id) => updateSlots(slots.filter(p => p._id !== id))
    const clearAll        = ()   => updateSlots([])

    const emptyCount = MAX_SLOTS - slots.length

    return (
        <div className='min-h-screen'>
            <Navbar />

            <div className='max-w-6xl mx-auto px-6 pt-24 pb-16'>

                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='text-xl font-bold text-orve-darker-teal flex items-center gap-2'>
                        <SlidersHorizontal className='w-5 h-5' />
                        Comparar propiedades
                    </h1>
                    {slots.length > 0 && (
                        <button
                            onClick={clearAll}
                            className='flex items-center gap-1.5 text-xs text-orve-teal/60 hover:text-orve-red transition-colors'
                        >
                            Limpiar comparador
                            <X className='w-3.5 h-3.5' />
                        </button>
                    )}
                </div>

                {/* Columnas */}
                <div className='grid gap-4' style={{ gridTemplateColumns: `repeat(${MAX_SLOTS}, 1fr)` }}>
                    {slots.map((prop) => (
                        <PropertyColumn
                            key={prop._id}
                            property={prop}
                            allSlots={slots}
                            onRemove={() => removeProperty(prop._id)}
                            onSchedule={() => navigate(`/property/${prop.public_id}/schedule`)}
                        />
                    ))}
                    {Array.from({ length: emptyCount }).map((_, i) => (
                        <EmptySlot key={i} onClick={() => navigate('/compare/select')} />
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ─── Slot vacío ───────────────────────────────────────────────────── */

const EmptySlot = ({ onClick }) => (
    <button
        onClick={onClick}
        className='w-full min-h-[160px] rounded-2xl border-2 border-dashed border-orve-teal/20 bg-orve-teal/4 hover:border-orve-teal/40 hover:bg-orve-teal/8 transition-all flex items-center justify-center group'
    >
        <Plus className='w-10 h-10 text-orve-teal/25 group-hover:text-orve-teal/50 transition-colors' strokeWidth={1.5} />
    </button>
)

/* ─── Columna de propiedad ─────────────────────────────────────────── */

const PropertyColumn = ({ property: p, allSlots, onRemove, onSchedule }) => {
    const [imgIdx, setImgIdx] = useState(0)
    const pics  = p.pictures ?? []
    const area  = p.area?.number ?? p.area ?? 0
    const pricePerM2 = area > 0 ? (p.price / area) : 0

    const wins = useMemo(() => computeWins(allSlots), [allSlots])
    const w    = wins[p._id] ?? {}

    const rows = [
        { icon: DollarSign, label: 'Precio de venta',       value: fmt(p.price),           win: w.price },
        { icon: Maximize2,  label: 'Área de la propiedad',  value: `${area} m²`,           win: w.area },
        { icon: DollarSign, label: 'Precio por m²',         value: `${fmt(pricePerM2)} / m²`, win: w.pricePerM2 },
        { icon: Bed,        label: 'Habitaciones',           value: p.bedrooms ?? 0,        win: w.bedrooms },
        { icon: Bath,       label: 'Baños',                  value: p.bathrooms ?? 0,       win: w.bathrooms },
        { icon: Car,        label: 'Parqueos disponibles',   value: p.parking_spaces ?? 0,  win: w.parking },
    ]

    return (
        <div className='flex flex-col rounded-2xl overflow-hidden border border-orve-teal/10 bg-white/60 backdrop-blur-sm'>

            {/* Imagen con slider */}
            <div className='relative h-44 bg-orve-teal/10 overflow-hidden shrink-0'>
                {pics.length > 0 ? (
                    <img src={pics[imgIdx]?.picture} alt='' className='w-full h-full object-cover' />
                ) : (
                    <div className='w-full h-full flex items-center justify-center text-orve-teal/25 text-xs'>Sin imagen</div>
                )}
                {pics.length > 1 && (
                    <>
                        <button onClick={() => setImgIdx(i => (i - 1 + pics.length) % pics.length)}
                            className='absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors'>
                            <ChevronLeft className='w-4 h-4' />
                        </button>
                        <button onClick={() => setImgIdx(i => (i + 1) % pics.length)}
                            className='absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors'>
                            <ChevronRight className='w-4 h-4' />
                        </button>
                    </>
                )}
                {p.address && (
                    <div className='absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2'>
                        <p className='text-white text-[10px] flex items-center gap-1 line-clamp-1'>
                            <MapPin className='w-2.5 h-2.5 shrink-0' />
                            {p.address}
                        </p>
                    </div>
                )}
                <button onClick={onRemove}
                    className='absolute top-2 right-2 w-6 h-6 rounded-full bg-black/35 hover:bg-orve-red/80 flex items-center justify-center text-white transition-colors'>
                    <X className='w-3 h-3' />
                </button>
            </div>

            {/* Filas de datos */}
            <div className='flex flex-col divide-y divide-orve-teal/8'>
                {rows.map(({ icon: Icon, label, value, win }) => (
                    <div key={label} className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 text-xs transition-colors',
                        win && allSlots.length > 1 ? 'bg-orve-green/12' : 'bg-transparent'
                    )}>
                        <div className='flex items-center gap-2 text-orve-teal/60'>
                            <Icon className='w-3.5 h-3.5 shrink-0' />
                            <span>{label}</span>
                        </div>
                        <span className={cn('font-semibold', win && allSlots.length > 1 ? 'text-orve-green' : 'text-orve-darker-teal')}>
                            {value}
                        </span>
                    </div>
                ))}
                <CompareAccordion icon={Star}   label='Amenidades'        items={p.amenities} />
                <CompareAccordion icon={Zap}    label='Electrodomésticos' items={p.appliances} />
                <CompareAccordion icon={Layers} label='Características'   items={p.features} />
                <CompareAccordion icon={Tag}    label='Etiquetas'         items={p.tags} />
            </div>

            <button
                onClick={onSchedule}
                className='flex items-center justify-center gap-2 m-3 mt-auto py-3 rounded-xl bg-orve-darker-teal hover:bg-orve-teal text-white text-xs font-semibold transition-colors'
            >
                <Calendar className='w-3.5 h-3.5' />
                Agendar cita
            </button>
        </div>
    )
}

/* ─── Acordeón ─────────────────────────────────────────────────────── */

const CompareAccordion = ({ icon: Icon, label, items = [] }) => {
    const [open, setOpen] = useState(false)
    return (
        <div>
            <button
                onClick={() => setOpen(v => !v)}
                className='w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-orve-teal/60 hover:bg-orve-teal/5 transition-colors'
            >
                <div className='flex items-center gap-2'>
                    <Icon className='w-3.5 h-3.5 shrink-0' />
                    {label}
                </div>
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
            </button>
            {open && (
                <div className='px-3.5 pb-2.5 flex flex-wrap gap-1.5 border-t border-orve-teal/8'>
                    {items?.length > 0
                        ? items.map((a, i) => (
                            <span key={i} className='text-[10px] bg-orve-teal/10 text-orve-darker-teal px-2 py-0.5 rounded-full'>
                                {a.name ?? a}
                            </span>
                        ))
                        : <p className='text-[10px] text-orve-teal/30 py-1'>Sin datos</p>
                    }
                </div>
            )}
        </div>
    )
}

/* ─── Lógica de comparación ────────────────────────────────────────── */

function computeWins(slots) {
    if (slots.length < 2) return {}
    const result = {}
    const check = (field, getter, higherIsBetter) => {
        const values = slots.map(p => ({ id: p._id, val: getter(p) }))
        const hasDiff = values.some(v => v.val !== values[0].val)
        if (!hasDiff) return
        const best = higherIsBetter
            ? Math.max(...values.map(v => v.val))
            : Math.min(...values.map(v => v.val))
        values.forEach(({ id, val }) => {
            if (!result[id]) result[id] = {}
            result[id][field] = val === best
        })
    }
    check('price',      p => p.price ?? 0,                                              false)
    check('area',       p => p.area?.number ?? p.area ?? 0,                             true)
    check('pricePerM2', p => p.price / Math.max(p.area?.number ?? p.area ?? 1, 1),     false)
    check('bedrooms',   p => p.bedrooms ?? 0,                                           true)
    check('bathrooms',  p => p.bathrooms ?? 0,                                          true)
    check('parking',    p => p.parking_spaces ?? 0,                                     true)
    return result
}

export default CompareProperties
