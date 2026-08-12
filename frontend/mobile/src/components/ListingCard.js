import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Building2, Home as HomeIcon, Map, Star } from 'lucide-react-native';
import { colors, radius, spacing, fontSize, shadow } from '@/styles/theme';

const PROPERTY_ICONS = { house: HomeIcon, apartment: Building2, land: Map };

const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price ?? 0);

/** Tarjeta de grilla usada en el listado de propiedades (venta/alquiler) y favoritos. */
const ListingCard = ({ property, onPress, isFavorite = false, onToggleFavorite }) => {
    const picture = property.pictures?.[0]?.picture ?? property.image;
    const Icon = PROPERTY_ICONS[property.property_type] ?? HomeIcon;

    return (
        <Pressable onPress={onPress} style={[styles.card, shadow]}>
            <View style={styles.imageWrap}>
                {picture
                    ? <Image source={{ uri: picture }} style={styles.image} />
                    : <View style={[styles.image, styles.imagePlaceholder]}><Icon size={26} color={colors.orveTeal} opacity={0.3} /></View>
                }
                <View style={styles.typeBadge}><Icon size={13} color={colors.orveTeal} /></View>
                {onToggleFavorite && (
                    <Pressable onPress={onToggleFavorite} style={styles.favBadge} hitSlop={8}>
                        <Star size={13} color={isFavorite ? colors.orveRed : colors.orveTeal} fill={isFavorite ? colors.orveRed : 'transparent'} />
                    </Pressable>
                )}
                <View style={styles.priceBadge}><Text style={styles.priceBadgeText}>{formatPrice(property.price)}</Text></View>
            </View>
            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
                <Text style={styles.address} numberOfLines={1}>{property.address ?? 'Sin dirección'}</Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.white },
    imageWrap: { height: 130, backgroundColor: '#E9EFEF' },
    image: { width: '100%', height: '100%' },
    imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
    typeBadge: {
        position: 'absolute', top: 6, left: 6, width: 24, height: 24, borderRadius: radius.full,
        backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center',
    },
    favBadge: {
        position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: radius.full,
        backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center',
    },
    priceBadge: {
        position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm,
    },
    priceBadgeText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.white },
    body: { padding: spacing.sm, gap: 2 },
    title: { fontSize: fontSize.sm, fontWeight: '600', color: colors.orveDarkerTeal },
    address: { fontSize: fontSize.xs, color: colors.textMuted },
});

export default ListingCard;
