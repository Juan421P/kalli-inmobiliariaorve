import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize } from '@/styles/theme';

/**
 * Pantalla de carga personalizada (distinta al Splash Screen nativo de
 * app.json): se muestra mientras AuthProvider consulta /auth/me para
 * rehidratar la sesion del usuario al abrir la app.
 */
const LoadingScreen = ({ label = 'Cargando...' }) => (
    <LinearGradient colors={[colors.orveTeal, colors.orveDarkerTeal]} style={styles.container}>
        <Image
            source={require('@/assets/orve-logo-white.png')}
            style={styles.logo}
            resizeMode='contain'
        />
        <ActivityIndicator color={colors.white} size='large' style={styles.spinner} />
        <Text style={styles.label}>{label}</Text>
    </LinearGradient>
);

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
    logo: { width: 200, height: 72 },
    spinner: { marginTop: spacing.md },
    label: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.sm, fontWeight: '500' },
});

export default LoadingScreen;
