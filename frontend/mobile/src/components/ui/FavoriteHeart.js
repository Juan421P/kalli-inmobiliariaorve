import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { Heart } from 'lucide-react-native';
import { colors } from '@/styles/theme';

/**
 * Botón de favorito (corazón) con un pequeño "pop" de escala al tocarlo.
 * Se usa tanto en las tarjetas de listado (ListingCard) como en el detalle
 * de propiedad — cada uno le pasa su propio contenedor/posicionamiento via
 * `style`, este componente solo resuelve el icono y la animación.
 */
const FavoriteHeart = ({ isFavorite, onPress, size = 14, style, hitSlop = 8 }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scale, { toValue: 1.3, duration: 90, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
        ]).start();
        onPress?.();
    };

    return (
        <Pressable onPress={handlePress} hitSlop={hitSlop} style={style}>
            <Animated.View style={{ transform: [{ scale }] }}>
                <Heart
                    size={size}
                    color={isFavorite ? colors.orveRed : colors.orveTeal}
                    fill={isFavorite ? colors.orveRed : 'transparent'}
                />
            </Animated.View>
        </Pressable>
    );
};

export default FavoriteHeart;
