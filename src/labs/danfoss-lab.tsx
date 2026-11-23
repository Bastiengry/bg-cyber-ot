import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import ChoiceLab, { type LabPhase } from '@/labs/choice-lab';

const OBJECTIVES = [
  'Repérer les régulateurs de froid exposés sur Internet',
  'Contourner l’authentification de l’interface StoreView',
  'Prendre le contrôle via la vulnérabilité d’injection de commandes',
  'Comprendre le sabotage par dégivrage forcé (nuit du 11 au 12 octobre 2026)',
  'Engager la défense : masquer, patcher, alerter indépendamment',
];

const PHASES: LabPhase[] = [
  {
    title: 'Repérage — la surface d’attaque',
    commandLines: [
      '> shodan search "StoreView" --fields ip_str,port',
      '[+] ~2 600 interfaces d’admin publiquement accessibles (majorité en France)',
      '> curl -s -m 10 http://203.0.113.7/admin/login.html',
      '[+] Page de connexion StoreView lisible depuis Internet',
    ],
    brief:
      'Vous cherchez à cibler des chaînes du froid. Notez bien : l’incident réel d’octobre 2026 en France (≈700 magasins Intermarché/Netto, Super U, Carrefour, Monoprix, Leclerc) est parti d’ici.',
    choices: [
      {
        label: 'Énumérer les interfaces web StoreView / xweb réellement exposées (moteurs de scan IoT)',
        correct: true,
        feedback:
          'Résultat : des milliers de régulateurs de type Danfoss StoreView et Copeland/Dixell xweb avec une page de connexion publique — environ 2 600 comptés fin octobre, plus de la moitié situés dans des réseaux français. Pas d’humain à compromettre : les interfaces sont directement sur Internet.',
      },
      {
        label: 'Préparer un hameçonnage ciblé contre les responsables maintenance des enseignes',
        correct: false,
        feedback:
          'Inutile ici : l’attaque réelle n’a pas eu besoin de vecteur humain. Les contrôleurs dialoguaient directement avec le monde depuis l’interface web. Cherchez là où l’exposition est.',
      },
      {
        label: 'Surveiller les bases de données marketing pour exploiter des données clients',
        correct: false,
        feedback:
          'Cette angle touche l’IT commerciale, pas la chaîne du froid. Le sabotage de la distribution visiait la régulation elle-même, pas les données.',
      },
    ],
  },
  {
    title: 'Accès initial — le contournement',
    commandLines: [
      '> curl -s -X POST http://203.0.113.7/admin/api/auth -d "user=admin&code=12/10/2026"',
      '[+] 200 OK — contournement « code du jour » (CVE-2025-41450)',
    ],
    brief:
      'Les failles des AK-SM 800A ont été publiées par Claroty (Team82) courant 2025, un correctif (R4.3.1) est sorti en août 2025 — mais des milliers d’appareils n’ont jamais été mis à jour.',
    choices: [
      {
        label: 'Utiliser la faille d’authentification documentée : « admin » + code journalier = date courante (CVE-2025-41450)',
        correct: true,
        feedback:
          'Vous êtes dans l’interface de gestion. La « sécurité » du produit reposait sur un code du jour renvoyé à l’écran : quiconque voit la page peut saisir la date. Il ne reste qu’un pas.',
      },
      {
        label: 'Attaque par dictionnaire massive des mots de passe admin sur des centaines d’appareils',
        correct: false,
        feedback:
          'Bruit colossal, très journalisé, et surtout inutile : le contournement d’authentification est public et ne nécessite aucune force brute.',
      },
    ],
  },
  {
    title: 'Prise de contrôle',
    commandLines: [
      '> curl -s -X POST http://203.0.113.7/admin/api/exec -d "cmd=;id"',
      '[+] uid=0(root) — exécution de commandes confirmée (CVE-2025-41451)',
    ],
    brief: 'Authentifié, vous disposez du panneau d’administration des unités frigorifiques.',
    choices: [
      {
        label: 'Exploiter l’injection de commandes de l’interface web pour exécuter du code (CVE-2025-41451)',
        correct: true,
        feedback:
          'Exécution de commandes confirmée sur le contrôleur : c’est ce niveau d’accès qui a permis de manipuler la régulation, et pas seulement les seuils.',
      },
      {
        label: 'Essayer de reflasher le firmware à distance depuis l’interface',
        correct: false,
        feedback:
          'Risque de briquer les appareils sans gain immédiat. L’attaque réelle n’a pas eu besoin de refaire le firmware : les paramètres de dégivrage sont accessibles à l’exploitation.',
      },
    ],
  },
  {
    title: 'Le sabotage (nuit du 11 au 12 octobre 2026)',
    commandLines: [
      '> curl -s -X POST http://203.0.113.7/admin/api/defrost -d "mode=manual&timeLimit=off"',
      '> curl -s -X POST http://203.0.113.7/admin/api/alarms -d "tempProbe=disabled"',
      '[+] Dégivrage illimité armé, alertes des sondes neutralisées',
      '[!] Nuit du 11 au 12 : jusqu’à 50 °C pendant plus de 6 heures',
    ],
    brief:
      'Vous voulez causer des dégâts visibles en une nuit, sans coupure électrique ni alarme. Qu’ont fait les attaquants réels ?',
    choices: [
      {
        label: 'Forcer un cycle de dégivrage sans limite de temps et couper les alertes des sondes internes',
        correct: true,
        feedback:
          'C’est le scénario réel : dégivrage continu la nuit, sondes de sécurité désactivées, froid monté jusqu’à 50 °C — jusqu’à 80 °C dans certains magasins — pendant plus de 6 heures. Pertes en dizaines de millions d’euros, une vingtaine de départs de feu, et une seconde vague le 2 novembre (Belgique, Pays-Bas, Suède… y compris des banques de sang EFS visées). Attribution annoncée le 9 novembre par la France : unité Shahid Kaveh, adossée aux Gardiens de la révolution iraniens.',
      },
      {
        label: 'Chiffrer les bases de données commerciales des magasins (rançongiciel classique)',
        correct: false,
        feedback:
          'Cette angle est IT et a déjà été vu mille fois. Ce qui a fait de cet incident un cas d’école OT, c’est l’effet physique sur une chaîne critique, pas le chiffrement.',
      },
    ],
  },
  {
    title: 'Changement de casquette : défense',
    commandLines: [
      '> conf t',
      '  ip access-list extended FROID-WEB',
      '   deny   tcp any any range 80 443',
      '   permit tcp host 10.10.0.9 host 10.20.70.21 eq 443',
      '  interface Vlan70',
      '   description FROID-OT (aucune route Internet)',
      '   ip access-group FROID-WEB in',
      '[+] Interfaces admin retirées d’Internet (nft/ACL périmétrique + VLAN sans route sortante)',
      '> firmware ak-sm800a --upgrade 4.3.1   / plan de remplacement AK-SC355 (EOL)',
      '> config set --security-level strict --passwords unique',
      '[+] Patché et durci : comptes dédiés, mots de passe changés, niveau Strict',
      '> monitoring add alarm --trigger "dégivrage > 30 min" --probe externe',
      '[+] Sonde de température indépendante du contrôleur + alerte sur cycle anormal',
    ],
    brief:
      'Vous êtes responsable sécurité d’un groupe de grande distribution. Deuxième vague en approche : que faites-vous d’abord ?',
    choices: [
      {
        label: 'Retirer toute interface admin d’Internet, migrer AK-SM800A vers R4.3.1+ (remplacer AK-SC355 EOL), niveau de sécurité Strict avec comptes dédiés et mots de passe changés',
        correct: true,
        feedback:
          'C’est le triptyque recommandé : masquage (plus aucune interface face au monde), patch et remplacement des modèles EOL, durcissement des comptes. C’est aussi la posture des enseignes qui ont évité le pire (Ahold Delhaize avait déconnecté préventivement ses systèmes).',
      },
      {
        label: 'Attendre la prochaine version du firmware et conduire les opérations normalement',
        correct: false,
        feedback:
          'Cette attitude coûte des dizaines de millions : c’est exactement ce qu’ont payé les enseignes dont les contrôleurs restaient exposés après les alertes de 2025.',
      },
      {
        label: 'Couper l’alimentation de tous les groupes froids et suspendre les ventes de frais',
        correct: false,
        feedback:
          'Cette solution détruit la chaîne du froid par mesure de précaution : pire que le problème. La bonne réponse combine masquage réseau, patch et supervision — pas l’interruption.',
      },
    ],
  },
];

