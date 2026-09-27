import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import Chip from '@/components/ui/Chip';
import { colors, radius, spacing, fontSize } from '@/styles/theme';

/**
 * Seccion desplegable (cerrada por defecto) para un grupo de chips —
 * amenidades, etiquetas, caracteristicas, electrodomesticos. Mismo
 * comportamiento que el Accordion de la web publica
 * (frontend/public/src/pages/PropertyForSale.jsx): un titulo con icono +
 * flecha que gira, y el contenido solo aparece al tocarlo. Antes esto se
 * mostraba siempre expandido (ChipSection en PropertyDetailScreen), lo que
 * se veia como un bloque de texto gigante cuando habia varias secciones con
 * varios items cada una.
 *
 * Puede usarse suelto (maneja su propio estado) o controlado desde afuera
 * pasando `open`/`onToggle` — esto ultimo es lo que permite que un grupo de
 * AccordionSection se comporten como un solo acordeon exclusivo (abrir uno
 * cierra los demas), ver PropertyDetailScreen.
 */
const AccordionSection = ({ icon: Icon, title, items = [], emptyText = 'Sin datos', open: openProp, onToggle }) => {
    const [openState, setOpenState] = useState(false);
    const isControlled = onToggle !== undefined;
    const open = isControlled ? openProp : openState;
    const toggle = isControlled ? onToggle : () => setOpenState((v) => !v);
    const list = items ?? [];

    return (
        <View style={styles.wrap}>
            <Pressable style={styles.header} onPress={toggle}>
                <View style={styles.headerLeft}>
                    {Icon ? <Icon size={15} color={colors.orveTeal} /> : null}
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.count}>({list.length})</Text>
                </View>
                <ChevronDown
                    size={16}
                    color={colors.textFaint}
                    style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
                />
            </Pressable>
            {open && (
                <View style={styles.body}>
                    {list.length > 0 ? (
                        list.map((item, i) => <Chip key={item._id ?? i} label={item.name ?? item} />)
                    ) : (
                        <Text style={styles.empty}>{emptyText}</Text>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: { backgroundColor: colors.white, borderRadius: radius.md, overflow: 'hidden' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    title: { fontSize: fontSize.sm, fontWeight: '600', color: colors.orveDarkerTeal },
    count: { fontSize: fontSize.xs, color: colors.textFaint },
    body: {
        flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
        paddingHorizontal: spacing.md, paddingBottom: spacing.md,
        borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm,
    },
    empty: { fontSize: fontSize.xs, color: colors.textFaint },
});

export default AccordionSection;
