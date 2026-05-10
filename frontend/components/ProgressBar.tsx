import { View, Text, StyleSheet } from 'react-native';
import { C } from '../config/theme';

type Props = { label: string; value: number; color?: string };

export function ProgressBar({ label, value, color = C.primary }: Props) {
  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.pct}>{value}%</Text>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${value}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:  { gap: 6 },
  row:   { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: C.sub, fontSize: 12 },
  pct:   { color: C.muted, fontSize: 12 },
  track: { height: 6, backgroundColor: C.border, borderRadius: 99, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 99 },
});
