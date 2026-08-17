import { useState } from 'react'

/**
 * Controla la visibilidad del visor de PDF en PropertyFormSection
 * (usado por SellProperty y RentProperty). Se extrae a un hook propio
 * para que el componente de UI no mezcle estado con presentacion.
 */
const useDocumentViewer = () => {
    const [isVisible, setIsVisible] = useState(false)
    const toggle = () => setIsVisible((v) => !v)
    return { isVisible, toggle }
}

export default useDocumentViewer
