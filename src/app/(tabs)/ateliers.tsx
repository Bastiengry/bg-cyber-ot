import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Pill, Screen, Title } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useProgress } from '@/lib/progress';

const LABS = [
  {
    id: 'modbus',
    emoji: '🛠️',
    title: 'Console Modbus sous attaque',
    subtitle: 'Inventaire, baseline, détection d’une écriture non autorisée, réponse',
    tag: 'Simulation',
  },
  {
    id: 'triage',
    emoji: '📰',
    title: 'Triage de journaux',
    subtitle: '12 journaux d’un site industriel : normal ou suspect ?',
    tag: 'Analyse SOC',
  },
  {
    id: 'zonage',
    emoji: '🏗️',
    title: 'Zonage Purdue',
    subtitle: 'Placez les actifs d’une usine dans les bonnes zones',
    tag: 'Architecture',
  },
] as const;

export default function Ateliers() {
  const { isLabDone, state } = useProgress();

  return (
    <Screen>
      <Title subtitle="Des situations réelles d’usine, à traiter comme sur le terrain">Ateliers pratiques</Title>

      {LABS.map((lab) => {
        const done = isLabDone(lab.id);
        const score =
          lab.id === 'triage' ? state.quizScores['lab-triage'] : state.quizScores['lab-zonage'];
        return (
          <Card key={lab.id} onPress={() => router.push({ pathname: '/lab/[id]', params: { id: lab.id } })} style={styles.card}>
            <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
              <Text style={styles.emoji}>{lab.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{lab.title}</Text>
                <Text style={styles.subtitle}>{lab.subtitle}</Text>
              </View>
              {done ? <Pill label={score ? `${score.correct}/${score.total}` : 'Terminé'} tone="accent" /> : <Pill label={lab.tag} tone="amber" />}
            </View>
          </Card>
        );
      })}

      <Text style={styles.note}>
        Ces ateliers simulent ce qu’un ingénieur cyber-OT rencontre : une écriture Modbus suspecte
        dans une consigne, un flux de logs mélangant trafic normal et hostile, une carte réseau à
        segmenter. Traitez-les comme des exercices d’entraînement : décrivez votre raisonnement à
        voix haute avant de valider.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  emoji: { fontSize: 26 },
  title: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  subtitle: { color: Colors.muted, fontSize: 13, marginTop: 2 },
  note: {
    color: Colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: Spacing.lg,
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: 12,
  },
});
