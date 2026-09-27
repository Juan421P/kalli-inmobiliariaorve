import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/HomeScreen';
import PropertyListScreen from '@/screens/PropertyListScreen';
import PropertyDetailScreen from '@/screens/PropertyDetailScreen';
import ScheduleAppointmentScreen from '@/screens/ScheduleAppointmentScreen';
import MakeOfferScreen from '@/screens/MakeOfferScreen';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import SellPropertyScreen from '@/screens/SellPropertyScreen';
import RentOutPropertyScreen from '@/screens/RentOutPropertyScreen';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

const HomeStack = () => (
    <Stack.Navigator screenOptions={stackScreenOptions}>
        <Stack.Screen name='Home' component={HomeScreen} options={{ title: 'ORVE' }} />
        <Stack.Screen name='PropertyList' component={PropertyListScreen} options={{ title: 'Propiedades' }} />
        <Stack.Screen name='PropertyDetail' component={PropertyDetailScreen} options={{ title: 'Propiedad' }} />
        <Stack.Screen name='ScheduleAppointment' component={ScheduleAppointmentScreen} options={{ title: 'Agendar cita' }} />
        <Stack.Screen name='MakeOffer' component={MakeOfferScreen} options={{ title: 'Hacer oferta' }} />
        <Stack.Screen name='Login' component={LoginScreen} options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name='Register' component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
        <Stack.Screen name='SellProperty' component={SellPropertyScreen} options={{ title: 'Vender mi propiedad' }} />
        <Stack.Screen name='RentOutProperty' component={RentOutPropertyScreen} options={{ title: 'Alquilar mi propiedad' }} />
    </Stack.Navigator>
);

export default HomeStack;
