import { router } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { Card, Pill, ProgressBar, Screen, Title } from '@/components/ui';
import { COURSE_MODULES } from '@/data/courses';
import { LABS } from '@/data/labs-registry';
import { useProgress } from '@/lib/progress';

export default function Home() {
  const { totals, isLabDone, isLessonDone } = useProgress();

  const nextModule =
    COURSE_MODULES.find((m) => m.lessons.some((l) => !isLessonDone(l.id))) ?? COURSE_MODULES[0];
  const doneInNext = nextModule.lessons.filter((l) => isLessonDone(l.id)).length;

  return (
    <Screen indicator>
      <Title subtitle="Entraînement réaliste à la cybersécurité industrielle (OT)">
        Tableau de bord
      </Title>

      <Card style={styles.hero}>
        <Text style={styles.heroLabel}>Progression globale</Text>
        <Text style={styles.heroValue}>{totals.overallPct}%</Text>
        <ProgressBar pct={totals.overallPct} />
        <View style={styles.statsRow}>
          <Stat label="Leçons" value={`${totals.lessonsDone}/${totals.lessonsTotal}`} />
          <Stat label="Quiz réussis" value={`${totals.quizDone}/${totals.quizTotal}`} />
          <Stat label="Ateliers" value={`${totals.labsDone}/${totals.labsTotal}`} />
        </View>
      </Card>

      <Card onPress={() => router.push({ pathname: '/module/[id]', params: { id: nextModule.id } })}>
        <View style={styles.row}>
          <Text style={styles.emoji}>{nextModule.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Continuer : {nextModule.title}</Text>
            <Text style={styles.cardSub}>
              Leçon {Math.min(doneInNext + 1, nextModule.lessons.length)} / {nextModule.lessons.length}
            </Text>
          </View>
          <Text style={styles.chevron}>→</Text>
        </View>
      </Card>

      <Text style={styles.section}>Ateliers du moment</Text>
      {LABS.map((lab) => {
        const done = isLabDone(lab.id);
        return (
          <Card key={lab.id} onPress={() => router.push({ pathname: '/lab/[id]', params: { id: lab.id } })}>
            <Text style={styles.cardTitle}>{lab.emoji} {lab.title}</Text>
            <Pill label={done ? 'Terminé' : lab.tag} tone={done ? 'accent' : 'amber'} />
          </Card>
        );
      })}

      <Text style={styles.section}>Comment progresser</Text>
      <Card style={{ opacity: 0.9 }}>
        <Text style={styles.bodyText}>
          1. Lisez les modules de cours, leçon par leçon.{'\n'}
          2. Validez chaque module par son quiz de 5 questions.{'\n'}
          3. Faites les ateliers pratiques : ils reprennent des situations réelles
          (écriture Modbus non autorisée, pivot IT→OT, incident Danfoss, analyse de logs,
          segmentation).{'\n'}
          4. Votre progression est enregistrée sur l’appareil.
        </Text>
      </Card>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.cardAlt,
    borderColor: Colors.border,
  },
  heroLabel: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroValue: {
    color: Colors.text,
    fontSize: 34,
    fontWeight: '800',
    marginVertical: 6,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
  statValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 26,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardSub: {
    color: Colors.muted,
    fontSize: 13,
  },
  chevron: {
    color: Colors.accent,
    fontSize: 20,
    fontWeight: '800',
  },
  bodyText: {
    color: Colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
});
