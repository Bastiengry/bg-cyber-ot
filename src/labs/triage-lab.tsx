import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, PrimaryButton, ProgressBar } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { TRIAGE_LOGS } from '@/data/labs-data';
import type { LabResult } from '@/lib/labs';

export default function TriageLab({ onComplete }: { onComplete: (result: LabResult) => void }) {
  const [answers, setAnswers] = useState<Record<string, Verdict | undefined>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const score = TRIAGE_LOGS.filter((l) => answers[l.id] === (l.suspicious ? 'suspect' : 'normal')).length;

  function submit() {
    setSubmitted(true);
    onComplete({ correct: score, total: TRIAGE_LOGS.length });
  }

  function tryAgain() {
    setAnswers({});
    setSubmitted(false);
  }

  if (submitted) {
    const passed = score >= Math.ceil(TRIAGE_LOGS.length * 0.8);
    return (
      <View style={{ gap: Spacing.md }}>
        <Card style={{ borderColor: passed ? Colors.accent : Colors.amber }}>
          <Text style={styles.finalScore}>
            {score}/{TRIAGE_LOGS.length} corrects
          </Text>
          <Text style={styles.finalText}>
            {passed
              ? 'Bien joué : vous distinguez le trafic normal d’un site industriel des événements hostiles. En SOC OT, chaque faux positif a un coût : la précision d’abord.'
              : 'Revoyez les explications ci-dessous. Le réflexe à construire : fonctions d’écriture, sources non inventoriées, flux non déclarés, désactivation de protections = suspects.'}
          </Text>
        </Card>
        {TRIAGE_LOGS.map((l) => {
          const given = answers[l.id];
          const ok = given === (l.suspicious ? 'suspect' : 'normal');
          return (
            <Card key={l.id} style={{ borderColor: ok ? Colors.accent : Colors.red }}>
              <Text style={styles.logTime}>
                [{l.time}] {l.source}
              </Text>
              <Text style={styles.logText}>{l.text}</Text>
              <Text style={[styles.verdict, { color: ok ? Colors.accent : Colors.red }]}>
                {ok ? '✔' : '✘'} {l.suspicious ? 'Suspect' : 'Normal'} — vous : {given ?? 'pas de réponse'}
              </Text>
              <Text style={styles.whyText}>{l.why}</Text>
            </Card>
          );
        })}
        <PrimaryButton label="Refaire l’atelier" tone="blue" onPress={tryAgain} style={{ marginBottom: Spacing.xl }} />
      </View>
    );
  }

  return (
    <View style={{ gap: Spacing.md }}>
      <ProgressBar pct={(answeredCount / TRIAGE_LOGS.length) * 100} tone="amber" />
      <Text style={styles.hint}>
        Classez chaque journal : trafic normal d’un site industriel ou événement suspect ?
      </Text>
      {TRIAGE_LOGS.map((l) => (
        <Card key={l.id}>
          <Text style={styles.logTime}>
            [{l.time}] {l.source}
          </Text>
          <Text style={styles.logText}>{l.text}</Text>
          <View style={styles.choiceRow}>
            {(['normal', 'suspect'] as Verdict[]).map((v) => {
              const active = answers[l.id] === v;
              const tone = v === 'suspect' ? Colors.red : Colors.accent;
              return (
                <Pressable
                  key={v}
                  onPress={() => setAnswers((prev) => ({ ...prev, [l.id]: v }))}
                  style={[
                    styles.choice,
                    { borderColor: active ? tone : Colors.border, backgroundColor: active ? `${tone}22` : Colors.cardAlt },
                  ]}
                >
                  <Text style={[styles.choiceText, active && { color: tone }]}>{v === 'normal' ? 'Normal' : 'Suspect'}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      ))}
      <PrimaryButton
        label={`Valider le triage (${answeredCount}/${TRIAGE_LOGS.length})`}
        onPress={submit}
        disabled={answeredCount < TRIAGE_LOGS.length}
        style={{ marginBottom: Spacing.xl }}
      />
    </View>
  );
}

type Verdict = 'normal' | 'suspect';

const styles = StyleSheet.create({
  hint: { color: Colors.muted, fontSize: 14, lineHeight: 20 },
  logTime: { color: Colors.muted, fontSize: 11, fontWeight: '700' },
  logText: { color: Colors.text, fontSize: 14, lineHeight: 20, marginTop: 4, fontFamily: 'monospace' },
  choiceRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  choice: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  choiceText: { color: Colors.muted, fontWeight: '700', fontSize: 13 },
  finalScore: { color: Colors.text, fontSize: 34, fontWeight: '800' },
  finalText: { color: Colors.muted, fontSize: 14, lineHeight: 21, marginTop: Spacing.sm },
  verdict: { fontWeight: '800', fontSize: 13, marginTop: Spacing.md },
  whyText: { color: Colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
});
