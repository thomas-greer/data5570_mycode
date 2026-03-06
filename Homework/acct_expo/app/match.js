import { View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'expo-router';
import CheckInButton from '../components/CheckInButton';
import { addCheckIn } from '../store/accountabilitySlice';

export default function MatchPage() {
  const dispatch = useDispatch();

  const { displayName, category, targetPerWeek, partnerName, checkIns } =
    useSelector((state) => state.accountability);

  const handleCheckIn = (result) => {
    dispatch(
      addCheckIn({
        result,
        date: new Date().toLocaleDateString(),
      })
    );
  };

  const latestCheckIn =
    checkIns.length > 0 ? checkIns[checkIns.length - 1].result : 'None yet';

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Your Match</Text>

      <Text>User: {displayName}</Text>
      <Text>Goal: {category}</Text>
      <Text>Target Per Week: {targetPerWeek}</Text>
      <Text>Partner: {partnerName}</Text>

      <Text style={{ marginTop: 20, marginBottom: 10 }}>Daily Check-In</Text>

      <CheckInButton title="Did It" onPress={() => handleCheckIn('Did It')} />
      <CheckInButton title="Partial" onPress={() => handleCheckIn('Partial')} />
      <CheckInButton title="Missed" onPress={() => handleCheckIn('Missed')} />

      <Text style={{ marginTop: 20 }}>Latest Check-In: {latestCheckIn}</Text>

      <Text style={{ marginTop: 20 }}>
        <Link href="/">Go Back</Link>
      </Text>
    </View>
  );
}
