import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { C, glow } from '../config/theme';

const CATS = [
  { label: 'All',       icon: 'layers-outline'    },
  { label: 'AI/LLMs',  icon: 'sparkles-outline'  },
  { label: 'Tools',    icon: 'construct-outline'  },
  { label: 'Research', icon: 'flask-outline'      },
  { label: 'Startups', icon: 'rocket-outline'     },
  { label: 'Jobs',     icon: 'briefcase-outline'  },
];

const CAT_COLOR: Record<string, string> = {
  'AI/LLMs':  C.primary,
  'Tools':    C.accent,
  'Research': C.purple,
  'Startups': C.warn,
  'Jobs':     C.pink,
};

type Article = {
  id: string; title: string; source: string; url: string;
  time: string; category: string; points?: number; readMins?: number;
};

function categorise(title: string): string {
  const t = title.toLowerCase();
  if (/llm|gpt|gemini|claude|openai|anthropic|mistral|ai model|transformer|chatgpt/.test(t)) return 'AI/LLMs';
  if (/raise|funding|series|valuation|acqui|billion|million/.test(t)) return 'Startups';
  if (/paper|research|benchmark|arxiv|study|findings/.test(t)) return 'Research';
  if (/hire|layoff|job|team|headcount/.test(t)) return 'Jobs';
  if (/tool|sdk|release|launch|open.source|api|cursor|copilot|plugin|library/.test(t)) return 'Tools';
  return 'AI/LLMs';
}

function timeAgo(unix: number): string {
  const diff = Math.floor((Date.now() / 1000 - unix) / 60);
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function readMins(title: string): number {
  return Math.max(2, Math.ceil(title.split(' ').length / 5));
}

async function loadHN(): Promise<Article[]> {
  const ids: number[] = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json').then(r => r.json());
  const top = ids.slice(0, 40);
  const items = await Promise.all(
    top.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()))
  );
  return items
    .filter((i: any) => i && i.title && i.url && !i.deleted && i.score > 10)
    .map((i: any) => ({
      id:       String(i.id),
      title:    i.title,
      source:   'Hacker News',
      url:      i.url,
      time:     timeAgo(i.time),
      category: categorise(i.title),
      points:   i.score,
      readMins: readMins(i.title),
    }));
}

