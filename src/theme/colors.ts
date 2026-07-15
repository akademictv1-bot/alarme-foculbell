import { Platform } from 'react-native';

export const colors = {
  label: Platform.select({
    ios: 'label',
    android: '?android:attr/textColor',
    default: '#1a1a1a',
  }),
  secondaryLabel: Platform.select({
    ios: 'secondaryLabel',
    android: '?android:attr/textColorSecondary',
    default: '#6b7280',
  }),
  separator: Platform.select({
    ios: 'separator',
    android: '?android:attr/listDivider',
    default: '#e0e0e0',
  }),
  systemBackground: Platform.select({
    ios: 'systemBackground',
    android: '?android:attr/windowBackground',
    default: '#ffffff',
  }),
  secondarySystemBackground: Platform.select({
    ios: 'secondarySystemBackground',
    android: '?attr/colorSurface',
    default: '#f5f5f5',
  }),
  systemBlue: Platform.select({
    ios: 'systemBlue',
    android: '?attr/colorAccent',
    default: '#007aff',
  }),
  systemRed: Platform.select({
    ios: 'systemRed',
    android: '?attr/colorError',
    default: '#ff3b30',
  }),
  systemGreen: Platform.select({
    ios: 'systemGreen',
    android: '?android:attr/colorControlActivated',
    default: '#34c759',
  }),
  systemOrange: Platform.select({
    ios: 'systemOrange',
    android: '?android:attr/colorControlHighlight',
    default: '#ff9500',
  }),
};
