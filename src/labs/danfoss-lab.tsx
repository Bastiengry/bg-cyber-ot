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

export default function DanfossLab({ onCompleted }: { onCompleted: () => void }) {
  return (
    <ChoiceLab
      emoji="🧊"
      title="Dégivrage forcé : Danfoss (2026)"
      intro={
        'Scénario fondé sur l’incident réaliste du 11–12 octobre 2026 : des régulateurs de froid Danfoss exposés sur Internet (interfaces StoreView), contournement d’authentification documenté puis injection de commandes, dégivrage forcé pendant la nuit dans ≈700 magasins français.\n\n' +
        'Vous rejouez la chaîne d’attaque étape par étape, puis vous vous mettez à la place de la défense.'
      }
      objectives={OBJECTIVES}
      phases={PHASES}
      finalNote={
        'À retenir : l’exposition directe d’interfaces OT sur Internet est le facteur clé, avec des modèles EOL jamais migrés et des alertes internes neutralisées. En conditions réelles : masquage des interfaces (pas d’admin public), mise à jour ou migration vers des versions supportées, alertes de température indépendantes (hors du contrôleur), supervision des cycles de dégivrage anormaux, et veille sur les bulletins des fournisseurs et des autorités (Claroty, CERT-FR, ANSSI).'
      }
      onCompleted={onCompleted}
    />
  );
}
