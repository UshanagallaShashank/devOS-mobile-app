import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { C, glow } from '../../config/theme';
import { DAILY_CONCEPTS, CAT_META, getTodaysConcept, type DailyConcept } from '../../services/learn-data';

const CATS = ['Today', 'System Design', 'GCP', 'Core AI', 'Agentic AI', 'Modern AI', 'DSA Pattern'] as const;
type Cat = typeof CATS[number];

const TODAY = getTodaysConcept();

const TRACKS = [
  { id: 1, title: 'LLM Engineering', topics: 24, weeks: 8, level: 'Intermediate', color: C.primary,  icon: 'hardware-chip-outline',  progress: 35 },
  { id: 2, title: 'System Design',   topics: 18, weeks: 6, level: 'Advanced',     color: C.purple,   icon: 'git-branch-outline',     progress: 10 },
  { id: 3, title: 'React Native',    topics: 16, weeks: 5, level: 'Beginner',     color: C.accent,   icon: 'phone-portrait-outline', progress: 60 },
  { id: 4, title: 'Python & APIs',   topics: 20, weeks: 6, level: 'Beginner',     color: C.warn,     icon: 'terminal-outline',       progress: 80 },
];

const LEVEL_COLOR: Record<string, string> = {
  Beginner: C.accent, Intermediate: C.warn, Advanced: C.danger,
};

