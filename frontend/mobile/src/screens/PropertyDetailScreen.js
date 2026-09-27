import { useMemo, useRef, useState } from 'react';
import {
    FlatList, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    Bath, Bed, Building2, Calendar, Car, Eye, Home as HomeIcon, ImageOff, Layers, Map, MapPin,
    Maximize2, PawPrint, Sofa, Star, Tag, Zap,
} from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import FavoriteHeart from '@/components/ui/FavoriteHeart';
import AccordionSection from '@/components/ui/AccordionSection';
import EmptyState from '@/components/EmptyState';
import PropertiesMap from '@/components/PropertiesMap';
import useProperty from '@/hooks/useProperty';
import useFavorites from '@/hooks/useFavorites';
import useAuth from '@/hooks/useAuth';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price ?? 0);

// Mismo mapeo que CATEGORIES en HomeScreen.js — la propiedad no mostraba en
// ningun lado a que categoria pertenece (ni la web publica lo hace, pero acá
// se pidio explicitamente que quedara claro).
const TYPE_LABELS = { house: 'Casa', apartment: 'Apartamento', land: 'Terreno' };
const TYPE_ICONS = { house: HomeIcon, apartment: Building2, land: Map };

const PropertyDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { publicId } = route.params;
    const { property, isLoading, notFound, loadError, refetch } = useProperty(publicId);
    const { toggleFavorite, isFavorite } = useFavorites();
    const { isAuthenticated } = useAuth();
    const { width } = useWindowDimensions();
    const [activeImage, setActiveImage] = useState(0);
    const [brokenImages, setBrokenImages] = useState({});
    const galleryRef = useRef(null);
    // Un solo nombre de seccion abierta a la vez ('amenities'|'appliances'|
    // 'features'|'tags'|null) — asi los 4 acordeones se comportan como un
    // solo grupo exclusivo: abrir uno cierra el que estuviera abierto antes.
    const [openSection, setOpenSection] = useState(null);
    const toggleSection = (key) => setOpenSection((prev) => (prev === key ? null : key));

    // Todas las imagenes registradas para la propiedad, sin limite artificial
    // (la web publica solo muestra miniaturas de las primeras 4 — acá se
    // recorren todas), y sin duplicados por si el mismo picture llegara
    // repetido desde el backend.
    const pictures = useMemo(() => {
        const seen = new Set();
        return (property?.pictures ?? []).filter((p) => {
            if (!p?.picture || seen.has(p.picture)) return false;
            seen.add(p.picture);
            return true;
        });
    }, [property]);

    const handleSchedule = () => {
        if (!isAuthenticated) {
            navigation.navigate('Login', { redirectTo: 'ScheduleAppointment', redirectParams: { publicId } });
            return;
        }
        navigation.navigate('ScheduleAppointment', { publicId });
    };

    const handleOffer = () => {
        if (!isAuthenticated) {
            navigation.navigate('Login', { redirectTo: 'MakeOffer', redirectParams: { publicId } });
            return;
        }
        navigation.navigate('MakeOffer', { publicId });
    };

    if (isLoading) {
        return (
            <ScrollView style={styles.flex} contentContainerStyle={styles.loadingContent}>
                <Skeleton style={styles.gallerySkeleton} />
                <Skeleton style={styles.lineSkeleton} />
                <Skeleton style={[styles.lineSkeleton, { width: '60%' }]} />
            </ScrollView>
        );
    }

    if (loadError) {
        return (
            <View style={styles.errorWrap}>
                <EmptyState title='No se pudo cargar la propiedad' subtitle={loadError} />
                <Button title='Reintentar' variant='outline' onPress={refetch} style={styles.retryButton} />
            </View>
        );
    }

    if (notFound || !property) {
        return <EmptyState title='Propiedad no encontrada' subtitle='Puede que ya no esté disponible.' />;
    }

    const isFav = isFavorite(property._id);
    const TypeIcon = TYPE_ICONS[property.property_type] ?? HomeIcon;
    const coords = property.location?.coordinates;
    const hasMap = coords?.length === 2;

    const goToImage = (index) => {
        setActiveImage(index);
        galleryRef.current?.scrollToIndex({ index, animated: true });
    };

    const handleGalleryScrollEnd = (e) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        setActiveImage(index);
    };

    return (
        <ScrollView style={styles.flex}>
            <View style={styles.galleryWrap}>
                {pictures.length > 0 ? (
                    <>
                        <FlatList
                            ref={galleryRef}
                            data={pictures}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, i) => item.picture ?? String(i)}
                            onMomentumScrollEnd={handleGalleryScrollEnd}
                            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                            renderItem={({ item }) => (
                                brokenImages[item.picture] ? (
                                    <View style={[styles.gallery, styles.galleryPlaceholder, { width }]}>
                                        <ImageOff size={26} color={colors.textFaint} />
                                        <Text style={styles.placeholderText}>No se pudo cargar esta imagen</Text>
                                    </View>
                                ) : (
                                    <Image
                                        source={{ uri: item.picture }}
                                        style={[styles.gallery, { width }]}
                                        resizeMode='cover'
                                        onError={() => setBrokenImages((prev) => ({ ...prev, [item.picture]: true }))}
                                    />
                                )
                            )}
                        />
                        {pictures.length > 1 && (
                            <>
                                <View style={styles.countBadge}>
                                    <Text style={styles.countBadgeText}>{activeImage + 1} / {pictures.length}</Text>
                                </View>
                                <FlatList
                                    data={pictures}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item, i) => item.picture ?? String(i)}
                                    contentContainerStyle={styles.thumbRow}
                                    renderItem={({ item, index }) => (
                                        <Pressable onPress={() => goToImage(index)}>
                                            <Image
                                                source={{ uri: item.picture }}
                                                style={[styles.thumb, index === activeImage && styles.thumbActive]}
                                            />
                                        </Pressable>
                                    )}
                                />
                            </>
                        )}
                    </>
                ) : (
                    <View style={[styles.gallery, styles.galleryPlaceholder]}>
                        <ImageOff size={26} color={colors.textFaint} />
                        <Text style={styles.placeholderText}>Sin imágenes registradas</Text>
                    </View>
                )}
                <FavoriteHeart isFavorite={isFav} onPress={() => toggleFavorite(property)} size={18} style={styles.favButton} />
            </View>

            <View style={styles.body}>
                <View style={styles.typeBadge}>
                    <TypeIcon size={12} color={colors.orveTeal} />
                    <Text style={styles.typeBadgeText}>{TYPE_LABELS[property.property_type] ?? property.property_type}</Text>
                </View>

                <Text style={styles.title}>{property.title}</Text>
                {property.address ? (
                    <View style={styles.rowGap}>
                        <MapPin size={14} color={colors.textMuted} />
                        <Text style={styles.address}>{property.address}</Text>
                    </View>
                ) : null}
                <View style={styles.rowGap}>
                    <Eye size={13} color={colors.textFaint} />
                    <Text style={styles.viewsText}>{property.views ?? 0} vistas</Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.priceLabel}>{property.listing_type === 'rent' ? 'Alquiler de' : 'Precio de venta'}</Text>
                <Text style={styles.price}>
                    {formatPrice(property.price)}
                    {property.listing_type === 'rent' ? <Text style={styles.priceSuffix}> / mes</Text> : null}
                </Text>

                {property.description ? (
                    <Text style={styles.description}>{property.description}</Text>
                ) : null}

                <View style={styles.featuresGrid}>
                    <Feature icon={Bed} label={`${property.bedrooms ?? 0} habitaciones`} />
                    <Feature icon={Bath} label={`${property.bathrooms ?? 0} baños`} />
                    <Feature icon={Car} label={`${property.parking_spaces ?? 0} parqueos`} />
                    <Feature icon={Maximize2} label={`${property.area?.number ?? 0} ${property.area?.unit ?? 'm2'}`} />
                    <Feature icon={Sofa} label={property.furnished ? 'Amueblado' : 'No amueblado'} />
                    {property.allows_pets ? <Feature icon={PawPrint} label='Admite mascotas' /> : null}
                </View>

                <View style={styles.accordionsWrap}>
                    <AccordionSection
                        icon={Star} title='Amenidades' items={property.amenities}
                        open={openSection === 'amenities'} onToggle={() => toggleSection('amenities')}
                    />
                    <AccordionSection
                        icon={Zap} title='Electrodomésticos' items={property.appliances}
                        open={openSection === 'appliances'} onToggle={() => toggleSection('appliances')}
                    />
                    <AccordionSection
                        icon={Layers} title='Características' items={property.features}
                        open={openSection === 'features'} onToggle={() => toggleSection('features')}
                    />
                    <AccordionSection
                        icon={Tag} title='Etiquetas' items={property.tags}
                        open={openSection === 'tags'} onToggle={() => toggleSection('tags')}
                    />
                </View>

                <View style={[styles.actionsRow, styles.actionsRowSpaced]}>
                    <Button
                        title='Agendar cita'
                        onPress={handleSchedule}
                        variant='primary'
                        style={styles.actionButton}
                        icon={<Calendar size={16} color={colors.white} />}
                    />
                    <Button
                        title='Hacer oferta'
                        onPress={handleOffer}
                        variant='dark'
                        style={styles.actionButton}
                        icon={<Tag size={16} color={colors.white} />}
                    />
                </View>

                {hasMap && (
                    <View style={styles.mapSection}>
                        <Text style={styles.chipSectionTitle}>Ubicación</Text>
                        <View style={styles.mapWrap}>
                            <PropertiesMap properties={[property]} />
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const Feature = ({ icon: Icon, label }) => (
    <View style={styles.featureItem}>
        <Icon size={14} color={colors.textMuted} />
        <Text style={styles.featureLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    loadingContent: { padding: spacing.lg, gap: spacing.md },
    errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
    retryButton: { minWidth: 160 },
    gallerySkeleton: { height: 220, borderRadius: radius.lg },
    lineSkeleton: { height: 16, borderRadius: radius.sm },
    galleryWrap: { position: 'relative' },
    gallery: { width: '100%', height: 260 },
    galleryPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9EFEF', gap: spacing.xs },
    placeholderText: { color: colors.textFaint, fontSize: fontSize.sm },
    countBadge: {
        position: 'absolute', bottom: spacing.sm, right: spacing.sm, backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full,
    },
    countBadgeText: { color: colors.white, fontSize: fontSize.xs, fontWeight: '600' },
    thumbRow: { gap: spacing.sm, padding: spacing.sm, position: 'absolute', bottom: 0, left: 0 },
    thumb: { width: 48, height: 48, borderRadius: radius.sm, borderWidth: 2, borderColor: 'transparent' },
    thumbActive: { borderColor: colors.white },
    favButton: {
        position: 'absolute', top: spacing.md, right: spacing.md, width: 36, height: 36, borderRadius: radius.full,
        backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center',
    },
    body: { padding: spacing.lg, gap: spacing.sm },
    typeBadge: {
        flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(80,113,119,0.1)', borderRadius: radius.full,
        paddingHorizontal: spacing.sm, paddingVertical: 3, marginBottom: 2,
    },
    typeBadgeText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.orveTeal },
    title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.orveDarkerTeal },
    rowGap: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    address: { fontSize: fontSize.sm, color: colors.textMuted },
    viewsText: { fontSize: fontSize.xs, color: colors.textFaint },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
    priceLabel: { fontSize: fontSize.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
    price: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.orveTeal, marginBottom: spacing.md },
    priceSuffix: { fontSize: fontSize.sm, fontWeight: '400', color: colors.textMuted },
    description: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
    featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
    actionsRow: { flexDirection: 'row', gap: spacing.sm },
    actionsRowSpaced: { marginTop: spacing.lg },
    actionButton: { flex: 1 },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, width: '45%' },
    featureLabel: { fontSize: fontSize.xs, color: colors.orveBlack },
    chipSectionTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.orveTeal },
    accordionsWrap: { marginTop: spacing.lg, gap: spacing.sm },
    mapSection: { marginTop: spacing.lg, gap: spacing.sm },
    mapWrap: { height: 200, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
});

export default PropertyDetailScreen;
