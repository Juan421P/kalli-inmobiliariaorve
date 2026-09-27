import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize } from '@/styles/theme';

/**
 * Pantalla de carga personalizada (distinta al Splash Screen nativo de
 * app.json): se muestra mientras AuthProvider consulta /auth/me para
 * rehidratar la sesion del usuario al abrir la app.
 *
 * La entrada es escalonada (logo -> marca -> texto) en vez de que todo
 * aparezca de una, para que se sienta mas compuesta/premium, pero el total
 * dura bien poco (~700ms) para no atrasar el arranque. El anillo gira de
 * forma continua mientras se espera. Todo con Animated de React Native, sin
 * libreria nueva.
 */
const LoadingScreen = ({ label = 'Cargando...' }) => {
    const logoFade = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const brandFade = useRef(new Animated.Value(0)).current;
    const brandRise = useRef(new Animated.Value(10)).current;
    const textFade = useRef(new Animated.Value(0)).current;
    const spin = useRef(new Animated.Value(0)).current;
    const [showSlowHint, setShowSlowHint] = useState(false);

    useEffect(() => {
        Animated.stagger(160, [
            Animated.parallel([
                Animated.timing(logoFade, { toValue: 1, duration: 380, useNativeDriver: true }),
                Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(brandFade, { toValue: 1, duration: 350, useNativeDriver: true }),
                Animated.timing(brandRise, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            ]),
            Animated.timing(textFade, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true })
        ).start();

        // El backend (Render, plan gratuito) se "duerme" tras un rato sin uso y
        // puede tardar hasta 30-60s en despertar en la primera peticion. Si la
        // carga se extiende, se avisa en vez de dejar la pantalla en silencio
        // pareciendo trabada.
        const timer = setTimeout(() => setShowSlowHint(true), 6000);
        return () => clearTimeout(timer);
    }, []);

    const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    return (
        <LinearGradient colors={[colors.orveTeal, colors.orveDarkerTeal]} style={styles.container}>
            {/* Circulos decorativos, mismo lenguaje visual que los fondos de las
            pantallas de auth (LoginScreen/RegisterScreen) y de la web publica */}
            <View pointerEvents='none' style={styles.decorWrap}>
                <View style={[styles.decorCircle, styles.decorCircleLg]} />
                <View style={[styles.decorCircle, styles.decorCircleSm]} />
            </View>

            <View style={styles.content}>
                <Animated.View style={[styles.logoWrap, { opacity: logoFade, transform: [{ scale: logoScale }] }]}>
                    <Animated.View style={[styles.ring, { transform: [{ rotate }] }]} />
                    <Image
                        source={require('@/assets/orve-logo-white.png')}
                        style={styles.logo}
                        resizeMode='contain'
                    />
                </Animated.View>

                <Animated.Text style={[styles.brand, { opacity: brandFade, transform: [{ translateY: brandRise }] }]}>
                    ORVE
                </Animated.Text>

                <Animated.View style={{ opacity: textFade, alignItems: 'center' }}>
                    <Text style={styles.tagline}>Inmobiliaria</Text>
                    <Text style={styles.label}>{label}</Text>
                    {showSlowHint && (
                        <Text style={styles.hint}>Esto puede tardar unos segundos si el servidor estaba inactivo...</Text>
                    )}
                </Animated.View>
            </View>
        </LinearGradient>
    );
};

const RING_SIZE = 108;

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    decorWrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    decorCircle: { position: 'absolute', borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)' },
    decorCircleLg: { width: 420, height: 420, top: -160, right: -140 },
    decorCircleSm: { width: 280, height: 280, bottom: -110, left: -100 },
    content: { alignItems: 'center', gap: spacing.xs },
    logoWrap: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
    ring: {
        position: 'absolute', width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2,
        borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.18)', borderTopColor: colors.white,
    },
    logo: { width: 56, height: 56 },
    brand: { color: colors.white, fontSize: fontSize.xxl, fontWeight: '700', letterSpacing: 4 },
    tagline: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.xs, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' },
    label: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.sm, fontWeight: '500', marginTop: spacing.xl },
    hint: {
        color: 'rgba(255,255,255,0.6)', fontSize: fontSize.xs, fontWeight: '500', textAlign: 'center',
        marginTop: spacing.sm, maxWidth: 240,
    },
});

export default LoadingScreen;
