import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller } from 'react-hook-form';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowLeft, ArrowRight, Check, CheckCircle, CheckCircle2, Eye, EyeOff,
    Hash, Lock, Mail, Phone, User, UserPlus,
} from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import OTPInput from '@/components/OTPInput';
import useRegisterForm from '@/hooks/useRegisterForm';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const PASSWORD_CHECKS = [
    { label: 'Mínimo 8 caracteres', test: (v) => v.length >= 8 },
    { label: 'Una letra mayúscula', test: (v) => /[A-Z]/.test(v) },
    { label: 'Una letra minúscula', test: (v) => /[a-z]/.test(v) },
    { label: 'Un número', test: (v) => /\d/.test(v) },
    { label: 'Un símbolo (@$!%*?&)', test: (v) => /[@$!%*?&]/.test(v) },
];

const DOCUMENT_TYPES = ['DUI', 'Pasaporte', 'Residencia'];

const ControlledInput = ({ control, name, rules, ...inputProps }) => (
    <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <Input value={value} onChangeText={onChange} onBlur={onBlur} error={error?.message} {...inputProps} />
        )}
    />
);

const RegisterScreen = () => {
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        step, step1, step2, step3,
        serverError, countdown, formatCountdown,
        onStep1Submit, onStep2Submit, onStep3Submit, onResendCode, goBack, goToLogin,
    } = useRegisterForm();

    const passwordVal = step1.watch('password', '');

    return (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps='handled'>
                <LinearGradient colors={[colors.orveTeal, colors.orveDarkerTeal]} style={styles.header}>
                    <Text style={styles.headerBrand}>ORVE</Text>
                    <Text style={styles.headerTitle}>{step === 3 ? 'Verificación de correo' : 'Crear cuenta'}</Text>
                    <Text style={styles.headerSubtitle}>Crea tu cuenta para poder personalizar tu experiencia</Text>
                </LinearGradient>

                <View style={styles.card}>
                    {step < 4 && (
                        <View style={styles.authTabs}>
                            <Text onPress={goToLogin} style={styles.authTab}>Iniciar sesión</Text>
                            <Text style={[styles.authTab, styles.authTabActive]}>Registrarse</Text>
                        </View>
                    )}

                    {step < 4 && (
                        <Text style={styles.stepIndicator}>Paso {Math.min(step, 3)} / 3</Text>
                    )}

                    {serverError ? (
                        <View style={styles.errorBox}><Text style={styles.errorText}>{serverError}</Text></View>
                    ) : null}

                    {step === 1 && (
                        <View style={styles.form}>
                            <ControlledInput control={step1.control} name='name' rules={{ required: 'Este campo es requerido.' }} label='Nombre' icon={<User size={16} color={colors.textFaint} />} placeholder='Ingrese su nombre' />
                            <ControlledInput control={step1.control} name='lastname' rules={{ required: 'Este campo es requerido.' }} label='Apellido' icon={<User size={16} color={colors.textFaint} />} placeholder='Ingrese su apellido' />
                            <ControlledInput
                                control={step1.control}
                                name='email'
                                rules={{ required: 'El correo es requerido.', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Ingrese un correo válido.' } }}
                                label='Correo electrónico'
                                icon={<Mail size={16} color={colors.textFaint} />}
                                placeholder='correo@ejemplo.com'
                                autoCapitalize='none'
                                keyboardType='email-address'
                            />
                            <Controller
                                control={step1.control}
                                name='password'
                                rules={{
                                    required: 'La contraseña es requerida.',
                                    validate: (v) =>
                                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v)
                                        || 'La contraseña no cumple los requisitos.',
                                }}
                                render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                                    <View style={{ gap: spacing.xs }}>
                                        <Input
                                            label='Contraseña'
                                            icon={<Lock size={16} color={colors.textFaint} />}
                                            placeholder='Ingrese su contraseña'
                                            secureTextEntry={!showPass}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            error={error?.message}
                                            rightSlot={<Pressable onPress={() => setShowPass((v) => !v)} hitSlop={8}>{showPass ? <EyeOff size={16} color={colors.textFaint} /> : <Eye size={16} color={colors.textFaint} />}</Pressable>}
                                        />
                                        {value ? (
                                            <View style={{ gap: 2 }}>
                                                {PASSWORD_CHECKS.map(({ label, test }) => {
                                                    const ok = test(value);
                                                    return (
                                                        <Text key={label} style={[styles.checkItem, ok && styles.checkItemOk]}>
                                                            {ok ? '✓' : '○'} {label}
                                                        </Text>
                                                    );
                                                })}
                                            </View>
                                        ) : null}
                                    </View>
                                )}
                            />
                            <Button title='Continuar' onPress={onStep1Submit} loading={step1.formState.isSubmitting} disabled={!step1.formState.isValid} variant='dark' icon={<ArrowRight size={16} color={colors.white} />} />
                            <Text onPress={goToLogin} style={styles.linkMuted}>¿Ya tenés cuenta? Iniciá sesión</Text>
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.form}>
                            <ControlledInput
                                control={step2.control}
                                name='phone'
                                rules={{ required: 'El teléfono es requerido.', pattern: { value: /^\d{4}-?\d{4}$/, message: 'Formato: 0000-0000' } }}
                                label='Número de teléfono'
                                icon={<Phone size={16} color={colors.textFaint} />}
                                placeholder='0000-0000'
                                keyboardType='phone-pad'
                            />

                            <View style={{ gap: spacing.xs }}>
                                <Text style={styles.fieldLabel}>Tipo de documento</Text>
                                <Controller
                                    control={step2.control}
                                    name='document_type'
                                    rules={{ required: true }}
                                    render={({ field: { value, onChange } }) => (
                                        <View style={styles.chipRow}>
                                            {DOCUMENT_TYPES.map((t) => (
                                                <Chip key={t} label={t} selected={value === t} onPress={() => onChange(t)} />
                                            ))}
                                        </View>
                                    )}
                                />
                            </View>

                            <ControlledInput
                                control={step2.control}
                                name='document_number'
                                rules={{ required: 'El número de documento es requerido.' }}
                                label='Número de documento'
                                icon={<Hash size={16} color={colors.textFaint} />}
                                placeholder='Ingrese su número de documento'
                            />

                            <ControlledInput
                                control={step2.control}
                                name='confirmPassword'
                                rules={{ required: 'Confirme su contraseña.', validate: (v) => v === passwordVal || 'Las contraseñas no coinciden.' }}
                                label='Confirme su contraseña'
                                icon={<Lock size={16} color={colors.textFaint} />}
                                placeholder='Ingrese la contraseña otra vez'
                                secureTextEntry={!showConfirm}
                                rightSlot={<Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={8}>{showConfirm ? <EyeOff size={16} color={colors.textFaint} /> : <Eye size={16} color={colors.textFaint} />}</Pressable>}
                            />

                            <Controller
                                control={step2.control}
                                name='terms'
                                rules={{ validate: (v) => v === true }}
                                render={({ field: { value, onChange } }) => (
                                    <Pressable onPress={() => onChange(!value)} style={styles.termsRow}>
                                        <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                                            {value ? <Check size={12} color={colors.white} /> : null}
                                        </View>
                                        <Text style={styles.termsText}>He leído y acepto los términos y condiciones de ORVE</Text>
                                    </Pressable>
                                )}
                            />

                            <View style={styles.row}>
                                <Button title='Atrás' variant='outline' style={styles.flex1} onPress={goBack} icon={<ArrowLeft size={16} color={colors.orveTeal} />} />
                                <Button title='Registrarse' variant='dark' style={styles.flex1} loading={step2.formState.isSubmitting} disabled={!step2.formState.isValid} onPress={onStep2Submit} icon={<UserPlus size={16} color={colors.white} />} />
                            </View>
                        </View>
                    )}

                    {step === 3 && (
                        <View style={styles.form}>
                            <Text style={styles.otpDescription}>
                                Le hemos enviado un código de 6 dígitos a{' '}
                                <Text style={styles.otpEmail}>{step1.getValues('email')}</Text>.
                                Revise su bandeja de entrada e introdúzcalo a continuación.
                            </Text>

                            <Controller
                                control={step3.control}
                                name='code'
                                rules={{ required: true, validate: (v) => v.length === 6 }}
                                render={({ field: { value, onChange } }) => (
                                    <OTPInput value={value} onChange={onChange} separatorAt={3} />
                                )}
                            />

                            <View style={styles.otpFooter}>
                                <Text style={styles.otpCountdown}>
                                    {countdown > 0 ? `El código expira en: ${formatCountdown(countdown)}` : 'El código ha expirado.'}
                                </Text>
                                <Text
                                    onPress={countdown > 0 ? undefined : onResendCode}
                                    style={[styles.link, countdown > 0 && styles.linkDisabled]}
                                >
                                    Solicitar un nuevo código
                                </Text>
                            </View>

                            <View style={styles.row}>
                                <Button title='Atrás' variant='outline' style={styles.flex1} onPress={goBack} icon={<ArrowLeft size={16} color={colors.orveTeal} />} />
                                <Button
                                    title='Confirmar'
                                    variant='dark'
                                    style={styles.flex1}
                                    loading={step3.formState.isSubmitting}
                                    disabled={!step3.formState.isValid || countdown === 0}
                                    onPress={onStep3Submit}
                                    icon={<CheckCircle size={16} color={colors.white} />}
                                />
                            </View>
                        </View>
                    )}

                    {step === 4 && (
                        <View style={styles.successWrap}>
                            <View style={styles.successIcon}><CheckCircle2 size={32} color={colors.orveGreen} /></View>
                            <Text style={styles.successTitle}>¡Cuenta creada!</Text>
                            <Text style={styles.successSubtitle}>Su cuenta ha sido verificada exitosamente. Ya puede iniciar sesión.</Text>
                            <Button title='Iniciar sesión' variant='dark' onPress={goToLogin} style={{ width: '100%' }} />
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    flex1: { flex: 1 },
    scroll: { flexGrow: 1 },
    header: {
        paddingTop: spacing.xxl + spacing.lg,
        paddingBottom: spacing.xxl,
        paddingHorizontal: spacing.xl,
        borderBottomLeftRadius: radius.xl,
        borderBottomRightRadius: radius.xl,
    },
    headerBrand: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.sm, fontWeight: '700', letterSpacing: 2 },
    headerTitle: { color: colors.white, fontSize: fontSize.xxl, fontWeight: '700', marginTop: spacing.sm },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm, marginTop: spacing.xs },
    card: {
        backgroundColor: colors.white,
        marginHorizontal: spacing.lg,
        marginTop: -spacing.xl,
        borderRadius: radius.xl,
        padding: spacing.xl,
        gap: spacing.lg,
    },
    stepIndicator: { fontSize: fontSize.xs, color: colors.textFaint, fontWeight: '600', textAlign: 'center' },
    authTabs: {
        flexDirection: 'row', backgroundColor: '#F3F5F5', borderRadius: radius.lg, padding: 4,
    },
    authTab: {
        flex: 1, textAlign: 'center', paddingVertical: spacing.sm, borderRadius: radius.md,
        fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted,
    },
    authTabActive: { backgroundColor: colors.orveDarkerTeal, color: colors.white },
    form: { gap: spacing.md },
    row: { flexDirection: 'row', gap: spacing.sm },
    fieldLabel: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    checkItem: { fontSize: 10, color: colors.textFaint },
    checkItemOk: { color: colors.orveGreen },
    link: { fontSize: fontSize.xs, color: colors.orveTeal, fontWeight: '600' },
    linkDisabled: { color: colors.textFaint },
    linkMuted: { fontSize: fontSize.xs, color: colors.textFaint, textAlign: 'center' },
    errorBox: { backgroundColor: '#FDECEC', borderRadius: radius.md, padding: spacing.md },
    errorText: { color: colors.orveRed, fontSize: fontSize.xs },
    termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    checkbox: {
        width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colors.border,
        alignItems: 'center', justifyContent: 'center', marginTop: 1,
    },
    checkboxChecked: { backgroundColor: colors.orveTeal, borderColor: colors.orveTeal },
    termsText: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },
    otpDescription: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 18 },
    otpEmail: { fontWeight: '700', color: colors.orveTeal },
    otpFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    otpCountdown: { fontSize: fontSize.xs, color: colors.textFaint },
    successWrap: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
    successIcon: { width: 64, height: 64, borderRadius: radius.full, backgroundColor: '#EAF7EF', alignItems: 'center', justifyContent: 'center' },
    successTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.orveDarkerTeal },
    successSubtitle: { fontSize: fontSize.xs, color: colors.textFaint, textAlign: 'center' },
});

export default RegisterScreen;
