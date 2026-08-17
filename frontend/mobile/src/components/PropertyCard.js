import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Building2, Home as HomeIcon, Info, Map } from 'lucide-react-native';
import { colors, radius, spacing, fontSize, shadow } from '@/styles/theme';

const PROPERTY_ICONS = { house: HomeIcon, apartment: Building2, land: Map };

const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price ?? 0);

const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3_600_000);
    if (hours < 1) return 'Hace menos de 1 hora';
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${Math.floor(hours / 24)}d`;
};

/** Tarjeta angosta usada en los carruseles horizontales de la Home. */
const PropertyCard = ({ property, onPress }) => {
    const picture = property.pictures?.[0]?.picture;
    const Icon = PROPERTY_ICONS[property.property_type] ?? HomeIcon;

    return (
        <Pressable onPress={onPress} style={[styles.card, shadow]}>
            <View style={styles.imageWrap}>
                {picture
                    ? <Image source={{ uri: picture }} style={styles.image} />
                    : <View style={[styles.image, styles.imagePlaceholder]}><Icon size={28} color={colors.orveTeal} opacity={0.3} /></View>
                }
                <View style={styles.typeBadge}><Icon size={14} color={colors.orveTeal} /></View>
                <View style={styles.timeBadge}><Text style={styles.timeBadgeText}>Publicado {timeAgo(property.createdAt)}</Text></View>
                <View style={styles.priceBadge}><Text style={styles.priceBadgeText}>{formatPrice(property.price)}</Text></View>
                <View style={styles.infoBadge}><Info size={14} color={colors.orveTeal} /></View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: { width: 200, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.white },
    imageWrap: { height: 150, backgroundColor: '#E9EFEF' },
    image: { width: '100%', height: '100%' },
    imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
    typeBadge: {
        position: 'absolute', top: 8, left: 8, width: 26, height: 26, borderRadius: radius.md,
        backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center',
    },
    timeBadge: {
        position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.85)',
        paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full,
    },
    timeBadgeText: { fontSize: 9, color: colors.orveTeal, fontWeight: '600' },
    priceBadge: {
        position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm,
    },
    priceBadgeText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.white },
    infoBadge: {
        position: 'absolute', bottom: 8, right: 8, width: 22, height: 22, borderRadius: radius.full,
        backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center',
    },
});

export default PropertyCard;
