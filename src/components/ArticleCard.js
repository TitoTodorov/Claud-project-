import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { TOPICS } from '../sources';
import { timeAgo } from '../rss';
import { colors, serif } from '../theme';

const open = (url) => WebBrowser.openBrowserAsync(url).catch(() => {});

function Byline({ article }) {
  return (
    <Text style={styles.byline}>
      <Text style={styles.topic}>{TOPICS[article.topic].label.toUpperCase()}</Text>
      {'  ·  '}{article.source}{article.date ? `  ·  ${timeAgo(article.date)}` : ''}
    </Text>
  );
}

// The big story at the top of the page.
export function LeadStory({ article }) {
  return (
    <Pressable onPress={() => open(article.link)} style={({ pressed }) => [styles.lead, pressed && styles.pressed]}>
      {article.image && <Image source={{ uri: article.image }} style={styles.leadImage} resizeMode="cover" />}
      <Byline article={article} />
      <Text style={styles.leadTitle}>{article.title}</Text>
      {!!article.summary && <Text style={styles.leadSummary}>{article.summary}</Text>}
    </Pressable>
  );
}

export default function ArticleCard({ article }) {
  return (
    <Pressable onPress={() => open(article.link)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={{ flex: 1 }}>
        <Byline article={article} />
        <Text style={styles.title} numberOfLines={3}>{article.title}</Text>
        {!!article.summary && <Text style={styles.summary} numberOfLines={2}>{article.summary}</Text>}
      </View>
      {article.image && <Image source={{ uri: article.image }} style={styles.thumb} resizeMode="cover" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.6 },
  lead: { paddingBottom: 20, borderBottomWidth: 2, borderBottomColor: colors.ink, marginBottom: 6 },
  leadImage: { width: '100%', aspectRatio: 16 / 9, borderRadius: 4, marginBottom: 12, backgroundColor: colors.rule },
  leadTitle: { fontFamily: serif, fontSize: 28, lineHeight: 34, fontWeight: '700', color: colors.ink, marginTop: 6 },
  leadSummary: { fontFamily: serif, fontSize: 17, lineHeight: 25, color: '#3A3632', marginTop: 10 },
  row: { flexDirection: 'row', gap: 14, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.rule },
  byline: { fontSize: 11.5, color: colors.muted, letterSpacing: 0.4 },
  topic: { color: colors.accent, fontWeight: '800' },
  title: { fontFamily: serif, fontSize: 18, lineHeight: 23, fontWeight: '700', color: colors.ink, marginTop: 5 },
  summary: { fontSize: 14, lineHeight: 20, color: colors.muted, marginTop: 5 },
  thumb: { width: 96, height: 96, borderRadius: 4, backgroundColor: colors.rule },
});
