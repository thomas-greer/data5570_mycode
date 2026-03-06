import { View, Button } from 'react-native';

export default function CheckInButton({ title, onPress }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Button title={title} onPress={onPress} />
    </View>
  );
}