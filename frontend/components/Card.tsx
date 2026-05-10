import { View, StyleSheet, type ViewProps } from 'react-native';
import { C } from '../config/theme';

export function Card({ style, children, ...p }: ViewProps) {
  return <View style={[s.card, style]} {...p}>{children}</View>;
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 16,
  },
});
