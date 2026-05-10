import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { supabase } from '../../services/supabase';
import { C, glow } from '../../config/theme';
import { getTodaysConcept, getThisWeekConcepts, CAT_META, type DailyConcept } from '../../services/learn-data';

const TRACKS = [
  { id: 1, title: 'LLM Engineering', topics: 24, weeks: 8, level: 'Intermediate', color: C.primary,  icon: 'hardware-chip-outline',  progress: 35 },
  { id: 2, title: 'System Design',   topics: 18, weeks: 6, level: 'Advanced',     color: C.purple,   icon: 'git-branch-outline',     progress: 10 },
  { id: 3, title: 'React Native',    topics: 16, weeks: 5, level: 'Beginner',     color: C.accent,   icon: 'phone-portrait-outline', progress: 60 },
  { id: 4, title: 'Python & APIs',   topics: 20, weeks: 6, level: 'Beginner',     color: C.warn,     icon: 'terminal-outline',       progress: 80 },
];

const LEVEL_COLOR: Record<string, string> = {
  Beginner: C.accent, Intermediate: C.warn, Advanced: C.danger,
};

const TODAY   = getTodaysConcept();
const WEEK    = getThisWeekConcepts();

export default function LearnScreen() {
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from('daily_learns')
        .select('concept_id')
        .eq('user_id', user.id);
      if (data) setLearnedIds(new Set(data.map(r => r.concept_id)));
    });
  }, []);

  function openConcept(concept: DailyConcept) {
    router.push({ pathname: '/daily-learn' as any, params: { conceptId: concept.id } });
  }

  function openTrack(title: string, progress: number) {
    router.push({ pathname: '/track', params: { title, progress: String(progress) } });
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(350)} style={s.header}>
          <Text style={s.title}>Learn</Text>
          <Text style={s.sub}>Daily concepts · AI-curated tracks</Text>
        </Animated.View>

        {/* Today's concept — hero card */}
        <Animated.View entering={FadeInDown.delay(60).duration(400)}>
          <TouchableOpacity activeOpacity={0.88} onPress={() => openConcept(TODAY)}>
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
        </Animated.View>

        {/* This week */}
        <Animated.View entering={FadeInDown.delay(120).duration(350)}>
          <Text style={s.sectionLabel}>THIS WEEK</Text>
        </Animated.View>

        <View style={s.weekRow}>
          {WEEK.map((concept, i) => {
            const isToday   = concept.id === TODAY.id;
            const isLearned = learnedIds.has(concept.id);
            const dayNames  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const dayIndex  = (Math.floor(Date.now() / 86400000) - 6 + i) % 7;
            return (
              <Animated.View key={concept.id} entering={FadeInRight.delay(i * 50).duration(300)}>
                <TouchableOpacity
                  style={[
                    s.weekCard,
                    isToday  && { borderColor: concept.color + '60', backgroundColor: concept.color + '12' },
                    isLearned && { opacity: 0.85 },
                  ]}
                  onPress={() => openConcept(concept)}
                  activeOpacity={0.8}
                >
                  <View style={[s.weekDot, { backgroundColor: concept.color + (isLearned ? 'FF' : '40') }]}>
                    {isLearned
                      ? <Ionicons name="checkmark" size={10} color="#fff" />
                      : <View style={[s.weekDotInner, { backgroundColor: concept.color }]} />
                    }
                  </View>
                  <Text style={[s.weekDay, isToday && { color: concept.color }]}>
                    {isToday ? 'Today' : dayNames[dayIndex]}
                  </Text>
                  <Text style={s.weekTitle} numberOfLines={2}>{concept.title}</Text>
                  <View style={[s.weekCat, { backgroundColor: concept.color + '20' }]}>
                    <Text style={[s.weekCatText, { color: concept.color }]}>
                      {concept.category.split(' ')[0]}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Learning tracks */}
        <Animated.View entering={FadeInDown.delay(200).duration(350)}>
          <Text style={s.sectionLabel}>LEARNING TRACKS</Text>
        </Animated.View>

        {/* Featured track */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <TouchableOpacity style={[s.featured, glow(TRACKS[0].color, 0.2)]} activeOpacity={0.85} onPress={() => openTrack(TRACKS[0].title, TRACKS[0].progress)}>
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
        </Animated.View>

        <View style={{ gap: 12, paddingBottom: 32 }}>
          {TRACKS.slice(1).map((track, i) => (
            <Animated.View key={track.id} entering={FadeInDown.delay(280 + i * 60).duration(350)}>
              <TouchableOpacity
                style={s.trackCard}
                activeOpacity={0.75}
                onPress={() => openTrack(track.title, track.progress)}
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
            </Animated.View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1, paddingHorizontal: 16 },
  content: { paddingBottom: 32 },
  header:  { marginTop: 16, marginBottom: 20 },
  title:   { color: C.text, fontSize: 24, fontWeight: '700' },
  sub:     { color: C.sub, fontSize: 13, marginTop: 4 },

  // Hero concept card
  heroCard:    { borderWidth: 1, borderColor: '#ffffff12', borderRadius: 22, padding: 18, marginBottom: 24 },
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

  // Section label
  sectionLabel: { color: C.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },

  // Week row
  weekRow:  { flexDirection: 'row', gap: 8, marginBottom: 28 },
  weekCard: { width: 80, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 10, gap: 6, alignItems: 'center' },
  weekDot:  { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  weekDotInner: { width: 8, height: 8, borderRadius: 4 },
  weekDay:  { color: C.muted, fontSize: 10, fontWeight: '700' },
  weekTitle:{ color: C.text, fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 15 },
  weekCat:  { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  weekCatText: { fontSize: 9, fontWeight: '800' },

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
