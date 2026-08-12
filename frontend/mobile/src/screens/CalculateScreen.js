import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Minus, Plus } from 'lucide-react-native';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const fmt = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n);

/**
 * Calculadora de cuota hipotecaria mensual aproximada, misma formula de
 * amortizacion que frontend/public/src/pages/Calculate.jsx:
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
const CalculateScreen = () => {
    const [propertyValue, setPropertyValue] = useState(676767);
    const [creditPct, setCreditPct] = useState(10);
    const [annualRate, setAnnualRate] = useState(6.7);
    const [months, setMonths] = useState(67);

    const { loanAmount, downPayment, monthly } = useMemo(() => {
        const loan = propertyValue * (creditPct / 100);
        const down = propertyValue - loan;
        const r = annualRate / 100 / 12;
        const n = months;
        const M = n === 0 || r === 0
            ? (r === 0 && n > 0 ? loan / n : 0)
            : loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return { loanAmount: loan, downPayment: down, monthly: M };
    }, [propertyValue, creditPct, annualRate, months]);

    const handlePropertyValue = (text) => {
        const raw = text.replace(/[^0-9]/g, '');
        setPropertyValue(Number(raw) || 0);
    };

    return (
        <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Calcular cuota mensual aproximada</Text>

            <View style={styles.field}>
                <Text style={styles.label}>Valor de la propiedad</Text>
                <TextInput
                    value={`$${fmt(propertyValue)}`}
                    onChangeText={handlePropertyValue}
                    keyboardType='numeric'
                    style={styles.valueInput}
                />
            </View>

            <StepperField
                label='Crédito requerido'
                sublabel={`$${fmt(loanAmount)}  ·  ${creditPct}% del valor de la propiedad`}
                value={creditPct}
                min={0} max={100} step={5}
                onChange={setCreditPct}
            />
            <StepperField
                label='Tasa de interés'
                sublabel={`${annualRate.toFixed(1)}%`}
                value={annualRate}
                min={0} max={50} step={0.5}
                onChange={(v) => setAnnualRate(Number(v.toFixed(1)))}
            />
            <StepperField
                label='Plazo del crédito'
                sublabel={`${months} meses (${(months / 12).toFixed(2)} años)`}
                value={months}
                min={0} max={360} step={12}
                onChange={setMonths}
            />

            <View style={styles.resultsWrap}>
                <ResultCard label='Pago inicial' value={`$${fmt(downPayment)}`} />
                <ResultCard label='Pago mensual desde' value={`$${fmt(monthly)}`} />
            </View>
        </ScrollView>
    );
};

const StepperField = ({ label, sublabel, value, min, max, step, onChange }) => (
    <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.sublabel}>{sublabel}</Text>
        <View style={styles.stepperRow}>
            <Pressable
                onPress={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
                style={styles.stepperButton}
            >
                <Minus size={16} color={colors.orveTeal} />
            </Pressable>
            <View style={styles.stepperTrack}>
                <View style={[styles.stepperFill, { width: `${((value - min) / (max - min)) * 100}%` }]} />
            </View>
            <Pressable
                onPress={() => onChange(Math.min(max, +(value + step).toFixed(2)))}
                style={styles.stepperButton}
            >
                <Plus size={16} color={colors.orveTeal} />
            </Pressable>
        </View>
    </View>
);

const ResultCard = ({ label, value }) => (
    <LinearGradient colors={[colors.orveTeal, colors.orveDarkerTeal]} style={styles.resultCard}>
        <Text style={styles.resultLabel}>{label}</Text>
        <Text style={styles.resultValue}>{value}</Text>
    </LinearGradient>
);

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
    title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.orveDarkerTeal },
    field: { gap: spacing.xs },
    label: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
    sublabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.orveDarkerTeal },
    valueInput: {
        backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: spacing.md,
        paddingVertical: spacing.md, fontSize: fontSize.sm, fontWeight: '600', color: colors.orveDarkerTeal,
    },
    stepperRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    stepperButton: {
        width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.white,
        alignItems: 'center', justifyContent: 'center',
    },
    stepperTrack: { flex: 1, height: 6, borderRadius: radius.full, backgroundColor: colors.border, overflow: 'hidden' },
    stepperFill: { height: '100%', backgroundColor: colors.orveTeal, borderRadius: radius.full },
    resultsWrap: { gap: spacing.md, marginTop: spacing.sm },
    resultCard: { borderRadius: radius.lg, padding: spacing.xl, gap: spacing.xs },
    resultLabel: { color: 'rgba(255,255,255,0.75)', fontSize: fontSize.sm },
    resultValue: { color: colors.white, fontSize: fontSize.xxl, fontWeight: '700' },
});

export default CalculateScreen;
