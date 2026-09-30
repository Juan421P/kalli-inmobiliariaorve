import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Controller } from 'react-hook-form';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { ArrowRight, Calendar, Tag, X } from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/EmptyState';
import useProperty from '@/hooks/useProperty';
import useOfferForm from '@/hooks/useOfferForm';
import useAuth from '@/hooks/useAuth';
import { sanitizeDecimalInput } from '@/lib/format';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const formatMoveInDate = (dateStr) => dateStr
    ? new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

const RENTAL_OPTIONS = [
    { value: '6', label: '6 meses' },
    { value: '12', label: '1 año' },
    { value: '24', label: '2 años' },
    { value: '36+', label: '3+ años' },
];

const MakeOfferScreen = () => {
    const route = useRoute();
    const { publicId } = route.params;
    const { user } = useAuth();
    const { property, isLoading, notFound, loadError, refetch } = useProperty(publicId);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const {
        isRent, isSubmitting, errors, control, isValid, onSubmit,
    } = useOfferForm({ property, publicId, userId: user?.id });

    if (isLoading) {
        return (
            <ScrollView style={styles.flex} contentContainerStyle={styles.loadingContent}>
                <Skeleton style={{ height: 120, borderRadius: radius.lg }} />
                <Skeleton style={{ height: 200, borderRadius: radius.lg }} />
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

    return (
        <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
            <Text style={styles.title}>{property.title}</Text>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}><Tag size={18} color={colors.orveTeal} /></View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>Hacer una oferta</Text>
                        <Text style={styles.cardSubtitle}>Anímate a dar el primer paso hacia la adquisición de tu nuevo hogar</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <Controller
                    control={control}
                    name='price'
                    rules={{ required: true, min: 0.01 }}
                    render={({ field: { value, onChange } }) => (
                        <Input
                            label='Ingrese su oferta'
                            placeholder='0.00'
                            keyboardType='decimal-pad'
                            value={value}
                            onChangeText={(text) => onChange(sanitizeDecimalInput(text))}
                            error={errors.price ? 'Ingresá un monto de oferta válido.' : null}
                        />
                    )}
                />
                {property.price ? (
                    <Text style={styles.hint}>
                        Sugerencia: en el rango de ${Math.round(property.price * 0.85).toLocaleString()} a ${property.price.toLocaleString()}
                    </Text>
                ) : null}

                <Controller
                    control={control}
                    name='moveInDate'
                    render={({ field: { value, onChange } }) => (
                        <View style={styles.field}>
                            <Text style={styles.label}>Fecha de mudanza deseada (opcional)</Text>
                            <Pressable style={styles.dateField} onPress={() => setShowDatePicker(true)}>
                                <Calendar size={16} color={colors.textFaint} />
                                <Text style={[styles.dateFieldText, !value && styles.dateFieldPlaceholder]}>
                                    {value ? formatMoveInDate(value) : 'Seleccionar fecha'}
                                </Text>
                            </Pressable>

                            <Modal visible={showDatePicker} transparent animationType='fade' onRequestClose={() => setShowDatePicker(false)}>
                                <Pressable style={styles.modalBackdrop} onPress={() => setShowDatePicker(false)}>
                                    <Pressable style={styles.modalCard} onPress={() => {}}>
                                        <View style={styles.modalHeader}>
                                            <Text style={styles.modalTitle}>Fecha de mudanza</Text>
                                            <Pressable onPress={() => setShowDatePicker(false)} hitSlop={8}>
                                                <X size={18} color={colors.textMuted} />
                                            </Pressable>
                                        </View>
                                        <RNCalendar
                                            minDate={new Date().toISOString().slice(0, 10)}
                                            onDayPress={(day) => { onChange(day.dateString); setShowDatePicker(false); }}
                                            markedDates={value ? { [value]: { selected: true, selectedColor: colors.orveTeal } } : {}}
                                            theme={{
                                                todayTextColor: colors.orveTeal,
                                                arrowColor: colors.orveTeal,
                                                selectedDayBackgroundColor: colors.orveTeal,
                                            }}
                                            style={styles.calendar}
                                        />
                                        {value ? (
                                            <Pressable onPress={() => { onChange(''); setShowDatePicker(false); }} style={styles.clearDateBtn}>
                                                <Text style={styles.clearDateText}>Quitar fecha</Text>
                                            </Pressable>
                                        ) : null}
                                    </Pressable>
                                </Pressable>
                            </Modal>
                        </View>
                    )}
                />

                {isRent ? (
                    <View style={styles.field}>
                        <Text style={styles.label}>Duración del contrato (opcional)</Text>
                        <Controller
                            control={control}
                            name='rentalMonths'
                            render={({ field: { value, onChange } }) => (
                                <View style={styles.optionsRow}>
                                    {RENTAL_OPTIONS.map((opt) => (
                                        <Chip
                                            key={opt.value}
                                            label={opt.label}
                                            selected={value === opt.value}
                                            onPress={() => onChange(value === opt.value ? null : opt.value)}
                                        />
                                    ))}
                                </View>
                            )}
                        />
                    </View>
                ) : null}

                <Button
                    title={isSubmitting ? 'Enviando...' : 'Hacer oferta'}
                    onPress={onSubmit}
                    loading={isSubmitting}
                    disabled={!isValid}
                    variant='dark'
                    icon={<ArrowRight size={16} color={colors.white} />}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
    loadingContent: { padding: spacing.lg, gap: spacing.md },
    errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
    retryButton: { minWidth: 160 },
    title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.orveDarkerTeal },
    card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    cardIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: 'rgba(80,113,119,0.1)', alignItems: 'center', justifyContent: 'center' },
    cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.orveDarkerTeal },
    cardSubtitle: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
    divider: { height: 1, backgroundColor: colors.border },
    field: { gap: spacing.sm },
    label: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
    optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    hint: { fontSize: fontSize.xs, color: colors.textFaint, marginTop: -spacing.sm },
    error: { fontSize: fontSize.xs, color: colors.orveRed },
    dateField: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        backgroundColor: '#F3F5F5', borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    },
    dateFieldText: { fontSize: fontSize.sm, color: colors.orveBlack },
    dateFieldPlaceholder: { color: colors.textFaint },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    modalCard: { width: '100%', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.sm },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.orveDarkerTeal },
    calendar: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
    clearDateBtn: { alignSelf: 'center', paddingVertical: spacing.sm },
    clearDateText: { fontSize: fontSize.xs, fontWeight: '600', color: colors.orveRed },
});

export default MakeOfferScreen;
