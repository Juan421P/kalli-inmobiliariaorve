import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import offerService from '@/services/Offer'
import toast from '@/lib/toast'

/**
 * Maneja el formulario de "Hacer una oferta" con react-hook-form.
 * Precio y fecha de mudanza son inputs nativos (se registran con `register`
 * normal). Metodo de contacto y duracion de renta son botones tipo "chip"
 * en vez de <select>/<input>, asi que se exponen via `control` para que la
 * pagina los maneje con <Controller> (la forma correcta de RHF para inputs
 * que no son elementos de formulario nativos).
 *
 * @param {object} property - propiedad sobre la que se oferta (ya cargada con useProperty)
 * @param {string} publicId - public_id de la propiedad, para navegar de vuelta
 * @param {string} userId - id del usuario logueado, va como `buyer` en el payload
 */
const useOfferForm = ({ property, publicId, userId }) => {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isRent = property?.listing_type === 'rent'

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        defaultValues: {
            price: '',
            moveInDate: '',
            rentalMonths: null,
            contactMethod: null,
        },
    })

    // react-hook-form ya valida price > 0 y contactMethod requerido antes de llegar aca.
    const onSubmit = async (values) => {
        setIsSubmitting(true)
        try {
                const payload = {
                buyer:    userId,
                property: property._id,
                price:    Number(values.price),
                ...(values.moveInDate   && { move_in_date:  values.moveInDate }),
                ...(values.rentalMonths && { rental_months: values.rentalMonths }),
            }
            await offerService.create(payload)
            toast.success('¡Oferta enviada! Un agente se pondrá en contacto contigo.')
            navigate(`/property/${publicId}`)
        } catch (err) {
            const msg = err?.response?.data?.message ?? 'No se pudo enviar la oferta. Intenta de nuevo.'
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        isRent,
        isSubmitting,
        errors,
        register,
        control,
        handleSubmit: handleSubmit(onSubmit),
    }
}

export default useOfferForm
