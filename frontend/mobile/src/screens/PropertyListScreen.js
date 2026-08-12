import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import ListingCard from '@/components/ListingCard';
import Chip from '@/components/ui/Chip';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/EmptyState';
import usePropertyListing from '@/hooks/usePropertyListing';
import useFavorites from '@/hooks/useFavorites';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const PROPERTY_TYPES = [
    { value: 'all', label: 'Todos' },
    { value: 'house', label: 'Casas' },
    { value: 'apartment', label: 'Apartamentos' },
    { value: 'land', label: 'Terrenos' },
];

const PropertyListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [listingType, setListingType] = useState(route.params?.listingType ?? 'sale');

    const {
        isLoading, filtered, search, setSearch, typeFilter, setTypeFilter,
    } = usePropertyListing(listingType, {
        propertyType: route.params?.propertyType,
        query: route.params?.query,
    });

    const { toggleFavorite, isFavorite } = useFavorites();

    return (
        <View style={styles.flex}>
            <View style={styles.header}>
                <View style={styles.listingTabs}>
                    <Text
                        onPress={() => setListingType('sale')}
                        style={[styles.listingTab, listingType === 'sale' && styles.listingTabActive]}
                    >
                        Comprar
                    </Text>
                    <Text
                        onPress={() => setListingType('rent')}
                        style={[styles.listingTab, listingType === 'rent' && styles.listingTabActive]}
                    >
                        Alquilar
                    </Text>
                </View>

                <View style={styles.searchBar}>
                    <Search size={16} color={colors.textFaint} />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder='Buscar por ciudad, zona o lugar'
                        placeholderTextColor={colors.textFaint}
                        style={styles.searchInput}
                    />
                </View>

                <FlatList
                    data={PROPERTY_TYPES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(t) => t.value}
                    contentContainerStyle={styles.chipsRow}
                    renderItem={({ item }) => (
                        <Chip label={item.label} selected={typeFilter === item.value} onPress={() => setTypeFilter(item.value)} />
                    )}
                />
            </View>

            {isLoading ? (
                <View style={styles.grid}>
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} style={styles.cardSkeleton} />)}
                </View>
            ) : filtered.length === 0 ? (
                <EmptyState title='No hay propiedades que coincidan' subtitle='Probá con otra búsqueda o filtro.' />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <ListingCard
                            property={item}
                            isFavorite={isFavorite(item._id)}
                            onToggleFavorite={() => toggleFavorite(item)}
                            onPress={() => navigation.navigate('PropertyDetail', { publicId: item.public_id })}
                        />
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    header: { padding: spacing.lg, gap: spacing.md, backgroundColor: colors.white },
    listingTabs: { flexDirection: 'row', gap: spacing.lg },
    listingTab: { fontSize: fontSize.md, fontWeight: '600', color: colors.textFaint, paddingBottom: spacing.xs },
    listingTabActive: { color: colors.orveTeal, borderBottomWidth: 2, borderBottomColor: colors.orveTeal },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    },
    searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.orveBlack },
    chipsRow: { gap: spacing.sm },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, padding: spacing.lg },
    cardSkeleton: { width: '47%', height: 170, borderRadius: radius.lg },
    columnWrapper: { gap: spacing.md },
    listContent: { padding: spacing.lg, gap: spacing.md },
});

export default PropertyListScreen;
