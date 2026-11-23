import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import ChoiceLab, { type LabPhase } from '@/labs/choice-lab';

const OBJECTIVES = [
  'Franchir l’air gap (pas d’Internet : support amovible)',
  'Reconnaître l’environnement et injecter les blocs dans les automates S7',
  'Devenir invisible : enregistrer puis rejouer les valeurs normales',
  'Saboter les cascades en faisant osciller la fréquence des convertisseurs',
  'Engager la défense : indépendance des mesures, contrôle USB, intégrité des programmes',
];

const PHASES: LabPhase[] = [
  {
    title: 'Franchir l’air gap',
    brief:
      'Natanz, usine d’enrichissement : le réseau industriel est cloisonné, aucune porte vers Internet. Vous êtes sur le réseau bureautique d’un fournisseur de l’agence. Comment introduire la charge utile ?',
    choices: [
      {
        label: 'Propagation par clé USB (failles Windows, dont l’exploit des raccourcis .LNK)',
        correct: true,
        feedback:
          'C’est le chemin réel : la charge a traversé l’air gap par supports amovibles, avec quatre jour-zéro Windows et des certificats de signature volés (Realtek, JMicron) pour paraître légitime. Un technicien qui branche une clé sur la station de programmation Step 7 suffit.',
      },
      {
        label: 'Scanner Internet pour trouver les automates exposés',
        correct: false,
        feedback:
          'Aucun automate ici n’est joignable depuis Internet — c’est précisément l’inverse du scénario Danfoss, où les interfaces étaient exposées. L’air gap doit être franchi physiquement.',
      },
      {
        label: 'Hameçonner les opérateurs pour obtenir des accès distants',
        correct: false,
        feedback:
          'Il n’y a pas d’accès distant vers l’OT à voler. La remarquable leçon de Stuxnet : quand le réseau est cloisonné, l’humain qui transporte des fichiers devient le canal.',
      },
    ],
  },
  {
    title: 'Reconnaissance et injection',
    brief:
      'Un poste a été infecté. La charge ne doit s’activer que sur la bonne cible, pour rester invisible partout ailleurs.',
    choices: [
      {
        label: 'Ne s’activer que si l’environnement correspond : automates S7-315 (6ES7-315-2) et S7-417, convertisseurs Fararo Paya ou Vacon, fréquence entre 807 et 1 210 Hz — puis injecter les blocs via la programmation Step 7 (rootkit sur s7otbxsx.dll)',
        correct: true,
        feedback:
          'Empreinte exacte confirmée : la charge ne s’exécute qu’à Natanz, sur les automates qui pilotent les cascades de 164 centrifugeuses. Le rootkit intercepte la lecture/écriture des blocs de programme de Step 7 : l’ingénieur ne voit jamais les blocs malveillants.',
      },
      {
        label: 'Se propager massivement et attaquer tous les automates rencontrés',
        correct: false,
        feedback:
          'C’est ce qui a fini par trahir Stuxnet : il s’est répandu bien au-delà de sa cible (jusqu’à des dizaines de milliers de machines dans le monde). Une arme de précision reste discrète.',
      },
      {
        label: 'Couper les systèmes de protection de cascade dès l’arrivée',
        correct: false,
        feedback:
          'Trop tôt : les protections ont leurs propres automates (S7-417 côté « Cascade Protection System »). Vous devez d’abord couvrir le système de mesure et les protections avant de toucher la vitesse.',
      },
    ],
  },
  {
    title: 'Devenir invisible (man-in-the-middle)',
    brief:
      'Vous pouvez maintenant perturber les centrifugeuses. Problème : chaque variation est visible sur les pupitres et déclenche des alarmes. Comment saboter sans être vu ?',
    choices: [
      {
        label: 'Enregistrer d’abord ~13 jours de valeurs normales de fonctionnement, puis les rejouer en boucle aux opérateurs',
        correct: true,
        feedback:
          'C’est le cœur du déjouement : pendant le sabotage, les salles de contrôle voient une cascade parfaitement nominale — des données authentiques, simplement anciennes. La mesure elle-même est prise en otage.',
      },
      {
        label: 'Afficher des valeurs aléatoires pour brouiller les opérateurs',
        correct: false,
        feedback:
          'Des valeurs incohérentes déclencheraient l’intuition des opérateurs expérimentés instantanément. La force du replay est son réalisme absolu : tout est « normal », comme à l’accoutumée.',
      },
      {
        label: 'Désactiver les alarmes dans la base de données WinCC',
        correct: false,
        feedback:
          'Modifier la configuration visible est détectable et réversible. Stuxnet est allé plus loin : il a truqué la source des mesures, pas leur affichage.',
      },
    ],
  },
  {
    title: 'Le sabotage (oscillation des fréquences)',
    brief:
      'Fréquence nominale du rotor IR-1 : 1 064 Hz (vitesse tangentielle ~334 m/s). Le rotor en aluminium casse vers 1 400–1 432 Hz (~440–450 m/s). Comment détruire en évitant une panne brutale et visible ?',
    choices: [
      {
        label: 'Faire osciller les convertisseurs : montée à 1 410 Hz (~15 min), descente à 2 Hz (~50 min), retour à 1 064 Hz — en boucle, pendant des mois',
        correct: true,
        feedback:
          'C’est la signature réelle du code : cycles successifs de sur-vitesse (rotor à la limite de rupture) et d’arrêts quasi complets (rotor déséquilibré avec l’UF₆ à l’intérieur). Fatigue mécanique casse les centrifugeuses une à une : environ 1 000 déclassées fin 2009–début 2010, sans panne « spectaculaire » identifiable.',
      },
      {
        label: 'Monter toutes les fréquences à 1 410 Hz et y rester',
        correct: false,
        feedback:
          'Tout cassera d’un coup, avec vibrations et décrochages manifestes : le personnel verrait immédiatement la cascade entière tomber. La destruction discrète exige du patient.',
      },
      {
        label: 'Arrêter brutalement toutes les cascades',
        correct: false,
        feedback:
          'Une ligne d’enrichissement qui s’arrête net, c’est une alerte immédiate, une enquête et la découverte probable du logiciel malveillant. L’état cible ici est la dégradation lente et silencieuse.',
      },
    ],
  },
  {
    title: 'Changement de casquette : défense',
    brief:
      'Vous êtes maintenant l’ingénieur cyber-OT du site. Les centrifugeuses cassent trop souvent, le pupitre affiche pourtant des valeurs parfaites. Par où commencer ?',
    choices: [
      {
        label: 'Croiser les mesures avec des instruments indépendants du contrôleur (vibration, fréquence mesurée localement), verrouiller les supports amovibles, vérifier l’intégrité et la signature des blocs de programme, journaliser les écritures',
        correct: true,
        feedback:
          'C’est le triptyque qui aurait trahi Stuxnet : une mesure physique indépendante contredit immédiatement le replay ; le contrôle USB ferme le vecteur d’entrée ; la validation d’intégrité des blocs révèle la surprise des automates. C’est la topologie « confiance zéro » appliquée à la mesure.',
      },
      {
        label: 'Renforcer l’antivirus et les pare-feux des postes Windows',
        correct: false,
        feedback:
          'Nécessaire mais très insuffisant : Stuxnet utilisait quatre jour-zéro et des certificats signés. Le blindage doit porter sur la mesure physique et la chaîne de mise à jour des automates, pas seulement sur l’IT.',
      },
      {
        label: 'Tout débrancher : arrêter l’enrichissement et tout reconstruire',
        correct: false,
        feedback:
          'Mesure extrême et irréaliste en continu. La démarche réelle : détecter par des mesures indépendantes, recharger des programmes d’automate signés, puis fermer le vecteur USB.',
      },
    ],
  },
];

