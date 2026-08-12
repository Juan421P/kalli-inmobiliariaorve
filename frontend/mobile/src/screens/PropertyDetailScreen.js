import { useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    Bath, Bed, Calendar, Car, Eye, Heart, MapPin, Maximize2, PawPrint, Sofa, Tag,
} from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/EmptyState';
import useProperty from '@/hooks/useProperty';
import useFavorites from '@/hooks/useFavorites';
import useAuth from '@/hooks/useAuth';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price ?? 0);

const PropertyDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { publicId } = route.params;
    const { property, isLoading, notFound } = useProperty(publicId);
    const { toggleFavorite, isFavorite } = useFavorites();
    const { isAuthenticated } = useAuth();
    const [activeImage, setActiveImage] = useState(0);

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

    if (notFound || !property) {
        return <EmptyState title='Propiedad no encontrada' subtitle='Puede que ya no esté disponible.' />;
    }

    const pictures = property.pictures ?? [];
    const isFav = isFavorite(property._id);

    return (
        <ScrollView style={styles.flex}>
            <View style={styles.galleryWrap}>
                {pictures.length > 0 ? (
                    <>
                        <Image source={{ uri: pictures[activeImage]?.picture }} style={styles.gallery} resizeMode='cover' />
                        {pictures.length > 1 && (
                            <FlatList
                                data={pictures}
                                horizontal
                                keyExtractor={(_, i) => String(i)}
                                contentContainerStyle={styles.thumbRow}
                                renderItem={({ item, index }) => (
                                    <Pressable onPress={() => setActiveImage(index)}>
                                        <Image
                                            source={{ uri: item.picture }}
                                            style={[styles.thumb, index === activeImage && styles.thumbActive]}
                                        />
                                    </Pressable>
                                )}
                            />
                        )}
                    </>
                ) : (
                    <View style={[styles.gallery, styles.galleryPlaceholder]}>
                        <Text style={styles.placeholderText}>Sin imagen</Text>
                    </View>
                )}
                <Pressable onPress={() => toggleFavorite(property)} style={styles.favButton}>
                    <Heart size={18} color={isFav ? colors.orveRed : colors.orveTeal} fill={isFav ? colors.orveRed : 'transparent'} />
                </Pressable>
            </View>

            <View style={styles.body}>
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

                <View style={styles.featuresGrid}>
                    <Feature icon={Bed} label={`${property.bedrooms ?? 0} habitaciones`} />
                    <Feature icon={Bath} label={`${property.bathrooms ?? 0} baños`} />
                    <Feature icon={Car} label={`${property.parking_spaces ?? 0} parqueos`} />
                    <Feature icon={Maximize2} label={`${property.area?.number ?? 0} ${property.area?.unit ?? 'm2'}`} />
                    <Feature icon={Sofa} label={property.furnished ? 'Amueblado' : 'No amueblado'} />
                    {property.allows_pets ? <Feature icon={PawPrint} label='Admite mascotas' /> : null}
                </View>

                <View style={styles.actionsRow}>
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

                <ChipSection title='Amenidades' items={property.amenities} />
                <ChipSection title='Electrodomésticos' items={property.appliances} />
                <ChipSection title='Características' items={property.features} />
                <ChipSection title='Etiquetas' items={property.tags} />
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

const ChipSection = ({ title, items = [] }) => {
    if (!items || items.length === 0) return null;
    return (
        <View style={styles.chipSection}>
            <Text style={styles.chipSectionTitle}>{title}</Text>
            <View style={styles.chipWrap}>
                {items.map((item, i) => <Chip key={item._id ?? i} label={item.name ?? item} />)}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    loadingContent: { padding: spacing.lg, gap: spacing.md },
    gallerySkeleton: { height: 220, borderRadius: radius.lg },
    lineSkeleton: { height: 16, borderRadius: radius.sm },
    galleryWrap: { position: 'relative' },
    gallery: { width: '100%', height: 260 },
    galleryPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9EFEF' },
    placeholderText: { color: colors.textFaint, fontSize: fontSize.sm },
    thumbRow: { gap: spacing.sm, padding: spacing.sm, position: 'absolute', bottom: 0 },
    thumb: { width: 48, height: 48, borderRadius: radius.sm, borderWidth: 2, borderColor: 'transparent' },
    thumbActive: { borderColor: colors.white },
    favButton: {
        position: 'absolute', top: spacing.md, right: spacing.md, width: 36, height: 36, borderRadius: radius.full,
        backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center',
    },
    body: { padding: spacing.lg, gap: spacing.sm },
    title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.orveDarkerTeal },
    rowGap: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    address: { fontSize: fontSize.sm, color: colors.textMuted },
    viewsText: { fontSize: fontSize.xs, color: colors.textFaint },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
    priceLabel: { fontSize: fontSize.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
    price: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.orveTeal, marginBottom: spacing.md },
    priceSuffix: { fontSize: fontSize.sm, fontWeight: '400', color: colors.textMuted },
    featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
    actionsRow: { flexDirection: 'row', gap: spacing.sm },
    actionButton: { flex: 1 },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, width: '45%' },
    featureLabel: { fontSize: fontSize.xs, color: colors.orveBlack },
    chipSection: { marginTop: spacing.lg, gap: spacing.sm },
    chipSectionTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.orveTeal },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});

export default PropertyDetailScreen;
