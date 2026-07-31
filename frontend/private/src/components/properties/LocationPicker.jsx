import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { MapPin, CheckCircle2, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import L from 'leaflet'
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

// defaultCoordinates: [lng, lat] (GeoJSON order)
// defaultAddress: string — pre-confirmed address from backend
// onChange: ({ coordinates: [lng, lat] | null, address: string }) => void
const LocationPicker = ({ onChange, defaultCoordinates = null, defaultAddress = '' }) => {
    const initialPin = defaultCoordinates
        ? { lat: defaultCoordinates[1], lng: defaultCoordinates[0] }
        : null

    const [pin,         setPin]         = useState(initialPin)
    const [status,      setStatus]      = useState(defaultCoordinates ? 'confirmed' : 'idle')
    const [addressData, setAddressData] = useState(null)
    const [preAddress,  setPreAddress]  = useState(defaultAddress)
    const [errorMsg,    setErrorMsg]    = useState('')

    const isConfirmed = status === 'confirmed'
    const isVerifying = status === 'verifying'

    const mapCenter = pin ? [pin.lat, pin.lng] : [13.6929, -89.2182]

    const handlePlace = (latlng) => {
        setPin(latlng)
        setStatus('idle')
        setAddressData(null)
        setPreAddress('')
        setErrorMsg('')
    }

    const handleVerify = async () => {
        if (!pin) return
        setStatus('verifying')
        setErrorMsg('')
        try {
            const data = await GeoSVService.getAddress([pin.lng, pin.lat])
            setAddressData(data)
            setStatus('confirmed')
            const parts = [
                data.street?.name,
                data.settlement?.name,
                data.municipality?.name,
                data.department?.name,
            ].filter(Boolean)
            const fullAddress = parts.join(', ')
            setPreAddress(fullAddress)
            onChange({ coordinates: [pin.lng, pin.lat], address: fullAddress })
        } catch {
            setStatus('error')
            setErrorMsg('No se encontró dirección para esta ubicación. Intente en otra posición.')
        }
    }

    const handleReset = () => {
        setPin(null)
        setStatus('idle')
        setAddressData(null)
        setPreAddress('')
        setErrorMsg('')
        onChange({ coordinates: null, address: '' })
    }

    return (
        <div className='flex flex-col gap-3'>
            <p className='text-xs text-orve-teal/60 select-none'>
                {isConfirmed
                    ? 'Ubicación confirmada. Haga clic en "Cambiar" para re-seleccionar.'
                    : 'Haga clic en el mapa para marcar la ubicación exacta de la propiedad.'}
            </p>

            {/* Mapa */}
            <div className='rounded-xl overflow-hidden border border-orve-teal/15' style={{ height: 280 }}>
                <MapContainer
                    center={mapCenter}
                    zoom={pin ? 15 : 12}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />
                    <ClickHandler onPlace={handlePlace} disabled={isConfirmed} />
                    {pin && <Marker position={[pin.lat, pin.lng]} icon={pinIcon} />}
                </MapContainer>
            </div>

            {/* Coordenadas + botón verificar */}
            {pin && !isConfirmed && (
                <div className='flex items-center justify-between gap-3 px-3 py-2.5 bg-orve-teal/5 rounded-xl border border-orve-teal/15'>
                    <div className='flex items-center gap-1.5 min-w-0'>
                        <MapPin className='w-3.5 h-3.5 text-orve-teal/50 shrink-0' />
                        <span className='text-xs text-orve-teal/60 font-mono truncate'>
                            {pin.lat.toFixed(5)}°N, {Math.abs(pin.lng).toFixed(5)}°O
                        </span>
                    </div>
                    <Button
                        type='button'
                        size='sm'
                        onClick={handleVerify}
                        disabled={isVerifying}
                        className='shrink-0 bg-orve-teal hover:bg-orve-darker-teal text-white h-7 px-3 text-xs gap-1.5'
                    >
                        {isVerifying
                            ? <><Loader2 className='w-3 h-3 animate-spin' />Verificando...</>
                            : 'Verificar dirección'
                        }
                    </Button>
                </div>
            )}

            {/* Error */}
            {status === 'error' && (
                <div className='flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl'>
                    <AlertCircle className='w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5' />
                    <span className='text-xs text-red-600'>{errorMsg}</span>
                </div>
            )}

            {/* Dirección confirmada */}
            {isConfirmed && (
                <div className='bg-orve-teal/5 border border-orve-teal/20 rounded-xl p-3.5'>
                    <div className='flex items-start justify-between gap-3'>
                        <div className='flex items-start gap-2.5 min-w-0'>
                            <CheckCircle2 className='w-4 h-4 text-orve-green shrink-0 mt-0.5' />
                            <div className='min-w-0'>
                                <p className='text-xs font-semibold text-orve-teal mb-1'>Dirección verificada</p>
                                {addressData?.street?.name && (
                                    <p className='text-sm font-medium text-orve-teal'>{addressData.street.name}</p>
                                )}
                                {addressData ? (
                                    <p className='text-xs text-orve-teal/60 mt-0.5'>
                                        {[
                                            addressData.settlement?.name,
                                            addressData.municipality?.name,
                                            addressData.department?.name && `Depto. ${addressData.department.name}`,
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

export default LocationPicker
