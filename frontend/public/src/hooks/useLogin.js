import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import ClientService from '@/services/client';
import toast from '@/lib/toast';
const schema = z.object({
    email: z.string().email('Correo inválido'),
    password: z.string().min(1, 'Ingrese su contraseña'),
});
const useLogin = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });
    const onSubmit = handleSubmit(async (data) => {
        setLoading(true);
        try {
            const { client } = await ClientService.login(data.email, data.password);
            login({ role: 'client', user: client });
            toast.success('Bienvenido', `Hola de nuevo, ${client.name}`);
            navigate('/');
        } catch (err) {
            toast.error(
                'Error al ingresar',
                err.response?.data?.message || 'Credenciales inválidas'
            );
        } finally {
            setLoading(false);
        }
    });
    return {
        register, onSubmit, errors,
        loading,
        showPassword, setShowPassword,
        rememberMe, setRememberMe,
    };
};
export default useLogin;