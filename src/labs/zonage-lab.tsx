import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, PrimaryButton, ProgressBar } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ZONAGE_ITEMS, ZONAGE_ZONES } from '@/data/labs-data';
import type { LabResult } from '@/lib/labs';

export default function ZonageLab({ onComplete }: { onComplete: (result: LabResult) => void }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const item = ZONAGE_ITEMS[index];
  const isCorrect = choice === item.zone;

  function choose(zone: string) {
    if (choice) return;
    setChoice(zone);
    if (zone === item.zone) setCorrect((c) => c + 1);
  }

  function next() {
    if (index + 1 < ZONAGE_ITEMS.length) {
      setIndex(index + 1);
      setChoice(null);
      return;
    }
    setFinished(true);
    onComplete({ correct, total: ZONAGE_ITEMS.length });
  }

  function restart() {
    setIndex(0);
    setChoice(null);
    setCorrect(0);
    setFinished(false);
  }

  if (finished) {
    const passed = correct >= Math.ceil(ZONAGE_ITEMS.length * 0.8);
    return (
      <Card style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 44 }}>{passed ? '✅' : '🏗️'}</Text>
        <Text style={styles.scoreBig}>
          {correct}/{ZONAGE_ITEMS.length}
        </Text>
        <Text style={styles.scoreText}>
          {passed
            ? 'Segmentation maîtrisée : vous savez ranger un actif dans le bon niveau de Purdue et repérer une dérive (accès fournisseur permanent en supervision).'
            : 'Objectif 80% : retenez surtout le niveau 0/1 (procédé), 3 (exploitation), 3.5 (échanges IT/OT) et 4/5 (bureautique).'}
        </Text>
        <PrimaryButton label="Refaire" tone="blue" onPress={restart} style={{ alignSelf: 'stretch', marginTop: Spacing.lg }} />
      </Card>
    );
  }

  return (
    <View style={{ gap: Spacing.md }}>
      <ProgressBar pct={((index + (choice ? 1 : 0)) / ZONAGE_ITEMS.length) * 100} tone="blue" />
      <Text style={styles.counter}>
        ACTIF {index + 1} / {ZONAGE_ITEMS.length}
      </Text>
      <Card>
        <Text style={styles.asset}>{item.asset}</Text>
        <Text style={styles.hint}>{item.hint}</Text>
        <View style={styles.zones}>
          {ZONAGE_ZONES.map((z) => {
            let borderColor: string = Colors.border;
            let bg: string = Colors.cardAlt;
            let fg: string = Colors.text;
            if (choice) {
              if (z === item.zone) {
                borderColor = Colors.accent;
                bg = 'rgba(57,217,138,0.12)';
                fg = Colors.accent;
              } else if (z === choice) {
                borderColor = Colors.red;
                bg = 'rgba(242,69,92,0.12)';
                fg = Colors.red;
              }
            }
            return (
              <Pressable key={z} onPress={() => choose(z)} style={[styles.zoneButton, { borderColor, backgroundColor: bg }]}>
                <Text style={[styles.zoneText, { color: fg }]}>{z}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {choice && (
        <Card style={{ borderColor: isCorrect ? Colors.accent : Colors.red }}>
          <Text style={{ color: isCorrect ? Colors.accent : Colors.red, fontWeight: '800', marginBottom: 6 }}>
            {isCorrect ? 'Correct' : `Réponse : ${item.zone}`}
          </Text>
          <Text style={styles.whyText}>{item.why}</Text>
        </Card>
      )}

      <PrimaryButton label={choice ? 'Actif suivant' : 'Choisissez une zone'} onPress={next} disabled={!choice} style={{ marginBottom: Spacing.xl }} />
    </View>
  );
}

const styles = StyleSheet.create({
  counter: { color: Colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  asset: { color: Colors.text, fontSize: 17, fontWeight: '700', lineHeight: 24 },
  hint: { color: Colors.muted, fontSize: 13, marginTop: 6 },
  zones: { gap: Spacing.sm, marginTop: Spacing.lg },
  zoneButton: {
    paddingVertical: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  zoneText: { fontWeight: '700', fontSize: 14 },
  whyText: { color: Colors.text, fontSize: 14, lineHeight: 21 },
  scoreBig: { color: Colors.text, fontSize: 34, fontWeight: '800', marginVertical: Spacing.sm },
  scoreText: { color: Colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
