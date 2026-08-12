import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import useLoginForm from '@/hooks/useLoginForm';
import { colors, spacing, fontSize, radius } from '@/styles/theme';

const STEP_COPY = {
    1: { title: 'Recuperar contraseña', subtitle: 'Le enviaremos un código a su correo' },
    2: { title: 'Verificar código', subtitle: 'Introduzca el código enviado a su correo' },
    3: { title: 'Nueva contraseña', subtitle: 'Elija una contraseña segura para su cuenta' },
};

/** Input controlado con react-hook-form (RN's TextInput usa onChangeText,
 * no el evento onChange estilo DOM que espera register()). */
const ControlledInput = ({ control, name, rules, ...inputProps }) => (
    <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
                {...inputProps}
            />
        )}
    />
);

const LoginScreen = () => {
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const {
        form,
        emailForm, codeForm, passwordForm,
        serverError, forgotMode, setForgotMode, forgotStep, resetForgot,
        onLoginSubmit, onForgotSubmit, onCodeSubmit, onPasswordSubmit,
    } = useLoginForm();

    const newPassVal = passwordForm.watch('newPassword', '');

    return (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps='handled'>
                <LinearGradient colors={[colors.orveTeal, colors.orveDarkerTeal]} style={styles.header}>
                    <Text style={styles.headerBrand}>ORVE</Text>
                    <Text style={styles.headerTitle}>
                        {forgotMode ? STEP_COPY[forgotStep]?.title : 'Inicio de sesión'}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        {forgotMode ? STEP_COPY[forgotStep]?.subtitle : 'Accede a tu cuenta para gestionar propiedades'}
                    </Text>
                </LinearGradient>

                <View style={styles.card}>
                    {!forgotMode && (
                        <View style={styles.authTabs}>
                            <Text style={[styles.authTab, styles.authTabActive]}>Iniciar sesión</Text>
                            <Text onPress={() => navigation.navigate('Register')} style={styles.authTab}>Registrarse</Text>
                        </View>
                    )}

                    {serverError ? (
                        <View style={styles.errorBox}><Text style={styles.errorText}>{serverError}</Text></View>
                    ) : null}

                    {!forgotMode && (
                        <View style={styles.form}>
                            <ControlledInput
                                control={form.control}
                                name='email'
                                rules={{
                                    required: 'El correo es requerido.',
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Ingrese un correo válido.' },
                                }}
                                label='Correo electrónico'
                                icon={<Mail size={16} color={colors.textFaint} />}
                                placeholder='Ingrese su correo electrónico'
                                autoCapitalize='none'
                                keyboardType='email-address'
                            />

                            <PasswordField
                                control={form.control}
                                name='password'
                                rules={{
                                    required: 'La contraseña es requerida.',
                                    minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres.' },
                                }}
                                label='Contraseña'
                                placeholder='Ingrese su contraseña'
                                show={showPassword}
                                onToggle={() => setShowPassword((v) => !v)}
                            />

                            <Text onPress={() => setForgotMode(true)} style={styles.link}>
                                ¿Olvidó su contraseña?
                            </Text>

                            <Button
                                title='Ingresar'
                                onPress={onLoginSubmit}
                                loading={form.formState.isSubmitting}
                                disabled={!form.formState.isValid}
                                variant='dark'
                                icon={<ArrowRight size={16} color={colors.white} />}
                            />
                        </View>
                    )}

                    {forgotMode && forgotStep === 1 && (
                        <View style={styles.form}>
                            <ControlledInput
                                control={emailForm.control}
                                name='recoveryEmail'
                                rules={{
                                    required: 'El correo es requerido.',
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Ingrese un correo válido.' },
                                }}
                                label='Correo electrónico'
                                icon={<Mail size={16} color={colors.textFaint} />}
                                placeholder='Ingrese su correo electrónico'
                                autoCapitalize='none'
                                keyboardType='email-address'
                            />
                            <Button title='Enviar código' onPress={onForgotSubmit} loading={emailForm.formState.isSubmitting} disabled={!emailForm.formState.isValid} variant='dark' icon={<ArrowRight size={16} color={colors.white} />} />
                            <Text onPress={resetForgot} style={styles.linkMuted}>Volver al inicio de sesión</Text>
                        </View>
                    )}

                    {forgotMode && forgotStep === 2 && (
                        <View style={styles.form}>
                            <ControlledInput
                                control={codeForm.control}
                                name='code'
                                rules={{ required: true, validate: (v) => v.length === 6 || 'El código debe tener 6 caracteres.' }}
                                label='Código de verificación'
                                placeholder='Ingrese el código de 6 dígitos'
                                autoCapitalize='characters'
                            />
                            <View style={styles.row}>
                                <Button title='Cancelar' onPress={resetForgot} variant='outline' style={styles.flex1} icon={<ArrowLeft size={16} color={colors.orveTeal} />} />
                                <Button title='Verificar' onPress={onCodeSubmit} loading={codeForm.formState.isSubmitting} disabled={!codeForm.formState.isValid} variant='dark' style={styles.flex1} icon={<CheckCircle2 size={16} color={colors.white} />} />
                            </View>
                        </View>
                    )}

                    {forgotMode && forgotStep === 3 && (
                        <View style={styles.form}>
                            <PasswordField
                                control={passwordForm.control}
                                name='newPassword'
                                rules={{
                                    required: true,
                                    validate: (v) =>
                                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v)
                                        || 'La contraseña no cumple los requisitos.',
                                }}
                                label='Nueva contraseña'
                                placeholder='Nueva contraseña'
                                show={showNewPass}
                                onToggle={() => setShowNewPass((v) => !v)}
                            />
                            {newPassVal ? <Text style={styles.hint}>Mín. 8 caracteres, mayúscula, minúscula, número y símbolo (@$!%*?&)</Text> : null}
                            <PasswordField
                                control={passwordForm.control}
                                name='confirmPassword'
                                rules={{ required: true, validate: (v) => v === newPassVal || 'Las contraseñas no coinciden.' }}
                                label='Confirmar contraseña'
                                placeholder='Confirme su nueva contraseña'
                                show={showConfirmPass}
                                onToggle={() => setShowConfirmPass((v) => !v)}
                            />
                            <Button title='Cambiar contraseña' onPress={onPasswordSubmit} loading={passwordForm.formState.isSubmitting} disabled={!passwordForm.formState.isValid} variant='dark' icon={<CheckCircle2 size={16} color={colors.white} />} />
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const PasswordField = ({ control, name, rules, label, placeholder, show, onToggle }) => (
    <ControlledInput
        control={control}
        name={name}
        rules={rules}
        label={label}
        icon={<Lock size={16} color={colors.textFaint} />}
        placeholder={placeholder}
        secureTextEntry={!show}
        rightSlot={<Pressable onPress={onToggle} hitSlop={8}>{show ? <EyeOff size={16} color={colors.textFaint} /> : <Eye size={16} color={colors.textFaint} />}</Pressable>}
    />
);

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
    link: { fontSize: fontSize.xs, color: colors.orveTeal, textAlign: 'right', fontWeight: '600' },
    linkMuted: { fontSize: fontSize.xs, color: colors.textFaint, textAlign: 'center' },
    hint: { fontSize: 10, color: colors.textFaint, marginTop: -spacing.sm },
    errorBox: { backgroundColor: '#FDECEC', borderRadius: radius.md, padding: spacing.md },
    errorText: { color: colors.orveRed, fontSize: fontSize.xs },
});

export default LoginScreen;
