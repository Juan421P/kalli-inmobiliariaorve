import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ToastCard from './ToastCard';

// Overlay fijo en la parte superior de la pantalla, montado una sola vez
// desde ToastProvider (ver providers/ToastProvider.js).
const Toaster = ({ toasts, onDismiss }) => {
    const insets = useSafeAreaInsets();
    if (toasts.length === 0) return null;
    return (
        <View pointerEvents='box-none' style={[styles.container, { top: insets.top + 8 }]}>
            {toasts.map((t) => (
                <ToastCard key={t.id} {...t} onDismiss={() => onDismiss(t.id)} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { position: 'absolute', left: 0, right: 0, zIndex: 999 },
});

export default Toaster;
