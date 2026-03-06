import { Pressable, View, Text } from 'react-native';

export default function GoalCard({ title, selected, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <View style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}>
        <Text>
          {selected ? 'Selected: ' : ''}
          {title}
        </Text>
      </View>
    </Pressable>
  );
}