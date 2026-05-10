import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../services/supabase';
import { fetchProfile, upsertProfile, fetchStreak, type Profile } from '../services/db';
import { fetchLCStats } from '../services/leetcode';
import { C } from '../config/theme';

const STACK_OPTIONS = ['Python', 'JavaScript', 'TypeScript', 'React', 'React Native', 'Next.js', 'Node.js', 'Go', 'Java', 'FastAPI', 'PostgreSQL', 'LLMs / AI', 'C++', 'Rust'];
const EXP_OPTIONS   = ['Student / 0', '1–2 years', '3–5 years', '6+ years'];
const GOAL_OPTIONS  = ['Get first dev job', 'Switch to AI/ML', 'Level up to senior', 'Start a startup', 'Land FAANG'];

export default function ProfileScreen() {
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [email, setEmail]       = useState('');
  const [streak, setStreak]     = useState(0);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);

  // editable fields
  const [name, setName]         = useState('');
  const [bio, setBio]           = useState('');
  const [github, setGithub]     = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [lcSolved, setLcSolved] = useState<number | null>(null);
  const [lcStatus, setLcStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [stack, setStack]       = useState<string[]>([]);
  const [exp, setExp]           = useState('');
  const [goal, setGoal]         = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? '');
      const [p, s] = await Promise.all([fetchProfile(user.id), fetchStreak(user.id)]);
      setStreak(s);
      if (p) {
        setProfile(p);
        setName(p.full_name ?? '');
        setBio(p.bio ?? '');
        setGithub(p.github_url ?? '');
        setLinkedin(p.linkedin_url ?? '');
        setLeetcode(p.leetcode_username ?? '');
        setLcSolved(p.leetcode_solved ?? null);
        if (p.leetcode_username) setLcStatus('valid');
        setStack(p.primary_stack ?? []);
        setExp(p.experience_years != null ? EXP_OPTIONS[Math.min(p.experience_years > 5 ? 3 : p.experience_years > 2 ? 2 : p.experience_years > 0 ? 1 : 0, 3)] : '');
        setGoal(p.career_goal ?? '');
      }
    });
  }, []);

  async function save() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      const expYears = exp.startsWith('6') ? 6 : exp.startsWith('3') ? 4 : exp.startsWith('1') ? 1 : 0;
      await upsertProfile(user.id, {
        full_name: name,
        bio,
        github_url: github,
        linkedin_url: linkedin,
        leetcode_username: leetcode.trim() || undefined,
        leetcode_solved: lcSolved ?? undefined,
        primary_stack: stack,
        experience_years: expYears,
        career_goal: goal,
      });
      setEditing(false);
    } catch (error: any) {
      Alert.alert('Save failed', error?.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function verifyLeetCode() {
    const u = leetcode.trim();
    if (!u) return;
    setLcStatus('checking');
    const stats = await fetchLCStats(u);
    if (stats) {
      setLcStatus('valid');
      setLcSolved(stats.total);
    } else {
      setLcStatus('invalid');
    }
  }

  const avatar = (name || email || '?')[0].toUpperCase();

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={C.muted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => editing ? save() : setEditing(true)} activeOpacity={0.8} style={s.editBtn} disabled={saving}>
            {saving ? <ActivityIndicator color={C.primary} size="small" /> : <Text style={s.editBtnText}>{editing ? 'Save' : 'Edit'}</Text>}
          </TouchableOpacity>
        </View>

        {/* Avatar + name */}
        <View style={s.avatarWrap}>
          <View style={s.avatar}><Text style={s.avatarText}>{avatar}</Text></View>
          {editing
            ? <TextInput style={s.nameInput} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={C.muted} />
            : <Text style={s.nameText}>{name || 'Add your name'}</Text>
          }
          <Text style={s.emailText}>{email}</Text>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.stat}><Ionicons name="flame" size={20} color={C.warn} /><Text style={s.statVal}>{streak}d</Text><Text style={s.statLbl}>Streak</Text></View>
          <View style={s.stat}><Ionicons name="code-slash" size={20} color={C.primary} /><Text style={s.statVal}>{exp || '—'}</Text><Text style={s.statLbl}>Experience</Text></View>
          <View style={s.stat}><Ionicons name="rocket" size={20} color={C.accent} /><Text style={s.statVal} numberOfLines={1}>{goal ? goal.split(' ').slice(0, 2).join(' ') : '—'}</Text><Text style={s.statLbl}>Goal</Text></View>
        </View>

        <View style={s.body}>
          {/* Bio */}
          <Text style={s.sectionLabel}>Bio</Text>
          {editing
            ? <TextInput style={[s.input, s.multiline]} value={bio} onChangeText={setBio} placeholder="A sentence about yourself" placeholderTextColor={C.muted} multiline />
            : <Text style={s.fieldText}>{bio || 'Add a short bio'}</Text>
          }

          {/* Links */}
          <Text style={s.sectionLabel}>Links</Text>
          {editing ? (
            <View style={{ gap: 10 }}>
              <View style={s.linkRow}>
                <Ionicons name="logo-github" size={18} color={C.muted} />
                <TextInput style={s.linkInput} value={github} onChangeText={setGithub} placeholder="github.com/username" placeholderTextColor={C.muted} autoCapitalize="none" />
              </View>
              <View style={s.linkRow}>
                <Ionicons name="logo-linkedin" size={18} color={C.muted} />
                <TextInput style={s.linkInput} value={linkedin} onChangeText={setLinkedin} placeholder="linkedin.com/in/username" placeholderTextColor={C.muted} autoCapitalize="none" />
              </View>
              <View style={[s.linkRow, lcStatus === 'valid' && { borderColor: C.accent }, lcStatus === 'invalid' && { borderColor: C.danger }]}>
                <Ionicons name="code-slash" size={18} color={lcStatus === 'valid' ? C.accent : lcStatus === 'invalid' ? C.danger : C.muted} />
                <TextInput
                  style={s.linkInput}
                  value={leetcode}
                  onChangeText={t => { setLeetcode(t); setLcStatus('idle'); }}
                  placeholder="LeetCode username"
                  placeholderTextColor={C.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={verifyLeetCode} disabled={lcStatus === 'checking' || !leetcode.trim()} style={s.verifyBtn}>
                  {lcStatus === 'checking'
                    ? <ActivityIndicator size="small" color={C.primary} />
                    : lcStatus === 'valid'
                    ? <Ionicons name="checkmark-circle" size={18} color={C.accent} />
                    : lcStatus === 'invalid'
                    ? <Ionicons name="close-circle" size={18} color={C.danger} />
                    : <Text style={s.verifyText}>Verify</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              <TouchableOpacity style={s.linkRow} onPress={() => github && Linking.openURL(`https://${github.replace(/^https?:\/\//, '')}`)}>
                <Ionicons name="logo-github" size={18} color={C.muted} />
                <Text style={[s.linkText, !github && { color: C.muted }]}>{github || 'Add GitHub'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.linkRow} onPress={() => linkedin && Linking.openURL(`https://${linkedin.replace(/^https?:\/\//, '')}`)}>
                <Ionicons name="logo-linkedin" size={18} color={C.muted} />
                <Text style={[s.linkText, !linkedin && { color: C.muted }]}>{linkedin || 'Add LinkedIn'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.linkRow} onPress={() => leetcode && Linking.openURL(`https://leetcode.com/${leetcode}`)}>
                <Ionicons name="code-slash" size={18} color={lcStatus === 'valid' ? C.accent : C.muted} />
                <Text style={[s.linkText, !leetcode && { color: C.muted }]}>{leetcode || 'Add LeetCode username'}</Text>
                {lcStatus === 'valid' && <Ionicons name="checkmark-circle" size={15} color={C.accent} />}
              </TouchableOpacity>
            </View>
          )}

          {/* Tech Stack */}
          <Text style={s.sectionLabel}>Tech Stack</Text>
          {editing ? (
            <View style={s.chipGrid}>
              {STACK_OPTIONS.map(item => (
                <TouchableOpacity key={item} style={[s.chip, stack.includes(item) && s.chipActive]} onPress={() => setStack(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])}>
                  <Text style={[s.chipText, stack.includes(item) && s.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={s.chipGrid}>
              {(stack.length ? stack : ['None added']).map(item => (
                <View key={item} style={s.chipStatic}><Text style={s.chipStaticText}>{item}</Text></View>
              ))}
            </View>
          )}

          {/* Experience */}
          <Text style={s.sectionLabel}>Experience</Text>
          {editing ? (
            <View style={{ gap: 8 }}>
              {EXP_OPTIONS.map(o => (
                <TouchableOpacity key={o} style={[s.option, exp === o && s.optionActive]} onPress={() => setExp(o)}>
                  <Text style={[s.optionText, exp === o && s.optionTextActive]}>{o}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : <Text style={s.fieldText}>{exp || 'Not set'}</Text>}

          {/* Career Goal */}
          <Text style={s.sectionLabel}>Career Goal</Text>
          {editing ? (
            <View style={{ gap: 8 }}>
              {GOAL_OPTIONS.map(o => (
                <TouchableOpacity key={o} style={[s.option, goal === o && s.optionActive]} onPress={() => setGoal(o)}>
                  <Text style={[s.optionText, goal === o && s.optionTextActive]}>{o}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : <Text style={s.fieldText}>{goal || 'Not set'}</Text>}

          {/* Account */}
          <Text style={[s.sectionLabel, { marginTop: 32 }]}>Account</Text>
          <View style={s.accountBox}>
            <TouchableOpacity style={[s.accountRow, s.accountBorder]} onPress={() =>
              Alert.alert('Reset Password', 'Send a reset link to your email?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Send', onPress: () => supabase.auth.resetPasswordForEmail(email) },
              ])}>
              <Ionicons name="lock-closed-outline" size={16} color={C.muted} />
              <Text style={s.accountLabel}>Change Password</Text>
              <Ionicons name="chevron-forward" size={16} color={C.muted} />
            </TouchableOpacity>
            <TouchableOpacity style={s.accountRow} onPress={() =>
              Alert.alert('Delete Account', 'This is permanent.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive' }])}>
              <Ionicons name="trash-outline" size={16} color={C.danger} />
              <Text style={[s.accountLabel, { color: C.danger }]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.bg },
  topBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 16 },
  editBtn:        { backgroundColor: C.primary + '22', borderWidth: 1, borderColor: C.primary + '40', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 7 },
  editBtnText:    { color: C.primary, fontWeight: '600', fontSize: 14 },
  avatarWrap:     { alignItems: 'center', paddingVertical: 24 },
  avatar:         { width: 72, height: 72, borderRadius: 36, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:     { color: '#fff', fontSize: 30, fontWeight: '700' },
  nameText:       { color: C.text, fontSize: 20, fontWeight: '700' },
  nameInput:      { color: C.text, fontSize: 20, fontWeight: '700', textAlign: 'center', borderBottomWidth: 1, borderBottomColor: C.primary, paddingBottom: 4, minWidth: 160 },
  emailText:      { color: C.muted, fontSize: 13, marginTop: 4 },
  statsRow:       { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 8 },
  stat:           { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  statVal:        { color: C.text, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  statLbl:        { color: C.muted, fontSize: 11 },
  body:           { paddingHorizontal: 20, paddingBottom: 48 },
  sectionLabel:   { color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.3, marginTop: 24, marginBottom: 10 },
  input:          { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, color: C.text, fontSize: 14 },
  multiline:      { minHeight: 72, textAlignVertical: 'top' },
  fieldText:      { color: C.text, fontSize: 14, backgroundColor: C.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  linkRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12 },
  linkInput:      { flex: 1, color: C.text, fontSize: 13 },
  linkText:       { flex: 1, color: C.primary, fontSize: 13 },
  verifyBtn:      { paddingHorizontal: 8, paddingVertical: 4 },
  verifyText:     { color: C.primary, fontSize: 12, fontWeight: '700' },
  chipGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  chipActive:     { borderColor: C.primary, backgroundColor: C.primary + '22' },
  chipText:       { color: C.muted, fontSize: 12, fontWeight: '500' },
  chipTextActive: { color: C.primary },
  chipStatic:     { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, backgroundColor: C.border },
  chipStaticText: { color: C.sub, fontSize: 12, fontWeight: '500' },
  option:         { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14 },
  optionActive:   { borderColor: C.primary, backgroundColor: C.primary + '18' },
  optionText:     { color: C.sub, fontSize: 14 },
  optionTextActive:{ color: C.primary, fontWeight: '600' },
  accountBox:     { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: 'hidden' },
  accountRow:     { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  accountBorder:  { borderBottomWidth: 1, borderBottomColor: C.border },
  accountLabel:   { flex: 1, color: C.text, fontSize: 14 },
});
