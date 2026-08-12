import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, fontSize } from '@/styles/theme';

const VARIANT_STYLES = {
    primary: { backgroundColor: colors.orveTeal },
    dark: { backgroundColor: colors.orveDarkerTeal },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.orveTeal },
};

const VARIANT_TEXT = {
    primary: colors.white,
    dark: colors.white,
    outline: colors.orveTeal,
};

/**
 * Botón base reutilizable de la app. `variant` define el color, `loading`
 * muestra un spinner en vez del ícono/flecha y deshabilita el press.
 */
const Button = ({ title, onPress, variant = 'primary', loading = false, disabled = false, style, icon }) => (
    <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
            styles.base,
            VARIANT_STYLES[variant],
            (disabled || loading) && styles.disabled,
            pressed && !disabled && !loading && styles.pressed,
            style,
        ]}
    >
        {loading
            ? <ActivityIndicator color={VARIANT_TEXT[variant]} size='small' />
            : (
                <>
                    {icon}
                    <Text style={[styles.text, { color: VARIANT_TEXT[variant] }]}>{title}</Text>
                </>
            )}
    </Pressable>
);

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
    },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.5 },
    text: { fontSize: fontSize.md, fontWeight: '600' },
});

export default Button;