async function loadDevTo(): Promise<Article[]> {
  const data = await fetch('https://dev.to/api/articles?tag=ai&per_page=20&top=1').then(r => r.json());
  return (data as any[]).map(a => ({
    id:       `dt-${a.id}`,
    title:    a.title,
    source:   'Dev.to',
    url:      a.url,
    time:     new Date(a.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    category: categorise(a.title),
    points:   a.positive_reactions_count,
    readMins: a.reading_time_minutes || readMins(a.title),
  }));
}

const SOURCE_ICON: Record<string, { name: string; color: string }> = {
  'Hacker News': { name: 'logo-hackernews', color: '#FF6600' },
  'Dev.to':      { name: 'code-slash-outline', color: C.accent },
};

export default function NewsScreen() {
  const [articles, setArticles]   = useState<Article[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [active, setActive]       = useState('All');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [hn, dev] = await Promise.allSettled([loadHN(), loadDevTo()]);
      const all: Article[] = [
        ...(hn.status  === 'fulfilled' ? hn.value  : []),
        ...(dev.status === 'fulfilled' ? dev.value : []),
      ];
      const seen = new Set<string>();
      const unique = all.filter(a => { if (seen.has(a.url)) return false; seen.add(a.url); return true; });
      setArticles(unique.sort((a, b) => (b.points ?? 0) - (a.points ?? 0)));
    } catch { /* keep stale */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = active === 'All' ? articles : articles.filter(a => a.category === active);
  const top3     = filtered.slice(0, 3);
  const rest     = filtered.slice(3);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>AI News</Text>
          <Text style={s.sub}>Hacker News · Dev.to · live</Text>
        </View>
        <View style={s.headerRight}>
          {refreshing
            ? <ActivityIndicator color={C.primary} size="small" />
            : <TouchableOpacity style={s.refreshBtn} onPress={() => load(true)} activeOpacity={0.8}>
                <Ionicons name="refresh-outline" size={17} color={C.primary} />
              </TouchableOpacity>
          }
          <TouchableOpacity onPress={() => router.back()} style={s.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={C.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {CATS.map(cat => {
          const isActive = cat.label === active;
          const color = CAT_COLOR[cat.label] ?? C.primary;
          return (
            <TouchableOpacity
              key={cat.label}
              style={[s.chip, isActive && { backgroundColor: color, borderColor: color }]}
              activeOpacity={0.75}
              onPress={() => setActive(cat.label)}
            >
              <Ionicons name={cat.icon as any} size={13} color={isActive ? '#fff' : C.muted} />
              <Text style={[s.chipText, isActive && s.chipTextActive]}>{cat.label}</Text>
              {isActive && filtered.length > 0 && (
                <View style={s.chipCount}><Text style={s.chipCountText}>{filtered.length}</Text></View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading
        ? (
          <View style={s.loader}>
            <ActivityIndicator color={C.primary} size="large" />
            <Text style={s.loaderText}>Loading latest AI news…</Text>
          </View>
        )
        : (
          <ScrollView
            style={{ flex: 1 }} showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.primary} />}
          >
            {/* Featured cards (top 3) */}
            {top3.length > 0 && (
              <View style={s.featuredSection}>
                {top3.map((item, i) => {
                  const catColor = CAT_COLOR[item.category] ?? C.primary;
                  const srcMeta  = SOURCE_ICON[item.source];
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[s.featuredCard, i === 0 && s.featuredCardLarge, glow(catColor, 0.08)]}
                      activeOpacity={0.82}
                      onPress={() => Linking.openURL(item.url)}
                    >
                      {/* Category stripe */}
                      <View style={[s.catStripe, { backgroundColor: catColor }]} />

                      <View style={s.featuredBody}>
                        {/* Top row: category badge + trending */}
                        <View style={s.featuredTop}>
                          <View style={[s.catBadge, { backgroundColor: catColor + '20', borderColor: catColor + '50' }]}>
                            <Text style={[s.catBadgeText, { color: catColor }]}>{item.category}</Text>
                          </View>
                          {i === 0 && (
                            <View style={s.trendBadge}>
                              <Ionicons name="flame-outline" size={11} color={C.warn} />
                              <Text style={s.trendText}>Trending</Text>
                            </View>
                          )}
                        </View>

                        {/* Title */}
                        <Text style={[s.featuredTitle, i === 0 && s.featuredTitleLarge]} numberOfLines={i === 0 ? 3 : 2}>
                          {item.title}
                        </Text>

                        {/* Footer */}
                        <View style={s.cardFooter}>
                          <View style={s.srcRow}>
                            {srcMeta && <Ionicons name={srcMeta.name as any} size={12} color={srcMeta.color} />}
                            <Text style={s.srcText}>{item.source}</Text>
                            <Text style={s.dot}>·</Text>
                            <Text style={s.srcText}>{item.time}</Text>
                          </View>
                          <View style={s.metaRight}>
                            {item.points != null && (
                              <View style={s.pointsBadge}>
                                <Ionicons name="arrow-up-outline" size={10} color={C.warn} />
                                <Text style={s.pointsText}>{item.points > 999 ? `${(item.points/1000).toFixed(1)}k` : item.points}</Text>
                              </View>
                            )}
                            <View style={s.readBadge}>
                              <Ionicons name="time-outline" size={10} color={C.muted} />
                              <Text style={s.readText}>{item.readMins}m</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Divider */}
            {rest.length > 0 && (
              <View style={s.sectionLabel}>
                <Text style={s.sectionLabelText}>More Stories</Text>
                <View style={s.sectionLine} />
              </View>
            )}

            {/* List cards */}
            <View style={{ paddingHorizontal: 16, gap: 8, paddingBottom: 40 }}>
              {rest.map(item => {
                const catColor = CAT_COLOR[item.category] ?? C.primary;
                const srcMeta  = SOURCE_ICON[item.source];
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={s.listCard}
                    activeOpacity={0.8}
                    onPress={() => Linking.openURL(item.url)}
                  >
                    <View style={[s.listStripe, { backgroundColor: catColor }]} />
                    <View style={s.listBody}>
                      <Text style={s.listTitle} numberOfLines={2}>{item.title}</Text>
                      <View style={s.listFooter}>
                        <View style={s.srcRow}>
                          {srcMeta && <Ionicons name={srcMeta.name as any} size={11} color={srcMeta.color} />}
                          <Text style={s.srcText}>{item.source} · {item.time}</Text>
                        </View>
                        <View style={s.metaRight}>
                          {item.points != null && (
                            <Text style={s.listPoints}>▲ {item.points > 999 ? `${(item.points/1000).toFixed(1)}k` : item.points}</Text>
                          )}
                          <View style={[s.catDot, { backgroundColor: catColor }]} />
                        </View>
                      </View>
                    </View>
                    <Ionicons name="open-outline" size={14} color={C.muted} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {filtered.length === 0 && !loading && (
              <View style={s.emptyState}>
                <Ionicons name="newspaper-outline" size={36} color={C.muted} />
                <Text style={s.emptyTitle}>No {active} articles</Text>
                <Text style={s.emptySub}>Pull down to refresh</Text>
              </View>
            )}
          </ScrollView>
        )
      }
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: C.bg },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16, marginBottom: 12 },
  title:            { color: C.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  sub:              { color: C.muted, fontSize: 12, marginTop: 2 },
  headerRight:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshBtn:       { width: 36, height: 36, borderRadius: 11, backgroundColor: C.surface, borderWidth: 1, borderColor: C.primary + '40', alignItems: 'center', justifyContent: 'center' },
  closeBtn:         { width: 36, height: 36, borderRadius: 11, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  filterRow:        { marginBottom: 16, maxHeight: 44 },
  chip:             { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  chipText:         { color: C.muted, fontSize: 13, fontWeight: '500' },
  chipTextActive:   { color: '#fff', fontWeight: '700' },
  chipCount:        { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  chipCountText:    { color: '#fff', fontSize: 10, fontWeight: '700' },
  loader:           { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loaderText:       { color: C.muted, fontSize: 14 },

  // Featured section
  featuredSection:  { paddingHorizontal: 16, gap: 10, marginBottom: 4 },
  featuredCard:     { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, overflow: 'hidden', flexDirection: 'row' },
  featuredCardLarge:{ },
  catStripe:        { width: 4 },
  featuredBody:     { flex: 1, padding: 14 },
  featuredTop:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  catBadge:         { borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3 },
  catBadgeText:     { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  trendBadge:       { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.warn + '18', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  trendText:        { color: C.warn, fontSize: 11, fontWeight: '700' },
  featuredTitle:    { color: C.text, fontWeight: '600', fontSize: 14, lineHeight: 20, marginBottom: 10 },
  featuredTitleLarge:{ fontSize: 16, lineHeight: 23, fontWeight: '700' },
  cardFooter:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  srcRow:           { flexDirection: 'row', alignItems: 'center', gap: 5 },
  srcText:          { color: C.muted, fontSize: 11 },
  dot:              { color: C.muted, fontSize: 11 },
  metaRight:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pointsBadge:      { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: C.warn + '15', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  pointsText:       { color: C.warn, fontSize: 11, fontWeight: '700' },
  readBadge:        { flexDirection: 'row', alignItems: 'center', gap: 2 },
  readText:         { color: C.muted, fontSize: 11 },

  // Divider
  sectionLabel:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginVertical: 12 },
  sectionLabelText: { color: C.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  sectionLine:      { flex: 1, height: 1, backgroundColor: C.border },

  // List cards
  listCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: 'hidden', paddingRight: 12, paddingVertical: 12 },
  listStripe:       { width: 3, alignSelf: 'stretch', marginRight: 12 },
  listBody:         { flex: 1 },
  listTitle:        { color: C.text, fontSize: 13, fontWeight: '600', lineHeight: 19, marginBottom: 6 },
  listFooter:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listPoints:       { color: C.warn, fontSize: 11, fontWeight: '600' },
  catDot:           { width: 7, height: 7, borderRadius: 4 },

  // Empty
  emptyState:       { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle:       { color: C.sub, fontSize: 16, fontWeight: '600' },
  emptySub:         { color: C.muted, fontSize: 13 },
});
