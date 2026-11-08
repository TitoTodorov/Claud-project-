import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ArticleCard, { LeadStory } from '../components/ArticleCard';
import { fetchNews, timeAgo } from '../rss';
import { TOPICS } from '../sources';
import { colors, serif } from '../theme';

const REFRESH_EVERY_MS = 5 * 60 * 1000; // check for new stories every 5 minutes
const CACHE_KEY = 'news-cache-v1';

export default function Home({ topics, onEditTopics }) {
  const [articles, setArticles] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');
  const [, tick] = useState(0);
  const busy = useRef(false);

  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const news = await fetchNews(topics);
      setArticles(news);
      setUpdatedAt(Date.now());
      setError(null);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ topics, news, at: Date.now() })).catch(() => {});
    } catch (e) {
      setError(e.message);
    } finally {
      busy.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [topics]);

  // Show the last saved stories right away, then fetch fresh ones.
  useEffect(() => {
    setTab(topics.length > 1 ? 'all' : topics[0]);
    setArticles([]);
    setUpdatedAt(0);
    setLoading(true);
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        const cache = raw && JSON.parse(raw);
        if (cache && cache.topics.join() === topics.join()) {
          setArticles(cache.news);
          setUpdatedAt(cache.at);
          setLoading(false);
        }
      })
      .catch(() => {})
      .finally(load);
  }, [load, topics]);

  // Auto-update on a timer and whenever the app comes back to the foreground.
  useEffect(() => {
    const timer = setInterval(load, REFRESH_EVERY_MS);
    const clock = setInterval(() => tick((n) => n + 1), 60 * 1000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && load());
    return () => { clearInterval(timer); clearInterval(clock); sub.remove(); };
  }, [load]);

  const shown = useMemo(() => (tab === 'all' ? articles : articles.filter((a) => a.topic === tab)), [articles, tab]);
  const [lead, ...rest] = shown;

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const tabs = topics.length > 1 ? ['all', ...topics] : topics;

  const header = (
    <View>
      <View style={styles.mastRow}>
        <Text style={styles.date}>{today}</Text>
        <Pressable onPress={onEditTopics} hitSlop={10}>
          <Text style={styles.edit}>Topics</Text>
        </Pressable>
      </View>
      <View style={styles.doubleRule} />
      <Text style={styles.masthead} adjustsFontSizeToFit numberOfLines={1}>The Daily Brief</Text>
      <View style={styles.doubleRule} />
      <Text style={styles.updated}>
        {updatedAt ? `Updated ${timeAgo(updatedAt)} · refreshes automatically` : 'Fetching the latest stories…'}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {tabs.map((key) => {
          const on = tab === key;
          return (
            <Pressable key={key} onPress={() => setTab(key)} style={[styles.tab, on && styles.tabOn]}>
              <Text style={[styles.tabText, on && styles.tabTextOn]}>
                {key === 'all' ? 'Top Stories' : `${TOPICS[key].emoji} ${TOPICS[key].label}`}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error && (
        <Pressable onPress={load} style={styles.error}>
          <Text style={styles.errorText}>{error} Tap to retry.</Text>
        </Pressable>
      )}
      {lead && <LeadStory article={lead} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={rest}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => <ArticleCard article={item} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.ink} /> :
          !lead && !error ? <Text style={styles.empty}>No stories right now. Pull down to refresh.</Text> : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  list: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 760, width: '100%', alignSelf: 'center' },
  mastRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 8 },
  date: { fontSize: 12, color: colors.muted, letterSpacing: 0.5 },
  edit: { fontSize: 14, color: colors.accent, fontWeight: '700' },
  doubleRule: { borderTopWidth: 1, borderBottomWidth: 3, borderColor: colors.ink, height: 6 },
  masthead: { fontFamily: serif, fontSize: 44, fontWeight: '900', color: colors.ink, textAlign: 'center', paddingVertical: 6 },
  updated: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 8 },
  tabs: { gap: 8, paddingVertical: 14 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.rule, backgroundColor: colors.card },
  tabOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  tabTextOn: { color: colors.paper },
  error: { backgroundColor: '#FCE8E6', padding: 12, borderRadius: 8, marginBottom: 12 },
  errorText: { color: colors.accent, fontSize: 14 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
