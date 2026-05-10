import { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { fetchProfile, upsertProfile, fetchLCProgress, upsertLCProgress, type LCProgress } from '../../services/db';
import { fetchLCStats, type LCStats } from '../../services/leetcode';
import { PROBLEMS, DIFF_COLOR, CAT_COLOR } from '../../services/dsa-data';
import { C, glow } from '../../config/theme';

const DEFAULT_CATEGORIES: LCProgress[] = Object.entries(PROBLEMS).map(([cat, probs]) => ({
  category: cat, solved: 0, total: probs.length,
}));

const CONTESTS = [
  { name: 'LeetCode Weekly',    icon: 'trophy-outline',   color: C.warn,    url: 'https://leetcode.com/contest/' },
  { name: 'LeetCode Biweekly', icon: 'calendar-outline',  color: C.primary, url: 'https://leetcode.com/contest/' },
  { name: 'Codeforces Rounds', icon: 'flash-outline',     color: C.danger,  url: 'https://codeforces.com/contests' },
  { name: 'NeetCode Practice', icon: 'map-outline',       color: C.accent,  url: 'https://neetcode.io/roadmap' },
];

export default function DSAScreen() {
  const [stats, setStats]           = useState<LCStats | null>(null);
  const [lcUsername, setLcUsername] = useState('');
  const [progress, setProgress]     = useState<LCProgress[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId]         = useState('');

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
    } catch { /* keep stale */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const nextTopic = (): LCProgress | null => {
    const incomplete = progress.filter(p => p.solved < p.total);
    if (!incomplete.length) return null;
    return incomplete.reduce((a, b) => (a.solved / a.total) <= (b.solved / b.total) ? a : b);
  };

  async function incrementSolved(cat: LCProgress) {
    if (cat.solved >= cat.total) return;
    const next = cat.solved + 1;
    setProgress(prev => prev.map(p => p.category === cat.category ? { ...p, solved: next } : p));
    await upsertLCProgress(userId, cat.category, next, cat.total);
  }

  const next = nextTopic();
  const totalSolved  = progress.reduce((s, p) => s + p.solved, 0);
  const totalProblems = progress.reduce((s, p) => s + p.total, 0);

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

        {/* NeetCode 150 progress */}
        <View style={[s.neetCard, glow(C.primary, 0.12)]}>
          <View style={s.neetTop}>
            <Text style={s.neetTitle}>NeetCode 150 Roadmap</Text>
            <Text style={s.neetCount}>{totalSolved} / {totalProblems}</Text>
          </View>
          <View style={s.neetBarTrack}>
            <View style={[s.neetBarFill, { width: `${totalProblems ? (totalSolved / totalProblems) * 100 : 0}%` as any }]} />
          </View>
          <Text style={s.neetHint}>12 topics · tap any category to view problems</Text>
        </View>

        {/* Continue banner */}
        {next && (
          <TouchableOpacity
            style={[s.continueBanner, glow(C.primary, 0.15)]} activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/dsa-category' as any, params: { category: next.category } })}
          >
            <View style={s.continueLeft}>
              <Ionicons name="play-circle" size={22} color={C.primary} />
              <View>
                <Text style={s.continueTitle}>Continue → {next.category}</Text>
                <Text style={s.continueSub}>{next.solved}/{next.total} done · {Math.round((next.solved / next.total) * 100)}% complete</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={18} color={C.primary} />
          </TouchableOpacity>
        )}

        {/* Contests */}
        <Text style={s.section}>Competitions</Text>
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

        {/* Category drills */}
        <Text style={s.section}>Drill Progress  <Text style={s.sectionHint}>tap to open</Text></Text>
        <View style={{ gap: 8, paddingBottom: 32 }}>
          {progress.map(cat => {
            const problems   = PROBLEMS[cat.category] ?? [];
            const pct        = cat.total > 0 ? (cat.solved / cat.total) * 100 : 0;
            const isNext     = next?.category === cat.category;
            const color      = CAT_COLOR[cat.category] ?? C.primary;
            const diffCounts = problems.reduce((acc, p) => { acc[p.difficulty] = (acc[p.difficulty] || 0) + 1; return acc; }, {} as Record<string, number>);

            return (
              <TouchableOpacity
                key={cat.category}
                style={[s.catCard, isNext && { borderColor: color + '60' }]}
                activeOpacity={0.75}
                onPress={() => router.push({ pathname: '/dsa-category' as any, params: { category: cat.category } })}
              >
                <View style={[s.catStrip, { backgroundColor: color }]} />
                <View style={s.catLeft}>
                  <View style={s.catTopRow}>
                    <Text style={s.catName}>{cat.category}</Text>
                    {isNext && <View style={[s.nextPill, { backgroundColor: color + '20' }]}><Text style={[s.nextPillText, { color }]}>continue</Text></View>}
                  </View>
                  <Text style={s.catMeta}>{cat.solved}/{cat.total} solved</Text>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: color }]} />
                  </View>
                  <View style={s.diffRow}>
                    {Object.entries(diffCounts).map(([d, n]) => (
                      <Text key={d} style={[s.diffTag, { color: DIFF_COLOR[d] }]}>{n} {d}</Text>
                    ))}
                  </View>
                </View>
                <View style={s.catRight}>
                  <TouchableOpacity
                    style={[s.plusBtn, { backgroundColor: color + '18', borderColor: color + '40' }]}
                    onPress={(e) => { e.stopPropagation(); incrementSolved(cat); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="add" size={16} color={color} />
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={16} color={C.muted} style={{ marginTop: 8 }} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: C.bg },
  scroll:          { flex: 1, paddingHorizontal: 16 },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 16 },
  title:           { color: C.text, fontSize: 24, fontWeight: '700' },
  sub:             { color: C.sub, fontSize: 12, marginTop: 4 },
  heroBadge:       { backgroundColor: C.surface, borderWidth: 1, borderColor: C.accent + '50', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 12, alignItems: 'center' },
  heroNum:         { color: C.accent, fontWeight: '800', fontSize: 32, lineHeight: 36 },
  heroLbl:         { color: C.muted, fontSize: 11, marginTop: 2 },
  promptCard:      { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.primary + '50', borderRadius: 18, padding: 16, marginBottom: 16 },
  promptTitle:     { color: C.text, fontWeight: '700', fontSize: 14 },
  promptSub:       { color: C.muted, fontSize: 12, marginTop: 2 },
  statsRow:        { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard:        { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  statNum:         { color: C.text, fontWeight: '800', fontSize: 20 },
  statLbl:         { color: C.muted, fontSize: 10, marginTop: 3 },
  neetCard:        { backgroundColor: C.surface, borderWidth: 1, borderColor: C.primary + '40', borderRadius: 18, padding: 16, marginBottom: 16 },
  neetTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  neetTitle:       { color: C.text, fontWeight: '700', fontSize: 14 },
  neetCount:       { color: C.primary, fontWeight: '800', fontSize: 14 },
  neetBarTrack:    { height: 6, backgroundColor: C.border, borderRadius: 99, overflow: 'hidden', marginBottom: 8 },
  neetBarFill:     { height: '100%', backgroundColor: C.primary, borderRadius: 99 },
  neetHint:        { color: C.muted, fontSize: 11 },
  continueBanner:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.surface, borderWidth: 1, borderColor: C.primary + '50', borderRadius: 18, padding: 16, marginBottom: 20 },
  continueLeft:    { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  continueTitle:   { color: C.text, fontWeight: '700', fontSize: 14 },
  continueSub:     { color: C.muted, fontSize: 12, marginTop: 2 },
  section:         { color: C.text, fontWeight: '700', fontSize: 16, marginBottom: 12 },
  sectionHint:     { color: C.muted, fontWeight: '400', fontSize: 11 },
  contestGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  contestCard:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.surface, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, width: '47%' },
  contestIcon:     { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  contestName:     { flex: 1, color: C.text, fontSize: 12, fontWeight: '600' },
  catCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: 'hidden' },
  catStrip:        { width: 4, alignSelf: 'stretch' },
  catLeft:         { flex: 1, padding: 14, paddingLeft: 12 },
  catTopRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  catName:         { color: C.text, fontWeight: '600', fontSize: 14 },
  nextPill:        { backgroundColor: C.primary + '20', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  nextPillText:    { color: C.primary, fontSize: 10, fontWeight: '700' },
  catMeta:         { color: C.muted, fontSize: 12, marginBottom: 6 },
  barTrack:        { height: 4, backgroundColor: C.border, borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  barFill:         { height: '100%', backgroundColor: C.primary, borderRadius: 99 },
  diffRow:         { flexDirection: 'row', gap: 10 },
  diffTag:         { fontSize: 11, fontWeight: '600' },
  catRight:        { alignItems: 'center', gap: 4, paddingRight: 14, paddingLeft: 8 },
  plusBtn:         { width: 30, height: 30, borderRadius: 9, backgroundColor: C.primary + '18', borderWidth: 1, borderColor: C.primary + '40', alignItems: 'center', justifyContent: 'center' },
  problemList:     { backgroundColor: C.surface, borderWidth: 1, borderTopWidth: 0, borderColor: C.border, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, overflow: 'hidden' },
  problemRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.border },
  diffDot:         { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  diffDotText:     { fontSize: 11, fontWeight: '800' },
  probName:        { flex: 1, color: C.text, fontSize: 13 },
  notesBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primary + '14', borderWidth: 1, borderColor: C.primary + '40', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  notesBtnText:    { color: C.primary, fontSize: 12, fontWeight: '600' },
});
