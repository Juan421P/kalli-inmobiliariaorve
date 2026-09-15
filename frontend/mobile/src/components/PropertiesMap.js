import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// Mismo centro y proveedor de tiles que el mapa de la web publica
// (frontend/public/src/components/properties/PropertiesMap.jsx): Leaflet +
// OpenStreetMap. Se usa un WebView en vez de react-native-maps porque
// react-native-maps ya no corre dentro de Expo Go (necesitaria un
// development build), y esto evita depender de una API key de Google Maps.
const DEFAULT_CENTER = [13.6929, -89.2182];

const buildHtml = (points, userCoords) => `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; background: #F4F6F6; }
        .orve-pin { width: 22px; height: 22px; background: #507177; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.35); }
        .orve-user { width: 16px; height: 16px; background: #2B8E52; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 0 0 6px rgba(43,142,82,0.22); }
        .leaflet-control-attribution { font-size: 8px; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const points = ${JSON.stringify(points)};
        const userCoords = ${JSON.stringify(userCoords)};
        const map = L.map('map', { zoomControl: false }).setView([${DEFAULT_CENTER[0]}, ${DEFAULT_CENTER[1]}], 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const pinIcon = L.divIcon({ className: '', html: '<div class="orve-pin"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
        const bounds = [];

        points.forEach((p) => {
            L.marker([p.lat, p.lng], { icon: pinIcon })
                .addTo(map)
                .on('click', () => window.ReactNativeWebView.postMessage(JSON.stringify({ id: p.id })));
            bounds.push([p.lat, p.lng]);
        });

        if (userCoords) {
            const userIcon = L.divIcon({ className: '', html: '<div class="orve-user"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
            L.marker([userCoords.latitude, userCoords.longitude], { icon: userIcon }).addTo(map);
            bounds.push([userCoords.latitude, userCoords.longitude]);
        }

        if (bounds.length > 0) map.fitBounds(bounds, { padding: [40, 40] });
    </script>
</body>
</html>`;

/** Mapa de propiedades para la app: mismo mapa (Leaflet + OpenStreetMap) y
 * mismo pin teal que la web publica, mas la ubicacion del usuario cuando la
 * comparte. Un tap en un pin lleva directo al detalle de esa propiedad. */
const PropertiesMap = ({ properties, userCoords, onSelectProperty }) => {
    const points = useMemo(() => properties
        .filter((p) => p.location?.coordinates?.length === 2)
        .map((p) => ({ id: p._id, lat: p.location.coordinates[1], lng: p.location.coordinates[0] })),
    [properties]);

    const html = useMemo(() => buildHtml(points, userCoords), [points, userCoords]);

    const handleMessage = (event) => {
        try {
            const { id } = JSON.parse(event.nativeEvent.data);
            const property = properties.find((p) => p._id === id);
            if (property) onSelectProperty?.(property);
        } catch {
            // mensaje inesperado del WebView, se ignora
        }
    };

    return (
        <WebView
            source={{ html }}
            style={styles.flex}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
        />
    );
};

const styles = StyleSheet.create({ flex: { flex: 1 } });

export default PropertiesMap;
