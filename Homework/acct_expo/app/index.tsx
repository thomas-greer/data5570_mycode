import { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import { router } from 'expo-router';
import GoalList from '../components/GoalList';
import { setUserInfo } from '../store/accountabilitySlice';

export default function HomePage() {
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('');
  const [targetPerWeek, setTargetPerWeek] = useState('');

  const dispatch = useDispatch();

  const goals = ['Gym', 'Study', 'Nutrition', 'Recovery'];

  const handleMatch = () => {
    if (!displayName || !category || !targetPerWeek) return;

    dispatch(
      setUserInfo({
        displayName,
        category,
        targetPerWeek,
        partnerName: 'Alex',
      })
    );

    router.push('/match');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>
        Accountability App
      </Text>

      <Text>Name</Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Enter your name"
        style={{ borderWidth: 1, padding: 8, marginBottom: 15 }}
      />

      <Text>Choose a goal</Text>
      <GoalList
        goals={goals}
        selectedGoal={category}
        onSelect={setCategory}
      />

      <Text>Target Per Week</Text>
      <TextInput
        value={targetPerWeek}
        onChangeText={setTargetPerWeek}
        placeholder="Enter a number"
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8, marginBottom: 15 }}
      />

      <Button title="Find Accountability Partner" onPress={handleMatch} />
    </View>
  );
}