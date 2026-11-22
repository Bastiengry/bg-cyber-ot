import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { Card, PrimaryButton, ProgressBar, Screen } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { COURSE_MODULES } from '@/data/courses';
import { QUIZ_QUESTIONS } from '@/data/quizzes';
import { useProgress } from '@/lib/progress';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mod = COURSE_MODULES.find((m) => m.id === id);
  const questions = useMemo(() => QUIZ_QUESTIONS.filter((q) => q.moduleId === id), [id]);
  const { saveQuizScore } = useProgress();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!mod || questions.length === 0) {
    return (
      <Screen>
        <Card>
          <Text style={styles.question}>Quiz introuvable</Text>
        </Card>
      </Screen>
    );
  }

  const question = questions[index];
  const answered = selected !== null;
  const isCorrect = selected === question.answerIndex;

  function select(option: number) {
    if (answered) return;
    setSelected(option);
    if (option === question.answerIndex) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(null);
      return;
    }
    const score = { correct: correctCount, total: questions.length };
    saveQuizScore(questions[0].moduleId, score);
    setFinished(true);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    const passed = pct >= 80;
    return (
      <Screen>
        <Card style={{ alignItems: 'center', marginTop: Spacing.xl }}>
          <Text style={{ fontSize: 44 }}>{passed ? '✅' : '📖'}</Text>
          <Text style={styles.scoreBig}>{correctCount}/{questions.length}</Text>
          <Text style={styles.scoreText}>
            {passed
              ? 'Validé — vous maîtrisez ce module.'
              : 'Revoyez les leçons « À retenir » puis retentez le quiz : objectif 80%.'}
          </Text>
          <PrimaryButton label="Refaire le quiz" tone="blue" onPress={restart} style={{ alignSelf: 'stretch', marginTop: Spacing.lg }} />
          <PrimaryButton
            label={passed ? 'Atelier pratique' : 'Retour au module'}
            onPress={() =>
              passed
                ? router.push('(tabs)/ateliers')
                : router.back()
            }
            style={{ alignSelf: 'stretch', marginTop: Spacing.sm }}
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <ProgressBar pct={((index + (answered ? 1 : 0)) / questions.length) * 100} tone="blue" />
      <Text style={styles.counter}>
        QUESTION {index + 1} / {questions.length}
      </Text>

      <Card>
        <Text style={styles.question}>{question.prompt}</Text>
        <View style={styles.options}>
          {question.options.map((opt, i) => {
            let style: StyleProp<ViewStyle> = styles.option;
            let text: StyleProp<TextStyle> = styles.optionText;
            if (answered) {
              if (i === question.answerIndex) {
                style = styles.optionCorrect;
                text = styles.optionCorrectText;
              } else if (i === selected) {
                style = styles.optionWrong;
                text = styles.optionWrongText;
              }
            }
            return (
              <Pressable key={i} onPress={() => select(i)} style={style}>
                <Text style={text}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {answered && (
        <Card style={{ borderColor: isCorrect ? Colors.accent : Colors.red }}>
          <Text style={{ color: isCorrect ? Colors.accent : Colors.red, fontWeight: '800', marginBottom: 6 }}>
            {isCorrect ? 'Bonne réponse' : 'Réponse incorrecte'}
          </Text>
          <Text style={styles.explanation}>{question.explanation}</Text>
        </Card>
      )}

      <PrimaryButton label={answered ? 'Question suivante' : 'Choisissez une réponse'} onPress={next} disabled={!answered} style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  counter: {
    color: Colors.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  question: { color: Colors.text, fontSize: 17, fontWeight: '700', lineHeight: 25 },
  options: { gap: Spacing.sm, marginTop: Spacing.lg },
  option: {
    backgroundColor: Colors.cardAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionText: { color: Colors.text, fontSize: 14, lineHeight: 20 },
  optionCorrect: { borderColor: Colors.accent, backgroundColor: 'rgba(57,217,138,0.12)' },
  optionCorrectText: { color: Colors.accent, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  optionWrong: { borderColor: Colors.red, backgroundColor: 'rgba(242,69,92,0.12)' },
  optionWrongText: { color: Colors.red, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  explanation: { color: Colors.text, fontSize: 14, lineHeight: 21 },
  scoreBig: { color: Colors.text, fontSize: 34, fontWeight: '800', marginVertical: Spacing.sm },
  scoreText: { color: Colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
