import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Controller } from 'react-hook-form';
import { ArrowRight, Calendar, Mail, MessageCircle, Phone, Tag } from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/EmptyState';
import useProperty from '@/hooks/useProperty';
import useOfferForm from '@/hooks/useOfferForm';
import useAuth from '@/hooks/useAuth';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const CONTACT_OPTIONS = [
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { value: 'phone', label: 'Teléfono', icon: Phone },
    { value: 'email', label: 'Correo', icon: Mail },
];

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
    const { property, isLoading, notFound } = useProperty(publicId);

    const {
        isRent, isSubmitting, errors, control, isValid, onSubmit,
    } = useOfferForm({ property, publicId, userId: user?._id });

    if (isLoading) {
        return (
            <ScrollView style={styles.flex} contentContainerStyle={styles.loadingContent}>
                <Skeleton style={{ height: 120, borderRadius: radius.lg }} />
                <Skeleton style={{ height: 200, borderRadius: radius.lg }} />
            </ScrollView>
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
                            placeholder='0'
                            keyboardType='numeric'
                            value={value}
                            onChangeText={onChange}
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
                        <Input
                            label='Fecha de mudanza deseada (opcional)'
                            placeholder='AAAA-MM-DD'
                            value={value}
                            onChangeText={onChange}
                            icon={<Calendar size={16} color={colors.textFaint} />}
                        />
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

                <View style={styles.divider} />

                <View style={styles.field}>
                    <Text style={styles.label}>¿Cómo desea que lo contactemos?</Text>
                    <Controller
                        control={control}
                        name='contactMethod'
                        rules={{ required: true }}
                        render={({ field: { value, onChange } }) => (
                            <View style={styles.optionsRow}>
                                {CONTACT_OPTIONS.map(({ value: v, label, icon }) => (
                                    <Chip key={v} label={label} icon={icon} selected={value === v} onPress={() => onChange(v)} />
                                ))}
                            </View>
                        )}
                    />
                    {errors.contactMethod ? <Text style={styles.error}>Selecciona un método de contacto</Text> : null}
                </View>

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
});

export default MakeOfferScreen;
