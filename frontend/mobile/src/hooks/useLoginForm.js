import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation, useRoute } from '@react-navigation/native';
import clientService from '@/services/clientService';
import useAuth from '@/hooks/useAuth';

/**
 * Maneja el formulario de login y el flujo de "olvide mi contraseña" (3
 * pasos: pedir codigo -> verificar codigo -> nueva contraseña), igual que
 * frontend/public/src/hooks/useLoginForm.js. El token que devuelve cada paso
 * de recuperacion se guarda en estado local (a diferencia de la web, que lo
 * guarda en una variable de modulo) y se reenvia al paso siguiente.
 */
const useLoginForm = () => {
    const { login } = useAuth();
    const navigation = useNavigation();
    const route = useRoute();
    const [serverError, setServerError] = useState(null);
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);
    const [recoveryToken, setRecoveryToken] = useState(null);

    const form = useForm({ mode: 'onChange', defaultValues: { email: '', password: '' } });
    const emailForm = useForm({ mode: 'onChange', defaultValues: { recoveryEmail: '' } });
    const codeForm = useForm({ mode: 'onChange', defaultValues: { code: '' } });
    const passwordForm = useForm({ mode: 'onChange', defaultValues: { newPassword: '', confirmPassword: '' } });

    const onLoginSubmit = async ({ email, password }) => {
        setServerError(null);
        try {
            const data = await clientService.login({ email, password });
            login({ role: data.role ?? 'client', user: data.user ?? data.client });
            const { redirectTo, redirectParams } = route.params ?? {};
            if (redirectTo) navigation.replace(redirectTo, redirectParams);
            else if (navigation.canGoBack()) navigation.goBack();
        } catch (err) {
            setServerError(err?.data?.message ?? 'Credenciales incorrectas. Intente de nuevo.');
        }
    };

    const onForgotSubmit = async ({ recoveryEmail }) => {
        setServerError(null);
        try {
            const data = await clientService.requestPasswordRecovery({ email: recoveryEmail });
            setRecoveryToken(data?.token ?? null);
            setForgotStep(2);
        } catch (err) {
            const status = err?.status;
            setServerError(
                status === 401 || status === 403 || status === 404
                    ? 'No encontramos una cuenta con ese correo electrónico.'
                    : 'Ocurrió un error. Intente de nuevo más tarde.'
            );
        }
    };

    const onCodeSubmit = async ({ code }) => {
        setServerError(null);
        try {
            const data = await clientService.verifyRecoveryCode({ code: code.toLowerCase(), token: recoveryToken });
            setRecoveryToken(data?.token ?? recoveryToken);
            setForgotStep(3);
        } catch (err) {
            setServerError(err?.data?.message ?? 'Código incorrecto o expirado.');
        }
    };

    const onPasswordSubmit = async ({ newPassword, confirmPassword }) => {
        setServerError(null);
        try {
            await clientService.resetPassword({ token: recoveryToken, newPassword, confirmPassword });
            resetForgot();
        } catch (err) {
            setServerError(err?.data?.message ?? 'No se pudo cambiar la contraseña. Intente de nuevo.');
        }
    };

    const resetForgot = () => {
        setForgotMode(false);
        setForgotStep(1);
        setServerError(null);
        setRecoveryToken(null);
        emailForm.reset();
        codeForm.reset();
        passwordForm.reset();
    };

    return {
        form, emailForm, codeForm, passwordForm,
        serverError, forgotMode, setForgotMode, forgotStep, resetForgot,
        onLoginSubmit: form.handleSubmit(onLoginSubmit),
        onForgotSubmit: emailForm.handleSubmit(onForgotSubmit),
        onCodeSubmit: codeForm.handleSubmit(onCodeSubmit),
        onPasswordSubmit: passwordForm.handleSubmit(onPasswordSubmit),
    };
};

export default useLoginForm;
