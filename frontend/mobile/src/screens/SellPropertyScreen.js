import { Linking, StyleSheet, Text, View } from 'react-native';
import { Info } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const WHATSAPP_URL = 'https://wa.me/50322702561';

const SellPropertyScreen = () => (
    <View style={styles.flex}>
        <Text style={styles.title}>Puesta en venta de propiedad</Text>
        <Text style={styles.description}>
            Para poner su propiedad en venta, es necesario completar y firmar el formulario de Toma de Propiedad.
        </Text>

        <View style={styles.infoBox}>
            <Info size={16} color={colors.orveTeal} style={{ marginTop: 2 }} />
            <Text style={styles.infoText}>
                Este documento debe completarse y firmarse físicamente. Para ello, puede comunicarse con nosotros vía WhatsApp
                y le enviaremos el formulario.
            </Text>
        </View>

        <Button
            title='Contactar por WhatsApp'
            onPress={() => Linking.openURL(WHATSAPP_URL)}
            variant='primary'
            style={styles.whatsappButton}
        />
    </View>
);

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
    title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.orveDarkerTeal },
    description: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
    infoBox: {
        flexDirection: 'row', gap: spacing.sm, backgroundColor: 'rgba(80,113,119,0.08)',
        borderRadius: radius.md, padding: spacing.md,
    },
    infoText: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 18 },
    whatsappButton: { backgroundColor: '#25D366', marginTop: spacing.sm },
});

export default SellPropertyScreen;
