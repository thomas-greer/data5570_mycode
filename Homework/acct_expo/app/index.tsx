import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import GoalList from '../components/GoalList';
import { setUserInfo } from '../store/accountabilitySlice';
import { Redirect } from 'expo-router';
import { findMatch } from '../store/matchThunks';

export default function HomePage() {
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('');
  const [targetPerWeek, setTargetPerWeek] = useState('');

  const dispatch: any = useDispatch();
  const token = useSelector((state: any) => state.auth.token);

  const goals = ['Gym', 'Study', 'Nutrition', 'Recovery'];

  if (!token) {
    return <Redirect href="/login" />;
  }

  const handleMatch = async () => {
    if (!displayName || !category || !targetPerWeek) return;

    dispatch(
      setUserInfo({
        displayName,
        category,
        targetPerWeek,
      })
    );

    try {
      const result: any = await dispatch(
        (findMatch as any)({
          token,
          goal_category: category,
          target_per_week: Number(targetPerWeek),
        })
      ).unwrap();

      dispatch(
        setUserInfo({
          partnerName: result?.partner_name || 'Searching...',
          matchId: result?.match_id || '',
        })
      );
    } catch (e) {
      console.error('Match request failed:', e);
      dispatch(
        setUserInfo({
          partnerName: 'Searching...',
        })
      );
    }

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