import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, fontSize } from '@/styles/theme';

/** Pastilla seleccionable chica, usada para filtros/opciones tipo botón y
 * para mostrar amenidades/etiquetas/características (sin `onPress`, de solo
 * lectura). `maxWidth` + una sola línea con elipsis evita que un nombre muy
 * largo (ej. una etiqueta escrita libre desde el panel admin) estire la
 * pastilla o se salga del contenedor.
 * `icon` es opcional: un componente de ícono (ej. de lucide-react-native). */
const Chip = ({ label, icon: Icon, selected = false, onPress }) => (
    <Pressable
        onPress={onPress}
        style={[styles.chip, Icon && styles.chipWithIcon, selected && styles.chipSelected]}
    >
        {Icon ? <Icon size={14} color={selected ? colors.white : colors.orveTeal} /> : null}
        <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1} ellipsizeMode='tail'>
            {label}
        </Text>
    </Pressable>
);

const styles = StyleSheet.create({
    chip: {
        maxWidth: 220,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    chipWithIcon: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    chipSelected: { backgroundColor: colors.orveTeal, borderColor: colors.orveTeal },
    label: { fontSize: fontSize.sm, fontWeight: '500', color: colors.orveTeal },
    labelSelected: { color: colors.white },
});

export default Chip;
