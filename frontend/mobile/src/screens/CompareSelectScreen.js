import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bath, Bed, Car, Check, MapPin, Search } from 'lucide-react-native';
import EmptyState from '@/components/EmptyState';
import useCompare from '@/hooks/useCompare';
import propertyService from '@/services/propertyService';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0);

const CompareSelectScreen = () => {
    const navigation = useNavigation();
    const { slots, addProperty } = useCompare();
    const [allProps, setAllProps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    const currentIds = useMemo(() => slots.map((p) => p._id), [slots]);

    useEffect(() => {
        propertyService.getAll()
            .then((data) => {
                const list = data?.properties ?? data?.data ?? data ?? [];
                setAllProps(Array.isArray(list) ? list : []);
            })
            .catch(() => setAllProps([]))
            .finally(() => setIsLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return allProps;
        return allProps.filter((p) => p.title?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q));
    }, [allProps, search]);

    const handlePick = (property) => {
        addProperty(property);
        navigation.goBack();
    };

    return (
        <View style={styles.flex}>
            <View style={styles.searchBar}>
                <Search size={16} color={colors.textFaint} />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder='Buscar por título o dirección...'
                    placeholderTextColor={colors.textFaint}
                    style={styles.searchInput}
                />
            </View>

            {isLoading ? (
                <ActivityIndicator style={styles.loader} color={colors.orveTeal} />
            ) : filtered.length === 0 ? (
                <EmptyState title='Sin resultados' />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => {
                        const alreadyIn = currentIds.includes(item._id);
                        return (
                            <Pressable
                                disabled={alreadyIn}
                                onPress={() => handlePick(item)}
                                style={[styles.card, alreadyIn && styles.cardDisabled]}
                            >
                                <View style={styles.imageWrap}>
                                    {item.pictures?.[0]?.picture ? (
                                        <Image source={{ uri: item.pictures[0].picture }} style={styles.image} resizeMode='cover' />
                                    ) : (
                                        <View style={[styles.image, styles.imagePlaceholder]}>
                                            <Text style={styles.placeholderText}>Sin foto</Text>
                                        </View>
                                    )}
                                    <Text style={styles.priceBadge}>{fmt(item.price)}</Text>
                                    {alreadyIn ? (
                                        <View style={styles.checkBadge}><Check size={12} color={colors.white} /></View>
                                    ) : null}
                                </View>
                                <View style={styles.cardBody}>
                                    {item.address ? (
                                        <View style={styles.addressRow}>
                                            <MapPin size={11} color={colors.textFaint} />
                                            <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
                                        </View>
                                    ) : null}
                                    <View style={styles.metaRow}>
                                        {item.bedrooms != null ? (
                                            <View style={styles.metaItem}><Bed size={11} color={colors.textFaint} /><Text style={styles.metaText}>{item.bedrooms}</Text></View>
                                        ) : null}
                                        {item.bathrooms != null ? (
                                            <View style={styles.metaItem}><Bath size={11} color={colors.textFaint} /><Text style={styles.metaText}>{item.bathrooms}</Text></View>
                                        ) : null}
                                        {item.parking_spaces != null ? (
                                            <View style={styles.metaItem}><Car size={11} color={colors.textFaint} /><Text style={styles.metaText}>{item.parking_spaces}</Text></View>
                                        ) : null}
                                    </View>
                                </View>
                                {alreadyIn ? (
                                    <View style={styles.disabledOverlay}><Text style={styles.disabledText}>Ya agregada</Text></View>
                                ) : null}
                            </Pressable>
                        );
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm, margin: spacing.lg, marginBottom: spacing.sm,
        backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    },
    searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.orveBlack },
    loader: { marginTop: spacing.xxl },
    columnWrapper: { gap: spacing.md },
    listContent: { padding: spacing.lg, gap: spacing.md },
    card: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.white },
    cardDisabled: { opacity: 0.5 },
    imageWrap: { height: 100, backgroundColor: '#E9EFEF' },
    image: { width: '100%', height: '100%' },
    imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
    placeholderText: { fontSize: fontSize.xs, color: colors.textFaint },
    priceBadge: {
        position: 'absolute', top: spacing.xs, left: spacing.xs, backgroundColor: colors.orveDarkerTeal, color: colors.white,
        fontSize: 10, fontWeight: '700', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full,
    },
    checkBadge: {
        position: 'absolute', top: spacing.xs, right: spacing.xs, width: 20, height: 20, borderRadius: radius.full,
        backgroundColor: colors.orveTeal, alignItems: 'center', justifyContent: 'center',
    },
    cardBody: { padding: spacing.sm, gap: 4 },
    addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    address: { flex: 1, fontSize: 10, color: colors.textFaint },
    metaRow: { flexDirection: 'row', gap: spacing.sm },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    metaText: { fontSize: 10, color: colors.textMuted },
    disabledOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
    disabledText: { fontSize: 10, color: colors.white, backgroundColor: 'rgba(80,113,119,0.85)', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
});

export default CompareSelectScreen;
