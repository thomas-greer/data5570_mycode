import { View } from 'react-native';
import GoalCard from './GoalCard';

export default function GoalList({ goals, selectedGoal, onSelect }) {
  return (
    <View>
      {goals.map((goal) => (
        <GoalCard
          key={goal}
          title={goal}
          selected={selectedGoal === goal}
          onPress={() => onSelect(goal)}
        />
      ))}
    </View>
  );
}