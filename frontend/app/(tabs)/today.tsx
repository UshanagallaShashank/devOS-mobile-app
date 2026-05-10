import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../services/supabase';
import { fetchStreak, fetchTodayTasks, toggleTask, deleteTask, replaceOpenTasks, fetchProfile, addTasks, type Task } from '../../services/db';
import { useFocusEffect } from 'expo-router';
import { ENV } from '../../config/env';
import { C, TAG_COLORS, glow } from '../../config/theme';
import { getTodaysConcept } from '../../services/learn-data';
import { setupNotificationHandler, requestNotificationPermission, scheduleAllTaskNotifications, cancelTaskNotification, notifyTasksReady } from '../../services/notifications';
import { PROBLEMS, CAT_COLOR, DIFF_COLOR } from '../../services/dsa-data';

const ALL_PROBLEMS = Object.entries(PROBLEMS).flatMap(([cat, probs]) => probs.map(p => ({ ...p, category: cat })));
const DAY_IDX      = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000);
const DSA_TODAY    = ALL_PROBLEMS[DAY_IDX % ALL_PROBLEMS.length];

const DATE    = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const CONCEPT = getTodaysConcept();

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayScreen() {
  const [streak, setStreak]         = useState(0);
  const [tasks, setTasks]           = useState<Task[]>([]);
  const [firstName, setFirstName]   = useState('');
  const [lcSolved, setLcSolved]     = useState<number | null>(null);
  const [generating, setGenerating]   = useState(false);
  const [userId, setUserId]           = useState('');
  const [profile, setProfile]         = useState<{ stack: string[]; goal: string; experience: string } | null>(null);
  const [learnedCount, setLearnedCount] = useState(0);

  useEffect(() => {
    setupNotificationHandler();
    requestNotificationPermission();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
    });
  }, []);

  const loadData = useCallback(async () => {
    if (!userId) return;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const [s, t, p, lc] = await Promise.all([
      fetchStreak(userId),
      fetchTodayTasks(userId),
      fetchProfile(userId),
      supabase.from('daily_learns').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('learned_at', weekStart.toISOString().split('T')[0]),
    ]);
    setStreak(s);
    setTasks(t);
    setLearnedCount(lc.count ?? 0);
    scheduleAllTaskNotifications(t);
    notifyTasksReady(t);
    if (p?.full_name) setFirstName(p.full_name.split(' ')[0]);
    if (p?.leetcode_solved != null) setLcSolved(p.leetcode_solved);
    if (p) setProfile({ stack: p.primary_stack ?? [], goal: p.career_goal ?? '', experience: p.experience_years != null ? String(p.experience_years) : '' });
  }, [userId]);

  useEffect(() => { if (userId) loadData(); }, [userId, loadData]);
  useFocusEffect(useCallback(() => { if (userId) loadData(); }, [userId, loadData]));

  async function handleToggle(task: Task) {
    const updated = !task.done;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: updated } : t));
    if (updated) cancelTaskNotification(task.id);
    try { await toggleTask(task.id, updated); }
    catch { setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: task.done } : t)); }
  }

  async function handleDelete(taskId: string) {
    Alert.alert('Delete task', 'Remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const prev = tasks;
          setTasks(p => p.filter(t => t.id !== taskId));
          cancelTaskNotification(taskId);
          try { await deleteTask(taskId); }
          catch { setTasks(prev); }
        },
      },
    ]);
  }

  async function generateAITasks() {
    if (!userId || generating) return;
    setGenerating(true);
    try {
      const res = await fetch(`${ENV.API_URL}/api/v1/tasks/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stack: profile?.stack ?? [], goal: profile?.goal ?? '', experience: profile?.experience ?? '', existing_tasks: tasks.map(t => ({ label: t.label, tag: t.tag, done: t.done })) }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.tasks)) throw new Error();
      if (data.tasks.length) {
        if (tasks.length > 0) await replaceOpenTasks(userId, data.tasks);
        else await addTasks(userId, data.tasks);
        const fresh = await fetchTodayTasks(userId);
        setTasks(fresh);
        notifyTasksReady(fresh);
      } else {
        Alert.alert('No tasks generated', 'Try again or add manually.');
      }
    } catch { Alert.alert('Failed', 'Could not generate tasks.'); }
    finally { setGenerating(false); }
  }

  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.date}>{DATE}</Text>
            <Text style={s.greeting}>{greeting()}{firstName ? `, ${firstName}` : ''} 👋</Text>
          </View>
          <TouchableOpacity style={s.streakBadge} onPress={() => router.push('/profile')} activeOpacity={0.8}>
            <Ionicons name="flame" size={16} color={C.warn} />
            <Text style={s.streakNum}>{streak}</Text>
            <Text style={s.streakLbl}>streak</Text>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Text style={s.statNum}>{done}<Text style={s.statSlash}>/{total}</Text></Text>
            <Text style={s.statLbl}>Tasks done</Text>
          </View>
          <View style={[s.stat, s.statMid]}>
            <Text style={[s.statNum, { color: C.primary }]}>{pct}<Text style={[s.statSlash, { color: C.muted }]}>%</Text></Text>
            <Text style={s.statLbl}>Progress</Text>
          </View>
          <View style={s.stat}>
            <Text style={[s.statNum, { color: C.accent }]}>{lcSolved ?? '—'}</Text>
            <Text style={s.statLbl}>DSA solved</Text>
          </View>
        </View>

        {/* Daily Concept Card */}
        <View>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push({ pathname: '/daily-learn' as any, params: { conceptId: CONCEPT.id } })}
          >
            <LinearGradient
              colors={[CONCEPT.color + '30', CONCEPT.color + '12', C.surface]}
              style={s.conceptCard}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <View style={s.conceptTop}>
                <View style={[s.conceptIconBox, { backgroundColor: CONCEPT.color + '30' }]}>
                  <Ionicons name={CONCEPT.icon as any} size={20} color={CONCEPT.color} />
                </View>
                <View style={[s.conceptBadge, { backgroundColor: CONCEPT.color + '20', borderColor: CONCEPT.color + '50' }]}>
                  <View style={[s.conceptDot, { backgroundColor: CONCEPT.color }]} />
                  <Text style={[s.conceptBadgeText, { color: CONCEPT.color }]}>DAILY CONCEPT</Text>
                </View>
              </View>
              <Text style={s.conceptTitle}>{CONCEPT.title}</Text>
              <Text style={s.conceptTagline}>{CONCEPT.tagline}</Text>
              <View style={s.conceptFooter}>
                <View style={[s.conceptCat, { backgroundColor: CONCEPT.color + '15' }]}>
                  <Text style={[s.conceptCatText, { color: CONCEPT.color }]}>{CONCEPT.category}</Text>
                </View>
                <View style={s.conceptCta}>
                  <Text style={[s.conceptCtaText, { color: CONCEPT.color }]}>Learn now</Text>
                  <Ionicons name="arrow-forward" size={13} color={CONCEPT.color} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tasks header */}
        <View style={s.sectionRow}>
          <Text style={s.section}>Today's Tasks</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => router.push('/add-task')} activeOpacity={0.8}>
            <Ionicons name="add" size={20} color={C.primary} />
          </TouchableOpacity>
        </View>

        {total > 0 && (
          <View style={s.actionRow}>
            <TouchableOpacity style={[s.refreshBtn, generating && s.refreshBtnDisabled]} onPress={generateAITasks} disabled={generating} activeOpacity={0.85}>
              {generating
                ? <><ActivityIndicator size="small" color={C.primary} /><Text style={s.refreshBtnText}>Regenerating…</Text></>
                : <><Ionicons name="sparkles-outline" size={14} color={C.primary} /><Text style={s.refreshBtnText}>Regenerate with AI</Text></>
              }
            </TouchableOpacity>
            {tasks.some(t => t.tag === 'Jobs') && (
              <TouchableOpacity style={[s.jobBtn, glow(C.accent, 0.18)]} onPress={() => router.push('/jobs')} activeOpacity={0.85}>
                <Text style={s.jobBtnText}>View job matches</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {total === 0 && (
          <View style={s.emptyBox}>
            <View style={s.emptyIcon}>
              <Ionicons name="sparkles-outline" size={28} color={C.primary} />
            </View>
            <Text style={s.emptyText}>No tasks yet</Text>
            <TouchableOpacity style={[s.genBtn, glow(C.primary, 0.25)]} onPress={generateAITasks} disabled={generating} activeOpacity={0.85}>
              {generating
                ? <><ActivityIndicator size="small" color="#fff" /><Text style={s.genBtnText}>Building your day…</Text></>
                : <><Ionicons name="sparkles" size={16} color="#fff" /><Text style={s.genBtnText}>Generate with AI</Text></>
              }
            </TouchableOpacity>
            <Text style={s.emptyHint}>or tap + to add manually</Text>
          </View>
        )}

        <View style={{ gap: 10 }}>
          {tasks.map((task) => {
            const tagColor = TAG_COLORS[task.tag] ?? C.sub;
            return (
              <View key={task.id} style={[s.task, task.done && s.taskDone]}>
                <View style={[s.taskStrip, { backgroundColor: tagColor }]} />
                <TouchableOpacity style={s.taskMain} onPress={() => handleToggle(task)} activeOpacity={0.7}>
                  <View style={[s.check, task.done && s.checkDone]}>
                    {task.done && <Ionicons name="checkmark" size={11} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.taskText, task.done && s.taskTextDone]}>{task.label}</Text>
                    {task.start_time ? (
                      <View style={s.taskTimeRow}>
                        <Ionicons name="time-outline" size={11} color={C.muted} />
                        <Text style={s.taskTime}>{task.start_time}{task.end_time ? ` → ${task.end_time}` : ''}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={[s.tagPill, { backgroundColor: tagColor + '20', borderColor: tagColor + '50' }]}>
                    <Text style={[s.tagText, { color: tagColor }]}>{task.tag}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={s.iconBtn} onPress={() => router.push({ pathname: '/edit-task', params: { id: task.id, label: task.label, tag: task.tag, start_time: task.start_time ?? '', end_time: task.end_time ?? '' } })}>
                  <Ionicons name="pencil-outline" size={16} color={C.muted} />
                </TouchableOpacity>
                <TouchableOpacity style={s.iconBtn} onPress={() => handleDelete(task.id)}>
                  <Ionicons name="trash-outline" size={16} color={C.muted} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* DSA Problem of the Day */}
        <TouchableOpacity style={s.dsaCard} onPress={() => router.push('/(tabs)/dsa' as any)} activeOpacity={0.85}>
          <View style={[s.dsaIcon, { backgroundColor: CAT_COLOR[DSA_TODAY.category] + '25' }]}>
            <Ionicons name="code-slash-outline" size={18} color={CAT_COLOR[DSA_TODAY.category]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.dsaLabel}>DSA PROBLEM OF THE DAY</Text>
            <Text style={s.dsaName}>{DSA_TODAY.name}</Text>
            <Text style={s.dsaCat}>{DSA_TODAY.category}</Text>
          </View>
          <View style={[s.diffPill, { backgroundColor: DIFF_COLOR[DSA_TODAY.difficulty] + '25' }]}>
            <Text style={[s.diffText, { color: DIFF_COLOR[DSA_TODAY.difficulty] }]}>{DSA_TODAY.difficulty}</Text>
          </View>
        </TouchableOpacity>

        {/* Jobs card */}
        <TouchableOpacity style={[s.jobCard, glow(C.accent, 0.15)]} onPress={() => router.push('/(tabs)/jobs' as any)} activeOpacity={0.85}>
          <LinearGradient colors={[C.accent + '30', C.primary + '15']} style={s.jobCardIcon}>
            <Ionicons name="briefcase-outline" size={20} color={C.accent} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={s.jobCardTitle}>Job Opportunities</Text>
            <Text style={s.jobCardSub}>AI-matched roles based on your stack</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={22} color={C.accent} />
        </TouchableOpacity>

        {/* AI Morning Brief banner */}
        <TouchableOpacity style={[s.banner, glow(C.primary, 0.2)]} activeOpacity={0.85} onPress={() => router.push('/news')}>
          <View style={s.bannerLeft}>
            <LinearGradient colors={[C.primary + '40', C.purple + '30']} style={s.bannerIcon}>
              <Ionicons name="sparkles" size={20} color={C.primary} />
            </LinearGradient>
            <View>
              <Text style={s.bannerTitle}>AI Morning Brief ready</Text>
              <Text style={s.bannerSub}>Latest AI news · job picks · tap to read</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={22} color={C.primary} />
        </TouchableOpacity>

        {/* Learning progress */}
        <View style={s.learnRow}>
          <View style={s.learnRowLeft}>
            <Ionicons name="school-outline" size={18} color={C.primary} />
            <Text style={s.learnRowText}>
              <Text style={s.learnRowNum}>{learnedCount}</Text> concepts learned this week
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/learn' as any)} activeOpacity={0.8}>
            <Text style={s.learnRowCta}>Learn more →</Text>
          </TouchableOpacity>
        </View>

        {/* Quick actions */}
        <View style={s.quickRow}>
          {([
            { label: 'Chat AI',  icon: 'chatbubble-ellipses-outline', route: '/chat',    color: C.primary },
            { label: 'Resume',   icon: 'document-text-outline',        route: '/resume',  color: C.accent  },
            { label: 'News',     icon: 'newspaper-outline',            route: '/news',    color: C.warn    },
            { label: 'Ideas',    icon: 'bulb-outline',                 route: '/ideas',   color: C.purple  },
          ] as const).map(q => (
            <TouchableOpacity key={q.label} style={[s.quickBtn, { borderColor: q.color + '30', backgroundColor: q.color + '10' }]} onPress={() => router.push(q.route as any)} activeOpacity={0.8}>
              <Ionicons name={q.icon as any} size={20} color={q.color} />
              <Text style={[s.quickBtnText, { color: q.color }]}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  scroll:       { flex: 1, paddingHorizontal: 16 },
  scrollContent:{ paddingBottom: 40 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 20 },
  date:         { color: C.sub, fontSize: 12, letterSpacing: 0.4 },
  greeting:     { color: C.text, fontSize: 22, fontWeight: '700', marginTop: 4 },
  streakBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.warn + '18', borderWidth: 1, borderColor: C.warn + '40', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  streakNum:    { color: C.warn, fontWeight: '800', fontSize: 15 },
  streakLbl:    { color: C.warn, fontSize: 11, opacity: 0.75 },
  statsRow:     { flexDirection: 'row', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, marginBottom: 16, overflow: 'hidden' },
  stat:         { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statMid:      { borderLeftWidth: 1, borderRightWidth: 1, borderColor: C.border },
  statNum:      { color: C.text, fontWeight: '800', fontSize: 22, lineHeight: 26 },
  statSlash:    { fontSize: 16, fontWeight: '500', color: C.muted },
  statLbl:      { color: C.muted, fontSize: 11, marginTop: 4 },

  // Daily concept card
  conceptCard:   { borderWidth: 1, borderColor: '#ffffff12', borderRadius: 22, padding: 18, marginBottom: 20 },
  conceptTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  conceptIconBox:{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  conceptBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  conceptDot:    { width: 6, height: 6, borderRadius: 3 },
  conceptBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  conceptTitle:  { color: C.text, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  conceptTagline:{ color: C.sub, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  conceptFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  conceptCat:    { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  conceptCatText:{ fontSize: 12, fontWeight: '700' },
  conceptCta:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  conceptCtaText:{ fontSize: 13, fontWeight: '700' },

  sectionRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  section:      { color: C.text, fontSize: 16, fontWeight: '700' },
  addBtn:       { width: 34, height: 34, borderRadius: 11, backgroundColor: C.primary + '20', borderWidth: 1, borderColor: C.primary + '40', alignItems: 'center', justifyContent: 'center' },
  emptyBox:     { alignItems: 'center', paddingVertical: 28, gap: 8, marginBottom: 8 },
  emptyIcon:    { width: 56, height: 56, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyText:    { color: C.sub, fontSize: 15, fontWeight: '600' },
  emptyHint:    { color: C.muted, fontSize: 13 },
  actionRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  genBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.primary, borderRadius: 14, paddingHorizontal: 22, paddingVertical: 13, flex: 1 },
  refreshBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primary + '12', borderWidth: 1, borderColor: C.primary + '30', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  refreshBtnDisabled: { opacity: 0.5 },
  refreshBtnText: { color: C.primary, fontWeight: '600', fontSize: 13 },
  jobBtn:       { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: C.accent + '30', backgroundColor: C.accent + '10', paddingHorizontal: 18, paddingVertical: 13 },
  jobBtnText:   { color: C.accent, fontWeight: '700', fontSize: 14 },
  genBtnText:   { color: '#fff', fontWeight: '700', fontSize: 14 },

  task:         { flexDirection: 'row', alignItems: 'stretch', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: 'hidden', paddingRight: 4 },
  taskDone:     { opacity: 0.42 },
  taskMain:     { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  iconBtn:      { width: 36, alignItems: 'center', justifyContent: 'center' },
  taskStrip:    { width: 4, alignSelf: 'stretch', marginRight: 14 },
  check:        { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.muted, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkDone:    { backgroundColor: C.accent, borderColor: C.accent },
  taskText:     { color: C.text, fontSize: 14 },
  taskTextDone: { textDecorationLine: 'line-through', color: C.muted },
  taskTimeRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  taskTime:     { color: C.muted, fontSize: 11 },
  tagPill:      { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  tagText:      { fontSize: 11, fontWeight: '600' },

  banner:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.surface, borderWidth: 1, borderColor: C.primary + '50', borderRadius: 20, padding: 16, marginTop: 4 },
  bannerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  bannerIcon:  { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { color: C.text, fontWeight: '700', fontSize: 14 },
  bannerSub:   { color: C.muted, fontSize: 12, marginTop: 2 },

  dsaCard:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 14 },
  dsaIcon:     { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dsaLabel:    { color: C.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  dsaName:     { color: C.text, fontWeight: '700', fontSize: 14 },
  dsaCat:      { color: C.sub, fontSize: 12, marginTop: 2 },
  diffPill:    { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  diffText:    { fontSize: 12, fontWeight: '700' },

  jobCard:     { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.accent + '40', borderRadius: 20, padding: 16 },
  jobCardIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  jobCardTitle:{ color: C.text, fontWeight: '700', fontSize: 14 },
  jobCardSub:  { color: C.muted, fontSize: 12, marginTop: 2 },

  learnRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 },
  learnRowLeft:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  learnRowText:{ color: C.sub, fontSize: 13 },
  learnRowNum: { color: C.primary, fontWeight: '800', fontSize: 15 },
  learnRowCta: { color: C.primary, fontWeight: '700', fontSize: 13 },

  quickRow:    { flexDirection: 'row', gap: 10 },
  quickBtn:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderRadius: 16, paddingVertical: 14 },
  quickBtnText:{ fontSize: 11, fontWeight: '700' },
});