export default function LearnScreen() {
  const [tab, setTab]             = useState<Cat>('Today');
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from('daily_learns').select('concept_id').eq('user_id', user.id);
      if (data) setLearnedIds(new Set(data.map(r => r.concept_id)));
    });
  }, []);

  const open = (c: DailyConcept) =>
    router.push({ pathname: '/daily-learn' as any, params: { conceptId: c.id } });

  const filtered = tab === 'Today'
    ? null
    : DAILY_CONCEPTS.filter(c => c.category === tab);

  return (
    <SafeAreaView style={s.safe}>
      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar} contentContainerStyle={s.tabContent}>
        {CATS.map(cat => {
          const active = tab === cat;
          const meta   = cat !== 'Today' ? CAT_META[cat as Exclude<Cat, 'Today'>] : null;
          const color  = meta?.color ?? C.primary;
          return (
            <TouchableOpacity
              key={cat}
              style={[s.tab, active && { backgroundColor: color + '22', borderColor: color + '70' }]}
              onPress={() => setTab(cat)}
              activeOpacity={0.75}
            >
              {meta && <Ionicons name={meta.icon as any} size={12} color={active ? color : C.muted} />}
              <Text style={[s.tabText, active && { color }]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* TODAY TAB */}
        {tab === 'Today' && (
          <>
            {/* Hero card */}
            <TouchableOpacity activeOpacity={0.88} onPress={() => open(TODAY)}>
              <LinearGradient
                colors={[TODAY.color + '35', TODAY.color + '12', C.surface]}
                style={s.heroCard}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <View style={s.heroTop}>
                  <View style={[s.heroIcon, { backgroundColor: TODAY.color + '30' }]}>
                    <Ionicons name={TODAY.icon as any} size={24} color={TODAY.color} />
                  </View>
                  <View style={[s.heroBadge, { backgroundColor: TODAY.color + '20', borderColor: TODAY.color + '50' }]}>
                    <View style={[s.heroDot, { backgroundColor: TODAY.color }]} />
                    <Text style={[s.heroBadgeText, { color: TODAY.color }]}>TODAY'S CONCEPT</Text>
                  </View>
                </View>
                <Text style={s.heroTitle}>{TODAY.title}</Text>
                <Text style={s.heroTagline}>{TODAY.tagline}</Text>
                <View style={s.heroFooter}>
                  <View style={[s.heroCat, { backgroundColor: TODAY.color + '20' }]}>
                    <Text style={[s.heroCatText, { color: TODAY.color }]}>{TODAY.category}</Text>
                  </View>
                  <View style={[s.heroLearnBtn, { backgroundColor: TODAY.color }]}>
                    <Text style={s.heroLearnText}>Learn now</Text>
                    <Ionicons name="arrow-forward" size={14} color="#fff" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Browse all categories */}
            <Text style={s.sectionLabel}>BROWSE CATEGORIES</Text>
            <View style={s.catGrid}>
              {(Object.entries(CAT_META) as [Exclude<Cat, 'Today'>, { color: string; icon: string }][]).map(([cat, meta]) => {
                const count = DAILY_CONCEPTS.filter(c => c.category === cat).length;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[s.catCard, { borderColor: meta.color + '40', backgroundColor: meta.color + '10' }]}
                    onPress={() => setTab(cat)}
                    activeOpacity={0.8}
                  >
                    <View style={[s.catCardIcon, { backgroundColor: meta.color + '25' }]}>
                      <Ionicons name={meta.icon as any} size={18} color={meta.color} />
                    </View>
                    <Text style={[s.catCardName, { color: meta.color }]} numberOfLines={2}>{cat}</Text>
                    <Text style={s.catCardCount}>{count} concepts</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Learning tracks */}
            <Text style={s.sectionLabel}>LEARNING TRACKS</Text>
            <TouchableOpacity
              style={[s.featured, glow(TRACKS[0].color, 0.2)]}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/track', params: { title: TRACKS[0].title, progress: String(TRACKS[0].progress) } })}
            >
              <View style={[s.featuredStrip, { backgroundColor: TRACKS[0].color }]} />
              <View style={s.featuredBody}>
                <View style={s.featuredTop}>
                  <View style={[s.featuredIcon, { backgroundColor: TRACKS[0].color + '25' }]}>
                    <Ionicons name={TRACKS[0].icon as any} size={22} color={TRACKS[0].color} />
                  </View>
                  <View style={[s.inProgressPill, { backgroundColor: TRACKS[0].color + '20', borderColor: TRACKS[0].color + '50' }]}>
                    <View style={[s.inProgressDot, { backgroundColor: TRACKS[0].color }]} />
                    <Text style={[s.inProgressText, { color: TRACKS[0].color }]}>In Progress · Week 3/8</Text>
                  </View>
                </View>
                <Text style={s.featuredTitle}>{TRACKS[0].title}</Text>
                <Text style={s.featuredSub}>Prompting → RAG → Agents → Fine-tuning</Text>
                <View style={s.barWrap}>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width: `${TRACKS[0].progress}%` as any, backgroundColor: TRACKS[0].color }]} />
                  </View>
                  <Text style={[s.barPct, { color: TRACKS[0].color }]}>{TRACKS[0].progress}%</Text>
                </View>
                <View style={[s.continueBtn, { backgroundColor: TRACKS[0].color }]}>
                  <Text style={s.continueBtnText}>Continue Learning</Text>
                  <Ionicons name="arrow-forward" size={15} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>

            <View style={{ gap: 12, paddingBottom: 32 }}>
              {TRACKS.slice(1).map(track => (
                <TouchableOpacity
                  key={track.id}
                  style={s.trackCard}
                  activeOpacity={0.75}
                  onPress={() => router.push({ pathname: '/track', params: { title: track.title, progress: String(track.progress) } })}
                >
                  <View style={[s.trackStrip, { backgroundColor: track.color }]} />
                  <View style={[s.trackIcon, { backgroundColor: track.color + '20' }, glow(track.color, 0.15)]}>
                    <Ionicons name={track.icon as any} size={20} color={track.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.trackRow}>
                      <Text style={s.trackName}>{track.title}</Text>
                      <View style={[s.levelPill, { backgroundColor: LEVEL_COLOR[track.level] + '20', borderColor: LEVEL_COLOR[track.level] + '50' }]}>
                        <Text style={[s.levelText, { color: LEVEL_COLOR[track.level] }]}>{track.level}</Text>
                      </View>
                    </View>
                    <Text style={s.trackMeta}>{track.topics} topics · {track.weeks} weeks</Text>
                    <View style={s.trackBarRow}>
                      <View style={s.trackBarTrack}>
                        <View style={[s.trackBarFill, { width: `${track.progress}%` as any, backgroundColor: track.color }]} />
                      </View>
                      <Text style={[s.trackPct, { color: track.color }]}>{track.progress}%</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* CATEGORY TAB */}
        {filtered && (
          <View style={{ paddingBottom: 32 }}>
            <Text style={s.sectionLabel}>{filtered.length} CONCEPTS</Text>
            <View style={{ gap: 10 }}>
              {filtered.map(concept => {
                const learned = learnedIds.has(concept.id);
                return (
                  <TouchableOpacity
                    key={concept.id}
                    style={[s.conceptRow, learned && s.conceptRowDone]}
                    activeOpacity={0.8}
                    onPress={() => open(concept)}
                  >
                    <View style={[s.conceptIcon, { backgroundColor: concept.color + '22' }]}>
                      <Ionicons name={concept.icon as any} size={18} color={learned ? C.muted : concept.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.conceptTitle, learned && { color: C.muted }]}>{concept.title}</Text>
                      <Text style={s.conceptTagline} numberOfLines={1}>{concept.tagline}</Text>
                    </View>
                    {learned
                      ? <Ionicons name="checkmark-circle" size={20} color={C.accent} />
                      : <Ionicons name="chevron-forward" size={16} color={C.muted} />
                    }
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1, paddingHorizontal: 16 },
  content: { paddingBottom: 32 },

  tabBar:     { maxHeight: 48, marginTop: 12 },
  tabContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  tab:        { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: C.surface },
  tabText:    { color: C.muted, fontSize: 12, fontWeight: '600' },

  sectionLabel: { color: C.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginTop: 20, marginBottom: 12 },

  catGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  catCard:      { width: '47%', borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  catCardIcon:  { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  catCardName:  { fontWeight: '700', fontSize: 13 },
  catCardCount: { color: C.muted, fontSize: 11 },

  // Hero card
  heroCard:    { borderWidth: 1, borderColor: '#ffffff12', borderRadius: 22, padding: 18, marginTop: 16, marginBottom: 4 },
  heroTop:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  heroIcon:    { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  heroBadge:   { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  heroDot:     { width: 6, height: 6, borderRadius: 3 },
  heroBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  heroTitle:   { color: C.text, fontSize: 24, fontWeight: '800', marginBottom: 6 },
  heroTagline: { color: C.sub, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  heroFooter:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroCat:     { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  heroCatText: { fontSize: 12, fontWeight: '700' },
  heroLearnBtn:{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  heroLearnText:{ color: '#fff', fontWeight: '700', fontSize: 13 },

  // Concept list row
  conceptRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14 },
  conceptRowDone: { opacity: 0.6 },
  conceptIcon:    { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  conceptTitle:   { color: C.text, fontWeight: '600', fontSize: 14 },
  conceptTagline: { color: C.muted, fontSize: 12, marginTop: 2 },

  // Featured track
  featured:       { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 22, overflow: 'hidden', marginBottom: 12, flexDirection: 'row' },
  featuredStrip:  { width: 5 },
  featuredBody:   { flex: 1, padding: 18 },
  featuredTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  featuredIcon:   { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  inProgressPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  inProgressDot:  { width: 6, height: 6, borderRadius: 3 },
  inProgressText: { fontSize: 11, fontWeight: '700' },
  featuredTitle:  { color: C.text, fontWeight: '700', fontSize: 20 },
  featuredSub:    { color: C.sub, fontSize: 13, marginTop: 4, marginBottom: 16 },
  barWrap:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  barTrack:       { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 99, overflow: 'hidden' },
  barFill:        { height: '100%', borderRadius: 99 },
  barPct:         { fontSize: 12, fontWeight: '700', width: 32, textAlign: 'right' },
  continueBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 13, paddingVertical: 12 },
  continueBtnText:{ color: '#fff', fontWeight: '700', fontSize: 14 },

  // Track cards
  trackCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, overflow: 'hidden', paddingRight: 16, paddingVertical: 14 },
  trackStrip:   { width: 4, alignSelf: 'stretch', marginRight: 14 },
  trackIcon:    { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  trackRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  trackName:    { color: C.text, fontWeight: '600', fontSize: 14 },
  levelPill:    { borderRadius: 7, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  levelText:    { fontSize: 11, fontWeight: '700' },
  trackMeta:    { color: C.muted, fontSize: 12, marginBottom: 8 },
  trackBarRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackBarTrack:{ flex: 1, height: 4, backgroundColor: C.border, borderRadius: 99, overflow: 'hidden' },
  trackBarFill: { height: '100%', borderRadius: 99 },
  trackPct:     { fontSize: 11, fontWeight: '700', width: 28, textAlign: 'right' },
});
