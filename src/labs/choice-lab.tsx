import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, PrimaryButton } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type LabChoice = { label: string; correct: boolean; feedback: string };

export type LabPhase = {
  title: string;
  brief: string;
  choices: LabChoice[];
  commandLines?: string[];
  usb?: boolean;
};

type Props = {
  emoji: string;
  title: string;
  intro: string;
  objectives: string[];
  phases: LabPhase[];
  finalNote: string;
  visual?: (phaseIdx: number, allDone: boolean) => ReactNode;
  onCompleted: () => void;
};

type LogLine = { time: string; text: string; tone: 'muted' | 'accent' | 'red' | 'amber' };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function UsbInsertion() {
  const [slide] = useState(() => new Animated.Value(0));
  const [inserted, setInserted] = useState(false);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: 1,
      duration: 1600,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => setInserted(true));
  }, [slide]);

  const dx = slide.interpolate({ inputRange: [0, 1], outputRange: [130, 0] });

  return (
    <View style={termStyles.usbRow}>
      <View style={termStyles.device}>
        <Text style={termStyles.deviceLabel}>POSTE STEP 7</Text>
        <View style={[termStyles.slot, inserted && termStyles.slotLit]} />
        {inserted && <Text style={termStyles.usbMsg}>[+] clé détectée</Text>}
      </View>
      <View style={termStyles.stickTrack}>
        <Animated.View style={[termStyles.stick, { transform: [{ translateX: dx }] }]}>
          <View style={termStyles.stickBody}>
            <View style={termStyles.stickLight} />
          </View>
          <View style={termStyles.stickMetal} />
          <View style={termStyles.stickHole} />
        </Animated.View>
      </View>
    </View>
  );
}

function Terminal({ lines }: { lines: string[] }) {
  const [shown, setShown] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let li = 0;

    const advance = () => {
      li += 1;
      if (li < lines.length) processLine(lines[li]);
    };

    const processLine = (line: string) => {
      if (cancelled) return;
      if (line.startsWith('>')) {
        let ci = 0;
        const typeStep = () => {
          if (cancelled) return;
          if (ci <= line.length) {
            setCurrent(line.slice(0, ci));
            ci += 1;
            timers.push(setTimeout(typeStep, 26));
          } else {
            setShown((s) => [...s, line]);
            setCurrent(null);
            timers.push(setTimeout(advance, 300));
          }
        };
        typeStep();
      } else {
        setShown((s) => [...s, line]);
        timers.push(setTimeout(advance, 260));
      }
    };

    if (lines.length) processLine(lines[0]);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [lines]);

  return (
    <View style={termStyles.term}>
      <View style={termStyles.termBar}>
        {['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => (
          <View key={c} style={[termStyles.dot, { backgroundColor: c }]} />
        ))}
        <Text style={termStyles.termTitle}>console</Text>
      </View>
      <View style={termStyles.termBody}>
        {shown.map((l, i) => (
          <Text key={i} style={[termStyles.termText, l.startsWith('>') && termStyles.termCmd]}>
            {l}
          </Text>
        ))}
        {current !== null && (
          <Text style={termStyles.termCmd}>
            {current}
            <Text style={termStyles.cursor}>▌</Text>
          </Text>
        )}
      </View>
    </View>
  );
}

export default function ChoiceLab({ emoji, title, intro, objectives, phases, finalNote, visual, onCompleted }: Props) {
  const [started, setStarted] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [objectivesDone, setObjectivesDone] = useState<boolean[]>(() => objectives.map(() => false));
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);
  const [terminal, setTerminal] = useState<string[] | null>(null);
  const [terminalKey, setTerminalKey] = useState(0);
  const [showUsb, setShowUsb] = useState(false);

  const [orders] = useState(() => phases.map((p) => shuffle(p.choices.map((_, i) => i))));

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
    if (phase.commandLines) {
      setTerminal(phase.commandLines);
      setTerminalKey((k) => k + 1);
      setShowUsb(Boolean(phase.usb));
    }
    setObjectivesDone((prev) => {
      if (prev[phaseIdx]) return prev;
      const next = [...prev];
      next[phaseIdx] = true;
      return next;
    });
    setPhaseIdx((p) => p + 1);
    setFeedback(null);
  };

  const currentChoices = allDone ? [] : orders[phaseIdx].map((i) => phase.choices[i]);

  return (
    <View style={{ flex: 1, gap: Spacing.md }}>
      <View style={styles.objectives}>
        {objectives.map((o, i) => (
          <Text key={i} style={[styles.objective, objectivesDone[i] && styles.objectiveDone]}>
            {objectivesDone[i] ? '✔' : '○'} {o}
          </Text>
        ))}
      </View>

      {visual && <>{visual(phaseIdx, allDone)}</>}

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
          {currentChoices.map((choice, i) => (
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

      {(terminal || showUsb) && (
        <Card style={{ maxHeight: 340 }}>
          {showUsb && <UsbInsertion />}
          {terminal && <Terminal key={terminalKey} lines={terminal} />}
        </Card>
      )}

      <Card style={{ maxHeight: 280 }}>
        <Text style={styles.sectionTitle}>Journal de bord</Text>
        <ScrollView style={{ maxHeight: 210 }} nestedScrollEnabled showsVerticalScrollIndicator>
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
        </ScrollView>
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

const termStyles = StyleSheet.create({
  term: {
    backgroundColor: '#0B0F14',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  termBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    backgroundColor: Colors.cardAlt,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  termTitle: { color: Colors.muted, fontSize: 10, marginLeft: 4 },
  termBody: { padding: Spacing.sm, gap: 2 },
  termText: { color: Colors.muted, fontSize: 11, lineHeight: 16, fontFamily: 'monospace' },
  termCmd: { color: Colors.accent, fontSize: 11, lineHeight: 16, fontFamily: 'monospace' },
  cursor: { color: Colors.accent },
  usbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  device: {
    alignItems: 'center',
    gap: 4,
  },
  deviceLabel: { color: Colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  slot: {
    width: 42,
    height: 7,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  slotLit: { backgroundColor: Colors.accent },
  usbMsg: { color: Colors.accent, fontSize: 10 },
  stickTrack: { position: 'relative', width: 150, height: 34, justifyContent: 'center' },
  stick: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickBody: {
    width: 30,
    height: 20,
    backgroundColor: Colors.blue,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 3,
  },
  stickLight: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.accent },
  stickMetal: {
    width: 18,
    height: 12,
    backgroundColor: '#9AA7B4',
  },
  stickHole: {
    width: 4,
    height: 12,
    backgroundColor: '#4A5560',
  },
});
