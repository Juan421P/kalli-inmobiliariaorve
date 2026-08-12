import { useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, Home as HomeIcon, Map, Search } from 'lucide-react-native';
import PropertyCard from '@/components/PropertyCard';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/EmptyState';
import useHome from '@/hooks/useHome';
import useAuth from '@/hooks/useAuth';
import { colors, spacing, fontSize, radius, shadow } from '@/styles/theme';
import homeHeroBackground from '@/assets/home-hero-background.jpg';

const CATEGORIES = [
    { label: 'Casas', propertyType: 'house', icon: HomeIcon },
    { label: 'Apartamentos', propertyType: 'apartment', icon: Building2 },
    { label: 'Terrenos', propertyType: 'land', icon: Map },
];

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { search, setSearch, properties, isLoading, handleSearch } = useHome();
    const [tab, setTab] = useState('recent');

    const recent = properties.slice(0, 10);
    const popular = [...properties].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 10);
    const list = tab === 'popular' ? popular : recent;

    const goToProperty = (publicId) => navigation.navigate('PropertyDetail', { publicId });
    const goToCategory = (propertyType) => navigation.navigate('PropertyList', { propertyType });

    return (
        <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
                <Image source={homeHeroBackground} style={StyleSheet.absoluteFill} resizeMode='cover' />
                <LinearGradient colors={['rgba(80,113,119,0.85)', 'rgba(80,113,119,0.35)']} style={StyleSheet.absoluteFill} />
                <View style={styles.heroContent}>
                    <Text style={styles.heroGreeting}>
                        {user?.name ? `Hola, ${user.name}` : 'Bienvenido a ORVE'}
                    </Text>
                    <Text style={styles.heroTitle}>A un clic de tu{'\n'}próximo hogar</Text>
                    <View style={styles.searchBar}>
                        <Search size={16} color={colors.textFaint} />
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            onSubmitEditing={handleSearch}
                            placeholder='Buscar por ciudad, zona o lugar'
                            placeholderTextColor={colors.textFaint}
                            style={styles.searchInput}
                            returnKeyType='search'
                        />
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.tabs}>
                    {[{ key: 'recent', label: 'Recientes' }, { key: 'popular', label: 'Populares' }].map((t) => (
                        <Text
                            key={t.key}
                            onPress={() => setTab(t.key)}
                            style={[styles.tab, tab === t.key && styles.tabActive]}
                        >
                            {t.label}
                        </Text>
                    ))}
                </View>

                {isLoading ? (
                    <View style={styles.row}>
                        {[1, 2, 3].map((i) => <Skeleton key={i} style={styles.cardSkeleton} />)}
                    </View>
                ) : list.length === 0 ? (
                    <EmptyState title='No hay propiedades disponibles' subtitle='Volvé a intentarlo más tarde.' />
                ) : (
                    <FlatList
                        data={list}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.row}
                        renderItem={({ item }) => (
                            <PropertyCard property={item} onPress={() => goToProperty(item.public_id)} />
                        )}
                    />
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Explorar por categoría</Text>
                <View style={styles.categories}>
                    {CATEGORIES.map(({ label, propertyType, icon: Icon }) => (
                        <Pressable key={propertyType} onPress={() => goToCategory(propertyType)} style={[styles.categoryCard, shadow]}>
                            <View style={styles.categoryPressable}>
                                <View style={styles.categoryIconWrap}>
                                    <Icon size={20} color={colors.orveTeal} />
                                </View>
                                <Text style={styles.categoryLabel}>{label}</Text>
                            </View>
                        </Pressable>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: spacing.xxl },
    hero: { height: 260, overflow: 'hidden', justifyContent: 'flex-end' },
    heroContent: { padding: spacing.xl, gap: spacing.sm },
    heroGreeting: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.sm, fontWeight: '600' },
    heroTitle: { color: colors.white, fontSize: fontSize.xxl, fontWeight: '700', lineHeight: 32 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        marginTop: spacing.sm,
    },
    searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.orveBlack },
    section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl, gap: spacing.md },
    sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.orveDarkerTeal },
    tabs: { flexDirection: 'row', gap: spacing.lg },
    tab: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textFaint, paddingBottom: spacing.xs },
    tabActive: { color: colors.orveTeal, borderBottomWidth: 2, borderBottomColor: colors.orveTeal },
    row: { flexDirection: 'row', gap: spacing.md },
    cardSkeleton: { width: 200, height: 150, borderRadius: radius.lg },
    categories: { flexDirection: 'row', gap: spacing.md },
    categoryCard: { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' },
    categoryPressable: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
    categoryIconWrap: {
        width: 40, height: 40, borderRadius: radius.full, backgroundColor: 'rgba(80,113,119,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    categoryLabel: { fontSize: fontSize.xs, fontWeight: '600', color: colors.orveDarkerTeal },
});

export default HomeScreen;
