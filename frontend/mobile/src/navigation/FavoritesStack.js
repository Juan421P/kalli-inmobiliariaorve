import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FavoritesScreen from '@/screens/FavoritesScreen';
import PropertyDetailScreen from '@/screens/PropertyDetailScreen';
import ScheduleAppointmentScreen from '@/screens/ScheduleAppointmentScreen';
import MakeOfferScreen from '@/screens/MakeOfferScreen';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import { stackScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

const FavoritesStack = () => (
    <Stack.Navigator screenOptions={stackScreenOptions}>
        <Stack.Screen name='Favorites' component={FavoritesScreen} options={{ title: 'Favoritos' }} />
        <Stack.Screen name='PropertyDetail' component={PropertyDetailScreen} options={{ title: 'Propiedad' }} />
        <Stack.Screen name='ScheduleAppointment' component={ScheduleAppointmentScreen} options={{ title: 'Agendar cita' }} />
        <Stack.Screen name='MakeOffer' component={MakeOfferScreen} options={{ title: 'Hacer oferta' }} />
        <Stack.Screen name='Login' component={LoginScreen} options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name='Register' component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
    </Stack.Navigator>
);

export default FavoritesStack;
