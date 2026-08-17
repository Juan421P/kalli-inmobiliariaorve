import { useMemo, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    Bath, Bed, Calendar, Car, ChevronDown, DollarSign, Layers, Maximize2,
    Plus, Star, Tag, X, Zap,
} from 'lucide-react-native';
import EmptyState from '@/components/EmptyState';
import useCompare, { MAX_SLOTS } from '@/hooks/useCompare';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const CARD_WIDTH = Math.min(300, Dimensions.get('window').width - spacing.lg * 2);
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0);

function computeWins(slots) {
    if (slots.length < 2) return {};
    const result = {};
    const check = (field, getter, higherIsBetter) => {
        const values = slots.map((p) => ({ id: p._id, val: getter(p) }));
        const hasDiff = values.some((v) => v.val !== values[0].val);
        if (!hasDiff) return;
        const best = higherIsBetter ? Math.max(...values.map((v) => v.val)) : Math.min(...values.map((v) => v.val));
        values.forEach(({ id, val }) => {
            if (!result[id]) result[id] = {};
            result[id][field] = val === best;
        });
    };
    check('price', (p) => p.price ?? 0, false);
    check('area', (p) => p.area?.number ?? p.area ?? 0, true);
    check('pricePerM2', (p) => p.price / Math.max(p.area?.number ?? p.area ?? 1, 1), false);
    check('bedrooms', (p) => p.bedrooms ?? 0, true);
    check('bathrooms', (p) => p.bathrooms ?? 0, true);
    check('parking', (p) => p.parking_spaces ?? 0, true);
    return result;
}

