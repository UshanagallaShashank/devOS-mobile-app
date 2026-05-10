import { View, Text, StyleSheet } from 'react-native';
import { C } from '../config/theme';

type Color = 'primary' | 'accent' | 'warn' | 'danger' | 'default';
const MAP: Record<Color, [string, string]> = {
  primary: [C.primary + '25', '#818CF8'],
  accent:  [C.accent  + '25', '#34D399'],
  warn:    [C.warn    + '25', '#FCD34D'],
  danger:  [C.danger  + '25', '#F87171'],
  default: [C.border,          C.sub],
};

export function TagChip({ label, color = 'default' }: { label: string; color?: Color }) {
  const [bg, text] = MAP[color];
  return (
    <View style={[s.chip, { backgroundColor: bg }]}>
      <Text style={[s.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  text: { fontSize: 11, fontWeight: '600' },
});
