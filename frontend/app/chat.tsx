import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';
import { fetchProfile } from '../services/db';
import { ENV } from '../config/env';
import { C, glow } from '../config/theme';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

const WELCOME: Message = {
  id: '0',
  role: 'assistant',
  content: "Hi! I'm DevOS AI 👋\n\nAsk me anything — DSA help, interview prep, career advice, code review, or say \"plan my day\" for a time-blocked schedule.",
};

const STARTERS = [
  { label: 'Plan my day', icon: 'calendar-outline' as const },
  { label: 'Review my resume', icon: 'document-text-outline' as const },
  { label: 'Explain Two Pointers', icon: 'code-slash-outline' as const },
  { label: 'FAANG prep roadmap', icon: 'trending-up-outline' as const },
];

function PulsingDot() {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[s.headerDot, { opacity: anim }]} />;
}

function AnimatedBubble({ item, index }: { item: Message; index: number }) {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);
  const isUser = item.role === 'user';
  return (
    <Animated.View style={[s.msgRow, isUser && s.msgRowUser, { opacity: fade, transform: [{ translateY: slide }] }]}>
      {!isUser && (
        <LinearGradient colors={[C.primary + '40', C.purple + '30']} style={s.aiAvatar}>
          <Ionicons name="sparkles" size={13} color={C.primary} />
        </LinearGradient>
      )}
      <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAI]}>
        <Text style={[s.bubbleText, isUser && s.bubbleTextUser]}>{item.content}</Text>
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [context, setContext]   = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const p = await fetchProfile(user.id);
      if (!p) return;
      const parts = [
        p.full_name      ? `Name: ${p.full_name}`                             : null,
        p.career_goal    ? `Goal: ${p.career_goal}`                           : null,
        p.experience_years != null ? `Experience: ${p.experience_years} years` : null,
        p.primary_stack?.length ? `Stack: ${p.primary_stack.join(', ')}`      : null,
        p.leetcode_username ? `LeetCode: ${p.leetcode_username}`               : null,
        p.github_url     ? `GitHub: ${p.github_url}`                          : null,
        p.linkedin_url   ? `LinkedIn: ${p.linkedin_url}`                      : null,
      ].filter(Boolean);
      setContext(parts.join('\n'));
    });
  }, []);

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const res = await fetch(`${ENV.API_URL}/api/v1/chat/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          context,
        }),
      });
      const data = await res.json();
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: "Couldn't reach the backend. Check your connection." }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, messages, loading, context]);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={C.muted} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <PulsingDot />
            <Text style={s.headerTitle}>DevOS AI</Text>
          </View>
          <View style={s.headerRight}>
            <TouchableOpacity
              style={s.planBtn}
              activeOpacity={0.8}
              onPress={() => send('Plan my day')}
            >
              <Ionicons name="calendar-outline" size={14} color={C.accent} />
              <Text style={s.planBtnText}>Plan Day</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={({ item, index }) => <AnimatedBubble item={item} index={index} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={loading ? (
            <View style={s.msgRow}>
              <LinearGradient colors={[C.primary + '40', C.purple + '30']} style={s.aiAvatar}>
                <Ionicons name="sparkles" size={13} color={C.primary} />
              </LinearGradient>
              <View style={[s.bubbleAI, s.typingBubble]}>
                <ActivityIndicator size="small" color={C.primary} />
              </View>
            </View>
          ) : null}
        />

        {/* Starter chips */}
        {messages.length === 1 && (
          <View style={s.starters}>
            {STARTERS.map(q => (
              <TouchableOpacity key={q.label} style={s.starter} activeOpacity={0.75} onPress={() => send(q.label)}>
                <Ionicons name={q.icon} size={13} color={C.sub} />
                <Text style={s.starterText}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input bar */}
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything…"
            placeholderTextColor={C.muted}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled, glow(C.primary, 0.3)]}
            onPress={() => send()}
            disabled={!input.trim() || loading}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: C.bg },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn:         { width: 36, height: 36, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  headerCenter:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent },
  headerTitle:     { color: C.text, fontWeight: '700', fontSize: 16 },
  headerRight:     { width: 80, alignItems: 'flex-end' },
  planBtn:         { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.accent + '18', borderWidth: 1, borderColor: C.accent + '40', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  planBtnText:     { color: C.accent, fontSize: 12, fontWeight: '700' },
  list:            { padding: 16, gap: 12, paddingBottom: 8 },
  msgRow:          { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser:      { flexDirection: 'row-reverse' },
  aiAvatar:        { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  bubble:          { maxWidth: '80%', borderRadius: 18, padding: 13 },
  bubbleUser:      { backgroundColor: C.primary, borderBottomRightRadius: 5 },
  bubbleAI:        { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderBottomLeftRadius: 5 },
  typingBubble:    { paddingHorizontal: 18, paddingVertical: 14 },
  bubbleText:      { color: C.text, fontSize: 14, lineHeight: 21 },
  bubbleTextUser:  { color: '#fff' },
  starters:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  starter:         { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  starterText:     { color: C.sub, fontSize: 12 },
  inputBar:        { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bg },
  input:           { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11, color: C.text, fontSize: 14, maxHeight: 120 },
  sendBtn:         { width: 42, height: 42, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: C.muted, opacity: 0.4 },
});
