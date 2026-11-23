import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, PrimaryButton } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type LabChoice = { label: string; correct: boolean; feedback: string };

export type LabPhase = {
  title: string;
  brief: string;
  choices: LabChoice[];
};

type Props = {
  emoji: string;
  title: string;
  intro: string;
  objectives: string[];
  phases: LabPhase[];
  finalNote: string;
  onCompleted: () => void;
};

type LogLine = { time: string; text: string; tone: 'muted' | 'accent' | 'red' | 'amber' };

export default function ChoiceLab({ emoji, title, intro, objectives, phases, finalNote, onCompleted }: Props) {
  const [started, setStarted] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [objectivesDone, setObjectivesDone] = useState<boolean[]>(() => objectives.map(() => false));
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);

  const addLog = (text: string, tone: LogLine['tone'] = 'muted') => {
    const time = new Date().toTimeString().slice(0, 8);
    setLog((prev) => [{ time, text, tone }, ...prev].slice(0, 40));
  };

  useEffect(() => {
    if (objectivesDone.every(Boolean)) onCompleted();
  }, [objectivesDone, onCompleted]);

  if (!started) {
    return (
      <View style={styles.intro}>
        <Text style={styles.introEmoji}>{emoji}</Text>
        <Text style={styles.introTitle}>{title}</Text>
        <Text style={styles.introText}>{intro}</Text>
        <PrimaryButton label="Lancer le scénario" onPress={() => setStarted(true)} style={{ marginTop: Spacing.lg }} />
      </View>
    );
  }

  const phase = phases[phaseIdx];
  const allDone = phaseIdx >= phases.length;

  const pick = (choice: LabChoice) => {
    setFeedback({ text: choice.feedback, correct: choice.correct });
    if (!choice.correct) {
      addLog(choice.feedback, 'red');
      return;
    }
    addLog(choice.feedback, 'accent');
    setObjectivesDone((prev) => {
      if (prev[phaseIdx]) return prev;
      const next = [...prev];
      next[phaseIdx] = true;
      return next;
    });
    setPhaseIdx((p) => p + 1);
    setFeedback(null);
  };

  return (
    <View style={{ flex: 1, gap: Spacing.md }}>
      <View style={styles.objectives}>
        {objectives.map((o, i) => (
          <Text key={i} style={[styles.objective, objectivesDone[i] && styles.objectiveDone]}>
            {objectivesDone[i] ? '✔' : '○'} {o}
          </Text>
        ))}
      </View>

      {allDone ? (
        <Card style={{ borderColor: Colors.accent }}>
          <Text style={styles.sectionTitle}>Scénario réussi ✅</Text>
          <Text style={styles.introText}>{finalNote}</Text>
        </Card>
      ) : (
        <Card>
          <Text style={styles.phaseTag}>Étape {phaseIdx + 1} / {phases.length}</Text>
          <Text style={styles.sectionTitle}>{phase.title}</Text>
          <Text style={styles.introText}>{phase.brief}</Text>
          {phase.choices.map((choice, i) => (
            <Pressable
              key={i}
              onPress={() => pick(choice)}
              style={({ pressed }) => [styles.choice, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.choiceText}>{choice.label}</Text>
            </Pressable>
          ))}
          {feedback && !feedback.correct && (
            <Text style={styles.feedbackBad}>{feedback.text}</Text>
          )}
        </Card>
      )}

      <Card style={{ maxHeight: 260 }}>
        <Text style={styles.sectionTitle}>Journal de bord</Text>
        {log.length === 0 ? (
          <Text style={styles.mono}>Aucune action enregistrée. Choisissez une action.</Text>
        ) : (
          log.map((l, i) => (
            <Text
              key={i}
              style={[styles.mono, l.tone === 'red' && styles.logRed, l.tone === 'accent' && styles.logAccent, l.tone === 'amber' && styles.logAmber]}
            >
              [{l.time}] {l.text}
            </Text>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { flex: 1, padding: Spacing.lg, justifyContent: 'center' },
  introEmoji: { fontSize: 40, marginBottom: Spacing.md },
  introTitle: { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: Spacing.md },
  introText: { color: Colors.muted, fontSize: 14, lineHeight: 21 },
  objectives: { gap: 4 },
  objective: { color: Colors.muted, fontSize: 13, lineHeight: 20 },
  objectiveDone: { color: Colors.accent },
  phaseTag: { color: Colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  sectionTitle: { color: Colors.text, fontWeight: '800', fontSize: 14, marginBottom: Spacing.sm },
  choice: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  choiceText: { color: Colors.text, fontSize: 13, lineHeight: 18 },
  feedbackBad: { color: Colors.red, fontSize: 13, lineHeight: 18, marginTop: Spacing.xs },
  mono: { color: Colors.muted, fontSize: 12, fontFamily: 'monospace' },
  logRed: { color: Colors.red },
  logAccent: { color: Colors.accent },
  logAmber: { color: Colors.amber },
});
