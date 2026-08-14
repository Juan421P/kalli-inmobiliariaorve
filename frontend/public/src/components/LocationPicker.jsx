import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { MapPin, CheckCircle2, RefreshCw, Loader2, AlertCircle, Search, X } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import GeoSVService from '@/services/geosv'

const pinIcon = L.divIcon({
    html: `<svg viewBox="0 0 24 32" width="28" height="38" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 8.5 12 20 12 20S24 20.5 24 12C24 5.37 18.63 0 12 0z" fill="#507177"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    className: '',
    iconSize: [28, 38],
    iconAnchor: [14, 38],
})

const ClickHandler = ({ onPlace, disabled }) => {
    useMapEvents({
        click(e) {
            if (!disabled) onPlace(e.latlng)
        },
    })
    return null
}

const MapFlyTo = ({ target }) => {
    const map = useMap()
    useEffect(() => {
        if (target) map.flyTo(target, 16, { duration: 1 })
    }, [target])
    return null
}

// defaultCoordinates: [lng, lat] (orden GeoJSON)
// defaultAddress: string — dirección ya confirmada previamente
// onChange: ({ coordinates: [lng, lat] | null, address: string, components }) => void
export default function LocationPicker({ onChange, defaultCoordinates = null, defaultAddress = '' }) {
    const initialPin = defaultCoordinates
        ? { lat: defaultCoordinates[1], lng: defaultCoordinates[0] }
        : null

    const [pin,           setPin]           = useState(initialPin)
    const [status,        setStatus]        = useState(defaultCoordinates ? 'confirmed' : 'idle')
    const [addressData,   setAddressData]   = useState(null)
    const [preAddress,    setPreAddress]    = useState(defaultAddress)
    const [errorMsg,      setErrorMsg]      = useState('')
    const [flyTarget,     setFlyTarget]     = useState(null)
    const [searchQuery,   setSearchQuery]   = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching,   setIsSearching]   = useState(false)

    const searchRef = useRef(null)

    const isConfirmed = status === 'confirmed'
    const isVerifying = status === 'verifying'

    const initialCenter = initialPin ? [initialPin.lat, initialPin.lng] : [13.6929, -89.2182]
    const initialZoom   = initialPin ? 15 : 12

    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchResults([])
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handlePlace = (latlng) => {
        setPin(latlng)
        setStatus('idle')
        setAddressData(null)
        setPreAddress('')
        setErrorMsg('')
    }

    const handleSearch = async () => {
        const q = searchQuery.trim()
        if (!q) return
        setIsSearching(true)
        setSearchResults([])
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=sv&limit=5`,
                { headers: { 'Accept-Language': 'es' } }
            )
            const data = await res.json()
            setSearchResults(data)
        } catch {
            // fallo silencioso — el usuario puede seguir marcando en el mapa
        } finally {
            setIsSearching(false)
        }
    }

    const handleSelectResult = (result) => {
        const latlng = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }
        setPin(latlng)
        setFlyTarget([latlng.lat, latlng.lng])
        setStatus('idle')
        setAddressData(null)
        setPreAddress('')
        setErrorMsg('')
        setSearchResults([])
        setSearchQuery('')
    }

    const handleVerify = async () => {
        if (!pin) return
        setStatus('verifying')
        setErrorMsg('')
        try {
            const data = await GeoSVService.getAddress([pin.lng, pin.lat])
            setAddressData(data)
            setStatus('confirmed')
            const fullAddress = data.address ?? [
                data.components?.municipality,
                data.components?.department,
            ].filter(Boolean).join(', ')
            setPreAddress(fullAddress)
            onChange({ coordinates: [pin.lng, pin.lat], address: fullAddress, components: data.components ?? null })
        } catch {
            setStatus('error')
            setErrorMsg('No se encontró dirección para esta ubicación. Intente en otra posición.')
        }
    }

    const handleReset = () => {
        setPin(null)
        setFlyTarget(null)
        setStatus('idle')
        setAddressData(null)
        setPreAddress('')
        setErrorMsg('')
        onChange({ coordinates: null, address: '', components: null })
    }

    return (
        <div className='flex flex-col gap-3'>

            {!isConfirmed && (
                <div className='relative' ref={searchRef}>
                    <div className='flex gap-2'>
                        <div className='relative flex-1'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orve-teal/40 pointer-events-none' />
                            <input
                                type='text'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                                placeholder='Buscar colonia, municipio, dirección...'
                                className='w-full pl-9 pr-8 bg-white/70 border border-orve-teal/20 rounded-xl text-sm h-9 outline-none placeholder:text-orve-teal/30 text-orve-darker-teal'
                            />
                            {searchQuery && (
                                <button
                                    type='button'
                                    onClick={() => { setSearchQuery(''); setSearchResults([]) }}
                                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-orve-teal/30 hover:text-orve-teal transition-colors'
                                >
                                    <X className='w-3.5 h-3.5' />
                                </button>
                            )}
                        </div>
                        <button
                            type='button'
                            onClick={handleSearch}
                            disabled={isSearching || !searchQuery.trim()}
                            className='shrink-0 bg-orve-teal hover:bg-orve-darker-teal disabled:opacity-50 text-white h-9 px-3 rounded-xl flex items-center justify-center transition-colors'
                        >
                            {isSearching
                                ? <Loader2 className='w-3.5 h-3.5 animate-spin' />
                                : <Search className='w-3.5 h-3.5' />
                            }
                        </button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className='absolute top-full left-0 right-0 z-[9999] mt-1 bg-white border border-orve-teal/15 rounded-xl shadow-lg overflow-hidden'>
                            {searchResults.map((r, i) => (
                                <button
                                    key={i}
                                    type='button'
                                    onClick={() => handleSelectResult(r)}
                                    className='w-full text-left px-3 py-2.5 hover:bg-orve-teal/5 border-b border-orve-teal/8 last:border-0 transition-colors'
                                >
                                    <span className='text-xs text-orve-teal/80 block truncate'>{r.display_name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <p className='text-xs text-orve-teal/60 select-none'>
                {isConfirmed
                    ? 'Ubicación confirmada. Haga clic en "Cambiar" para re-seleccionar.'
                    : 'Busque o haga clic en el mapa para marcar su ubicación actual.'}
            </p>

            <div className='rounded-xl overflow-hidden border border-orve-teal/15' style={{ height: 260 }}>
                <MapContainer
                    center={initialCenter}
                    zoom={initialZoom}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />
                    <ClickHandler onPlace={handlePlace} disabled={isConfirmed} />
                    <MapFlyTo target={flyTarget} />
                    {pin && <Marker position={[pin.lat, pin.lng]} icon={pinIcon} />}
                </MapContainer>
            </div>

            {pin && !isConfirmed && (
                <div className='flex items-center justify-between gap-3 px-3 py-2.5 bg-orve-teal/5 rounded-xl border border-orve-teal/15'>
                    <div className='flex items-center gap-1.5 min-w-0'>
                        <MapPin className='w-3.5 h-3.5 text-orve-teal/50 shrink-0' />
                        <span className='text-xs text-orve-teal/60 font-mono truncate'>
                            {pin.lat.toFixed(5)}°N, {Math.abs(pin.lng).toFixed(5)}°O
                        </span>
                    </div>
                    <button
                        type='button'
                        onClick={handleVerify}
                        disabled={isVerifying}
                        className='shrink-0 bg-orve-teal hover:bg-orve-darker-teal disabled:opacity-60 text-white h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors'
                    >
                        {isVerifying
                            ? <><Loader2 className='w-3 h-3 animate-spin' />Verificando...</>
                            : 'Verificar dirección'
                        }
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className='flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl'>
                    <AlertCircle className='w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5' />
                    <span className='text-xs text-red-600'>{errorMsg}</span>
                </div>
            )}

            {isConfirmed && (
                <div className='bg-orve-teal/5 border border-orve-teal/20 rounded-xl p-3.5'>
                    <div className='flex items-start justify-between gap-3'>
                        <div className='flex items-start gap-2.5 min-w-0'>
                            <CheckCircle2 className='w-4 h-4 text-orve-green shrink-0 mt-0.5' />
                            <div className='min-w-0'>
                                <p className='text-xs font-semibold text-orve-teal mb-1'>Ubicación verificada</p>
                                {addressData?.address && (
                                    <p className='text-sm font-medium text-orve-teal'>{addressData.address}</p>
                                )}
                                {addressData?.components ? (
                                    <p className='text-xs text-orve-teal/60 mt-0.5'>
                                        {[
                                            addressData.components.municipality,
                                            addressData.components.district,
                                            addressData.components.department && `Depto. ${addressData.components.department}`,
                                        ].filter(Boolean).join(' · ')}
                                    </p>
                                ) : (
                                    <p className='text-xs text-orve-teal/70 mt-0.5'>{preAddress}</p>
                                )}
                            </div>
                        </div>
                        <button
                            type='button'
                            onClick={handleReset}
                            className='shrink-0 flex items-center gap-1 text-xs text-orve-teal/50 hover:text-orve-teal transition-colors pt-0.5'
                        >
                            <RefreshCw className='w-3 h-3' />
                            Cambiar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}