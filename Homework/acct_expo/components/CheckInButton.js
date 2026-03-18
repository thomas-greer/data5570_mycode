import { Pressable, Text } from 'react-native';

export default function CheckInButton({ title, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          minHeight: 44,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: '#111827',
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          paddingHorizontal: 8,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={{ fontWeight: '700', color: '#111827' }}>{title}</Text>
    </Pressable>
  );
}