import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import offerService from '@/services/offerService';
import useToast from '@/hooks/useToast';

/**
 * Maneja el formulario de "Hacer una oferta", igual que
 * frontend/public/src/hooks/useOfferForm.js pero con useNavigation/useToast
 * en vez de react-router/toast web.
 *
 * @param {object} property - propiedad sobre la que se oferta (ya cargada con useProperty)
 * @param {string} publicId - public_id de la propiedad, para navegar de vuelta
 * @param {string} userId - id del usuario logueado, va como `buyer` en el payload
 */
const useOfferForm = ({ property, publicId, userId }) => {
    const navigation = useNavigation();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isRent = property?.listing_type === 'rent';

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            price: '',
            moveInDate: '',
            rentalMonths: null,
            contactMethod: null,
        },
    });

    const onSubmit = async (values) => {
        setIsSubmitting(true);
        try {
            const payload = {
                buyer: userId,
                property: property._id,
                price: Number(values.price),
                ...(values.moveInDate?.trim() && { move_in_date: values.moveInDate.trim() }),
                ...(values.rentalMonths && { rental_months: values.rentalMonths }),
            };
            await offerService.create(payload);
            toast.success('¡Oferta enviada!', 'Un agente se pondrá en contacto contigo.');
            navigation.navigate('PropertyDetail', { publicId });
        } catch (err) {
            toast.error('No se pudo enviar la oferta', err?.data?.message ?? 'Intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isRent,
        isSubmitting,
        errors,
        control,
        isValid,
        onSubmit: handleSubmit(onSubmit),
    };
};

export default useOfferForm;
