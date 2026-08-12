import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { colors, radius } from '@/styles/theme';

/** Placeholder animado (pulso de opacidad) mientras se cargan datos reales. */
const Skeleton = ({ style }) => {
    const opacity = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[{ backgroundColor: colors.border, borderRadius: radius.sm, opacity }, style]}
        />
    );
};

export default Skeleton;
