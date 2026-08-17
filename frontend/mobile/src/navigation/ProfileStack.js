import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '@/screens/ProfileScreen';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import HelpScreen from '@/screens/HelpScreen';
import CalculateScreen from '@/screens/CalculateScreen';
import CompareSelectScreen from '@/screens/CompareSelectScreen';
import CompareScreen from '@/screens/CompareScreen';
import SellPropertyScreen from '@/screens/SellPropertyScreen';
import RentOutPropertyScreen from '@/screens/RentOutPropertyScreen';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

// Profile ya no depende de isAuthenticated a nivel de stack: siempre es la
// pantalla inicial (ella misma decide, via useAuth, si mostrar los datos de
// la cuenta o una tarjeta de "iniciar sesion"), asi los enlaces de "Mas"
// (Ayuda, Calculadora, Comparar, Vender/Alquilar mi propiedad) quedan
// accesibles sin sesion, igual que el Navbar de la web.
const ProfileStack = () => (
    <Stack.Navigator screenOptions={stackScreenOptions}>
        <Stack.Screen name='Profile' component={ProfileScreen} options={{ title: 'Perfil' }} />
        <Stack.Screen name='Login' component={LoginScreen} options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name='Register' component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
        <Stack.Screen name='Help' component={HelpScreen} options={{ title: 'Ayuda' }} />
        <Stack.Screen name='Calculate' component={CalculateScreen} options={{ title: 'Calculadora' }} />
        <Stack.Screen name='CompareSelect' component={CompareSelectScreen} options={{ title: 'Elegir propiedad' }} />
        <Stack.Screen name='Compare' component={CompareScreen} options={{ title: 'Comparar propiedades' }} />
        <Stack.Screen name='SellProperty' component={SellPropertyScreen} options={{ title: 'Vender mi propiedad' }} />
        <Stack.Screen name='RentOutProperty' component={RentOutPropertyScreen} options={{ title: 'Alquilar mi propiedad' }} />
    </Stack.Navigator>
);

export default ProfileStack;
