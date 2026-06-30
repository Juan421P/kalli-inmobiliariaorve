import Navbar from '@/components/Navbar';
import orveLogo from '@/assets/orve-logo.svg';
import background from '@/assets/cool-ass-design-for-the-login.png';
import { House, MapPinned, ShieldCheck } from 'lucide-react';
const features = [
    {
        icon: House,
        title: 'Propiedades verificadas',
        subtitle: 'Seguridad y confianza',
    },
    {
        icon: MapPinned,
        title: 'Las mejores ubicaciones',
        subtitle: 'Encuentre su lugar ideal',
    },
    {
        icon: ShieldCheck,
        title: 'Proceso seguro',
        subtitle: 'Su información, siempre protegida',
    },
];
const AuthLayout = ({ children }) => {
    return (
        <>
        </>
    );
};
export default AuthLayout;