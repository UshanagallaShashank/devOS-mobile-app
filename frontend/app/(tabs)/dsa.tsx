import { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { fetchProfile, upsertProfile, fetchLCProgress, upsertLCProgress, type LCProgress } from '../../services/db';
import { fetchLCStats, type LCStats } from '../../services/leetcode';
import { PROBLEMS, DIFF_COLOR, CAT_COLOR } from '../../services/dsa-data';
import { C, glow } from '../../config/theme';

const DEFAULT_CATEGORIES: LCProgress[] = Object.entries(PROBLEMS).map(([cat, probs]) => ({
  category: cat, solved: 0, total: probs.length,
}));

const CONTESTS = [
  { name: 'LeetCode Weekly',   icon: 'trophy-outline',   color: C.warn,    url: 'https://leetcode.com/contest/' },
  { name: 'LeetCode Biweekly', icon: 'calendar-outline', color: C.primary, url: 'https://leetcode.com/contest/' },
  { name: 'Codeforces Rounds', icon: 'flash-outline',    color: C.danger,  url: 'https://codeforces.com/contests' },
  { name: 'NeetCode Practice', icon: 'map-outline',      color: C.accent,  url: 'https://neetcode.io/roadmap' },
];

export default function DSAScreen() {
  const [stats, setStats]           = useState<LCStats | null>(null);
  const [lcUsername, setLcUsername] = useState('');
  const [progress, setProgress]     = useState<LCProgress[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId]         = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const [profile, dbProgress] = await Promise.all([fetchProfile(user.id), fetchLCProgress(user.id)]);
      const username = profile?.leetcode_username ?? '';
      setLcUsername(username);
      if (username) {
        const s = await fetchLCStats(username);
        if (s) { setStats(s); await upsertProfile(user.id, { leetcode_solved: s.total }); }
      }
      const merged = DEFAULT_CATEGORIES.map(def => dbProgress.find(p => p.category === def.category) ?? def);
      setProgress(merged);
      // auto-select first incomplete
      const first = merged.find(p => p.solved < p.total);
      if (first) setSelectedCat(first.category);
    } catch { /* keep stale */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  async function incrementSolved(cat: LCProgress) {
    if (cat.solved >= cat.total) return;
    const next = cat.solved + 1;
    setProgress(prev => prev.map(p => p.category === cat.category ? { ...p, solved: next } : p));
    await upsertLCProgress(userId, cat.category, next, cat.total);
  }

  const totalSolved   = progress.reduce((s, p) => s + p.solved, 0);
  const totalProblems = progress.reduce((s, p) => s + p.total, 0);

  // incomplete first, done last
  const sorted = [...progress].sort((a, b) => {
    const aDone = a.solved >= a.total;
    const bDone = b.solved >= b.total;
    if (aDone !== bDone) return aDone ? 1 : -1;
    return (a.solved / a.total) - (b.solved / b.total);
  });

  const activeCat   = selectedCat ? progress.find(p => p.category === selectedCat) : null;
  const activeProbs = selectedCat ? (PROBLEMS[selectedCat] ?? []) : [];
  const activeColor = selectedCat ? (CAT_COLOR[selectedCat] ?? C.primary) : C.primary;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.primary} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>DSA Practice</Text>
            <Text style={s.sub}>{lcUsername ? `@${lcUsername} · LeetCode` : 'Add LeetCode username in Profile'}</Text>
          </View>
          {loading && !stats
            ? <ActivityIndicator color={C.accent} />
            : <TouchableOpacity style={[s.heroBadge, glow(C.accent, 0.2)]} onPress={() => lcUsername && Linking.openURL(`https://leetcode.com/${lcUsername}`)}>
                <Text style={s.heroNum}>{stats?.total ?? 0}</Text>
                <Text style={s.heroLbl}>solved</Text>
              </TouchableOpacity>
          }
        </View>

        {!lcUsername && !loading && (
          <TouchableOpacity style={s.promptCard} onPress={() => router.push('/profile')} activeOpacity={0.85}>
            <Ionicons name="code-slash" size={24} color={C.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.promptTitle}>Connect LeetCode</Text>
              <Text style={s.promptSub}>Add your username in Profile to track real stats</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={C.primary} />
          </TouchableOpacity>
        )}

        {stats && (
          <View style={s.statsRow}>
            <View style={[s.statCard, { borderColor: C.accent  + '50' }]}><Text style={[s.statNum, { color: C.accent  }]}>{stats.easy}</Text><Text style={s.statLbl}>Easy</Text></View>
            <View style={[s.statCard, { borderColor: C.warn    + '50' }]}><Text style={[s.statNum, { color: C.warn    }]}>{stats.medium}</Text><Text style={s.statLbl}>Medium</Text></View>
            <View style={[s.statCard, { borderColor: C.danger  + '50' }]}><Text style={[s.statNum, { color: C.danger  }]}>{stats.hard}</Text><Text style={s.statLbl}>Hard</Text></View>
            <View style={[s.statCard, { borderColor: C.border         }]}><Text style={s.statNum}>#{stats.ranking > 0 ? (stats.ranking / 1000).toFixed(0) + 'k' : '—'}</Text><Text style={s.statLbl}>Rank</Text></View>
          </View>
        )}

        {/* Overall progress */}
        <View style={[s.neetCard, glow(C.primary, 0.12)]}>
          <View style={s.neetTop}>
            <Text style={s.neetTitle}>NeetCode 150 Roadmap</Text>
            <Text style={s.neetCount}>{totalSolved} / {totalProblems}</Text>
          </View>
          <View style={s.neetBarTrack}>
            <View style={[s.neetBarFill, { width: `${totalProblems ? (totalSolved / totalProblems) * 100 : 0}%` as any }]} />
          </View>
          <Text style={s.neetHint}>{sorted.filter(p => p.solved >= p.total).length} of {sorted.length} topics complete</Text>
        </View>

        {/* Horizontal topic chips */}
        <Text style={s.section}>Topics</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipBar} contentContainerStyle={s.chipContent}>
          {sorted.map(cat => {
            const done    = cat.solved >= cat.total;
            const color   = CAT_COLOR[cat.category] ?? C.primary;
            const active  = selectedCat === cat.category;
            const pct     = cat.total > 0 ? Math.round((cat.solved / cat.total) * 100) : 0;
            return (
              <TouchableOpacity
                key={cat.category}
                style={[s.chip, active && { borderColor: color, backgroundColor: color + '18' }, done && s.chipDone]}
                onPress={() => setSelectedCat(cat.category)}
                activeOpacity={0.75}
              >
                {done && <Ionicons name="checkmark-circle" size={12} color={C.accent} />}
                <Text style={[s.chipText, active && { color }, done && { color: C.muted }]} numberOfLines={1}>
                  {cat.category}
                </Text>
                <Text style={[s.chipPct, { color: active ? color : C.muted }]}>{pct}%</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected category problems */}
        {activeCat && (
          <View style={s.catSection}>
            <View style={s.catHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[s.catName, { color: activeColor }]}>{activeCat.category}</Text>
                <Text style={s.catMeta}>{activeCat.solved}/{activeCat.total} solved</Text>
              </View>
              <TouchableOpacity
                style={[s.openBtn, { backgroundColor: activeColor + '18', borderColor: activeColor + '40' }]}
                onPress={() => router.push({ pathname: '/dsa-category' as any, params: { category: activeCat.category } })}
              >
                <Text style={[s.openBtnText, { color: activeColor }]}>Open all</Text>
                <Ionicons name="arrow-forward" size={13} color={activeColor} />
              </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View style={s.catBarTrack}>
              <View style={[s.catBarFill, { width: `${activeCat.total > 0 ? (activeCat.solved / activeCat.total) * 100 : 0}%` as any, backgroundColor: activeColor }]} />
            </View>

            {/* Show next 5 unsolved problems */}
            <View style={s.problemList}>
              {activeProbs
                .filter((_, i) => i >= activeCat.solved)
                .slice(0, 5)
                .map((prob, i) => (
                  <View key={i} style={[s.probRow, i === 0 && s.probRowFirst]}>
                    <View style={[s.diffDot, { backgroundColor: DIFF_COLOR[prob.difficulty] + '25' }]}>
                      <Text style={[s.diffDotText, { color: DIFF_COLOR[prob.difficulty] }]}>
                        {prob.difficulty[0]}
                      </Text>
                    </View>
                    <Text style={s.probName}>{prob.name}</Text>
                    <TouchableOpacity
                      style={[s.notesBtn]}
                      onPress={() => router.push({ pathname: '/dsa-notes' as any, params: { problem: prob.name, category: activeCat.category } })}
                    >
                      <Ionicons name="create-outline" size={12} color={C.primary} />
                      <Text style={s.notesBtnText}>Notes</Text>
                    </TouchableOpacity>
                  </View>
                ))
              }
              {activeCat.solved >= activeCat.total && (
                <View style={s.doneMsg}>
                  <Ionicons name="trophy" size={20} color={C.accent} />
                  <Text style={s.doneMsgText}>All done! Pick another topic above.</Text>
                </View>
              )}
            </View>

            {activeCat.solved < activeCat.total && (
              <TouchableOpacity
                style={[s.markBtn, { borderColor: activeColor + '40', backgroundColor: activeColor + '14' }]}
                onPress={() => incrementSolved(activeCat)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={16} color={activeColor} />
                <Text style={[s.markBtnText, { color: activeColor }]}>Mark next as solved</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Contests */}
        <Text style={[s.section, { marginTop: 24 }]}>Competitions</Text>
        <View style={s.contestGrid}>
          {CONTESTS.map(c => (
            <TouchableOpacity key={c.name} style={[s.contestCard, { borderColor: c.color + '40' }]} activeOpacity={0.8} onPress={() => Linking.openURL(c.url)}>
              <View style={[s.contestIcon, { backgroundColor: c.color + '18' }]}>
                <Ionicons name={c.icon as any} size={20} color={c.color} />
              </View>
              <Text style={s.contestName}>{c.name}</Text>
              <Ionicons name="open-outline" size={13} color={C.muted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.bg },
  scroll:      { flex: 1, paddingHorizontal: 16 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 16 },
  title:       { color: C.text, fontSize: 24, fontWeight: '700' },
  sub:         { color: C.sub, fontSize: 12, marginTop: 4 },
  heroBadge:   { backgroundColor: C.surface, borderWidth: 1, borderColor: C.accent + '50', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 12, alignItems: 'center' },
  heroNum:     { color: C.accent, fontWeight: '800', fontSize: 32, lineHeight: 36 },
  heroLbl:     { color: C.muted, fontSize: 11, marginTop: 2 },
  promptCard:  { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.primary + '50', borderRadius: 18, padding: 16, marginBottom: 16 },
  promptTitle: { color: C.text, fontWeight: '700', fontSize: 14 },
  promptSub:   { color: C.muted, fontSize: 12, marginTop: 2 },
  statsRow:    { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard:    { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  statNum:     { color: C.text, fontWeight: '800', fontSize: 20 },
  statLbl:     { color: C.muted, fontSize: 10, marginTop: 3 },
  neetCard:    { backgroundColor: C.surface, borderWidth: 1, borderColor: C.primary + '40', borderRadius: 18, padding: 16, marginBottom: 20 },
  neetTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  neetTitle:   { color: C.text, fontWeight: '700', fontSize: 14 },
  neetCount:   { color: C.primary, fontWeight: '800', fontSize: 14 },
  neetBarTrack:{ height: 6, backgroundColor: C.border, borderRadius: 99, overflow: 'hidden', marginBottom: 8 },
  neetBarFill: { height: '100%', backgroundColor: C.primary, borderRadius: 99 },
  neetHint:    { color: C.muted, fontSize: 11 },
  section:     { color: C.text, fontWeight: '700', fontSize: 16, marginBottom: 10 },

  // Horizontal chips
  chipBar:     { marginBottom: 16 },
  chipContent: { gap: 8, paddingRight: 4 },
  chip:        { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  chipDone:    { opacity: 0.6 },
  chipText:    { color: C.muted, fontSize: 12, fontWeight: '600', maxWidth: 110 },
  chipPct:     { fontSize: 11, fontWeight: '700' },

  // Category detail
  catSection:  { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 16, marginBottom: 8 },
  catHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  catName:     { fontWeight: '700', fontSize: 16 },
  catMeta:     { color: C.muted, fontSize: 12, marginTop: 2 },
  openBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  openBtnText: { fontSize: 12, fontWeight: '700' },
  catBarTrack: { height: 5, backgroundColor: C.border, borderRadius: 99, overflow: 'hidden', marginBottom: 14 },
  catBarFill:  { height: '100%', borderRadius: 99 },

  problemList:  { gap: 0, borderWidth: 1, borderColor: C.border, borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  probRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.border },
  probRowFirst: { borderTopWidth: 0 },
  diffDot:      { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  diffDotText:  { fontSize: 11, fontWeight: '800' },
  probName:     { flex: 1, color: C.text, fontSize: 13 },
  notesBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primary + '14', borderWidth: 1, borderColor: C.primary + '40', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  notesBtnText: { color: C.primary, fontSize: 12, fontWeight: '600' },
  doneMsg:      { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 },
  doneMsgText:  { color: C.muted, fontSize: 13 },

  markBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderRadius: 12, paddingVertical: 11 },
  markBtnText:  { fontSize: 13, fontWeight: '700' },

  contestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  contestCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.surface, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, width: '47%' },
  contestIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  contestName: { flex: 1, color: C.text, fontSize: 12, fontWeight: '600' },
});
