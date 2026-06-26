import { useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
})
function MapClickHandler({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng)
        },
    })
    return null
}
export default function LocationPicker() {
    const [position, setPosition] = useState(null)
    const defaultCenter = [13.6929, -89.2182]
    return (
        <div className="space-y-4 w-full max-w-2xl mx-auto mt-10">
            <div className="p-4 bg-muted rounded-md">
                <h3 className="font-semibold mb-2">Ubicación seleccionada:</h3>
                {position ? (
                    <p className="text-sm text-muted-foreground">
                        Latitud: {position.lat.toFixed(10)}, Longitud: {position.lng.toFixed(10)}
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground">Haga clic en cualquier parte del mapa para seleccionar una ubicación</p>
                )}
            </div>
            <div className="h-96 w-full rounded-md overflow-hidden border shadow-sm z-0 relative">
                <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onLocationSelect={setPosition} />
                    {position && <Marker position={position} />}
                </MapContainer>
            </div>
        </div>
    )
}