const STORE_COUNT = 12;
const BASE = (i: number) => 2 + (i % 5);
const LIMIT = (i: number) => (i === 4 ? 80 : i === 9 ? 74 : 46 + (i % 5));

function tempColor(t: number) {
  if (t <= 8) return Colors.blue;
  if (t <= 20) return Colors.amber;
  return Colors.red;
}

function DanfossVisual({ phaseIdx, allDone }: { phaseIdx: number; allDone: boolean }) {
  const sabotaged = phaseIdx >= 4;
  const defended = allDone;
  const [temps, setTemps] = useState<number[]>(() => Array.from({ length: STORE_COUNT }, (_, i) => BASE(i)));
  const [selected, setSelected] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setTemps((prev) => {
        let changed = false;
        const next = prev.map((t, i) => {
          if (sabotaged && !defended) {
            const target = LIMIT(i);
            if (t < target) {
              changed = true;
              return Math.min(target, t + 4 + ((i * 7) % 5));
            }
          } else if (defended) {
            const target = BASE(i);
            if (t > target) {
              changed = true;
              return Math.max(target, t - 9);
            }
          }
          return t;
        });
        return changed ? next : prev;
      });
    }, 900);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [sabotaged, defended]);

  const statusText = defended
    ? '✅ Retour au froid : interfaces masquées, contrôleurs patchés, sondes réarmées'
    : sabotaged
      ? '⚠ Dégivrage forcé en cours — alertes des sondes coupées dans les contrôleurs'
      : 'Veille : consignes nominales sur les 12 magasins suivis (interfaces web exposées)';

  return (
    <View style={styles.panel}>
      <Text style={styles.status}>{statusText}</Text>
      <View style={styles.grid}>
        {temps.map((t, i) => {
          const active = selected === i;
          return (
            <Pressable
              key={i}
              onPress={() => setSelected(i)}
              style={[styles.tile, active && styles.tileActive]}
            >
              <Text style={styles.tileIndex}>M{String(i + 1).padStart(2, '0')}</Text>
              <Text style={[styles.tileTemp, { color: tempColor(t) }]}>
                {Math.round(t)}°{t >= 70 ? ' 🔥' : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>Touchez un magasin pour inspecter son régulateur</Text>
      {selected !== null && (
        <View style={styles.detail}>
          <Text style={styles.detailTitle}>Magasin {String(selected + 1).padStart(2, '0')} — régulateur Danfoss AK-SM800</Text>
          <Text style={styles.detailLine}>Température mesurée : {Math.round(temps[selected])} °C</Text>
          <Text style={[styles.detailLine, { color: sabotaged && !defended ? Colors.red : Colors.accent }]}>
            Dégivrage : {sabotaged && !defended ? 'EN COURS — cycle sans limite de temps' : defended ? 'arrêté, consigne normale rétablie' : 'inactif'}
          </Text>
          <Text style={styles.detailLine}>
            Alerte sonde : {defended ? 'réarmée (sonde autonome, hors du contrôleur)' : sabotaged ? 'coupée dans le contrôleur' : 'active (seuil 8 °C)'}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function DanfossLab({ onCompleted }: { onCompleted: () => void }) {
  return (
    <ChoiceLab
      emoji="🧊"
      title="Dégivrage forcé : Danfoss (2026)"
      intro={
        'Scénario fondé sur l’incident réaliste du 11–12 octobre 2026 : des régulateurs de froid Danfoss exposés sur Internet (interfaces StoreView), contournement d’authentification documenté puis injection de commandes, dégivrage forcé pendant la nuit dans ≈700 magasins français.\n\n' +
        'Vous rejouez la chaîne d’attaque étape par étape sur un parc de 12 magasins — observez les températures, inspectez les régulateurs — puis vous vous mettez à la place de la défense.'
      }
      objectives={OBJECTIVES}
      phases={PHASES}
      finalNote={
        'À retenir : l’exposition directe d’interfaces OT sur Internet est le facteur clé, avec des modèles EOL jamais migrés et des alertes internes neutralisées. En conditions réelles : masquage des interfaces (pas d’admin public), mise à jour ou migration vers des versions supportées, alertes de température indépendantes (hors du contrôleur), supervision des cycles de dégivrage anormaux, et veille sur les bulletins des fournisseurs et des autorités (Claroty, CERT-FR, ANSSI).'
      }
      visual={(phaseIdx, allDone) => <DanfossVisual phaseIdx={phaseIdx} allDone={allDone} />}
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
  tileTemp: { fontSize: 15, fontWeight: '800' },
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
