import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { List, LocateFixed, Map as MapIcon, Search } from 'lucide-react-native';
import ListingCard from '@/components/ListingCard';
import PropertiesMap from '@/components/PropertiesMap';
import Chip from '@/components/ui/Chip';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/EmptyState';
import usePropertyListing from '@/hooks/usePropertyListing';
import useUserLocation from '@/hooks/useUserLocation';
import useFavorites from '@/hooks/useFavorites';
import useToast from '@/hooks/useToast';
import { colors, spacing, fontSize, radius, shadow } from '@/styles/theme';

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
        sortBy, setSortBy, view, setView, userCoords, setUserCoords,
    } = usePropertyListing(listingType, {
        propertyType: route.params?.propertyType,
        query: route.params?.query,
    });

    const { toggleFavorite, isFavorite } = useFavorites();
    const { coords, status, requestLocation } = useUserLocation();
    const toast = useToast();

    const isNearMeActive = sortBy === 'distance' && !!userCoords;
    const isLocating = status === 'loading';

    const handleToggleNearMe = async () => {
        if (isNearMeActive) {
            setSortBy('recommended');
            return;
        }
        if (coords) {
            setUserCoords(coords);
            setSortBy('distance');
            return;
        }
        const next = await requestLocation();
        if (next) {
            setUserCoords(next);
            setSortBy('distance');
        } else {
            toast.error('No pudimos acceder a tu ubicación', 'Activá el permiso de ubicación desde los ajustes del dispositivo para ver qué tan cerca están las propiedades.');
        }
    };

    const goToProperty = (item) => navigation.navigate('PropertyDetail', { publicId: item.public_id });

    return (
        <View style={styles.flex}>
            <View style={styles.header}>
                <View style={styles.topRow}>
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

                    <View style={styles.viewToggle}>
                        <Pressable
                            onPress={() => setView('list')}
                            style={[styles.viewToggleBtn, view === 'list' && styles.viewToggleBtnActive]}
                        >
                            <List size={15} color={view === 'list' ? colors.white : colors.orveTeal} />
                        </Pressable>
                        <Pressable
                            onPress={() => setView('map')}
                            style={[styles.viewToggleBtn, view === 'map' && styles.viewToggleBtnActive]}
                        >
                            <MapIcon size={15} color={view === 'map' ? colors.white : colors.orveTeal} />
                        </Pressable>
                    </View>
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
                    <Pressable
                        onPress={handleToggleNearMe}
                        style={[styles.nearMeBtn, isNearMeActive && styles.nearMeBtnActive]}
                        hitSlop={6}
                    >
                        {isLocating
                            ? <ActivityIndicator size='small' color={isNearMeActive ? colors.white : colors.orveTeal} />
                            : <LocateFixed size={15} color={isNearMeActive ? colors.white : colors.orveTeal} />
                        }
                    </Pressable>
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
            ) : view === 'map' ? (
                <View style={styles.mapWrap}>
                    <PropertiesMap properties={filtered} userCoords={userCoords} onSelectProperty={goToProperty} />
                </View>
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
                            onPress={() => goToProperty(item)}
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
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    listingTabs: { flexDirection: 'row', gap: spacing.lg },
    listingTab: { fontSize: fontSize.md, fontWeight: '600', color: colors.textFaint, paddingBottom: spacing.xs },
    listingTabActive: { color: colors.orveTeal, borderBottomWidth: 2, borderBottomColor: colors.orveTeal },
    viewToggle: {
        flexDirection: 'row', backgroundColor: colors.background, borderRadius: radius.md, padding: 3, gap: 2,
    },
    viewToggleBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
    viewToggleBtnActive: { backgroundColor: colors.orveTeal },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        ...shadow, shadowOpacity: 0.04,
    },
    searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.orveBlack },
    nearMeBtn: {
        width: 28, height: 28, borderRadius: radius.full, backgroundColor: colors.white,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
    },
    nearMeBtnActive: { backgroundColor: colors.orveTeal, borderColor: colors.orveTeal },
    chipsRow: { gap: spacing.sm },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, padding: spacing.lg },
    cardSkeleton: { width: '47%', height: 170, borderRadius: radius.lg },
    columnWrapper: { gap: spacing.md },
    listContent: { padding: spacing.lg, gap: spacing.md },
    mapWrap: { flex: 1 },
});

export default PropertyListScreen;
