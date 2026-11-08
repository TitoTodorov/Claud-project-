import { Platform } from 'react-native';

export const colors = {
  paper: '#FAF7F0',
  ink: '#1A1A1A',
  muted: '#6B6560',
  rule: '#D8D2C6',
  accent: '#A4161A',
  card: '#FFFFFF',
};

// Classic newspaper serif on each platform.
export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });
