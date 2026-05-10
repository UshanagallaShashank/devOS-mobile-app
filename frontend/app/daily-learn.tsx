import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';
import { ENV } from '../config/env';
import { C, glow } from '../config/theme';
import { DAILY_CONCEPTS, CAT_META } from '../services/learn-data';

type Explanation = {
  analogy: string;
  what_it_is: string;
  how_it_works: string[];
  real_world: string;
  code_hint: string | null;
  dev_insight: string;
  remember_this: string;
};

export default function DailyLearnScreen() {
  const { conceptId } = useLocalSearchParams<{ conceptId: string }>();
  const concept = DAILY_CONCEPTS.find(c => c.id === conceptId) ?? DAILY_CONCEPTS[0];
  const meta    = CAT_META[concept.category];

  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [learned,     setLearned]     = useState(false);
  const [userId,      setUserId]      = useState('');

  const learnScale = new Animated.Value(1);
  const learnStyle = { transform: [{ scale: learnScale }] };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      // Check if already learned
      const { data } = await supabase
        .from('daily_learns')
        .select('id')
        .eq('user_id', user.id)
        .eq('concept_id', concept.id)
        .maybeSingle();
      if (data) setLearned(true);
    });
    // Auto-load explanation
    loadExplanation();
  }, []);

  async function loadExplanation() {
    setLoading(true);
    try {
      const res = await fetch(`${ENV.API_URL}/api/v1/learn/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: concept.title, category: concept.category }),
      });
      const data = await res.json();
      setExplanation(data);
    } catch {
      Alert.alert('Error', 'Could not load explanation. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  async function markLearned() {
    if (learned || !userId) return;
    Animated.sequence([
      Animated.spring(learnScale, { toValue: 1.12, damping: 4, useNativeDriver: true }),
      Animated.spring(learnScale, { toValue: 1, damping: 10, useNativeDriver: true }),
    ]).start();
    setLearned(true);
    try {
      await supabase.from('daily_learns').upsert({
        user_id:       userId,
        concept_id:    concept.id,
        concept_title: concept.title,
        category:      concept.category,
        learned_at:    new Date().toISOString().split('T')[0],
      }, { onConflict: 'user_id,concept_id' });
    } catch {
      setLearned(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Animated gradient header */}
      <LinearGradient
        colors={[concept.color + '35', concept.color + '12', C.bg]}
        style={s.headerGrad}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </TouchableOpacity>
          <View style={[s.catBadge, { backgroundColor: concept.color + '25', borderColor: concept.color + '50' }]}>
            <Ionicons name={meta.icon as any} size={12} color={concept.color} />
            <Text style={[s.catBadgeText, { color: concept.color }]}>{concept.category}</Text>
          </View>
          <TouchableOpacity style={s.refreshBtn} onPress={loadExplanation} activeOpacity={0.7} disabled={loading}>
            <Ionicons name="refresh-outline" size={18} color={C.muted} />
          </TouchableOpacity>
        </View>

        <Text style={s.title}>
          {concept.title}
        </Text>
        <Text style={s.tagline}>
          {concept.tagline}
        </Text>
      </LinearGradient>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {loading && (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color={concept.color} />
            <Text style={s.loadingText}>Generating explanation…</Text>
          </View>
        )}

        {!loading && explanation && (
          <>
            {/* Analogy — the hook */}
            <View style={[s.analogyCard, { borderColor: concept.color + '50', backgroundColor: concept.color + '12' }]}>
              <View style={s.analogyHeader}>
                <View style={[s.iconBox, { backgroundColor: concept.color + '30' }]}>
                  <Ionicons name="bulb" size={16} color={concept.color} />
                </View>
                <Text style={[s.cardLabel, { color: concept.color }]}>THINK OF IT LIKE…</Text>
              </View>
              <Text style={s.analogyText}>{explanation.analogy}</Text>
            </View>

            {/* What it is */}
            <View style={s.card}>
              <View style={s.cardHeaderRow}>
                <View style={[s.iconBox, { backgroundColor: C.primary + '20' }]}>
                  <Ionicons name="information-circle-outline" size={16} color={C.primary} />
                </View>
                <Text style={s.cardTitle}>What It Is</Text>
              </View>
              <Text style={s.cardText}>{explanation.what_it_is}</Text>
            </View>

            {/* How it works */}
            <View style={s.card}>
              <View style={s.cardHeaderRow}>
                <View style={[s.iconBox, { backgroundColor: C.accent + '20' }]}>
                  <Ionicons name="layers-outline" size={16} color={C.accent} />
                </View>
                <Text style={s.cardTitle}>How It Works</Text>
              </View>
              {explanation.how_it_works.map((step, i) => (
                <View key={i} style={s.stepRow}>
                  <View style={[s.stepNum, { backgroundColor: concept.color + '25' }]}>
                    <Text style={[s.stepNumText, { color: concept.color }]}>{i + 1}</Text>
                  </View>
                  <Text style={s.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            {/* Real world */}
            <View style={s.card}>
              <View style={s.cardHeaderRow}>
                <View style={[s.iconBox, { backgroundColor: C.warn + '20' }]}>
                  <Ionicons name="globe-outline" size={16} color={C.warn} />
                </View>
                <Text style={s.cardTitle}>Real World</Text>
              </View>
              <Text style={s.cardText}>{explanation.real_world}</Text>
            </View>

            {/* Code hint */}
            {explanation.code_hint && (
              <View style={s.codeCard}>
                <View style={s.cardHeaderRow}>
                  <View style={[s.iconBox, { backgroundColor: C.purple + '20' }]}>
                    <Ionicons name="code-slash-outline" size={16} color={C.purple} />
                  </View>
                  <Text style={[s.cardTitle, { color: C.purple }]}>Code Glimpse</Text>
                </View>
                <Text style={s.codeText}>{explanation.code_hint}</Text>
              </View>
            )}

            {/* Dev insight */}
            <View style={[s.insightCard, { borderColor: C.pink + '50', backgroundColor: C.pink + '10' }]}>
              <View style={s.cardHeaderRow}>
                <View style={[s.iconBox, { backgroundColor: C.pink + '25' }]}>
                  <Ionicons name="star-outline" size={16} color={C.pink} />
                </View>
                <Text style={[s.cardTitle, { color: C.pink }]}>Senior Dev Insight</Text>
              </View>
              <Text style={s.cardText}>{explanation.dev_insight}</Text>
            </View>

            {/* Remember this */}
            <View style={[s.rememberCard, { borderColor: concept.color + '60', backgroundColor: concept.color + '15' }]}>
              <Ionicons name="bookmark" size={16} color={concept.color} />
              <Text style={[s.rememberText, { color: concept.color }]}>{explanation.remember_this}</Text>
            </View>
          </>
        )}

        {/* Mark as learned */}
        {!loading && explanation && (
          <View style={s.learnWrap}>
            <Animated.View style={learnStyle}>
              <TouchableOpacity
                style={[
                  s.learnBtn,
                  learned
                    ? { backgroundColor: C.accent + '20', borderColor: C.accent + '50' }
                    : { backgroundColor: concept.color, ...glow(concept.color, 0.4) },
                ]}
                onPress={markLearned}
                activeOpacity={0.85}
                disabled={learned}
              >
                <Ionicons
                  name={learned ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={20}
                  color={learned ? C.accent : '#fff'}
                />
                <Text style={[s.learnBtnText, learned && { color: C.accent }]}>
                  {learned ? 'Learned today!' : 'Mark as Learned'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={s.askBtn} onPress={() => router.push('/chat')} activeOpacity={0.8}>
              <Ionicons name="chatbubble-ellipses-outline" size={15} color={C.sub} />
              <Text style={s.askBtnText}>Ask DevOS AI more about this</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.bg },
  headerGrad:    { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  headerRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  backBtn:       { width: 36, height: 36, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  catBadge:      { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, flex: 1 },
  catBadgeText:  { fontSize: 12, fontWeight: '700' },
  refreshBtn:    { width: 36, height: 36, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  title:         { color: C.text, fontSize: 28, fontWeight: '800', marginBottom: 6 },
  tagline:       { color: C.sub, fontSize: 14, lineHeight: 20 },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 48 },
  loadingBox:    { alignItems: 'center', paddingVertical: 60, gap: 14 },
  loadingText:   { color: C.sub, fontSize: 14 },
  analogyCard:   { borderWidth: 1, borderRadius: 18, padding: 16, gap: 10 },
  analogyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLabel:     { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  analogyText:   { color: C.text, fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  card:          { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 16, gap: 12 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox:       { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cardTitle:     { color: C.text, fontWeight: '700', fontSize: 15 },
  cardText:      { color: C.sub, fontSize: 14, lineHeight: 21 },
  stepRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNum:       { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumText:   { fontSize: 12, fontWeight: '800' },
  stepText:      { flex: 1, color: C.sub, fontSize: 14, lineHeight: 21 },
  codeCard:      { backgroundColor: '#0A0A14', borderWidth: 1, borderColor: C.purple + '40', borderRadius: 18, padding: 16, gap: 12 },
  codeText:      { color: '#A5B4FC', fontSize: 13, fontFamily: 'monospace', lineHeight: 20 },
  insightCard:   { borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
  rememberCard:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: 16, padding: 14 },
  rememberText:  { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  learnWrap:     { gap: 10, marginTop: 8 },
  learnBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'transparent', borderRadius: 16, paddingVertical: 16 },
  learnBtnText:  { color: '#fff', fontWeight: '800', fontSize: 16 },
  askBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  askBtnText:    { color: C.muted, fontSize: 13 },
});
