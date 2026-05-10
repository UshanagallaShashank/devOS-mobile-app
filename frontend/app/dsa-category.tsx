import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';
import { fetchLCProgress, upsertLCProgress } from '../services/db';
import { PROBLEMS, DIFF_COLOR, CAT_COLOR } from '../services/dsa-data';
import { C, glow } from '../config/theme';

export default function DSACategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const color         = CAT_COLOR[category] ?? C.primary;
  const problems      = PROBLEMS[category] ?? [];

  const [solved,  setSolved]  = useState(0);
  const [userId,  setUserId]  = useState('');
  const fadeAnims = useRef(problems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(30, fadeAnims.map(a =>
      Animated.timing(a, { toValue: 1, duration: 280, useNativeDriver: true })
    )).start();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const prog = await fetchLCProgress(user.id);
      const cat  = prog.find(p => p.category === category);
      if (cat) setSolved(cat.solved);
    });
  }, []);

  async function increment() {
    if (solved >= problems.length) return;
    const next = solved + 1;
    setSolved(next);
    await upsertLCProgress(userId, category, next, problems.length);
  }

  const pct = problems.length ? (solved / problems.length) * 100 : 0;

  const diffCounts = problems.reduce((acc, p) => {
    acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <SafeAreaView style={s.safe}>
      {/* Gradient header */}
      <LinearGradient
        colors={[color + '30', C.bg]}
        style={s.headerGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={[s.plusBtn, { borderColor: color + '60', backgroundColor: color + '18' }]} onPress={increment} activeOpacity={0.8}>
            <Ionicons name="add" size={18} color={color} />
            <Text style={[s.plusText, { color }]}>+1 solved</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.catTitle}>{category}</Text>

        <View style={s.metaRow}>
          {Object.entries(diffCounts).map(([d, n]) => (
            <View key={d} style={[s.diffPill, { backgroundColor: DIFF_COLOR[d] + '20', borderColor: DIFF_COLOR[d] + '40' }]}>
              <Text style={[s.diffPillText, { color: DIFF_COLOR[d] }]}>{n} {d}</Text>
            </View>
          ))}
        </View>

        {/* Progress bar */}
        <View style={s.progressRow}>
          <View style={s.progressTrack}>
            <Animated.View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: color }]} />
          </View>
          <Text style={[s.progressPct, { color }]}>{solved}/{problems.length}</Text>
        </View>
      </LinearGradient>

      {/* Problem list */}
      <FlatList
        data={problems}
        keyExtractor={item => item.name}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View style={{ opacity: fadeAnims[index], transform: [{ translateY: fadeAnims[index].interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
            <View style={s.row}>
              <View style={[s.diffDot, { backgroundColor: DIFF_COLOR[item.difficulty] + '20' }]}>
                <Text style={[s.diffDotText, { color: DIFF_COLOR[item.difficulty] }]}>
                  {item.difficulty[0]}
                </Text>
              </View>
              <Text style={s.probName} numberOfLines={1}>{item.name}</Text>
              <TouchableOpacity
                style={[s.notesBtn, { borderColor: color + '50', backgroundColor: color + '12' }, glow(color, 0.1)]}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/dsa-notes', params: { problem: item.name, category } })}
              >
                <Ionicons name="bulb-outline" size={13} color={color} />
                <Text style={[s.notesBtnText, { color }]}>Notes</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        ItemSeparatorComponent={() => <View style={s.separator} />}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.bg },
  headerGrad:    { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  headerRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn:       { width: 36, height: 36, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  plusBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  plusText:      { fontWeight: '700', fontSize: 13 },
  catTitle:      { color: C.text, fontSize: 26, fontWeight: '800', marginBottom: 10 },
  metaRow:       { flexDirection: 'row', gap: 8, marginBottom: 14 },
  diffPill:      { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  diffPillText:  { fontSize: 12, fontWeight: '700' },
  progressRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 99, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 99 },
  progressPct:   { fontSize: 13, fontWeight: '800', width: 40, textAlign: 'right' },
  list:          { padding: 16 },
  row:           { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13 },
  diffDot:       { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  diffDotText:   { fontSize: 12, fontWeight: '800' },
  probName:      { flex: 1, color: C.text, fontSize: 13, fontWeight: '500' },
  notesBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 6 },
  notesBtnText:  { fontSize: 12, fontWeight: '700' },
  separator:     { height: 8 },
});
