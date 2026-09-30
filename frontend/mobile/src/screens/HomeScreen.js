import { useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, Home as HomeIcon, Map } from 'lucide-react-native';
import ListingCard from '@/components/ListingCard';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/EmptyState';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import useHome from '@/hooks/useHome';
import useAuth from '@/hooks/useAuth';
import useFavorites from '@/hooks/useFavorites';
import useAuthGate from '@/hooks/useAuthGate';
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
    const { properties, isLoading, isRefreshing, refresh } = useHome();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { requireAuth, authModalVisible, authModalMessage, closeAuthModal, confirmAuthLogin } = useAuthGate();
    const [tab, setTab] = useState('recent');

    const handleToggleFavorite = (item) => requireAuth({
        message: 'Iniciá sesión para guardar propiedades en tus favoritos.',
        onAuthenticated: () => toggleFavorite(item),
    });

    const recent = properties.slice(0, 10);
    // "Populares" son las que de verdad tienen vistas — antes se ordenaban
    // TODAS las propiedades por vistas (incluyendo las que tienen 0), asi que
    // con pocas vistas reales en el sistema esto terminaba mostrando
    // practicamente cualquier propiedad, no las realmente populares.
    const popular = properties
        .filter((p) => (p.views ?? 0) > 0)
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    const list = tab === 'popular' ? popular : recent;

    const goToProperty = (publicId) => navigation.navigate('PropertyDetail', { publicId });
    const goToCategory = (propertyType) => navigation.navigate('PropertyList', { propertyType });

    return (
        <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={colors.orveTeal} colors={[colors.orveTeal]} />
            }
        >
            <View style={styles.hero}>
                <Image source={homeHeroBackground} style={StyleSheet.absoluteFill} resizeMode='cover' />
                <LinearGradient colors={['rgba(80,113,119,0.85)', 'rgba(80,113,119,0.35)']} style={StyleSheet.absoluteFill} />
                <View style={styles.heroContent}>
                    <Text style={styles.heroGreeting}>
                        {user?.name ? `Hola, ${user.name}` : 'Bienvenido a ORVE'}
                    </Text>
                    <Text style={styles.heroTitle}>A un clic de tu{'\n'}próximo hogar</Text>
                </View>
            </View>

            <View style={styles.categories}>
                {CATEGORIES.map(({ label, propertyType, icon: Icon }) => (
                    <Pressable key={propertyType} onPress={() => goToCategory(propertyType)} style={styles.categoryItem}>
                        <View style={styles.categoryIconWrap}>
                            <Icon size={20} color={colors.orveTeal} />
                        </View>
                        <Text style={styles.categoryLabel}>{label}</Text>
                    </Pressable>
                ))}
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
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
                    <Text onPress={() => navigation.navigate('PropertyList')} style={styles.seeAll}>Ver todas</Text>
                </View>

                {isLoading ? (
                    <View style={styles.grid}>
                        {[1, 2, 3, 4].map((i) => <Skeleton key={i} style={styles.cardSkeleton} />)}
                    </View>
                ) : list.length === 0 ? (
                    tab === 'popular' ? (
                        <EmptyState title='Todavía no hay propiedades populares' subtitle='Volvé más tarde, cuando haya más actividad.' />
                    ) : (
                        <EmptyState title='No hay propiedades disponibles' subtitle='Volvé a intentarlo más tarde.' />
                    )
                ) : (
                    // Grid vertical (parte del scroll de la pantalla), no un
                    // carrusel horizontal — es una lista chica y acotada
                    // (10 items max), asi que un View con flexWrap alcanza sin
                    // necesitar un FlatList anidado dentro del ScrollView.
                    <View style={styles.grid}>
                        {list.map((item) => (
                            <View key={item._id} style={styles.cardWrap}>
                                <ListingCard
                                    property={item}
                                    isFavorite={isFavorite(item._id)}
                                    onToggleFavorite={() => handleToggleFavorite(item)}
                                    onPress={() => goToProperty(item.public_id)}
                                />
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <AuthRequiredModal
                visible={authModalVisible}
                message={authModalMessage}
                onClose={closeAuthModal}
                onConfirm={confirmAuthLogin}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: spacing.xxl },
    hero: { height: 190, overflow: 'hidden', justifyContent: 'flex-end' },
    heroContent: { padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.sm },
    heroGreeting: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.sm, fontWeight: '600' },
    heroTitle: { color: colors.white, fontSize: fontSize.xxl, fontWeight: '700', lineHeight: 32 },

    // Categorias: fila simple sin tarjetas/sombras, un paso menos "cargado"
    // que botones con fondo blanco propio — quedan como accesos rapidos.
    categories: {
        flexDirection: 'row', justifyContent: 'space-around',
        paddingVertical: spacing.lg, marginTop: -spacing.lg, backgroundColor: colors.white,
        marginHorizontal: spacing.lg, borderRadius: radius.lg, ...shadow,
    },
    categoryItem: { alignItems: 'center', gap: spacing.xs },
    categoryIconWrap: {
        width: 44, height: 44, borderRadius: radius.full, backgroundColor: 'rgba(80,113,119,0.08)',
        alignItems: 'center', justifyContent: 'center',
    },
    categoryLabel: { fontSize: fontSize.xs, fontWeight: '600', color: colors.orveDarkerTeal },

    section: { paddingHorizontal: spacing.lg, marginTop: spacing.xxl, gap: spacing.md },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    tabs: { flexDirection: 'row', gap: spacing.lg },
    tab: { fontSize: fontSize.md, fontWeight: '700', color: colors.textFaint, paddingBottom: spacing.xs },
    tabActive: { color: colors.orveDarkerTeal, borderBottomWidth: 2, borderBottomColor: colors.orveTeal },
    seeAll: { fontSize: fontSize.xs, fontWeight: '600', color: colors.orveTeal },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center' },
    cardWrap: { width: '47%' },
    cardSkeleton: { width: '47%', height: 170, borderRadius: radius.lg },
});

export default HomeScreen;
