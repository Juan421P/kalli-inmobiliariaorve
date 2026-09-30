import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LogIn } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

/**
 * Modal compartido para las acciones que ahora requieren sesión (favoritos,
 * ofertas, citas) — ver hooks/useAuthGate.js. Reemplaza el redirect directo y
 * silencioso a Login por una explicación breve antes de mandar al usuario a
 * iniciar sesión, para que se sienta parte de la app y no un mensaje suelto.
 */
const AuthRequiredModal = ({ visible, message, onClose, onConfirm }) => (
    <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose}>
            <Pressable style={styles.card} onPress={() => {}}>
                <View style={styles.icon}>
                    <LogIn size={22} color={colors.orveTeal} />
                </View>
                <Text style={styles.title}>Iniciá sesión para continuar</Text>
                {message ? <Text style={styles.message}>{message}</Text> : null}
                <View style={styles.actions}>
                    <Button title='Ahora no' variant='outline' style={styles.flex1} onPress={onClose} />
                    <Button title='Iniciar sesión' variant='dark' style={styles.flex1} onPress={onConfirm} />
                </View>
            </Pressable>
        </Pressable>
    </Modal>
);

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    card: {
        width: '100%', maxWidth: 340, backgroundColor: colors.white, borderRadius: radius.xl,
        padding: spacing.xl, gap: spacing.sm, alignItems: 'center',
    },
    icon: {
        width: 48, height: 48, borderRadius: radius.full, backgroundColor: 'rgba(80,113,119,0.1)',
        alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
    },
    title: { fontSize: fontSize.md, fontWeight: '700', color: colors.orveDarkerTeal, textAlign: 'center' },
    message: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center' },
    actions: { flexDirection: 'row', gap: spacing.sm, width: '100%', marginTop: spacing.sm },
    flex1: { flex: 1 },
});

export default AuthRequiredModal;
