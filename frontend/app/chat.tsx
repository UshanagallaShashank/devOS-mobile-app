import { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ENV } from '../config/env';
import { C, glow } from '../config/theme';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

const WELCOME: Message = {
  id: '0',
  role: 'assistant',
  content: "Hi! I'm DevOS AI 👋\n\nAsk me anything — programming concepts, interview prep, career advice, code help, or just how something works. I'll explain it simply for any level.",
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const res = await fetch(`${ENV.API_URL}/api/v1/chat/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Sorry, couldn't reach the backend. Make sure it's running." };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, messages, loading]);

  function renderMsg({ item }: { item: Message }) {
    const isUser = item.role === 'user';
    return (
      <View style={[s.msgRow, isUser && s.msgRowUser]}>
        {!isUser && (
          <View style={s.aiAvatar}>
            <Ionicons name="sparkles" size={14} color={C.primary} />
          </View>
        )}
        <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAI, glow(isUser ? C.primary : C.surface, 0.08)]}>
          <Text style={[s.bubbleText, isUser && s.bubbleTextUser]}>{item.content}</Text>
        </View>
      </View>
    );
  }

  const STARTERS = ['Explain React hooks simply', 'How to prepare for FAANG?', 'What is RAG in AI?', 'Review my career plan'];

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={C.muted} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <View style={s.headerDot} />
            <Text style={s.headerTitle}>DevOS AI</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={renderMsg}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={loading
            ? <View style={[s.msgRow]}><View style={s.aiAvatar}><Ionicons name="sparkles" size={14} color={C.primary} /></View><View style={s.bubbleAI}><ActivityIndicator size="small" color={C.primary} /></View></View>
            : null
          }
        />

        {/* Starter chips — only show when no conversation yet */}
        {messages.length === 1 && (
          <View style={s.starters}>
            {STARTERS.map(q => (
              <TouchableOpacity key={q} style={s.starter} activeOpacity={0.75} onPress={() => { setInput(q); }}>
                <Text style={s.starterText}>{q}</Text>
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
            onSubmitEditing={send}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled, glow(C.primary, 0.3)]}
            onPress={send}
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
  safe:           { flex: 1, backgroundColor: C.bg },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  headerCenter:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent },
  headerTitle:    { color: C.text, fontWeight: '700', fontSize: 16 },
  list:           { padding: 16, gap: 12, paddingBottom: 8 },
  msgRow:         { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser:     { flexDirection: 'row-reverse' },
  aiAvatar:       { width: 28, height: 28, borderRadius: 10, backgroundColor: C.primary + '20', borderWidth: 1, borderColor: C.primary + '40', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  bubble:         { maxWidth: '80%', borderRadius: 18, padding: 13 },
  bubbleUser:     { backgroundColor: C.primary, borderBottomRightRadius: 5 },
  bubbleAI:       { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderBottomLeftRadius: 5 },
  bubbleText:     { color: C.text, fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  starters:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  starter:        { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  starterText:    { color: C.sub, fontSize: 12 },
  inputBar:       { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.border },
  input:          { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11, color: C.text, fontSize: 14, maxHeight: 120 },
  sendBtn:        { width: 40, height: 40, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled:{ backgroundColor: C.muted, opacity: 0.4 },
});
