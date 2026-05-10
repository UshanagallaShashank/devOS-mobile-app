import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { fetchProfile } from '../../services/db';
import { ENV } from '../../config/env';
import { C, glow } from '../../config/theme';

type Job = {
  title: string; company: string; location: string;
  summary: string; url: string; source: string;
};

const ROLES = [
  { label: 'AI Engineer',     query: 'AI engineer',           icon: 'sparkles-outline'  },
  { label: 'Full Stack Dev',  query: 'full stack developer',  icon: 'layers-outline'    },
  { label: 'Backend Dev',     query: 'backend developer',     icon: 'server-outline'    },
  { label: 'Frontend Dev',    query: 'frontend developer',    icon: 'desktop-outline'   },
  { label: 'Data Scientist',  query: 'data scientist',        icon: 'bar-chart-outline' },
  { label: 'DevOps / SRE',   query: 'devops sre',            icon: 'cloud-outline'     },
  { label: 'ML Engineer',     query: 'machine learning engineer', icon: 'analytics-outline' },
  { label: 'Mobile Dev',      query: 'mobile developer',      icon: 'phone-portrait-outline' },
];

function computeMatch(job: Job, role: string): number {
  const text = `${job.title} ${job.company} ${job.summary}`.toLowerCase();
  const words = role.toLowerCase().split(' ');
  const hits  = words.filter(w => text.includes(w)).length;
  return Math.min(98, 50 + hits * 16);
}

