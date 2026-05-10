import { View, Text, StyleSheet } from 'react-native';
import { C } from '../config/theme';

export function StreakBadge({ count }: { count: number }) {
  return (
    <View style={s.wrap}>
      <Text style={s.fire}>🔥</Text>
      <Text style={s.count}>{count}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B22', borderWidth: 1, borderColor: '#F59E0B55', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7, gap: 4 },
  fire:  { fontSize: 16 },
  count: { color: C.warn, fontWeight: '700', fontSize: 15 },
});
