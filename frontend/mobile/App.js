import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthProvider from '@/providers/AuthProvider';
import ToastProvider from '@/providers/ToastProvider';
import RootNavigator from '@/navigation/RootNavigator';

// El Splash Screen nativo (logo de app.json) se mantiene visible hasta que
// este componente termina de montar; despues, RootNavigator muestra la
// pantalla de carga personalizada (LoadingScreen) mientras se rehidrata la
// sesion del usuario.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
    useEffect(() => {
        SplashScreen.hideAsync().catch(() => {});
    }, []);

    return (
        <SafeAreaProvider>
            <AuthProvider>
                <ToastProvider>
                    <NavigationContainer>
                        <StatusBar style='light' />
                        <RootNavigator />
                    </NavigationContainer>
                </ToastProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