export default function JobsScreen() {
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [loading, setLoading]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeRole, setActiveRole] = useState<typeof ROLES[0] | null>(null);
  const [profileRole, setProfileRole] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const p = await fetchProfile(user.id);
      if (p?.career_goal) setProfileRole(p.career_goal);
    });
  }, []);

  const loadJobs = useCallback(async (role: typeof ROLES[0], isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const url = `${ENV.API_URL}/api/v1/jobs/search?role=${encodeURIComponent(role.query)}${isRefresh ? '&force=true' : ''}`;
      const res  = await fetch(url);
      const payload = await res.json();
      const data: Job[] = Array.isArray(payload?.data?.jobs) ? payload.data.jobs : [];
      setJobs(data.filter(j => j.title && j.company));
    } catch {
      setJobs([]);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  function selectRole(role: typeof ROLES[0]) {
    setActiveRole(role);
    setJobs([]);
    loadJobs(role);
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Jobs</Text>
          <Text style={s.sub}>Google Jobs via Serper · select a role to search</Text>
        </View>
        {activeRole && (
          <TouchableOpacity style={s.refreshBtn} onPress={() => loadJobs(activeRole, true)} disabled={refreshing} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={18} color={C.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Role category chips */}
      <View style={s.rolesGrid}>
        {ROLES.map(r => {
          const isActive = activeRole?.label === r.label;
          return (
            <TouchableOpacity
              key={r.label}
              style={[s.roleChip, isActive && s.roleChipActive]}
              onPress={() => selectRole(r)}
              activeOpacity={0.8}
            >
              <Ionicons name={r.icon as any} size={14} color={isActive ? '#fff' : C.muted} />
              <Text style={[s.roleChipText, isActive && s.roleChipTextActive]}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Empty / loading / results */}
      {!activeRole && !loading && (
        <View style={s.emptyState}>
          <Ionicons name="briefcase-outline" size={40} color={C.muted} />
          <Text style={s.emptyTitle}>Pick a role above</Text>
          <Text style={s.emptySub}>Jobs are fetched live from Google Jobs via Serper and cached for 12 hours</Text>
        </View>
      )}

      {loading && (
        <View style={s.loader}>
          <ActivityIndicator color={C.primary} size="large" />
          <Text style={s.loaderText}>Fetching {activeRole?.label} jobs…</Text>
        </View>
      )}

      {!loading && activeRole && (
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => activeRole && loadJobs(activeRole, true)} tintColor={C.primary} />}
        >
          <Text style={s.resultsLabel}>{jobs.length} {activeRole.label} openings</Text>
          <View style={{ gap: 12, paddingBottom: 32 }}>
            {jobs.map((job, i) => {
              const match = computeMatch(job, activeRole.query);
              return (
                <TouchableOpacity key={`${job.title}-${i}`} style={s.card} activeOpacity={0.85} onPress={() => job.url && Linking.openURL(job.url)}>
                  <View style={s.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.role}>{job.title}</Text>
                      <Text style={s.company}>{job.company}</Text>
                    </View>
                    <View style={[s.matchBadge, match >= 80 && s.matchHigh]}>
                      <Text style={[s.matchNum, match >= 80 && s.matchNumHigh]}>{match}%</Text>
                      <Text style={s.matchLbl}>match</Text>
                    </View>
                  </View>

                  <View style={s.meta}>
                    <Ionicons name="location-outline" size={13} color={C.muted} />
                    <Text style={s.metaText}>{job.location || 'India'}</Text>
                    <Text style={s.dot}>·</Text>
                    <Ionicons name="globe-outline" size={13} color={C.muted} />
                    <Text style={s.metaText}>{job.source}</Text>
                  </View>

                  {job.summary ? <Text style={s.summary} numberOfLines={2}>{job.summary}</Text> : null}

                  {job.url ? (
                    <TouchableOpacity style={[s.applyBtn, glow(C.primary, 0.12)]} onPress={() => Linking.openURL(job.url)} activeOpacity={0.8}>
                      <Text style={s.applyText}>Apply Now  →</Text>
                    </TouchableOpacity>
                  ) : null}
                </TouchableOpacity>
              );
            })}
            {jobs.length === 0 && !loading && (
              <View style={s.emptyState}>
                <Text style={s.emptyTitle}>No results yet</Text>
                <Text style={s.emptySub}>Pull down to refresh or try a different role</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: C.bg },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16, marginBottom: 14 },
  title:             { color: C.text, fontSize: 24, fontWeight: '700' },
  sub:               { color: C.sub, fontSize: 11, marginTop: 3 },
  refreshBtn:        { width: 40, height: 40, borderRadius: 13, backgroundColor: C.surface, borderWidth: 1, borderColor: C.primary + '40', alignItems: 'center', justifyContent: 'center' },
  rolesGrid:         { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  roleChip:          { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  roleChipActive:    { backgroundColor: C.primary, borderColor: C.primary },
  roleChipText:      { color: C.muted, fontSize: 13, fontWeight: '500' },
  roleChipTextActive:{ color: '#fff', fontWeight: '700' },
  resultsLabel:      { color: C.muted, fontSize: 12, marginBottom: 12 },
  loader:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText:        { color: C.muted, fontSize: 14 },
  emptyState:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle:        { color: C.sub, fontSize: 16, fontWeight: '600' },
  emptySub:          { color: C.muted, fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 32 },
  card:              { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 16 },
  cardHeader:        { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  role:              { color: C.text, fontWeight: '700', fontSize: 15 },
  company:           { color: C.muted, fontSize: 13, marginTop: 2 },
  matchBadge:        { alignItems: 'center', backgroundColor: C.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  matchHigh:         { backgroundColor: C.accent + '22' },
  matchNum:          { color: C.sub, fontWeight: '700', fontSize: 14 },
  matchNumHigh:      { color: C.accent },
  matchLbl:          { color: C.muted, fontSize: 10 },
  meta:              { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  metaText:          { color: C.muted, fontSize: 12 },
  dot:               { color: C.muted, fontSize: 12 },
  summary:           { color: C.sub, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  applyBtn:          { backgroundColor: C.primary + '14', borderWidth: 1, borderColor: C.primary + '40', borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  applyText:         { color: C.primary, fontWeight: '700', fontSize: 14 },
});
