import { colors } from '@/styles/theme';

// Opciones compartidas por todos los Stack.Navigator: header con los colores
// de marca, igual que el Navbar de la web.
export const stackScreenOptions = {
    headerStyle: { backgroundColor: colors.orveTeal },
    headerTintColor: colors.white,
    headerTitleStyle: { fontWeight: '700' },
    contentStyle: { backgroundColor: colors.background },
};
