import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Pill, PrimaryButton, Screen } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { COURSE_MODULES } from '@/data/courses';
import { useProgress } from '@/lib/progress';

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mod = COURSE_MODULES.find((m) => m.id === id);
  const { isLessonDone, markLessonDone, isQuizDone, state } = useProgress();

  if (!mod) {
    return (
      <Screen>
        <Card>
          <Text style={styles.lessonTitle}>Module introuvable</Text>
        </Card>
      </Screen>
    );
  }

  const allLessonsDone = mod.lessons.every((l) => isLessonDone(l.id));
  const quiz = state.quizScores[mod.id];

  return (
    <Screen>
      <Text style={styles.emoji}>{mod.emoji}</Text>
      <Text style={styles.moduleTitle}>{mod.title}</Text>
      <Text style={styles.moduleSub}>{mod.subtitle}</Text>
      <View style={styles.pillRow}>
        <Pill label={mod.level} tone={mod.level === 'Débutant' ? 'accent' : mod.level === 'Intermédiaire' ? 'blue' : 'amber'} />
        <Pill label={`${mod.lessons.length} leçons`} />
      </View>

      <View style={styles.lessonsList}>
        {mod.lessons.map((lesson, i) => {
          const done = isLessonDone(lesson.id);
          return (
            <Card key={lesson.id} style={done ? styles.doneCard : undefined}>
              <Text style={styles.lessonIndex}>
                LEÇON {i + 1} {done ? '· vue' : `· ${lesson.duration}`}
              </Text>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              {lesson.body.map((p, j) => (
                <Text key={j} style={styles.paragraph}>
                  {p}
                </Text>
              ))}
              <View style={styles.keyBox}>
                <Text style={styles.keyTitle}>À retenir</Text>
                {lesson.keyPoints.map((k, j) => (
                  <Text key={j} style={styles.keyPoint}>
                    ✔ {k}
                  </Text>
                ))}
              </View>
              {!done && (
                <PrimaryButton label="Leçon lue et comprise" onPress={() => markLessonDone(lesson.id)} />
              )}
            </Card>
          );
        })}
      </View>

      <Card style={{ alignItems: 'center' }}>
        <Text style={styles.ctaTitle}>
          {quiz ? `Meilleur score : ${quiz.correct}/${quiz.total}` : allLessonsDone ? 'Toutes les leçons sont lues' : 'Terminez les leçons, puis validez vos acquis'}
        </Text>
        <PrimaryButton
          label={isQuizDone(mod.id) ? 'Refaire le quiz' : 'Passer le quiz'}
          tone={allLessonsDone ? 'accent' : 'blue'}
          onPress={() => router.push({ pathname: '/quiz/[id]', params: { id: mod.id } })}
          style={{ alignSelf: 'stretch', marginTop: Spacing.md }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 34 },
  moduleTitle: { color: Colors.text, fontSize: 24, fontWeight: '800', marginTop: Spacing.sm },
  moduleSub: { color: Colors.muted, fontSize: 14, marginTop: 4 },
  pillRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, marginBottom: Spacing.lg },
  lessonsList: { gap: Spacing.md, marginBottom: Spacing.lg },
  doneCard: { borderColor: Colors.accent },
  lessonIndex: {
    color: Colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  lessonTitle: { color: Colors.text, fontSize: 18, fontWeight: '800', marginBottom: Spacing.sm },
  paragraph: { color: Colors.text, fontSize: 15, lineHeight: 23, marginBottom: Spacing.md },
  keyBox: {
    backgroundColor: Colors.cardAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  keyTitle: { color: Colors.accent, fontWeight: '800', fontSize: 13, marginBottom: 6 },
  keyPoint: { color: Colors.text, fontSize: 14, lineHeight: 21 },
  ctaTitle: { color: Colors.muted, fontSize: 14, textAlign: 'center' },
});
