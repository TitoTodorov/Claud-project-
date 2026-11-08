import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Home from './src/screens/Home';
import TopicPicker from './src/screens/TopicPicker';
import { TOPIC_KEYS } from './src/sources';
import { colors } from './src/theme';

const TOPICS_KEY = 'chosen-topics-v1';

export default function App() {
  const [topics, setTopics] = useState(null); // null = still loading
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(TOPICS_KEY)
      .then((raw) => {
        const saved = (raw ? JSON.parse(raw) : []).filter((t) => TOPIC_KEYS.includes(t));
        setTopics(saved);
        setPicking(saved.length === 0); // first launch: ask what they want to see
      })
      .catch(() => { setTopics([]); setPicking(true); });
  }, []);

  const save = (chosen) => {
    const ordered = TOPIC_KEYS.filter((t) => chosen.includes(t));
    setTopics(ordered);
    setPicking(false);
    AsyncStorage.setItem(TOPICS_KEY, JSON.stringify(ordered)).catch(() => {});
  };

  let screen;
  if (topics === null) {
    screen = <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.paper }}><ActivityIndicator /></View>;
  } else if (picking) {
    screen = <TopicPicker initial={topics} onDone={save} onCancel={topics.length ? () => setPicking(false) : undefined} />;
  } else {
    screen = <Home topics={topics} onEditTopics={() => setPicking(true)} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen}
    </SafeAreaProvider>
  );
}
