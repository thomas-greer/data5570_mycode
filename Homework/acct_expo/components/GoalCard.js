import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';

export default function GoalCard({ title, selected, onPress }) {
  const glow = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(glow, {
      toValue: selected ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [glow, selected]);

  const glowShadowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const glowElevation = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6],
  });

  const glowBorderWidth = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3],
  });

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          { padding: 10, marginBottom: 10, borderRadius: 10, borderWidth: glowBorderWidth },
          selected ? { borderColor: '#4F46E5' } : { borderColor: '#00000022' },
          {
            shadowColor: '#4F46E5',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: glowShadowOpacity,
            shadowRadius: 10,
            elevation: glowElevation,
          },
        ]}
      >
        <Text>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}