import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { C, glow } from '../../config/theme';

const TRACKS = [
  { id: 1, title: 'LLM Engineering', topics: 24, weeks: 8, level: 'Intermediate', color: C.primary,  icon: 'hardware-chip-outline',  progress: 35 },
  { id: 2, title: 'System Design',   topics: 18, weeks: 6, level: 'Advanced',     color: C.purple,   icon: 'git-branch-outline',     progress: 10 },
  { id: 3, title: 'React Native',    topics: 16, weeks: 5, level: 'Beginner',     color: C.accent,   icon: 'phone-portrait-outline', progress: 60 },
  { id: 4, title: 'Python & APIs',   topics: 20, weeks: 6, level: 'Beginner',     color: C.warn,     icon: 'terminal-outline',       progress: 80 },
];

const LEVEL_COLOR: Record<string, string> = {
  Beginner: C.accent, Intermediate: C.warn, Advanced: C.danger,
};

function openTrack(title: string, progress: number) {
  router.push({ pathname: '/track', params: { title, progress: String(progress) } });
}

export default function LearnScreen() {
  const [active, setActive] = useState<number | null>(null);
  const featured = TRACKS[0];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Learn</Text>
          <Text style={s.sub}>AI-curated tracks for your growth</Text>
        </View>

        {/* Featured track */}
        <TouchableOpacity style={[s.featured, glow(featured.color, 0.2)]} activeOpacity={0.85} onPress={() => openTrack(featured.title, featured.progress)}>
          <View style={[s.featuredStrip, { backgroundColor: featured.color }]} />
          <View style={s.featuredBody}>
            <View style={s.featuredTop}>
              <View style={[s.featuredIcon, { backgroundColor: featured.color + '25' }]}>
                <Ionicons name={featured.icon as any} size={22} color={featured.color} />
              </View>
              <View style={[s.inProgressPill, { backgroundColor: featured.color + '20', borderColor: featured.color + '50' }]}>
                <View style={[s.inProgressDot, { backgroundColor: featured.color }]} />
                <Text style={[s.inProgressText, { color: featured.color }]}>In Progress · Week 3/8</Text>
              </View>
            </View>

            <Text style={s.featuredTitle}>{featured.title}</Text>
            <Text style={s.featuredSub}>Prompting → RAG → Agents → Fine-tuning</Text>

            {/* Progress bar */}
            <View style={s.barWrap}>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${featured.progress}%` as any, backgroundColor: featured.color }]} />
              </View>
              <Text style={[s.barPct, { color: featured.color }]}>{featured.progress}%</Text>
            </View>

            <View style={[s.continueBtn, { backgroundColor: featured.color }]}>
              <Text style={s.continueBtnText}>Continue Learning</Text>
              <Ionicons name="arrow-forward" size={15} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* All Tracks */}
        <Text style={s.section}>All Tracks</Text>
        <View style={{ gap: 12, paddingBottom: 32 }}>
          {TRACKS.map(track => (
            <TouchableOpacity
              key={track.id}
              style={[s.trackCard, active === track.id && { borderColor: track.color + '60' }]}
              activeOpacity={0.75}
              onPress={() => { setActive(track.id); openTrack(track.title, track.progress); }}
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

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.bg },
  scroll:         { flex: 1, paddingHorizontal: 16 },
  header:         { marginTop: 16, marginBottom: 20 },
  title:          { color: C.text, fontSize: 24, fontWeight: '700' },
  sub:            { color: C.sub, fontSize: 13, marginTop: 4 },
  featured:       { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 22, overflow: 'hidden', marginBottom: 8, flexDirection: 'row' },
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
  section:        { color: C.text, fontWeight: '700', fontSize: 16, marginTop: 20, marginBottom: 12 },
  trackCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, overflow: 'hidden', paddingRight: 16, paddingVertical: 14 },
  trackStrip:     { width: 4, alignSelf: 'stretch', marginRight: 14 },
  trackIcon:      { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  trackRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  trackName:      { color: C.text, fontWeight: '600', fontSize: 14 },
  levelPill:      { borderRadius: 7, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  levelText:      { fontSize: 11, fontWeight: '700' },
  trackMeta:      { color: C.muted, fontSize: 12, marginBottom: 8 },
  trackBarRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackBarTrack:  { flex: 1, height: 4, backgroundColor: C.border, borderRadius: 99, overflow: 'hidden' },
  trackBarFill:   { height: '100%', borderRadius: 99 },
  trackPct:       { fontSize: 11, fontWeight: '700', width: 28, textAlign: 'right' },
});
