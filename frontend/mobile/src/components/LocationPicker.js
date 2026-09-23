import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { AlertCircle, CheckCircle2, MapPin, RefreshCw } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import resolveAddressService from '@/services/resolveAddressService';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const DEFAULT_CENTER = [13.6929, -89.2182];

const buildHtml = (pin) => `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; background: #F4F6F6; }
        .orve-pin { width: 22px; height: 22px; background: #507177; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.35); }
        .leaflet-control-attribution { font-size: 8px; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const pin = ${JSON.stringify(pin)};
        const center = pin ? [pin.lat, pin.lng] : [${DEFAULT_CENTER[0]}, ${DEFAULT_CENTER[1]}];
        const map = L.map('map', { zoomControl: false }).setView(center, pin ? 15 : 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const pinIcon = L.divIcon({ className: '', html: '<div class="orve-pin"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
        let marker = pin ? L.marker([pin.lat, pin.lng], { icon: pinIcon }).addTo(map) : null;

        map.on('click', (e) => {
            if (marker) map.removeLayer(marker);
            marker = L.marker([e.latlng.lat, e.latlng.lng], { icon: pinIcon }).addTo(map);
            window.ReactNativeWebView.postMessage(JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng }));
        });
    </script>
</body>
</html>`;

/**
 * Version movil de frontend/public/src/components/LocationPicker.jsx: mismo
 * mapa Leaflet + OpenStreetMap (via WebView, igual que PropertiesMap.js) y el
 * mismo flujo tocar-el-mapa -> verificar contra POST /resolve-address, pero
 * sin el buscador por texto (Nominatim) que tiene la web.
 *
 * onChange recibe { coordinates: [lng, lat] | null, address: string }.
 */
const LocationPicker = ({ onChange, defaultCoordinates = null, defaultAddress = '' }) => {
    const initialPin = defaultCoordinates
        ? { lat: defaultCoordinates[1], lng: defaultCoordinates[0] }
        : null;

    const [pin, setPin] = useState(initialPin);
    const [status, setStatus] = useState(defaultCoordinates ? 'confirmed' : 'idle');
    const [address, setAddress] = useState(defaultAddress);
    const [errorMsg, setErrorMsg] = useState('');

    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo se usa para el pin inicial; los taps se manejan dentro del WebView
    const html = useMemo(() => buildHtml(initialPin), []);

    const handleMessage = (event) => {
        try {
            const { lat, lng } = JSON.parse(event.nativeEvent.data);
            setPin({ lat, lng });
            setStatus('idle');
            setAddress('');
            setErrorMsg('');
        } catch {
            // mensaje inesperado del WebView, se ignora
        }
    };

    const handleVerify = async () => {
        if (!pin) return;
        setStatus('verifying');
        setErrorMsg('');
        try {
            const data = await resolveAddressService.resolve([pin.lng, pin.lat]);
            const resolvedAddress = data?.address ?? [
                data?.components?.municipality,
                data?.components?.department,
            ].filter(Boolean).join(', ');
            setAddress(resolvedAddress);
            setStatus('confirmed');
            onChange({ coordinates: [pin.lng, pin.lat], address: resolvedAddress });
        } catch {
            setStatus('error');
            setErrorMsg('No se encontró dirección para esta ubicación. Intente en otra posición.');
        }
    };

    const handleReset = () => {
        setPin(null);
        setStatus('idle');
        setAddress('');
        setErrorMsg('');
        onChange({ coordinates: null, address: '' });
    };

    const isConfirmed = status === 'confirmed';
    const isVerifying = status === 'verifying';

    return (
        <View style={{ gap: spacing.sm }}>
            <Text style={styles.hint}>
                {isConfirmed ? 'Ubicación confirmada. Tocá "Cambiar" para re-seleccionar.' : 'Tocá el mapa para marcar su ubicación actual.'}
            </Text>

            <View style={styles.mapWrap} pointerEvents={isConfirmed ? 'none' : 'auto'}>
                <WebView
                    source={{ html }}
                    style={styles.flex}
                    onMessage={handleMessage}
                    javaScriptEnabled
                    domStorageEnabled
                    originWhitelist={['*']}
                />
            </View>

            {pin && !isConfirmed ? (
                <View style={styles.coordRow}>
                    <View style={styles.coordInfo}>
                        <MapPin size={14} color={colors.textFaint} />
                        <Text style={styles.coordText}>{pin.lat.toFixed(5)}°N, {Math.abs(pin.lng).toFixed(5)}°O</Text>
                    </View>
                    <Button
                        title={isVerifying ? 'Verificando...' : 'Verificar dirección'}
                        onPress={handleVerify}
                        loading={isVerifying}
                        variant='dark'
                    />
                </View>
            ) : null}

            {status === 'error' ? (
                <View style={styles.errorBox}>
                    <AlertCircle size={14} color={colors.orveRed} />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
            ) : null}

            {isConfirmed ? (
                <View style={styles.confirmedBox}>
                    <View style={styles.confirmedInfo}>
                        <CheckCircle2 size={16} color={colors.orveGreen} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.confirmedTitle}>Ubicación verificada</Text>
                            <Text style={styles.confirmedAddress}>{address}</Text>
                        </View>
                    </View>
                    <Button title='Cambiar' onPress={handleReset} variant='outline' icon={<RefreshCw size={14} color={colors.orveTeal} />} />
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1 },
    hint: { fontSize: fontSize.xs, color: colors.textFaint },
    mapWrap: { height: 220, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
    coordRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm,
        backgroundColor: 'rgba(80,113,119,0.06)', borderRadius: radius.md, padding: spacing.sm,
    },
    coordInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
    coordText: { fontSize: fontSize.xs, color: colors.textMuted },
    errorBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
        backgroundColor: '#FDECEC', borderRadius: radius.md, padding: spacing.sm,
    },
    errorText: { flex: 1, fontSize: fontSize.xs, color: colors.orveRed },
    confirmedBox: {
        backgroundColor: 'rgba(80,113,119,0.06)', borderRadius: radius.md, padding: spacing.md, gap: spacing.sm,
    },
    confirmedInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    confirmedTitle: { fontSize: fontSize.xs, fontWeight: '700', color: colors.orveTeal },
    confirmedAddress: { fontSize: fontSize.sm, color: colors.orveDarkerTeal, marginTop: 2 },
});

export default LocationPicker;
