import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowRightLeft, CalendarDays, Calculator, ChevronRight, Clock, Eye, HelpCircle,
    Home, LogOut, Mail, MapPin, Phone, Scale, Tag, User,
} from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/EmptyState';
import useAuth from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import useProfileActivity, { timeAgo } from '@/hooks/useProfileActivity';
import { colors, spacing, fontSize, radius, shadow } from '@/styles/theme';

const MORE_LINKS = [
    { icon: HelpCircle, label: 'Ayuda', screen: 'Help' },
    { icon: Calculator, label: 'Calcular cuota mensual', screen: 'Calculate' },
    { icon: Scale, label: 'Comparar propiedades', screen: 'Compare' },
    { icon: Tag, label: 'Vender mi propiedad', screen: 'SellProperty' },
    { icon: Home, label: 'Alquilar mi propiedad', screen: 'RentOutProperty' },
];

const OFFER_STATUS_LABEL = {
    pending: 'Oferta pendiente',
    countered: 'Contraoferta recibida',
    accepted: 'Oferta aceptada',
    rejected: 'Oferta rechazada',
    withdrawn: 'Oferta retirada',
};

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { isAuthenticated } = useAuth();
    const {
        user, isLoading, isRefreshing: isRefreshingProfile, refresh: refreshProfile,
        personal, setPersonal, personalErrors, personalIsValid,
        editing, setEditing, saving, savePersonal, logout,
    } = useProfile();
    const {
        appointments, activity, needsResponse, isLoading: isLoadingActivity,
        isRefreshing: isRefreshingActivity, refresh: refreshActivity,
        confirmCancelAppointment, refetchActivity,
    } = useProfileActivity();
    const [tab, setTab] = useState('profile');
    const isRefreshing = tab === 'profile' ? isRefreshingProfile : isRefreshingActivity;
    const handleRefresh = () => (tab === 'profile' ? refreshProfile() : refreshActivity());
    const isFirstFocus = useRef(true);

    // Al volver de OfferDetail (contraoferta/retiro) o de agendar/cancelar una
    // cita, esta pantalla no se desmonta (React Navigation solo la tapa), asi
    // que sin esto la lista de "Actividad" se quedaria con datos viejos. Se
    // salta el primer foco (montaje inicial) porque useProfileActivity ya
    // carga una vez por su cuenta — sin este guard se pediria todo dos veces.
    useFocusEffect(useCallback(() => {
        if (isFirstFocus.current) {
            isFirstFocus.current = false;
            return;
        }
        if (isAuthenticated) refetchActivity();
    }, [isAuthenticated]));

    const initials = user?.name ? `${user.name[0]}${user.lastname?.[0] ?? ''}`.toUpperCase() : '?';

    return (
        <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            refreshControl={
                isAuthenticated ? (
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.orveTeal} colors={[colors.orveTeal]} />
                ) : undefined
            }
        >
            {isAuthenticated ? (
                <>
                    <LinearGradient colors={[colors.orveTeal, colors.orveDarkerTeal]} style={styles.header}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <Text style={styles.name}>{user?.name} {user?.lastname}</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                    </LinearGradient>

                    <View style={styles.tabs}>
                        {[{ key: 'profile', label: 'Perfil' }, { key: 'activity', label: 'Actividad' }].map((t) => (
                            <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tabBtn}>
                                <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {tab === 'profile' ? (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Datos personales</Text>

                            {isLoading ? (
                                <View style={{ gap: spacing.sm }}>
                                    <Skeleton style={{ height: 44, borderRadius: radius.md }} />
                                    <Skeleton style={{ height: 44, borderRadius: radius.md }} />
                                </View>
                            ) : editing ? (
                                <View style={styles.form}>
                                    <Input
                                        label='Nombre'
                                        icon={<User size={16} color={colors.textFaint} />}
                                        value={personal.name}
                                        onChangeText={(v) => setPersonal((p) => ({ ...p, name: v }))}
                                        error={personalErrors.name}
                                    />
                                    <Input
                                        label='Apellido'
                                        icon={<User size={16} color={colors.textFaint} />}
                                        value={personal.lastname}
                                        onChangeText={(v) => setPersonal((p) => ({ ...p, lastname: v }))}
                                        error={personalErrors.lastname}
                                    />
                                    <Input
                                        label='Teléfono'
                                        icon={<Phone size={16} color={colors.textFaint} />}
                                        value={personal.phone}
                                        onChangeText={(v) => setPersonal((p) => ({ ...p, phone: v }))}
                                        keyboardType='phone-pad'
                                        placeholder='0000-0000'
                                        error={personalErrors.phone}
                                    />
                                    <View style={styles.row}>
                                        <Button title='Cancelar' variant='outline' style={styles.flex1} onPress={() => setEditing(false)} />
                                        <Button title='Guardar' variant='dark' style={styles.flex1} loading={saving} disabled={!personalIsValid} onPress={savePersonal} />
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.form}>
                                    <InfoRow icon={User} label='Nombre completo' value={`${personal.name} ${personal.lastname}`.trim() || '—'} />
                                    <InfoRow icon={Mail} label='Correo electrónico' value={personal.email || '—'} />
                                    <InfoRow icon={Phone} label='Teléfono' value={personal.phone || '—'} />
                                    <Button title='Editar datos' variant='outline' onPress={() => setEditing(true)} />
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.activityWrap}>
                            {needsResponse.length > 0 && (
                                <View style={styles.section}>
                                    <SectionHeading icon={ArrowRightLeft} title='Ofertas que requieren tu respuesta' />
                                    <View style={{ gap: spacing.sm }}>
                                        {needsResponse.map((item) => (
                                            <NeedsResponseCard key={item.id} item={item} onPress={() => navigation.navigate('OfferDetail', { offerId: item.id })} />
                                        ))}
                                    </View>
                                </View>
                            )}

                            <AppointmentSection
                                title='Citas próximas'
                                items={appointments.upcoming}
                                emptyText='No tenés citas programadas próximamente.'
                                type='upcoming'
                                onCancel={confirmCancelAppointment}
                                onView={(publicId) => navigation.navigate('PropertyDetail', { publicId })}
                                onReschedule={(publicId) => navigation.navigate('ScheduleAppointment', { publicId })}
                            />
                            <AppointmentSection
                                title='Citas pasadas'
                                items={appointments.past}
                                emptyText='No tenés citas anteriores registradas.'
                                type='past'
                                onView={(publicId) => navigation.navigate('PropertyDetail', { publicId })}
                            />

                            <View style={styles.section}>
                                <SectionHeading icon={Clock} title='Actividad reciente' />
                                {isLoadingActivity ? (
                                    <View style={{ gap: spacing.sm }}>
                                        {[1, 2, 3].map((i) => <Skeleton key={i} style={{ height: 64, borderRadius: radius.lg }} />)}
                                    </View>
                                ) : activity.length === 0 ? (
                                    <View style={styles.emptyCard}>
                                        <EmptyState icon={<Eye size={24} color={colors.textFaint} />} title='Sin actividad reciente' />
                                    </View>
                                ) : (
                                    <View style={{ gap: spacing.sm }}>
                                        {activity.map((item, i) => (
                                            <ActivityRow
                                                key={`${item.type}-${item.property?._id}-${i}`}
                                                item={item}
                                                onPress={() => item.type === 'offer'
                                                    ? navigation.navigate('OfferDetail', { offerId: item.id })
                                                    : navigation.navigate('PropertyDetail', { publicId: item.property?.public_id })
                                                }
                                            />
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </>
            ) : (
                <View style={styles.guestCard}>
                    <View style={styles.guestAvatar}><User size={26} color={colors.orveTeal} /></View>
                    <Text style={styles.guestTitle}>Iniciá sesión para ver tu perfil</Text>
                    <Text style={styles.guestSubtitle}>Gestioná tus datos, citas y ofertas desde acá.</Text>
                    <View style={styles.row}>
                        <Button title='Iniciar sesión' variant='dark' style={styles.flex1} onPress={() => navigation.navigate('Login')} />
                        <Button title='Registrarse' variant='outline' style={styles.flex1} onPress={() => navigation.navigate('Register')} />
                    </View>
                </View>
            )}

            {(!isAuthenticated || tab === 'profile') && (
                <>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Más</Text>
                        <View style={styles.linkList}>
                            {MORE_LINKS.map(({ icon: Icon, label, screen }) => (
                                <Pressable
                                    key={screen}
                                    onPress={() => navigation.navigate(screen)}
                                    style={styles.linkRow}
                                >
                                    <View style={styles.linkIcon}><Icon size={16} color={colors.orveTeal} /></View>
                                    <Text style={styles.linkLabel}>{label}</Text>
                                    <ChevronRight size={16} color={colors.textFaint} />
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {isAuthenticated ? (
                        <Button
                            title='Cerrar sesión'
                            variant='outline'
                            onPress={logout}
                            icon={<LogOut size={16} color={colors.orveTeal} />}
                            style={styles.logoutButton}
                        />
                    ) : null}
                </>
            )}
        </ScrollView>
    );
};

const InfoRow = ({ icon: Icon, label, value }) => (
    <View style={styles.infoRow}>
        <View style={styles.infoIcon}><Icon size={15} color={colors.orveTeal} /></View>
        <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

const SectionHeading = ({ icon: Icon, title }) => (
    <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}><Icon size={14} color={colors.orveTeal} /></View>
        <Text style={styles.sectionTitle}>{title}</Text>
    </View>
);

const NeedsResponseCard = ({ item, onPress }) => {
    const isAccepted = item.status === 'accepted';
    const theme = isAccepted
        ? { bg: '#EAF7EF', title: colors.orveGreen, badge: colors.orveGreen }
        : { bg: '#FFF7E6', title: '#8A6D1D', badge: '#C7960E' };

    return (
        <Pressable onPress={onPress} style={[styles.needsCard, { backgroundColor: theme.bg }, shadow]}>
            <View style={styles.needsImageWrap}>
                {item.property?.pictures?.[0]?.picture ? (
                    <Image source={{ uri: item.property.pictures[0].picture }} style={styles.needsImage} />
                ) : null}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.needsTitle, { color: theme.title }]} numberOfLines={1}>{item.property?.title}</Text>
                <Text style={styles.needsText}>
                    {isAccepted ? '¡Oferta aceptada! Te contactaremos pronto' : 'ORVE contraofertó'} · <Text style={styles.needsPrice}>${item.price?.toLocaleString()}</Text>
                </Text>
            </View>
            <View style={[styles.needsBadge, { backgroundColor: theme.badge }]}>
                <Text style={styles.needsBadgeText}>{isAccepted ? 'Aceptada' : 'Nuevo'}</Text>
            </View>
        </Pressable>
    );
};

const VISIBLE_APPOINTMENTS = 2;

const AppointmentSection = ({ title, items, emptyText, type, onCancel, onView, onReschedule }) => {
    const [expanded, setExpanded] = useState(false);
    const hasMore = items.length > VISIBLE_APPOINTMENTS;
    const visible = expanded ? items : items.slice(0, VISIBLE_APPOINTMENTS);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
                <SectionHeading icon={CalendarDays} title={title} />
                {hasMore && (
                    <Text onPress={() => setExpanded((v) => !v)} style={styles.sectionAction}>
                        {expanded ? 'Ver menos' : `Ver todas (${items.length})`}
                    </Text>
                )}
            </View>

            {items.length === 0 ? (
                <View style={styles.emptyCard}>
                    <EmptyState icon={<CalendarDays size={24} color={colors.textFaint} />} title={emptyText} />
                </View>
            ) : (
                <View style={{ gap: spacing.sm }}>
                    {visible.map((apt) => (
                        <View key={apt.id} style={[styles.appointmentCard, shadow]}>
                            <View style={styles.appointmentImageWrap}>
                                {apt.image ? <Image source={{ uri: apt.image }} style={styles.appointmentImage} /> : null}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.appointmentTitle} numberOfLines={1}>{apt.property}</Text>
                                <View style={styles.appointmentMetaRow}>
                                    <MapPin size={11} color={colors.textFaint} />
                                    <Text style={styles.appointmentMeta} numberOfLines={1}>{apt.address}</Text>
                                </View>
                                <View style={styles.appointmentMetaRow}>
                                    <CalendarDays size={11} color={colors.textFaint} />
                                    <Text style={styles.appointmentMeta}>{apt.date}</Text>
                                    <Clock size={11} color={colors.textFaint} style={{ marginLeft: spacing.sm }} />
                                    <Text style={styles.appointmentMeta}>{apt.time}</Text>
                                </View>
                                <View style={styles.appointmentActions}>
                                    <Text onPress={() => onView(apt.publicId)} style={styles.appointmentAction}>Ver propiedad</Text>
                                    {type === 'upcoming' && (
                                        <>
                                            <Text onPress={() => onReschedule(apt.publicId)} style={styles.appointmentAction}>Reagendar</Text>
                                            <Text onPress={() => onCancel(apt.id)} style={styles.appointmentActionDanger}>Cancelar</Text>
                                        </>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const ActivityRow = ({ item, onPress }) => {
    const isOffer = item.type === 'offer';
    const image = item.property?.pictures?.[0]?.picture;

    return (
        <Pressable onPress={onPress} style={[styles.activityRow, shadow]}>
            <View style={styles.activityImageWrap}>
                {image ? <Image source={{ uri: image }} style={styles.activityImage} /> : null}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle} numberOfLines={1}>{item.property?.title}</Text>
                <View style={styles.appointmentMetaRow}>
                    {isOffer ? <Tag size={11} color={colors.textFaint} /> : <Eye size={11} color={colors.textFaint} />}
                    <Text style={styles.appointmentMeta}>
                        {isOffer
                            ? `${OFFER_STATUS_LABEL[item.status] ?? 'Oferta enviada'}${item.price ? ` · $${item.price.toLocaleString()}` : ''}`
                            : 'Propiedad vista'}
                    </Text>
                </View>
            </View>
            <Text style={styles.activityTime}>{timeAgo(item.at)}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: spacing.xxl, gap: spacing.lg },
    header: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.xs },
    avatar: {
        width: 72, height: 72, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
    },
    avatarText: { color: colors.white, fontSize: fontSize.xl, fontWeight: '700' },
    name: { color: colors.white, fontSize: fontSize.lg, fontWeight: '700' },
    email: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm },
    tabs: {
        flexDirection: 'row', backgroundColor: colors.white, marginHorizontal: spacing.lg,
        marginTop: -spacing.xl, borderRadius: radius.lg, padding: 4, gap: 4, ...shadow,
    },
    tabBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, alignItems: 'center' },
    tabLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textFaint },
    tabLabelActive: { color: colors.orveDarkerTeal },
    guestCard: {
        backgroundColor: colors.white, marginHorizontal: spacing.lg, marginTop: spacing.lg,
        borderRadius: radius.xl, padding: spacing.xl, gap: spacing.sm, alignItems: 'center',
    },
    guestAvatar: {
        width: 52, height: 52, borderRadius: radius.full, backgroundColor: 'rgba(80,113,119,0.1)',
        alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
    },
    guestTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.orveDarkerTeal, textAlign: 'center' },
    guestSubtitle: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm },
    card: {
        backgroundColor: colors.white, marginHorizontal: spacing.lg,
        borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md,
    },
    cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.orveDarkerTeal },
    form: { gap: spacing.md },
    row: { flexDirection: 'row', gap: spacing.sm },
    flex1: { flex: 1 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    infoIcon: {
        width: 32, height: 32, borderRadius: radius.md, backgroundColor: 'rgba(80,113,119,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    infoLabel: { fontSize: fontSize.xs, color: colors.textFaint },
    infoValue: { fontSize: fontSize.sm, color: colors.orveBlack, fontWeight: '500' },
    linkList: { gap: spacing.xs },
    linkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
    linkIcon: {
        width: 32, height: 32, borderRadius: radius.md, backgroundColor: 'rgba(80,113,119,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    linkLabel: { flex: 1, fontSize: fontSize.sm, fontWeight: '500', color: colors.orveBlack },
    logoutButton: { marginHorizontal: spacing.lg },

    activityWrap: { paddingHorizontal: spacing.lg, gap: spacing.xl, paddingTop: spacing.xs },
    section: { gap: spacing.sm },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    sectionIcon: {
        width: 28, height: 28, borderRadius: radius.md, backgroundColor: 'rgba(80,113,119,0.1)',
        alignItems: 'center', justifyContent: 'center',
    },
    sectionTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.orveDarkerTeal },
    sectionAction: { fontSize: fontSize.xs, color: colors.orveTeal, fontWeight: '600' },
    emptyCard: { backgroundColor: colors.white, borderRadius: radius.lg },

    needsCard: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        borderRadius: radius.lg, padding: spacing.md,
    },
    needsImageWrap: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.border, overflow: 'hidden' },
    needsImage: { width: '100%', height: '100%' },
    needsTitle: { fontSize: fontSize.sm, fontWeight: '700' },
    needsText: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 3 },
    needsPrice: { fontWeight: '700' },
    needsBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
    needsBadgeText: { fontSize: 10, fontWeight: '700', color: colors.white, textTransform: 'uppercase' },

    appointmentCard: {
        flexDirection: 'row', gap: spacing.md, backgroundColor: colors.white,
        borderRadius: radius.lg, padding: spacing.md,
    },
    appointmentImageWrap: { width: 60, height: 60, borderRadius: radius.md, backgroundColor: colors.border, overflow: 'hidden' },
    appointmentImage: { width: '100%', height: '100%' },
    appointmentTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.orveDarkerTeal },
    appointmentMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
    appointmentMeta: { fontSize: fontSize.xs, color: colors.textMuted },
    appointmentActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
    appointmentAction: { fontSize: fontSize.xs, fontWeight: '700', color: colors.orveTeal },
    appointmentActionDanger: { fontSize: fontSize.xs, fontWeight: '700', color: colors.orveRed },

    activityRow: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.white,
        borderRadius: radius.lg, padding: spacing.md,
    },
    activityImageWrap: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.border, overflow: 'hidden' },
    activityImage: { width: '100%', height: '100%' },
    activityTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.orveDarkerTeal },
    activityTime: { fontSize: fontSize.xs, color: colors.textFaint },
});

export default ProfileScreen;
