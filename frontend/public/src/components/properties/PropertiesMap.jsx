import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon   from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Link } from 'react-router-dom'

// Fix leaflet icons en Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl:       markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl:     markerShadow,
})

// Ícono personalizado con el color orve-teal
const createCustomIcon = () => L.divIcon({
    className: '',
    html: `<div style="
        width: 28px; height: 28px;
        background: #507177;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        color: white; font-size: 11px; font-weight: 700;
    "></div>`,
    iconSize:   [28, 28],
    iconAnchor: [14, 14],
})

// Ajusta el mapa a los bounds de las propiedades
const FitBounds = ({ properties }) => {
    const map = useMap()
    useEffect(() => {
        if (!properties.length) return
        const coords = properties
            .filter((p) => p.location?.coordinates?.length === 2)
            .map((p) => [p.location.coordinates[1], p.location.coordinates[0]])
        if (coords.length > 0) map.fitBounds(coords, { padding: [40, 40] })
    }, [properties, map])
    return null
}

const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

const PropertiesMap = ({ properties }) => {
    const defaultCenter = [13.6929, -89.2182]

    return (
        <MapContainer
            center={defaultCenter}
            zoom={11}
            scrollWheelZoom
            className='h-full w-full z-0'
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <FitBounds properties={properties} />
            {properties
                .filter((p) => p.location?.coordinates?.length === 2)
                .map((p) => (
                    <Marker
                        key={p._id}
                        position={[p.location.coordinates[1], p.location.coordinates[0]]}
                        icon={createCustomIcon()}
                    >
                        <Popup>
                            <div className='text-xs'>
                                <p className='font-semibold text-orve-darker-teal truncate max-w-36'>{p.title}</p>
                                <p className='text-orve-teal font-bold mt-0.5'>{formatPrice(p.price)}</p>
                                <Link
                                    to={`/property/${p.public_id}`}
                                    className='text-orve-teal underline text-[10px]'
                                >
                                    Ver propiedad
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))
            }
        </MapContainer>
    )
}

export default PropertiesMap