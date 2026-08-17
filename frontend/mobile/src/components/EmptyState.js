import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, fontSize } from '@/styles/theme';

/** Estado vacío genérico (sin resultados, sin favoritos, etc). */
const EmptyState = ({ icon, title, subtitle }) => (
    <View style={styles.wrap}>
        {icon}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
);

const styles = StyleSheet.create({
    wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, gap: spacing.xs },
    title: { fontSize: fontSize.md, fontWeight: '600', color: colors.textMuted },
    subtitle: { fontSize: fontSize.sm, color: colors.textFaint, textAlign: 'center' },
});

export default EmptyState;
