import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { Card, Pill, ProgressBar, Screen, Title } from '@/components/ui';
import { COURSE_MODULES } from '@/data/courses';
import { useProgress } from '@/lib/progress';

const LEVEL_TONE = {
  'Débutant': 'accent',
  'Intermédiaire': 'blue',
  'Avancé': 'amber',
} as const;

export default function Cours() {
  const { isLessonDone, isQuizDone, state } = useProgress();

  return (
    <Screen>
      <Title subtitle="De zéro jusqu’aux situations d’incident réelles">Programme de formation</Title>

      {COURSE_MODULES.map((mod, index) => {
        const doneCount = mod.lessons.filter((l) => isLessonDone(l.id)).length;
        const pct = Math.round((doneCount / mod.lessons.length) * 100);
        const quiz = state.quizScores[mod.id];
        return (
          <Card key={mod.id} onPress={() => router.push({ pathname: '/module/[id]', params: { id: mod.id } })} style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
              <Text style={styles.emoji}>{mod.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.index}>MODULE {index + 1}</Text>
                <Text style={styles.title}>{mod.title}</Text>
                <Text style={styles.subtitle}>{mod.subtitle}</Text>
              </View>
              {isQuizDone(mod.id) && quiz ? (
                <Pill label={`${quiz.correct}/${quiz.total}`} tone="accent" />
              ) : (
                <Pill label={mod.level} tone={LEVEL_TONE[mod.level]} />
              )}
            </View>
            <View style={{ marginTop: Spacing.md, gap: 6 }}>
              <ProgressBar pct={pct} tone={pct === 100 ? 'accent' : 'blue'} />
              <Text style={styles.progressText}>
                {doneCount}/{mod.lessons.length} leçons{quiz ? ` · quiz ${quiz.correct}/${quiz.total}` : ''}
              </Text>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  index: {
    color: Colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  emoji: {
    fontSize: 26,
  },
  progressText: {
    color: Colors.muted,
    fontSize: 12,
  },
});