const CompareScreen = () => {
    const navigation = useNavigation();
    const { slots, removeProperty, clearAll } = useCompare();
    const wins = useMemo(() => computeWins(slots), [slots]);
    const emptyCount = MAX_SLOTS - slots.length;

    if (slots.length === 0) {
        return (
            <View style={styles.flex}>
                <EmptyState
                    icon={<Plus size={32} color={colors.textFaint} />}
                    title='Aún no agregaste propiedades'
                    subtitle='Tocá el botón de abajo para elegir hasta 3 propiedades y compararlas.'
                />
                <Pressable style={styles.addFirstButton} onPress={() => navigation.navigate('CompareSelect')}>
                    <Plus size={16} color={colors.white} />
                    <Text style={styles.addFirstText}>Agregar propiedad</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.flex}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Comparando {slots.length} de {MAX_SLOTS}</Text>
                <Pressable onPress={clearAll}>
                    <Text style={styles.clearText}>Limpiar</Text>
                </Pressable>
            </View>

            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {slots.map((property) => (
                    <PropertyCard
                        key={property._id}
                        property={property}
                        win={wins[property._id] ?? {}}
                        highlight={slots.length > 1}
                        onRemove={() => removeProperty(property._id)}
                        onSchedule={() => navigation.navigate('PropertyDetail', { publicId: property.public_id })}
                    />
                ))}
                {Array.from({ length: emptyCount }).map((_, i) => (
                    <Pressable key={i} style={styles.emptySlot} onPress={() => navigation.navigate('CompareSelect')}>
                        <Plus size={32} color={colors.textFaint} />
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
};

const PropertyCard = ({ property: p, win, highlight, onRemove, onSchedule }) => {
    const area = p.area?.number ?? p.area ?? 0;
    const pricePerM2 = area > 0 ? p.price / area : 0;

    const rows = [
        { icon: DollarSign, label: 'Precio', value: fmt(p.price), win: win.price },
        { icon: Maximize2, label: 'Área', value: `${area} m²`, win: win.area },
        { icon: DollarSign, label: 'Precio por m²', value: `${fmt(pricePerM2)} / m²`, win: win.pricePerM2 },
        { icon: Bed, label: 'Habitaciones', value: p.bedrooms ?? 0, win: win.bedrooms },
        { icon: Bath, label: 'Baños', value: p.bathrooms ?? 0, win: win.bathrooms },
        { icon: Car, label: 'Parqueos', value: p.parking_spaces ?? 0, win: win.parking },
    ];

    return (
        <View style={styles.card}>
            <View style={styles.imageWrap}>
                {p.pictures?.[0]?.picture ? (
                    <Image source={{ uri: p.pictures[0].picture }} style={styles.image} resizeMode='cover' />
                ) : (
                    <View style={[styles.image, styles.imagePlaceholder]}><Text style={styles.placeholderText}>Sin imagen</Text></View>
                )}
                <Pressable onPress={onRemove} style={styles.removeButton}>
                    <X size={14} color={colors.white} />
                </Pressable>
            </View>

            <Text style={styles.title} numberOfLines={2}>{p.title}</Text>

            <View style={styles.rows}>
                {rows.map(({ icon: Icon, label, value, win: rowWin }) => (
                    <View key={label} style={[styles.row, rowWin && highlight && styles.rowWin]}>
                        <View style={styles.rowLabel}>
                            <Icon size={13} color={colors.textFaint} />
                            <Text style={styles.rowLabelText}>{label}</Text>
                        </View>
                        <Text style={[styles.rowValue, rowWin && highlight && styles.rowValueWin]}>{value}</Text>
                    </View>
                ))}
                <CompareAccordion icon={Star} label='Amenidades' items={p.amenities} />
                <CompareAccordion icon={Zap} label='Electrodomésticos' items={p.appliances} />
                <CompareAccordion icon={Layers} label='Características' items={p.features} />
                <CompareAccordion icon={Tag} label='Etiquetas' items={p.tags} />
            </View>

            <Pressable style={styles.scheduleButton} onPress={onSchedule}>
                <Calendar size={14} color={colors.white} />
                <Text style={styles.scheduleText}>Ver propiedad</Text>
            </Pressable>
        </View>
    );
};

const CompareAccordion = ({ icon: Icon, label, items = [] }) => {
    const [open, setOpen] = useState(false);
    return (
        <View>
            <Pressable style={styles.accordionHeader} onPress={() => setOpen((v) => !v)}>
                <View style={styles.rowLabel}>
                    <Icon size={13} color={colors.textFaint} />
                    <Text style={styles.rowLabelText}>{label}</Text>
                </View>
                <ChevronDown size={13} color={colors.textFaint} style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }} />
            </Pressable>
            {open ? (
                <View style={styles.accordionBody}>
                    {items?.length > 0 ? (
                        items.map((item, i) => (
                            <View key={i} style={styles.accordionChip}>
                                <Text style={styles.accordionChipText}>{item.name ?? item}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.accordionEmpty}>Sin datos</Text>
                    )}
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    },
    headerTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.orveDarkerTeal },
    clearText: { fontSize: fontSize.xs, color: colors.orveRed, fontWeight: '600' },
    scrollContent: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    addFirstButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        backgroundColor: colors.orveDarkerTeal, marginHorizontal: spacing.lg, marginBottom: spacing.lg,
        paddingVertical: spacing.md, borderRadius: radius.md,
    },
    addFirstText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '600' },
    emptySlot: {
        width: CARD_WIDTH, minHeight: 200, borderRadius: radius.lg, borderWidth: 2, borderStyle: 'dashed',
        borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
    },
    card: { width: CARD_WIDTH, backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' },
    imageWrap: { height: 150, backgroundColor: '#E9EFEF' },
    image: { width: '100%', height: '100%' },
    imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
    placeholderText: { fontSize: fontSize.xs, color: colors.textFaint },
    removeButton: {
        position: 'absolute', top: spacing.sm, right: spacing.sm, width: 26, height: 26, borderRadius: radius.full,
        backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
    },
    title: { fontSize: fontSize.sm, fontWeight: '700', color: colors.orveDarkerTeal, padding: spacing.md, paddingBottom: 0 },
    rows: { paddingTop: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    rowWin: { backgroundColor: 'rgba(43,142,82,0.1)' },
    rowLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    rowLabelText: { fontSize: fontSize.xs, color: colors.textMuted },
    rowValue: { fontSize: fontSize.xs, fontWeight: '700', color: colors.orveDarkerTeal },
    rowValueWin: { color: colors.orveGreen },
    accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    accordionBody: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
    accordionChip: { backgroundColor: 'rgba(80,113,119,0.1)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
    accordionChipText: { fontSize: 10, color: colors.orveDarkerTeal, fontWeight: '600' },
    accordionEmpty: { fontSize: 10, color: colors.textFaint },
    scheduleButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
        backgroundColor: colors.orveDarkerTeal, margin: spacing.md, marginTop: spacing.sm,
        paddingVertical: spacing.sm, borderRadius: radius.md,
    },
    scheduleText: { color: colors.white, fontSize: fontSize.xs, fontWeight: '700' },
});

export default CompareScreen;
