import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Heart, Home as HomeIcon, Search, User } from 'lucide-react-native';
import HomeStack from './HomeStack';
import PropertiesStack from './PropertiesStack';
import FavoritesStack from './FavoritesStack';
import ProfileStack from './ProfileStack';
import { colors } from '@/styles/theme';

const Tab = createBottomTabNavigator();

const ICONS = {
    HomeTab: HomeIcon,
    PropertiesTab: Search,
    FavoritesTab: Heart,
    ProfileTab: User,
};

// Tab menu inferior — la navegabilidad principal de la app. Cada tab es su
// propio Stack (ver HomeStack/PropertiesStack/etc.) para poder empujar
// pantallas de detalle sin perder el menu inferior.
const MainTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.orveTeal,
            tabBarInactiveTintColor: colors.textFaint,
            tabBarIcon: ({ color, size }) => {
                const Icon = ICONS[route.name];
                return <Icon color={color} size={size ?? 22} />;
            },
        })}
    >
        <Tab.Screen name='HomeTab' component={HomeStack} options={{ title: 'Inicio' }} />
        <Tab.Screen name='PropertiesTab' component={PropertiesStack} options={{ title: 'Propiedades' }} />
        <Tab.Screen name='FavoritesTab' component={FavoritesStack} options={{ title: 'Favoritos' }} />
        <Tab.Screen name='ProfileTab' component={ProfileStack} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
);

export default MainTabs;
