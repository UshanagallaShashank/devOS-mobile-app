import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, Clipboard, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../services/supabase';
import { fetchProfile, upsertProfile, type ResumeAnalysis, type ResumeData, type Profile } from '../services/db';
import { Card, TagChip } from '../components';
import { C } from '../config/theme';
import { ENV } from '../config/env';

const SEV_CHIP: Record<string, 'danger' | 'warn' | 'accent'> = { high: 'danger', medium: 'warn', low: 'accent' };
const SEV_COLOR: Record<string, string> = { high: C.danger, medium: C.warn, low: C.accent };

const EMPTY_DATA: ResumeData = { summary: '', skills: '', experience: '', projects: '', education: '' };

function buildResumeHTML(profile: Profile | null, data: ResumeData, analysis: ResumeAnalysis | null): string {
  const name = analysis?.name || profile?.full_name || 'Your Name';
  const role = analysis?.current_role || profile?.career_goal || '';
  const github = profile?.github_url ? `<a href="${profile.github_url}">${profile.github_url.replace('https://', '')}</a>` : '';
  const linkedin = profile?.linkedin_url ? `<a href="${profile.linkedin_url}">${profile.linkedin_url.replace('https://', '')}</a>` : '';
  const links = [github, linkedin].filter(Boolean).join(' &nbsp;|&nbsp; ');
  const topSkills = analysis?.top_skills?.length ? analysis.top_skills.join(', ') : '';

  const sec = (title: string, body: string) => body.trim()
    ? `<section><h2>${title}</h2><div class="body">${body.replace(/\n/g, '<br>')}</div></section>`
    : '';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — Resume</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 820px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; line-height: 1.6; }
  h1 { font-size: 2rem; margin: 0 0 4px; }
  .role { font-size: 1.05rem; color: #555; margin-bottom: 6px; }
  .links { font-size: 0.9rem; color: #777; margin-bottom: 28px; }
  .links a { color: #4f46e5; text-decoration: none; }
  section { margin-bottom: 28px; border-top: 1px solid #e5e7eb; padding-top: 18px; }
  h2 { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1; margin: 0 0 10px; }
  .body { font-size: 0.95rem; white-space: pre-wrap; }
  .score { display: inline-block; background: #eef2ff; color: #4f46e5; border-radius: 8px; padding: 2px 10px; font-size: 0.85rem; font-weight: 600; margin-left: 10px; }
  @media print { body { margin: 20px; } }
</style></head><body>
<h1>${name}${analysis?.score ? `<span class="score">${analysis.score}/100</span>` : ''}</h1>
${role ? `<div class="role">${role}</div>` : ''}
${links ? `<div class="links">${links}</div>` : ''}
${sec('Summary', data.summary)}
${sec('Skills', topSkills ? `${topSkills}${data.skills ? '\n' + data.skills : ''}` : data.skills)}
${sec('Experience', data.experience)}
${sec('Projects', data.projects)}
${sec('Education', data.education)}
</body></html>`;
}

export default function ResumeScreen() {
  const [tab, setTab]           = useState<'builder' | 'analysis'>('builder');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [resumeData, setData]   = useState<ResumeData>(EMPTY_DATA);
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId]     = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      fetchProfile(user.id).then(p => {
        setProfile(p);
        if (p?.resume_analysis) setAnalysis(p.resume_analysis as ResumeAnalysis);
        if (p?.resume_data)     setData(p.resume_data as ResumeData);
      });
    });
  }, []);

  function openResumeInBrowser() {
    const html = buildResumeHTML(profile, resumeData, analysis);
    Linking.openURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  }

  async function saveBuilder() {
    setSaving(true);
    try {
      await upsertProfile(userId, { resume_data: resumeData });
      setEditing(false);
    } catch { Alert.alert('Save failed'); }
    finally { setSaving(false); }
  }

  async function pickAndAnalyze() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.canceled || !result.assets?.[0]) return;
    const file = result.assets[0];
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', { uri: file.uri, type: 'application/pdf', name: file.name ?? 'resume.pdf' } as any);
      const res = await fetch(`${ENV.API_URL}/api/v1/resume/analyze`, { method: 'POST', body: form });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail ?? 'Analysis failed'); }
      const data: ResumeAnalysis = await res.json();
      setAnalysis(data);
      if (userId) await upsertProfile(userId, { resume_analysis: data });
      setTab('analysis');
    } catch (e: any) {
      Alert.alert('Upload failed', e.message ?? 'Make sure the backend is running.');
    } finally { setUploading(false); }
  }

  function copyToClipboard() {
    const text = [
      resumeData.summary && `SUMMARY\n${resumeData.summary}`,
      resumeData.skills && `SKILLS\n${resumeData.skills}`,
      resumeData.experience && `EXPERIENCE\n${resumeData.experience}`,
      resumeData.projects && `PROJECTS\n${resumeData.projects}`,
      resumeData.education && `EDUCATION\n${resumeData.education}`,
    ].filter(Boolean).join('\n\n');
    Clipboard.setString(text);
    Alert.alert('Copied', 'Resume content copied to clipboard. Paste into any application form.');
  }

  const hasBuilderData = Object.values(resumeData).some(v => v.trim());

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Resume</Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={24} color={C.muted} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          <TouchableOpacity style={[s.tab, tab === 'builder' && s.tabActive]} onPress={() => setTab('builder')} activeOpacity={0.8}>
            <Text style={[s.tabText, tab === 'builder' && s.tabTextActive]}>My Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tab, tab === 'analysis' && s.tabActive]} onPress={() => setTab('analysis')} activeOpacity={0.8}>
            <Text style={[s.tabText, tab === 'analysis' && s.tabTextActive]}>AI Analysis</Text>
            {analysis && <View style={s.tabDot} />}
          </TouchableOpacity>
        </View>

        {/* ── Builder tab ── */}
        {tab === 'builder' && (
          <>
            <View style={s.builderHeader}>
              <Text style={s.sectionHint}>Store your resume sections. Use "Copy" to paste into job forms.</Text>
              <View style={s.builderActions}>
                {hasBuilderData && !editing && (
                  <>
                    <TouchableOpacity style={s.copyBtn} onPress={copyToClipboard} activeOpacity={0.8}>
                      <Ionicons name="copy-outline" size={15} color={C.accent} />
                      <Text style={s.copyBtnText}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.viewBtn} onPress={openResumeInBrowser} activeOpacity={0.8}>
                      <Ionicons name="download-outline" size={15} color={C.primary} />
                      <Text style={s.viewBtnText}>Export</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity style={s.editBtn} onPress={() => editing ? saveBuilder() : setEditing(true)} disabled={saving} activeOpacity={0.8}>
                  {saving ? <ActivityIndicator size="small" color={C.primary} /> : <Text style={s.editBtnText}>{editing ? 'Save' : 'Edit'}</Text>}
                </TouchableOpacity>
              </View>
            </View>

            {(['summary', 'skills', 'experience', 'projects', 'education'] as (keyof ResumeData)[]).map(field => (
              <View key={field} style={s.fieldBlock}>
                <Text style={s.fieldLabel}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                {editing
                  ? <TextInput
                      style={[s.input, { minHeight: field === 'experience' || field === 'projects' ? 100 : 64 }]}
                      value={resumeData[field]}
                      onChangeText={v => setData(prev => ({ ...prev, [field]: v }))}
                      placeholder={
                        field === 'summary'    ? 'Short professional summary…' :
                        field === 'skills'     ? 'Python, React, TypeScript, PostgreSQL…' :
                        field === 'experience' ? 'Company · Role · Duration\n• Key achievement…' :
                        field === 'projects'   ? 'Project Name — tech stack\n• What it does…' :
                                                 'Degree · College · Year'
                      }
                      placeholderTextColor={C.muted}
                      multiline
                      textAlignVertical="top"
                    />
                  : <Text style={[s.fieldValue, !resumeData[field] && { color: C.muted }]}>
                      {resumeData[field] || `Add ${field}…`}
                    </Text>
                }
              </View>
            ))}

            {editing && (
              <TouchableOpacity style={s.saveBtn} onPress={saveBuilder} disabled={saving} activeOpacity={0.85}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save Resume</Text>}
              </TouchableOpacity>
            )}

            {/* Analyse with AI */}
            <View style={s.aiSection}>
              <Text style={s.aiSectionTitle}>Analyse your PDF with AI</Text>
              <TouchableOpacity style={s.uploadBtn} activeOpacity={0.8} onPress={pickAndAnalyze} disabled={uploading}>
                {uploading
                  ? <><ActivityIndicator color={C.primary} /><Text style={s.uploadText}>Analysing…</Text></>
                  : <><Ionicons name="cloud-upload-outline" size={18} color={C.primary} /><Text style={s.uploadText}>{analysis ? 'Re-upload PDF' : 'Upload Resume PDF'}</Text></>
                }
              </TouchableOpacity>
              {!analysis && <Text style={s.uploadHint}>Upload once — results are stored and won't call AI again on reopen.</Text>}
            </View>
          </>
        )}

        {/* ── Analysis tab ── */}
        {tab === 'analysis' && (
          <>
            <TouchableOpacity style={s.uploadBtn} activeOpacity={0.8} onPress={pickAndAnalyze} disabled={uploading} style={{ marginBottom: 16 }}>
              {uploading
                ? <><ActivityIndicator color={C.primary} /><Text style={s.uploadText}>Analysing with AI…</Text></>
                : <><Ionicons name="cloud-upload-outline" size={18} color={C.primary} /><Text style={s.uploadText}>{analysis ? 'Upload New Resume' : 'Upload Resume PDF'}</Text></>
              }
            </TouchableOpacity>

            {!analysis && !uploading && <Text style={s.hint}>Upload your PDF — Gemini AI will score it and give you specific improvements. Stored so you don't need to re-upload.</Text>}

            {analysis && (
              <>
                <Card style={{ marginBottom: 16 }}>
                  <View style={s.nameRow}>
                    <View>
                      <Text style={s.candidateName}>{analysis.name}</Text>
                      <Text style={s.candidateRole}>{analysis.current_role} · {analysis.years_exp} yrs exp</Text>
                    </View>
                    <View style={s.bigScore}>
                      <Text style={s.bigScoreNum}>{analysis.score}</Text>
                      <Text style={s.bigScoreDen}>/100</Text>
                    </View>
                  </View>
                  <Text style={s.summary}>{analysis.summary}</Text>
                  <View style={s.statsRow}>
                    {[{ label: 'ATS', val: analysis.ats_score }, { label: 'Impact', val: analysis.impact_score }, { label: 'Clarity', val: analysis.clarity_score }].map(stat => (
                      <View key={stat.label} style={s.stat}>
                        <Text style={s.statNum}>{stat.val}</Text>
                        <Text style={s.statLbl}>{stat.label}</Text>
                      </View>
                    ))}
                  </View>
                </Card>

                <Text style={s.section}>Top Skills Detected</Text>
                <View style={s.skillRow}>
                  {analysis.top_skills.map(sk => <TagChip key={sk} label={sk} color="primary" />)}
                </View>

                <Text style={s.section}>AI Suggestions</Text>
                <View style={{ gap: 12, paddingBottom: 32 }}>
                  {analysis.suggestions.map((sg, i) => (
                    <View key={i} style={s.suggestion}>
                      <View style={s.sugHeader}>
                        <View style={[s.dot, { backgroundColor: SEV_COLOR[sg.severity] }]} />
                        <TagChip label={sg.severity} color={SEV_CHIP[sg.severity]} />
                      </View>
                      <Text style={s.sugText}>{sg.text}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.bg },
  scroll:         { flex: 1, paddingHorizontal: 16 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 16 },
  title:          { color: C.text, fontSize: 24, fontWeight: '700' },
  tabs:           { flexDirection: 'row', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 4, marginBottom: 20, gap: 4 },
  tab:            { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 11, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabActive:      { backgroundColor: C.primary },
  tabText:        { color: C.muted, fontWeight: '600', fontSize: 14 },
  tabTextActive:  { color: '#fff' },
  tabDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  builderHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionHint:    { flex: 1, color: C.muted, fontSize: 12, lineHeight: 18 },
  builderActions: { flexDirection: 'row', gap: 8, marginLeft: 12 },
  copyBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: C.accent + '40', backgroundColor: C.accent + '10' },
  copyBtnText:    { color: C.accent, fontWeight: '600', fontSize: 13 },
  viewBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: C.primary + '40', backgroundColor: C.primary + '10' },
  viewBtnText:    { color: C.primary, fontWeight: '600', fontSize: 13 },
  editBtn:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: C.primary + '18', borderWidth: 1, borderColor: C.primary + '40' },
  editBtnText:    { color: C.primary, fontWeight: '600', fontSize: 13 },
  fieldBlock:     { marginBottom: 18 },
  fieldLabel:     { color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },
  input:          { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, color: C.text, fontSize: 14, lineHeight: 22 },
  fieldValue:     { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, color: C.text, fontSize: 14, lineHeight: 22, minHeight: 48 },
  saveBtn:        { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 24 },
  saveBtnText:    { color: '#fff', fontWeight: '700', fontSize: 15 },
  aiSection:      { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 16, marginBottom: 32 },
  aiSectionTitle: { color: C.text, fontWeight: '700', fontSize: 14, marginBottom: 12 },
  uploadBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.primary + '12', borderWidth: 1, borderColor: C.primary + '40', borderRadius: 12, paddingVertical: 13 },
  uploadText:     { color: C.primary, fontWeight: '600', fontSize: 14 },
  uploadHint:     { color: C.muted, fontSize: 12, marginTop: 10, lineHeight: 18 },
  hint:           { color: C.muted, fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  nameRow:        { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  candidateName:  { color: C.text, fontWeight: '700', fontSize: 18 },
  candidateRole:  { color: C.sub, fontSize: 13, marginTop: 2 },
  bigScore:       { flexDirection: 'row', alignItems: 'flex-end' },
  bigScoreNum:    { color: C.text, fontSize: 44, fontWeight: '700', lineHeight: 48 },
  bigScoreDen:    { color: C.muted, fontSize: 18, marginBottom: 4 },
  summary:        { color: C.sub, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  statsRow:       { flexDirection: 'row', gap: 10 },
  stat:           { flex: 1, backgroundColor: C.border, borderRadius: 12, padding: 12, alignItems: 'center' },
  statNum:        { color: C.text, fontWeight: '700', fontSize: 18 },
  statLbl:        { color: C.muted, fontSize: 11, marginTop: 2 },
  section:        { color: C.text, fontWeight: '600', fontSize: 16, marginTop: 20, marginBottom: 12 },
  skillRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  suggestion:     { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16 },
  sugHeader:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dot:            { width: 8, height: 8, borderRadius: 4 },
  sugText:        { color: C.text, fontSize: 14, lineHeight: 20 },
});
