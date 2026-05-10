import { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { fetchProfile, upsertProfile, fetchLCProgress, upsertLCProgress, type LCProgress } from '../../services/db';
import { fetchLCStats, type LCStats } from '../../services/leetcode';
import { C, glow } from '../../config/theme';

type Problem = { name: string; difficulty: 'Easy' | 'Medium' | 'Hard' };

const PROBLEMS: Record<string, Problem[]> = {
  'Arrays & Hashing': [
    { name: 'Contains Duplicate',             difficulty: 'Easy'   },
    { name: 'Valid Anagram',                  difficulty: 'Easy'   },
    { name: 'Two Sum',                        difficulty: 'Easy'   },
    { name: 'Group Anagrams',                 difficulty: 'Medium' },
    { name: 'Top K Frequent Elements',        difficulty: 'Medium' },
    { name: 'Encode and Decode Strings',      difficulty: 'Medium' },
    { name: 'Product of Array Except Self',   difficulty: 'Medium' },
    { name: 'Valid Sudoku',                   difficulty: 'Medium' },
    { name: 'Longest Consecutive Sequence',   difficulty: 'Medium' },
  ],
  'Two Pointers': [
    { name: 'Valid Palindrome',               difficulty: 'Easy'   },
    { name: 'Two Sum II',                     difficulty: 'Medium' },
    { name: '3Sum',                           difficulty: 'Medium' },
    { name: 'Container With Most Water',      difficulty: 'Medium' },
    { name: 'Trapping Rain Water',            difficulty: 'Hard'   },
  ],
  'Sliding Window': [
    { name: 'Best Time to Buy and Sell Stock',                       difficulty: 'Easy'   },
    { name: 'Longest Substring Without Repeating Characters',        difficulty: 'Medium' },
    { name: 'Longest Repeating Character Replacement',               difficulty: 'Medium' },
    { name: 'Permutation in String',                                 difficulty: 'Medium' },
    { name: 'Minimum Window Substring',                              difficulty: 'Hard'   },
    { name: 'Sliding Window Maximum',                                difficulty: 'Hard'   },
  ],
  'Stack': [
    { name: 'Valid Parentheses',              difficulty: 'Easy'   },
    { name: 'Min Stack',                      difficulty: 'Medium' },
    { name: 'Evaluate Reverse Polish Notation', difficulty: 'Medium' },
    { name: 'Generate Parentheses',           difficulty: 'Medium' },
    { name: 'Daily Temperatures',             difficulty: 'Medium' },
    { name: 'Car Fleet',                      difficulty: 'Medium' },
    { name: 'Largest Rectangle in Histogram', difficulty: 'Hard'   },
  ],
  'Binary Search': [
    { name: 'Binary Search',                         difficulty: 'Easy'   },
    { name: 'Search a 2D Matrix',                    difficulty: 'Medium' },
    { name: 'Koko Eating Bananas',                   difficulty: 'Medium' },
    { name: 'Find Minimum in Rotated Sorted Array',  difficulty: 'Medium' },
    { name: 'Search in Rotated Sorted Array',        difficulty: 'Medium' },
    { name: 'Time Based Key-Value Store',            difficulty: 'Medium' },
    { name: 'Median of Two Sorted Arrays',           difficulty: 'Hard'   },
  ],
  'Linked List': [
    { name: 'Reverse Linked List',                   difficulty: 'Easy'   },
    { name: 'Merge Two Sorted Lists',                difficulty: 'Easy'   },
    { name: 'Reorder List',                          difficulty: 'Medium' },
    { name: 'Remove Nth Node From End of List',      difficulty: 'Medium' },
    { name: 'Copy List with Random Pointer',         difficulty: 'Medium' },
    { name: 'Add Two Numbers',                       difficulty: 'Medium' },
    { name: 'Linked List Cycle',                     difficulty: 'Easy'   },
    { name: 'Find the Duplicate Number',             difficulty: 'Medium' },
    { name: 'LRU Cache',                             difficulty: 'Medium' },
    { name: 'Merge K Sorted Lists',                  difficulty: 'Hard'   },
    { name: 'Reverse Nodes in K-Group',              difficulty: 'Hard'   },
  ],
  'Trees': [
    { name: 'Invert Binary Tree',                                       difficulty: 'Easy'   },
    { name: 'Maximum Depth of Binary Tree',                             difficulty: 'Easy'   },
    { name: 'Diameter of Binary Tree',                                  difficulty: 'Easy'   },
    { name: 'Balanced Binary Tree',                                     difficulty: 'Easy'   },
    { name: 'Same Tree',                                                difficulty: 'Easy'   },
    { name: 'Subtree of Another Tree',                                  difficulty: 'Easy'   },
    { name: 'Lowest Common Ancestor of a BST',                          difficulty: 'Medium' },
    { name: 'Binary Tree Level Order Traversal',                        difficulty: 'Medium' },
    { name: 'Binary Tree Right Side View',                              difficulty: 'Medium' },
    { name: 'Count Good Nodes in Binary Tree',                          difficulty: 'Medium' },
    { name: 'Validate Binary Search Tree',                              difficulty: 'Medium' },
    { name: 'Kth Smallest Element in a BST',                            difficulty: 'Medium' },
    { name: 'Construct Binary Tree from Preorder and Inorder Traversal',difficulty: 'Medium' },
    { name: 'Binary Tree Maximum Path Sum',                             difficulty: 'Hard'   },
    { name: 'Serialize and Deserialize Binary Tree',                    difficulty: 'Hard'   },
  ],
  'Heap / Priority Queue': [
    { name: 'Kth Largest Element in a Stream', difficulty: 'Easy'   },
    { name: 'Last Stone Weight',               difficulty: 'Easy'   },
    { name: 'K Closest Points to Origin',      difficulty: 'Medium' },
    { name: 'Kth Largest Element in an Array', difficulty: 'Medium' },
    { name: 'Task Scheduler',                  difficulty: 'Medium' },
    { name: 'Design Twitter',                  difficulty: 'Medium' },
    { name: 'Find Median from Data Stream',    difficulty: 'Hard'   },
  ],
  'Backtracking': [
    { name: 'Subsets',                                difficulty: 'Medium' },
    { name: 'Combination Sum',                        difficulty: 'Medium' },
    { name: 'Permutations',                           difficulty: 'Medium' },
    { name: 'Subsets II',                             difficulty: 'Medium' },
    { name: 'Combination Sum II',                     difficulty: 'Medium' },
    { name: 'Word Search',                            difficulty: 'Medium' },
    { name: 'Palindrome Partitioning',                difficulty: 'Medium' },
    { name: 'Letter Combinations of a Phone Number',  difficulty: 'Medium' },
    { name: 'N-Queens',                               difficulty: 'Hard'   },
  ],
  'Graphs': [
    { name: 'Number of Islands',                                    difficulty: 'Medium' },
    { name: 'Clone Graph',                                          difficulty: 'Medium' },
    { name: 'Max Area of Island',                                   difficulty: 'Medium' },
    { name: 'Pacific Atlantic Water Flow',                          difficulty: 'Medium' },
    { name: 'Surrounded Regions',                                   difficulty: 'Medium' },
    { name: 'Rotting Oranges',                                      difficulty: 'Medium' },
    { name: 'Walls and Gates',                                      difficulty: 'Medium' },
    { name: 'Course Schedule',                                      difficulty: 'Medium' },
    { name: 'Course Schedule II',                                   difficulty: 'Medium' },
    { name: 'Redundant Connection',                                 difficulty: 'Medium' },
    { name: 'Number of Connected Components in Undirected Graph',   difficulty: 'Medium' },
    { name: 'Graph Valid Tree',                                     difficulty: 'Medium' },
    { name: 'Word Ladder',                                          difficulty: 'Hard'   },
  ],
  'Dynamic Programming': [
    { name: 'Climbing Stairs',                            difficulty: 'Easy'   },
    { name: 'Min Cost Climbing Stairs',                   difficulty: 'Easy'   },
    { name: 'House Robber',                               difficulty: 'Medium' },
    { name: 'House Robber II',                            difficulty: 'Medium' },
    { name: 'Longest Palindromic Substring',              difficulty: 'Medium' },
    { name: 'Palindromic Substrings',                     difficulty: 'Medium' },
    { name: 'Decode Ways',                                difficulty: 'Medium' },
    { name: 'Coin Change',                                difficulty: 'Medium' },
    { name: 'Maximum Product Subarray',                   difficulty: 'Medium' },
    { name: 'Word Break',                                 difficulty: 'Medium' },
    { name: 'Longest Increasing Subsequence',             difficulty: 'Medium' },
    { name: 'Partition Equal Subset Sum',                 difficulty: 'Medium' },
    { name: 'Unique Paths',                               difficulty: 'Medium' },
    { name: 'Longest Common Subsequence',                 difficulty: 'Medium' },
    { name: 'Best Time to Buy and Sell Stock with Cooldown', difficulty: 'Medium' },
    { name: 'Coin Change II',                             difficulty: 'Medium' },
    { name: 'Target Sum',                                 difficulty: 'Medium' },
    { name: 'Interleaving String',                        difficulty: 'Medium' },
    { name: 'Longest Increasing Path in a Matrix',        difficulty: 'Hard'   },
    { name: 'Distinct Subsequences',                      difficulty: 'Hard'   },
    { name: 'Edit Distance',                              difficulty: 'Medium' },
    { name: 'Burst Balloons',                             difficulty: 'Hard'   },
    { name: 'Regular Expression Matching',                difficulty: 'Hard'   },
    { name: 'Jump Game',                                  difficulty: 'Medium' },
  ],
  'Tries': [
    { name: 'Implement Trie (Prefix Tree)',                    difficulty: 'Medium' },
    { name: 'Design Add and Search Words Data Structure',      difficulty: 'Medium' },
    { name: 'Word Search II',                                  difficulty: 'Hard'   },
  ],
};

const DEFAULT_CATEGORIES: LCProgress[] = Object.entries(PROBLEMS).map(([cat, probs]) => ({
  category: cat, solved: 0, total: probs.length,
}));

const DIFF_COLOR: Record<string, string> = { Easy: C.accent, Medium: C.warn, Hard: C.danger };

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
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

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
            onPress={() => setExpandedCat(expandedCat === next.category ? null : next.category)}
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
        <Text style={s.section}>Drill Progress  <Text style={s.sectionHint}>tap to expand</Text></Text>
        <View style={{ gap: 8, paddingBottom: 32 }}>
          {progress.map(cat => {
            const problems = PROBLEMS[cat.category] ?? [];
            const pct      = cat.total > 0 ? (cat.solved / cat.total) * 100 : 0;
            const isNext   = next?.category === cat.category;
            const isOpen   = expandedCat === cat.category;
            const diffCounts = problems.reduce((acc, p) => { acc[p.difficulty] = (acc[p.difficulty] || 0) + 1; return acc; }, {} as Record<string, number>);

            return (
              <View key={cat.category}>
                {/* Category header card */}
                <TouchableOpacity
                  style={[s.catCard, isNext && { borderColor: C.primary + '60' }, isOpen && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomColor: 'transparent' }]}
                  activeOpacity={0.75}
                  onPress={() => setExpandedCat(isOpen ? null : cat.category)}
                >
                  <View style={s.catLeft}>
                    <View style={s.catTopRow}>
                      <Text style={s.catName}>{cat.category}</Text>
                      {isNext && <View style={s.nextPill}><Text style={s.nextPillText}>continue</Text></View>}
                    </View>
                    <Text style={s.catMeta}>{cat.solved}/{cat.total} solved</Text>
                    <View style={s.barTrack}>
                      <View style={[s.barFill, { width: `${pct}%` as any }]} />
                    </View>
                    <View style={s.diffRow}>
                      {Object.entries(diffCounts).map(([d, n]) => (
                        <Text key={d} style={[s.diffTag, { color: DIFF_COLOR[d] }]}>{n} {d}</Text>
                      ))}
                    </View>
                  </View>
                  <View style={s.catRight}>
                    <TouchableOpacity style={s.plusBtn} onPress={() => incrementSolved(cat)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="add" size={16} color={C.primary} />
                    </TouchableOpacity>
                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={C.muted} style={{ marginTop: 8 }} />
                  </View>
                </TouchableOpacity>

                {/* Expanded problem list */}
                {isOpen && (
                  <View style={s.problemList}>
                    {problems.map((prob, idx) => (
                      <View key={prob.name} style={[s.problemRow, idx === problems.length - 1 && { borderBottomWidth: 0 }]}>
                        <View style={[s.diffDot, { backgroundColor: DIFF_COLOR[prob.difficulty] + '25' }]}>
                          <Text style={[s.diffDotText, { color: DIFF_COLOR[prob.difficulty] }]}>{prob.difficulty[0]}</Text>
                        </View>
                        <Text style={s.probName} numberOfLines={1}>{prob.name}</Text>
                        <TouchableOpacity
                          style={s.notesBtn}
                          activeOpacity={0.8}
                          onPress={() => router.push({ pathname: '/dsa-notes', params: { problem: prob.name, category: cat.category } })}
                        >
                          <Ionicons name="bulb-outline" size={13} color={C.primary} />
                          <Text style={s.notesBtnText}>Notes</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
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
  catCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14 },
  catLeft:         { flex: 1 },
  catTopRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  catName:         { color: C.text, fontWeight: '600', fontSize: 14 },
  nextPill:        { backgroundColor: C.primary + '20', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  nextPillText:    { color: C.primary, fontSize: 10, fontWeight: '700' },
  catMeta:         { color: C.muted, fontSize: 12, marginBottom: 6 },
  barTrack:        { height: 4, backgroundColor: C.border, borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  barFill:         { height: '100%', backgroundColor: C.primary, borderRadius: 99 },
  diffRow:         { flexDirection: 'row', gap: 10 },
  diffTag:         { fontSize: 11, fontWeight: '600' },
  catRight:        { alignItems: 'center', gap: 4, marginLeft: 12 },
  plusBtn:         { width: 30, height: 30, borderRadius: 9, backgroundColor: C.primary + '18', borderWidth: 1, borderColor: C.primary + '40', alignItems: 'center', justifyContent: 'center' },
  problemList:     { backgroundColor: C.surface, borderWidth: 1, borderTopWidth: 0, borderColor: C.border, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, overflow: 'hidden' },
  problemRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.border },
  diffDot:         { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  diffDotText:     { fontSize: 11, fontWeight: '800' },
  probName:        { flex: 1, color: C.text, fontSize: 13 },
  notesBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primary + '14', borderWidth: 1, borderColor: C.primary + '40', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  notesBtnText:    { color: C.primary, fontSize: 12, fontWeight: '600' },
});
