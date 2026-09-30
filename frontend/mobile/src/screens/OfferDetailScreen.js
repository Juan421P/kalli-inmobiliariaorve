import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowRightLeft, CheckCircle2, History, XCircle } from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/EmptyState';
import offerService from '@/services/offerService';
import useToast from '@/hooks/useToast';
import { sanitizeDecimalInput } from '@/lib/format';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const STATUS_LABEL = {
    pending: { label: 'Pendiente de respuesta', color: colors.orveTeal, bg: 'rgba(80,113,119,0.1)' },
    countered: { label: 'Contraoferta recibida', color: '#2563EB', bg: '#EFF6FF' },
    accepted: { label: 'Aceptada', color: colors.orveGreen, bg: '#EAF7EF' },
    rejected: { label: 'Rechazada', color: colors.orveRed, bg: '#FDECEC' },
    withdrawn: { label: 'Retirada', color: colors.textFaint, bg: colors.background },
};

const ACTOR_LABEL = { buyer: 'Usted', seller: 'ORVE' };

const fmt = (n) => typeof n === 'number'
    ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
    : n;

const fmtDate = (dateStr) => dateStr
    ? new Date(dateStr).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

/**
 * Detalle de una oferta propia con su historial de negociacion. Version
 * movil (pantalla completa, no hay bottom-sheet en la app) de
 * frontend/public/src/components/profile/OfferDetailSheet.jsx — misma
 * logica de permisos: solo se puede contraofertar cuando le toca al
 * comprador responder (last_actor === 'seller'), o retirar mientras la
 * oferta siga abierta.
 */
const OfferDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { offerId } = route.params;
    const toast = useToast();

    const [offer, setOffer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [price, setPrice] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchOffer = () => {
        setIsLoading(true);
        setLoadError(null);
        offerService.getById(offerId)
            .then((data) => setOffer(data?.offer ?? data))
            .catch((err) => {
                setOffer(null);
                setLoadError(err.friendlyMessage ?? 'No se pudo cargar la oferta.');
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(fetchOffer, [offerId]);

    const isOpenOffer = offer && ['pending', 'countered'].includes(offer.status);
    const canCounter = isOpenOffer && offer.last_actor === 'seller';

    const handleCounter = async () => {
        const value = parseFloat(price);
        if (!value || value <= 0) return;
        setSubmitting(true);
        try {
            const data = await offerService.counter(offerId, value);
            setOffer(data?.offer ?? data);
            setPrice('');
            toast.success('Contraoferta enviada.');
        } catch (err) {
            toast.error('No se pudo enviar la contraoferta', err.friendlyMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleWithdraw = async () => {
        setSubmitting(true);
        try {
            await offerService.resolve(offerId, 'withdrawn');
            toast.success('Oferta retirada.');
            navigation.goBack();
        } catch (err) {
            toast.error('No se pudo retirar la oferta', err.friendlyMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <ScrollView style={styles.flex} contentContainerStyle={styles.loadingContent}>
                <Skeleton style={{ height: 100, borderRadius: radius.lg }} />
                <Skeleton style={{ height: 160, borderRadius: radius.lg }} />
            </ScrollView>
        );
    }

    if (loadError || !offer) {
        return <EmptyState title='No se pudo cargar la oferta' subtitle={loadError} />;
    }

    const status = STATUS_LABEL[offer.status] ?? { label: offer.status, color: colors.textFaint, bg: colors.background };

    return (
        <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
            <Text style={styles.title}>{offer.property?.title}</Text>

            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.label}>Oferta actual</Text>
                        <Text style={styles.price}>{fmt(offer.price)}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                {offer.status === 'accepted' && (
                    <View style={styles.acceptedBox}>
                        <CheckCircle2 size={16} color={colors.orveGreen} />
                        <Text style={styles.acceptedText}>Oferta aceptada. Nos comunicaremos contigo pronto.</Text>
                    </View>
                )}

                {offer.history?.length > 0 && (
                    <View style={styles.historyWrap}>
                        <View style={styles.sectionLabel}>
                            <History size={13} color={colors.orveTeal} />
                            <Text style={styles.sectionLabelText}>Historial de negociación</Text>
                        </View>
                        {offer.history.map((h, i) => (
                            <View key={i} style={styles.historyRow}>
                                <Text style={styles.historyActor}>{ACTOR_LABEL[h.actor] ?? h.actor}</Text>
                                <Text style={styles.historyPrice}>{fmt(h.price)}</Text>
                                <Text style={styles.historyDate}>{fmtDate(h.created_at)}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {canCounter && (
                    <View style={styles.counterWrap}>
                        <View style={styles.sectionLabel}>
                            <ArrowRightLeft size={13} color={colors.orveTeal} />
                            <Text style={styles.sectionLabelText}>Hacer contraoferta</Text>
                        </View>
                        <View style={styles.counterRow}>
                            <View style={styles.counterInput}>
                                <Input
                                    placeholder='Nuevo monto'
                                    keyboardType='decimal-pad'
                                    value={price}
                                    onChangeText={(text) => setPrice(sanitizeDecimalInput(text))}
                                />
                            </View>
                            <Button title={submitting ? 'Enviando...' : 'Enviar'} onPress={handleCounter} loading={submitting} disabled={!price} />
                        </View>
                    </View>
                )}

                {isOpenOffer && (
                    <Pressable onPress={submitting ? undefined : handleWithdraw} style={styles.withdrawRow}>
                        <XCircle size={13} color={colors.orveRed} />
                        <Text style={styles.withdrawLink}>Retirar mi oferta</Text>
                    </Pressable>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    loadingContent: { padding: spacing.lg, gap: spacing.md },
    title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.orveDarkerTeal },
    card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
    headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    label: { fontSize: fontSize.xs, color: colors.textFaint },
    price: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.orveDarkerTeal },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
    badgeText: { fontSize: fontSize.xs, fontWeight: '700' },
    acceptedBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
        backgroundColor: '#EAF7EF', borderRadius: radius.md, padding: spacing.md,
    },
    acceptedText: { flex: 1, fontSize: fontSize.sm, color: colors.orveGreen, fontWeight: '500' },
    sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    sectionLabelText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.orveTeal },
    historyWrap: { gap: spacing.xs, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
    historyRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
    },
    historyActor: { fontSize: fontSize.xs, color: colors.textMuted },
    historyPrice: { fontSize: fontSize.xs, fontWeight: '700', color: colors.orveDarkerTeal },
    historyDate: { fontSize: 10, color: colors.textFaint },
    counterWrap: { gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
    counterRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
    counterInput: { flex: 1 },
    withdrawRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start' },
    withdrawLink: { fontSize: fontSize.xs, color: colors.orveRed, fontWeight: '600' },
});

export default OfferDetailScreen;
