import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Pill, Screen, Title } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { LABS } from '@/data/labs-registry';
import { useProgress } from '@/lib/progress';

export default function Ateliers() {
  const { isLabDone, state } = useProgress();

  return (
    <Screen indicator>
      <Title subtitle="Des situations réelles d’usine, à traiter comme sur le terrain">Ateliers pratiques</Title>

      <View style={styles.list}>
        {LABS.map((lab) => {
          const done = isLabDone(lab.id);
          const score = state.quizScores[`lab-${lab.id}`];
          return (
            <Card
              key={lab.id}
              onPress={() => router.push({ pathname: '/lab/[id]', params: { id: lab.id } })}
              style={lab.id === LABS[LABS.length - 1].id ? styles.rowLast : styles.row}
            >
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
      </View>

      <Text style={styles.note}>
        Ces ateliers simulent ce qu’un ingénieur cyber-OT rencontre : une écriture Modbus suspecte
        dans une consigne, un rebond récent du réseau bureautique vers le procédé, l’incident Danfoss
        de 2026, un flux de logs mêlant trafic normal et hostile, une carte réseau à segmenter.
        Traitez-les comme des exercices d’entraînement : décrivez votre raisonnement à voix haute
        avant de valider.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
  row: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  rowLast: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  emoji: { fontSize: 22 },
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
