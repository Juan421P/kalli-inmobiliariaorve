import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Info, XCircle } from 'lucide-react-native';
import { colors, radius, spacing, fontSize, shadow } from '@/styles/theme';

const VARIANTS = {
    default: { icon: Info, color: colors.orveTeal },
    success: { icon: CheckCircle2, color: colors.orveGreen },
    error: { icon: XCircle, color: colors.orveRed },
};

const ToastCard = ({ title, description, variant = 'default', onDismiss }) => {
    const translateY = useRef(new Animated.Value(-30)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
    }, [opacity, translateY]);

    const { icon: Icon, color } = VARIANTS[variant] ?? VARIANTS.default;

    return (
        <Animated.View style={[styles.card, shadow, { borderLeftColor: color, opacity, transform: [{ translateY }] }]}>
            <Pressable style={styles.row} onPress={onDismiss}>
                <Icon size={18} color={color} />
                <View style={styles.textWrap}>
                    <Text style={styles.title}>{title}</Text>
                    {description ? <Text style={styles.description}>{description}</Text> : null}
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: radius.md,
        borderLeftWidth: 4,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md },
    textWrap: { flex: 1 },
    title: { fontSize: fontSize.sm, fontWeight: '600', color: colors.orveBlack },
    description: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});

export default ToastCard;