const N = 12;
const NOMINAL = 1064;

function freqColor(f: number) {
  if (Math.abs(f - NOMINAL) <= 25) return Colors.blue;
  if (f < 80) return Colors.red;
  return Colors.red;
}

function StuxnetVisual({ phaseIdx, allDone }: { phaseIdx: number; allDone: boolean }) {
  const sabotaged = phaseIdx >= 4;
  const defended = allDone;
  const [freq, setFreq] = useState<number[]>(() => Array(N).fill(NOMINAL));
  const [broken, setBroken] = useState<boolean[]>(() => Array(N).fill(false));
  const [selected, setSelected] = useState<number | null>(null);
  const tick = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      tick.current += 1;
      const t = tick.current;
      if (sabotaged && !defended) {
        if (t === 10 || t === 16 || t === 24) {
          setBroken((prev) => {
            const i = [3, 8, 0][[10, 16, 24].indexOf(t)];
            if (prev[i]) return prev;
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }
        setFreq((prev) =>
          prev.map((f, i) => {
            if (broken[i]) return f;
            const wave = (Math.floor(t / 4) + i) % 2;
            const target = wave === 0 ? 1410 : 2;
            return Math.round(f + (target - f) * 0.5);
          }),
        );
      } else if (defended) {
        setFreq((prev) => prev.map((f) => Math.round(f + (NOMINAL - f) * 0.5)));
      }
    }, 1200);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [sabotaged, defended, broken]);

  const brokenCount = broken.filter(Boolean).length;
  const statusText = defended
    ? '✅ Sous contrôle : mesure indépendante en regard, programmes rechargés et signés, supports USB verrouillés'
    : sabotaged
      ? `⚠ Cascade perturbée : oscillation 1 410 / 2 Hz en cours · ${brokenCount} centrifugeuse(s) cassée(s) · pupitre : valeurs « nominales » rejouées`
      : 'Cascade IR-1 (12 centrifugeuses suivies) : fréquence nominale 1 064 Hz, fonctionnement stable';

  return (
    <View style={styles.panel}>
      <Text style={styles.status}>{statusText}</Text>
      <View style={styles.grid}>
        {freq.map((f, i) => {
          const b = broken[i];
          const active = selected === i;
          return (
            <Pressable key={i} onPress={() => setSelected(i)} style={[styles.tile, active && styles.tileActive]}>
              <Text style={styles.tileIndex}>C{String(i + 1).padStart(2, '0')}</Text>
              <Text style={[styles.tileTemp, { color: b ? Colors.red : freqColor(f) }]}>
                {b ? '✖' : `${f} Hz`}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>Touchez une centrifugeuse pour comparer mesure réelle et affichage pupitre</Text>
      {selected !== null && (
        <View style={styles.detail}>
          <Text style={styles.detailTitle}>C{String(selected + 1).padStart(2, '0')} — rotor IR-1, convertisseur de fréquence</Text>
          <Text style={styles.detailLine}>Fréquence réelle du rotor : {broken[selected] ? '0 Hz (rotor rompu — à remplacer)' : `${freq[selected]} Hz`}</Text>
          <Text style={[styles.detailLine, { color: sabotaged && !defended ? Colors.red : Colors.accent }]}>
            Affichage pupitre (via automate) : {sabotaged && !defended ? '1 064 Hz — valeurs normales rejouées, ne pas croire' : `${Math.round(freq[Math.min(selected, N - 1)])} Hz si mesure cohérente`}
          </Text>
          <Text style={styles.detailLine}>
            Vibration rotor : {broken[selected] ? '—' : `${(2 + Math.abs(freq[selected] - NOMINAL) / 60).toFixed(1)} mm/s`}{!broken[selected] && Math.abs(freq[selected] - NOMINAL) > 50 ? ' (hors tolérance)' : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function StuxnetLab({ onCompleted }: { onCompleted: () => void }) {
  return (
    <ChoiceLab
      emoji="⚙️"
      title="Stuxnet : centrifugeuses sous sabotage"
      intro={
        'Scénario fondé sur Stuxnet (découvert en juin 2010), premier cyber-arme documenté visant la destruction physique : les centrifugeuses IR-1 de l’usine d’enrichissement de Natanz (Iran), censées être hors d’atteinte derrière un air gap.\n\n' +
        'Vous rejouez la chaîne d’attaque sur une cascade de 12 centrifugeuses — comparez la mesure réelle et l’affichage du pupitre — puis vous passez côté défense.'
      }
      objectives={OBJECTIVES}
      phases={PHASES}
      finalNote={
        'À retenir : l’air gap ne protège pas des supports amovibles ; un attaquant qui contrôle l’automate contrôle aussi la mesure que vous regardez. En conditions réelles : mesure de vibration/fréquence indépendante du contrôleur, contrôle strict des périphériques amovibles, intégrité et signature des blocs de programme (Step 7), journalisation des écritures vers les automates, et détection des redondances incohérentes entre capteurs.'
      }
      visual={(phaseIdx, allDone) => <StuxnetVisual phaseIdx={phaseIdx} allDone={allDone} />}
      onCompleted={onCompleted}
    />
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  status: { color: Colors.muted, fontSize: 12, lineHeight: 17 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tile: {
    width: '23%',
    aspectRatio: 1.35,
    borderRadius: 8,
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileActive: { borderColor: Colors.text },
  tileIndex: { color: Colors.muted, fontSize: 10 },
  tileTemp: { fontSize: 13, fontWeight: '800' },
  hint: { color: Colors.muted, fontSize: 11 },
  detail: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
  },
  detailTitle: { color: Colors.text, fontWeight: '800', fontSize: 13, marginBottom: 4 },
  detailLine: { color: Colors.muted, fontSize: 12, lineHeight: 18 },
});
