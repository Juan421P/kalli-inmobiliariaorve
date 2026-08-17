import { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, fontSize } from '@/styles/theme';

const BOXES = 6;

/**
 * Input de 6 caracteres para verificación de email, con separador visual en
 * el medio y foco que avanza/retrocede automáticamente entre cajas — misma
 * idea que frontend/public/src/components/auth/register/OTPInput.jsx.
 */
const OTPInput = ({ value = '', onChange, separatorAt = 3 }) => {
    const refs = useRef([]);
    const digits = value.split('');

    const handleChange = (index, char) => {
        const charValue = char.replace(/[^a-zA-Z0-9]/g, '').slice(-1).toLowerCase();
        const next = Array(BOXES).fill('').map((_, i) => (i === index ? charValue : (digits[i] ?? '')));
        onChange(next.join(''));
        if (charValue && index < BOXES - 1) refs.current[index + 1]?.focus();
    };

    const handleKeyPress = (index, e) => {
        if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
            refs.current[index - 1]?.focus();
        }
    };

    return (
        <View style={styles.row}>
            {Array.from({ length: BOXES }).map((_, i) => (
                <View key={i} style={styles.boxWrap}>
                    {i === separatorAt ? <Text style={styles.separator}>—</Text> : null}
                    <TextInput
                        ref={(el) => { refs.current[i] = el; }}
                        maxLength={1}
                        autoCapitalize='characters'
                        value={digits[i] ?? ''}
                        onChangeText={(v) => handleChange(i, v)}
                        onKeyPress={(e) => handleKeyPress(i, e)}
                        style={styles.box}
                    />
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
    boxWrap: { flexDirection: 'row', alignItems: 'center' },
    separator: { color: colors.textFaint, fontSize: fontSize.lg, marginHorizontal: spacing.xs },
    box: {
        width: 42, height: 48, textAlign: 'center', fontSize: fontSize.lg, fontWeight: '700',
        borderWidth: 2, borderColor: colors.border, borderRadius: radius.md,
        backgroundColor: '#F3F5F5', color: colors.orveDarkerTeal,
    },
});

export default OTPInput;
