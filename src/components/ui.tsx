import { Colors, Radius, Spacing } from '@/constants/theme';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        {children}
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Title({ children, subtitle }: { children: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <Text style={styles.title}>{children}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({ children, style, onPress, bordered = true }: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  bordered?: boolean;
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, bordered && styles.cardBorder, style, pressed && { opacity: 0.7 }]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, bordered && styles.cardBorder, style]}>{children}</View>;
}

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'accent' | 'amber' | 'red' | 'blue' }) {
  const bg = {
    neutral: Colors.cardAlt,
    accent: 'rgba(57,217,138,0.15)',
    amber: 'rgba(245,166,35,0.15)',
    red: 'rgba(242,69,92,0.15)',
    blue: 'rgba(76,158,235,0.15)',
  }[tone];
  const fg = { neutral: Colors.muted, accent: Colors.accent, amber: Colors.amber, red: Colors.red, blue: Colors.blue }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ pct, tone = 'accent' }: { pct: number; tone?: 'accent' | 'amber' | 'blue' }) {
  const color = { accent: Colors.accent, amber: Colors.amber, blue: Colors.blue }[tone];
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color }]} />
    </View>
  );
}

export function PrimaryButton({ label, onPress, tone = 'accent', disabled, style }: {
  label: string;
  onPress: () => void;
  tone?: 'accent' | 'red' | 'blue';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg = { accent: Colors.accent, red: Colors.red, blue: Colors.blue }[tone];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg },
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  cardBorder: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.cardAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  button: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0A0E13',
    fontWeight: '800',
    fontSize: 15,
  },
});
