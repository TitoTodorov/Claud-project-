import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TOPICS, TOPIC_KEYS } from '../sources';
import { colors, serif } from '../theme';

export default function TopicPicker({ initial = [], onDone, onCancel }) {
  const [picked, setPicked] = useState(new Set(initial));

  const toggle = (key) =>
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const ready = picked.size > 0;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>THE DAILY BRIEF</Text>
        <Text style={styles.title}>What do you want to read?</Text>
        <Text style={styles.subtitle}>Pick one or more topics. You can change this anytime.</Text>

        {TOPIC_KEYS.map((key) => {
          const t = TOPICS[key];
          const on = picked.has(key);
          return (
            <Pressable
              key={key}
              onPress={() => toggle(key)}
              style={({ pressed }) => [styles.card, on && styles.cardOn, pressed && { opacity: 0.8 }]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
            >
              <Text style={styles.emoji}>{t.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, on && { color: colors.paper }]}>{t.label}</Text>
                <Text style={[styles.cardBlurb, on && { color: '#E9E4D8' }]}>{t.blurb}</Text>
              </View>
              <View style={[styles.check, on && styles.checkOn]}>
                {on && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </Pressable>
          );
        })}

        <Pressable
          disabled={!ready}
          onPress={() => onDone([...picked])}
          style={({ pressed }) => [styles.button, !ready && styles.buttonOff, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.buttonText}>{ready ? 'Show my news' : 'Pick at least one topic'}</Text>
        </Pressable>
        {onCancel && (
          <Pressable onPress={onCancel} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 24, paddingTop: 40, maxWidth: 640, width: '100%', alignSelf: 'center' },
  kicker: { fontFamily: serif, letterSpacing: 3, color: colors.accent, fontWeight: '700', fontSize: 13 },
  title: { fontFamily: serif, fontSize: 34, fontWeight: '700', color: colors.ink, marginTop: 12 },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: 8, marginBottom: 28 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 16, padding: 18, marginBottom: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: colors.rule, backgroundColor: colors.card,
  },
  cardOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  emoji: { fontSize: 30 },
  cardTitle: { fontFamily: serif, fontSize: 21, fontWeight: '700', color: colors.ink },
  cardBlurb: { fontSize: 14, color: colors.muted, marginTop: 2 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.rule, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkMark: { color: '#fff', fontWeight: '800' },
  button: { marginTop: 18, backgroundColor: colors.accent, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  buttonOff: { backgroundColor: '#C9C2B6' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  cancel: { alignItems: 'center', padding: 14 },
  cancelText: { color: colors.muted, fontSize: 16 },
});
