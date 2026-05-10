import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ProgressBar } from '../components';
import { C } from '../config/theme';

type Lesson = { id: number; title: string; duration: string; done: boolean };
type Module = { id: number; title: string; lessons: Lesson[] };

const CONTENT: Record<string, { sub: string; color: string; modules: Module[] }> = {
  default: {
    sub: 'AI-curated learning path',
    color: C.primary,
    modules: [
      { id: 1, title: 'Module 1 · Foundations', lessons: [
        { id: 1, title: 'What are LLMs?',              duration: '8 min',  done: true  },
        { id: 2, title: 'Tokenization & Embeddings',   duration: '12 min', done: true  },
        { id: 3, title: 'Prompt Engineering Basics',   duration: '15 min', done: true  },
        { id: 4, title: 'Temperature & Parameters',    duration: '10 min', done: true  },
      ]},
      { id: 2, title: 'Module 2 · RAG', lessons: [
        { id: 5, title: 'Vector Databases Explained',  duration: '14 min', done: true  },
        { id: 6, title: 'Embedding Models Deep Dive',  duration: '18 min', done: true  },
        { id: 7, title: 'Retrieval Strategies',        duration: '12 min', done: false },
        { id: 8, title: 'Chunking & Indexing',         duration: '10 min', done: false },
      ]},
      { id: 3, title: 'Module 3 · Agents  ← You are here', lessons: [
        { id: 9,  title: 'Agent Architectures',        duration: '16 min', done: false },
        { id: 10, title: 'Tool Use & Function Calling',duration: '20 min', done: false },
        { id: 11, title: 'LangGraph Basics',           duration: '22 min', done: false },
        { id: 12, title: 'Build a Simple Agent',       duration: '30 min', done: false },
      ]},
      { id: 4, title: 'Module 4 · Fine-tuning', lessons: [
        { id: 13, title: 'When to Fine-tune',          duration: '8 min',  done: false },
        { id: 14, title: 'LoRA & QLoRA Explained',     duration: '18 min', done: false },
        { id: 15, title: 'Dataset Preparation',        duration: '14 min', done: false },
        { id: 16, title: 'Evaluation & Benchmarks',    duration: '12 min', done: false },
      ]},
    ],
  },
};

export default function TrackScreen() {
  const { title = 'Track', progress = '0' } = useLocalSearchParams<{ title: string; progress: string }>();
  const data = CONTENT['default'];
  const allLessons = data.modules.flatMap(m => m.lessons);
  const doneLessons = allLessons.filter(l => l.done).length;
  const pct = Math.round((doneLessons / allLessons.length) * 100);
  const [expanded, setExpanded] = useState<number[]>([3]);

  function toggleModule(id: number) {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.headerWrap}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.back}>
            <Ionicons name="close" size={24} color={C.muted} />
          </TouchableOpacity>
          <Text style={s.title}>{title}</Text>
          <Text style={s.sub}>{data.sub}</Text>
          <View style={{ marginTop: 16 }}>
            <ProgressBar label={`${doneLessons} of ${allLessons.length} lessons complete`} value={pct} color={C.primary} />
          </View>
        </View>

        <View style={s.body}>
          {data.modules.map(mod => {
            const open = expanded.includes(mod.id);
            const modDone = mod.lessons.filter(l => l.done).length;
            return (
              <View key={mod.id} style={s.module}>
                <TouchableOpacity style={s.moduleHeader} activeOpacity={0.75} onPress={() => toggleModule(mod.id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.moduleName}>{mod.title}</Text>
                    <Text style={s.moduleMeta}>{modDone}/{mod.lessons.length} done</Text>
                  </View>
                  <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} />
                </TouchableOpacity>
                {open && mod.lessons.map((lesson, i) => (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[s.lesson, i < mod.lessons.length - 1 && s.lessonBorder]}
                    activeOpacity={0.75}
                    onPress={() => router.push({ pathname: '/lesson', params: { title: lesson.title, track: title as string } })}
                  >
                    <View style={[s.lessonDot, lesson.done && s.lessonDotDone]}>
                      {lesson.done
                        ? <Ionicons name="checkmark" size={11} color={C.bg} />
                        : <View style={s.innerDot} />
                      }
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.lessonTitle, lesson.done && s.lessonTitleDone]}>{lesson.title}</Text>
                      <Text style={s.lessonDur}>{lesson.duration}</Text>
                    </View>
                    {!lesson.done && <Ionicons name="play-circle-outline" size={22} color={C.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.bg },
  headerWrap:     { backgroundColor: C.surface, padding: 20, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  back:           { alignSelf: 'flex-end', marginBottom: 12 },
  title:          { color: C.text, fontSize: 26, fontWeight: '700' },
  sub:            { color: C.sub, fontSize: 13, marginTop: 4 },
  body:           { padding: 16, gap: 12, paddingBottom: 40 },
  module:         { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, overflow: 'hidden' },
  moduleHeader:   { flexDirection: 'row', alignItems: 'center', padding: 16 },
  moduleName:     { color: C.text, fontWeight: '600', fontSize: 14 },
  moduleMeta:     { color: C.muted, fontSize: 12, marginTop: 2 },
  lesson:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  lessonBorder:   { borderTopWidth: 1, borderTopColor: C.border },
  lessonDot:      { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.muted, alignItems: 'center', justifyContent: 'center' },
  lessonDotDone:  { backgroundColor: C.accent, borderColor: C.accent },
  innerDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: C.muted },
  lessonTitle:    { color: C.text, fontSize: 14, fontWeight: '500' },
  lessonTitleDone:{ color: C.muted, textDecorationLine: 'line-through' },
  lessonDur:      { color: C.muted, fontSize: 12, marginTop: 2 },
});
