import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Calculator, ChevronRight, HelpCircle, Home, LogOut, Mail, Phone,
    Scale, Tag, User,
} from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import useAuth from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const MORE_LINKS = [
    { icon: HelpCircle, label: 'Ayuda', screen: 'Help' },
    { icon: Calculator, label: 'Calcular cuota mensual', screen: 'Calculate' },
    { icon: Scale, label: 'Comparar propiedades', screen: 'Compare' },
    { icon: Tag, label: 'Vender mi propiedad', screen: 'SellProperty' },
    { icon: Home, label: 'Alquilar mi propiedad', screen: 'RentOutProperty' },
];

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { isAuthenticated } = useAuth();
    const { user, isLoading, personal, setPersonal, editing, setEditing, saving, savePersonal, logout } = useProfile();

    const initials = user?.name ? `${user.name[0]}${user.lastname?.[0] ?? ''}`.toUpperCase() : '?';

    return (
        <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
            {isAuthenticated ? (
                <>
                    <LinearGradient colors={[colors.orveTeal, colors.orveDarkerTeal]} style={styles.header}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <Text style={styles.name}>{user?.name} {user?.lastname}</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                    </LinearGradient>

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
                                />
                                <Input
                                    label='Apellido'
                                    icon={<User size={16} color={colors.textFaint} />}
                                    value={personal.lastname}
                                    onChangeText={(v) => setPersonal((p) => ({ ...p, lastname: v }))}
                                />
                                <Input
                                    label='Teléfono'
                                    icon={<Phone size={16} color={colors.textFaint} />}
                                    value={personal.phone}
                                    onChangeText={(v) => setPersonal((p) => ({ ...p, phone: v }))}
                                    keyboardType='phone-pad'
                                />
                                <View style={styles.row}>
                                    <Button title='Cancelar' variant='outline' style={styles.flex1} onPress={() => setEditing(false)} />
                                    <Button title='Guardar' variant='dark' style={styles.flex1} loading={saving} onPress={savePersonal} />
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
});

export default ProfileScreen;
