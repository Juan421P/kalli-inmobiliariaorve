import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, fontSize } from '@/styles/theme';

/**
 * Input de texto con label + icono izquierdo + slot para acción derecha
 * (ej. botón "mostrar contraseña"), y mensaje de error opcional.
 */
const Input = ({ label, icon, rightSlot, error, style, ...inputProps }) => (
    <View style={styles.wrap}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={[styles.inputRow, error && styles.inputRowError]}>
            {icon}
            <TextInput
                placeholderTextColor={colors.textFaint}
                style={[styles.input, style]}
                {...inputProps}
            />
            {rightSlot}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
);

const styles = StyleSheet.create({
    wrap: { gap: spacing.xs },
    label: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: '#F3F5F5',
        borderWidth: 1,
        borderColor: 'transparent',
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
    },
    inputRowError: { borderColor: colors.orveRed },
    input: { flex: 1, paddingVertical: spacing.md, fontSize: fontSize.sm, color: colors.orveBlack },
    error: { fontSize: fontSize.xs, color: colors.orveRed },
});

export default Input;
