import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, SlidersHorizontal, MapPin, Bed, Bath, Car } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { cn } from '@/lib/utils'
import propertyService from '@/services/property'

const STORAGE_KEY = 'compare_slots'

const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0)

const CompareSelect = () => {
    const navigate  = useNavigate()
    const [allProps, setAllProps] = useState([])
    const [loading,  setLoading]  = useState(true)
    const [search,   setSearch]   = useState('')
    const [picked,   setPicked]   = useState(null)

    // IDs ya en el comparador (para deshabilitarlos)
    const currentIds = useMemo(() => {
        try { return (JSON.parse(sessionStorage.getItem(STORAGE_KEY)) ?? []).map(p => p._id) }
        catch { return [] }
    }, [])

    useEffect(() => {
        propertyService.getAll()
            .then(d => {
                const list = d.properties ?? d.data ?? d ?? []
                setAllProps(Array.isArray(list) ? list : [])
            })
            .catch(() => setAllProps([]))
            .finally(() => setLoading(false))
    }, [])


    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim()
        if (!q) return allProps
        return allProps.filter(p =>
            p.title?.toLowerCase().includes(q) ||
            p.address?.toLowerCase().includes(q)
        )
    }, [allProps, search])

    const handleAdd = () => {
        if (!picked) return
        navigate('/compare', { state: { addProperty: picked } })
    }

    return (
        <div
            className='min-h-screen relative overflow-x-hidden'
            style={{ background: 'linear-gradient(135deg, #deeef0 0%, #eaf4f5 40%, #f2f8f9 100%)' }}
        >
            {/* Círculos decorativos */}
            <svg className='absolute inset-0 w-full h-full pointer-events-none' preserveAspectRatio='none' style={{ opacity: 0.15 }} aria-hidden>
                <circle cx='75%' cy='15%' r='300' fill='none' stroke='#507177' strokeWidth='55' />
                <circle cx='82%' cy='20%' r='460' fill='none' stroke='#507177' strokeWidth='38' />
                <circle cx='10%' cy='85%' r='240' fill='none' stroke='#507177' strokeWidth='42' />
            </svg>

            <Navbar />

            <div className='relative max-w-5xl mx-auto px-6 pt-24 pb-32'>

                {/* Header */}
                <div className='flex items-center gap-3 mb-6'>
                    <button
                        onClick={() => navigate('/compare')}
                        className='w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 border border-orve-teal/15 flex items-center justify-center text-orve-teal/60 hover:text-orve-teal transition-colors shrink-0'
                    >
                        <ArrowLeft className='w-4 h-4' />
                    </button>
                    <h1 className='text-xl font-bold text-orve-darker-teal flex items-center gap-2'>
                        <SlidersHorizontal className='w-5 h-5' />
                        Seleccione una propiedad
                    </h1>
                </div>

                {/* Buscador */}
                <div className='flex items-center gap-2 bg-white/80 border border-orve-teal/15 rounded-2xl px-4 py-3 mb-8 shadow-sm'>
                    <Search className='w-4 h-4 text-orve-teal/40 shrink-0' />
                    <input
                        autoFocus
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder='Buscar por título o dirección...'
                        className='flex-1 bg-transparent text-sm outline-none text-orve-darker-teal placeholder:text-orve-teal/35'
                    />
                </div>

                {/* Grid de propiedades */}
                {loading ? (
                    <div className='flex items-center justify-center py-24'>
                        <span className='w-8 h-8 border-2 border-orve-teal/20 border-t-orve-teal rounded-full animate-spin' />
                    </div>
                ) : filtered.length === 0 ? (
                    <p className='text-center text-sm text-orve-teal/40 py-24'>Sin resultados</p>
                ) : (
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                        {filtered.map(prop => {
                            const alreadyIn = currentIds.includes(prop._id)
                            const isPicked  = picked?._id === prop._id
                            return (
                                <button
                                    key={prop._id}
                                    onClick={() => !alreadyIn && setPicked(isPicked ? null : prop)}
                                    disabled={alreadyIn}
                                    className={cn(
                                        'relative flex flex-col rounded-2xl overflow-hidden border-2 text-left transition-all',
                                        alreadyIn
                                            ? 'opacity-40 cursor-not-allowed border-gray-200 bg-white/40'
                                            : isPicked
                                                ? 'border-orve-teal shadow-lg scale-[1.02] bg-white/90'
                                                : 'border-transparent bg-white/60 hover:border-orve-teal/40 hover:bg-white/80'
                                    )}
                                >
                                    {/* Imagen */}
                                    <div className='h-32 bg-orve-teal/10 relative overflow-hidden shrink-0'>
                                        {prop.pictures?.[0]?.picture
                                            ? <img src={prop.pictures[0].picture} alt='' className='w-full h-full object-cover' />
                                            : <div className='w-full h-full flex items-center justify-center text-orve-teal/20 text-xs'>Sin foto</div>
                                        }
                                        {/* Badge precio */}
                                        <span className='absolute top-2 left-2 bg-orve-darker-teal text-white text-[10px] font-bold px-2 py-0.5 rounded-full'>
                                            {fmt(prop.price)}
                                        </span>
                                        {/* Checkmark */}
                                        <div className={cn(
                                            'absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                                            isPicked ? 'bg-orve-teal border-orve-teal' : 'bg-white/70 border-white/60'
                                        )}>
                                            {isPicked && <span className='text-white text-[9px] font-bold leading-none'>✓</span>}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className='p-2.5 flex flex-col gap-1'>
                                        {prop.address && (
                                            <p className='text-[10px] text-orve-teal/50 flex items-center gap-1 line-clamp-1'>
                                                <MapPin className='w-2.5 h-2.5 shrink-0' />
                                                {prop.address}
                                            </p>
                                        )}
                                        <div className='flex items-center gap-2.5 text-[10px] text-orve-teal/60'>
                                            {prop.bedrooms != null && (
                                                <span className='flex items-center gap-0.5'>
                                                    <Bed className='w-2.5 h-2.5' />{prop.bedrooms}
                                                </span>
                                            )}
                                            {prop.bathrooms != null && (
                                                <span className='flex items-center gap-0.5'>
                                                    <Bath className='w-2.5 h-2.5' />{prop.bathrooms}
                                                </span>
                                            )}
                                            {prop.parking_spaces != null && (
                                                <span className='flex items-center gap-0.5'>
                                                    <Car className='w-2.5 h-2.5' />{prop.parking_spaces}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {alreadyIn && (
                                        <div className='absolute inset-0 flex items-center justify-center'>
                                            <span className='text-[10px] bg-orve-teal/80 text-white px-2 py-1 rounded-full'>Ya agregada</span>
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Barra inferior fija */}
            <div className='fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-orve-teal/10 px-6 py-4 flex items-center justify-between z-40'>
                <p className='text-sm text-orve-teal/50'>
                    {picked ? `Seleccionada: ${fmt(picked.price)}` : 'Ninguna propiedad seleccionada'}
                </p>
                <button
                    onClick={handleAdd}
                    disabled={!picked}
                    className='flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orve-darker-teal text-white text-sm font-semibold hover:bg-orve-teal transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
                >
                    <SlidersHorizontal className='w-4 h-4' />
                    Agregar a la comparación
                </button>
            </div>
        </div>
    )
}

export default CompareSelect
