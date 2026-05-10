import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TagChip } from '../components';
import { C } from '../config/theme';

const BASE_IDEAS = [
  { id: 1, title: 'AI Code Reviewer',       desc: 'GitHub bot that reviews PRs using LLMs, suggests improvements, and explains anti-patterns.',  stack: ['Python', 'FastAPI', 'GitHub API', 'GPT-4'], difficulty: 'Intermediate', duration: '3–4 weeks', impact: 'High' },
  { id: 2, title: 'Dev Flashcard Generator', desc: 'Paste any doc or article; AI extracts key concepts into spaced-repetition flashcards.',         stack: ['React', 'Node.js', 'OpenAI', 'Supabase'],  difficulty: 'Beginner',     duration: '1–2 weeks', impact: 'Medium' },
  { id: 3, title: 'LeetCode Coach Agent',    desc: 'Conversational agent that adapts hint depth based on how close your solution approach is.',    stack: ['LangGraph', 'Next.js', 'Vercel AI'],       difficulty: 'Advanced',     duration: '4–6 weeks', impact: 'High' },
];

const EXTRA_IDEAS = [
  { id: 4, title: 'Portfolio Analyzer',      desc: 'Paste a GitHub username; AI audits repos, rates project quality, and writes a career summary.', stack: ['Python', 'GitHub API', 'Gemini'],          difficulty: 'Intermediate', duration: '2–3 weeks', impact: 'High' },
  { id: 5, title: 'Mock Interview Bot',      desc: 'WhatsApp/Telegram bot that runs timed mock interviews and gives detailed feedback.',            stack: ['Twilio', 'LangChain', 'FastAPI'],          difficulty: 'Intermediate', duration: '2–3 weeks', impact: 'High' },
];

const DIFF_COLOR: Record<string, 'primary' | 'warn' | 'accent'> = {
  Beginner: 'accent', Intermediate: 'warn', Advanced: 'primary',
};

export default function IdeasScreen() {
  const [ideas, setIdeas] = useState(BASE_IDEAS);
  const [loading, setLoading] = useState(false);

  function generateNewIdeas() {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setIdeas([...ideas, ...EXTRA_IDEAS.filter(e => !ideas.find(i => i.id === e.id))]);
      setLoading(false);
      Alert.alert('New ideas added!', '2 fresh project ideas generated based on your LLM Engineering track.');
    }, 1200);
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Project Ideas</Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={C.muted} />
          </TouchableOpacity>
        </View>
        <Text style={s.sub}>AI-generated based on your learning track</Text>

        <TouchableOpacity style={[s.regenBtn, loading && s.regenDisabled]} activeOpacity={0.75} onPress={generateNewIdeas}>
          <Ionicons name={loading ? 'hourglass-outline' : 'refresh'} size={16} color={C.primary} />
          <Text style={s.regenText}>{loading ? 'Generating…' : 'Generate New Ideas'}</Text>
        </TouchableOpacity>

        <View style={{ gap: 16, paddingBottom: 32 }}>
          {ideas.map(idea => (
            <TouchableOpacity
              key={idea.id}
              style={s.card}
              activeOpacity={0.85}
              onPress={() => Alert.alert(idea.title, `${idea.desc}\n\nEstimated time: ${idea.duration}\nResume impact: ${idea.impact}`)}
            >
              <View style={s.cardHeader}>
                <Text style={s.ideaTitle}>{idea.title}</Text>
                <TagChip label={idea.difficulty} color={DIFF_COLOR[idea.difficulty]} />
              </View>
              <Text style={s.ideaDesc}>{idea.desc}</Text>
              <View style={s.stackRow}>
                {idea.stack.map(tech => <TagChip key={tech} label={tech} color="default" />)}
              </View>
              <View style={s.footer}>
                <View style={s.meta}>
                  <Ionicons name="time-outline" size={13} color={C.muted} />
                  <Text style={s.metaText}>{idea.duration}</Text>
                </View>
                <View style={s.meta}>
                  <Ionicons name="trending-up-outline" size={13} color={C.muted} />
                  <Text style={s.metaText}>Resume impact: {idea.impact}</Text>
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
  safe:        { flex: 1, backgroundColor: C.bg },
  scroll:      { flex: 1, paddingHorizontal: 16 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  title:       { color: C.text, fontSize: 24, fontWeight: '700' },
  sub:         { color: C.sub, fontSize: 13, marginTop: 4, marginBottom: 20 },
  regenBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.primary + '18', borderWidth: 1, borderColor: C.primary + '40', borderRadius: 16, paddingVertical: 14, marginBottom: 20 },
  regenDisabled:{ opacity: 0.6 },
  regenText:   { color: C.primary, fontWeight: '600', fontSize: 14 },
  card:        { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 20 },
  cardHeader:  { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  ideaTitle:   { color: C.text, fontWeight: '700', fontSize: 16, flex: 1, marginRight: 12 },
  ideaDesc:    { color: C.muted, fontSize: 13, lineHeight: 20, marginBottom: 14 },
  stackRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer:      { flexDirection: 'row', gap: 20, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.border },
  meta:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:    { color: C.muted, fontSize: 12 },
});
