import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Controller } from 'react-hook-form';
import { Calendar as CalendarIcon, Clock } from 'lucide-react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/EmptyState';
import useProperty from '@/hooks/useProperty';
import useAppointmentForm from '@/hooks/useAppointmentForm';
import useToast from '@/hooks/useToast';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

LocaleConfig.locales['es'] = {
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
};
LocaleConfig.defaultLocale = 'es';

const FUNDS_SOURCE_OPTIONS = [
    { value: 'own', label: 'Fondos propios' },
    { value: 'loan', label: 'Préstamo/crédito' },
    { value: 'mixed', label: 'Mixto' },
];

const toDateString = (date) => date.toISOString().slice(0, 10);

const ScheduleAppointmentScreen = () => {
    const route = useRoute();
    const { publicId } = route.params;
    const { property, isLoading: isLoadingProperty, notFound, loadError, refetch } = useProperty(publicId);
    const toast = useToast();

    const {
        isLoadingSchedules, noSchedules, isSubmitting, isValid,
        control, selectedDate, slotsForDate, isDayDisabled, handleDateChange, onSubmit,
    } = useAppointmentForm({ property, publicId });

    const isLoading = isLoadingProperty || isLoadingSchedules;

    if (isLoading) {
        return (
            <ScrollView style={styles.flex} contentContainerStyle={styles.loadingContent}>
                <Skeleton style={{ height: 300, borderRadius: radius.lg }} />
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

    if (notFound) {
        return <EmptyState title='Propiedad no encontrada' />;
    }

    const onDayPress = (day) => {
        const date = new Date(day.year, day.month - 1, day.day);
        if (isDayDisabled(date)) {
            toast.error('Sin horario disponible', 'No hay horarios configurados para ese día.');
            return;
        }
        handleDateChange(date);
    };

    return (
        <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
            {property?.title ? <Text style={styles.title}>{property.title}</Text> : null}

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}><CalendarIcon size={18} color={colors.orveTeal} /></View>
                    <View>
                        <Text style={styles.cardTitle}>Agendar cita</Text>
                        <Text style={styles.cardSubtitle}>Visite este inmueble en persona</Text>
                    </View>
                </View>

                {noSchedules ? (
                    <EmptyState title='No hay horarios disponibles' subtitle='Por el momento no hay horarios configurados. Intenta más tarde.' />
                ) : (
                    <>
                        <Text style={styles.label}>¿Cuándo desea visitar?</Text>
                        <Calendar
                            minDate={toDateString(new Date())}
                            onDayPress={onDayPress}
                            markedDates={selectedDate ? { [toDateString(selectedDate)]: { selected: true, selectedColor: colors.orveTeal } } : {}}
                            theme={{
                                todayTextColor: colors.orveTeal,
                                arrowColor: colors.orveTeal,
                                selectedDayBackgroundColor: colors.orveTeal,
                            }}
                            style={styles.calendar}
                        />

                        <Text style={styles.label}>Seleccione una hora</Text>
                        {!selectedDate ? (
                            <Text style={styles.hint}>Selecciona una fecha primero.</Text>
                        ) : slotsForDate.length === 0 ? (
                            <Text style={styles.hint}>No hay horarios disponibles para este día.</Text>
                        ) : (
                            <Controller
                                control={control}
                                name='selectedSlot'
                                rules={{ required: true }}
                                render={({ field: { value, onChange } }) => (
                                    <View style={styles.chipWrap}>
                                        {slotsForDate.map((slot) => (
                                            <Chip
                                                key={slot._id}
                                                label={slot.start_time}
                                                selected={value?._id === slot._id}
                                                onPress={() => onChange(slot)}
                                            />
                                        ))}
                                    </View>
                                )}
                            />
                        )}

                        <View style={styles.divider} />

                        <Text style={styles.label}>¿Cuál es el origen de los fondos?</Text>
                        <Controller
                            control={control}
                            name='fundsSource'
                            rules={{ required: true }}
                            render={({ field: { value, onChange } }) => (
                                <View style={styles.optionsRow}>
                                    {FUNDS_SOURCE_OPTIONS.map(({ value: v, label }) => (
                                        <Chip key={v} label={label} selected={value === v} onPress={() => onChange(v)} />
                                    ))}
                                </View>
                            )}
                        />

                        <Controller
                            control={control}
                            name='monthlyIncome'
                            rules={{
                                required: 'El ingreso mensual es requerido.',
                                validate: (v) => Number(v) >= 0 || 'El ingreso no puede ser negativo.',
                            }}
                            render={({ field: { value, onChange }, fieldState: { error } }) => (
                                <Input
                                    label='Ingreso mensual'
                                    placeholder='0'
                                    keyboardType='numeric'
                                    value={value ? String(value) : ''}
                                    onChangeText={onChange}
                                    error={error?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name='reason'
                            rules={{
                                required: 'El motivo de la visita es requerido.',
                                maxLength: { value: 500, message: 'No puede superar los 500 caracteres.' },
                            }}
                            render={({ field: { value, onChange }, fieldState: { error } }) => (
                                <Input
                                    label='Motivo de la visita'
                                    placeholder='Contanos por qué te interesa esta propiedad'
                                    value={value}
                                    onChangeText={onChange}
                                    maxLength={500}
                                    multiline
                                    numberOfLines={3}
                                    error={error?.message}
                                />
                            )}
                        />

                        <View style={styles.divider} />

                        <Button
                            title={isSubmitting ? 'Solicitando...' : 'Solicitar cita'}
                            onPress={onSubmit}
                            loading={isSubmitting}
                            disabled={!isValid}
                            icon={<Clock size={16} color={colors.white} />}
                        />
                    </>
                )}
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
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    cardIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: 'rgba(80,113,119,0.1)', alignItems: 'center', justifyContent: 'center' },
    cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.orveDarkerTeal },
    cardSubtitle: { fontSize: fontSize.xs, color: colors.textMuted },
    label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.orveTeal },
    hint: { fontSize: fontSize.xs, color: colors.textFaint },
    calendar: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    divider: { height: 1, backgroundColor: colors.border },
});

export default ScheduleAppointmentScreen;
