import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heart } from 'lucide-react-native';
import ListingCard from '@/components/ListingCard';
import EmptyState from '@/components/EmptyState';
import useFavorites from '@/hooks/useFavorites';
import { colors, spacing, fontSize } from '@/styles/theme';

const FavoritesScreen = () => {
    const navigation = useNavigation();
    const { favorites, toggleFavorite, isFavorite } = useFavorites();

    return (
        <View style={styles.flex}>
            <View style={styles.header}>
                <Text style={styles.title}>Favoritos</Text>
                <Text style={styles.subtitle}>Propiedades que guardaste en este dispositivo</Text>
            </View>

            {favorites.length === 0 ? (
                <EmptyState
                    icon={<Heart size={32} color={colors.textFaint} />}
                    title='Todavía no tenés favoritos'
                    subtitle='Tocá la estrella en una propiedad para guardarla acá.'
                />
            ) : (
                <FlatList
                    data={favorites}
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
    header: { padding: spacing.lg, backgroundColor: colors.white, gap: 2 },
    title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.orveDarkerTeal },
    subtitle: { fontSize: fontSize.sm, color: colors.textMuted },
    columnWrapper: { gap: spacing.md },
    listContent: { padding: spacing.lg, gap: spacing.md },
});

export default FavoritesScreen;
