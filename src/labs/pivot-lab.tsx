import ChoiceLab, { type LabPhase } from '@/labs/choice-lab';

const OBJECTIVES = [
  'Cartographier le VLAN IT depuis le poste compromis',
  'Collecter des identifiants menant vers l’OT',
  'Emprunter le chemin de rebond (serveur de maintenance double patte)',
  'Confirmer l’accès à l’automate PLC-CH-01',
  'Engager la défense : confinement, segmentation, durcissement de l’accès maintenance',
];

const PHASES: LabPhase[] = [
  {
    title: 'Reconnaissance du VLAN IT',
    commandLines: [
      '> nmap -sS -Pn -T2 10.10.0.0/24',
      '[+] 10.10.0.23 PC-DEV-12 (compromis)',
      '[+] 10.10.0.51 SRV-MAINT01 — deux interfaces : IT + 10.60.0.51',
      '[!] Cible du pivot identifiée : double patte IT/OT',
    ],
    brief:
      'Un hameçonnage vieux de trois semaines vous a donné un pied dans le poste de développement PC-DEV-12 (10.10.0.23, VLAN IT). Vous jouez le rôle de l’attaquant : restez discret, sur ce site l’IT et l’OT cohabitent.',
    choices: [
      {
        label: 'Balayage lent et ciblé du 10.10.0.0/24 depuis PC-DEV-12',
        correct: true,
        feedback:
          'Découvert : SRV-DC01 (AD/DNS) · PC-VENTES-07 · SRV-MAINT01 — deux interfaces (IT 10.10.0.51 / OT 10.60.0.51), pas d’EDR, jamais cité dans le plan de secours. C’est le pivot parfait.',
      },
      {
        label: 'Scan agressif de tous les ports sur tout le VLAN',
        correct: false,
        feedback:
          'Bruit énorme : le SOC IT décroche immédiatement et votre présence est relevée avant même d’atteindre l’OT. Un pivot réussi est silencieux.',
      },
      {
        label: 'Tenter une escalade de privilèges sur le domaine AD directement',
        correct: false,
        feedback:
          'Vous ne disposez encore d’aucun identifiant de domaine : chaque tentative échouée se journalise sur SRV-DC01. Regardez d’abord ce que le poste compromis peut vous offrir.',
      },
    ],
  },
  {
    title: 'Collecte d’identifiants',
    commandLines: [
      '> mimikatz # sekurlsa::logonpasswords',
      '[+] En cache : SRV-MAINT01\service-maint (mot de passe jamais changé)',
      '> route print | findstr 10.60',
      '[+] Route statique 10.60.0.0/24 via 10.10.0.51',
    ],
    brief:
      'PC-DEV-12 est infecté depuis des semaines. Quel gain décisif pour la suite de l’attaque ?',
    choices: [
      {
        label: 'Extraire les identifiants en cache (LSASS, navigateur, lecteur réseau)',
        correct: true,
        feedback:
          'Trouvé : le compte local « service-maint » de SRV-MAINT01 (créé pour la télé-maintenance du fournisseur, mot de passe jamais changé) et une route statique vers le VLAN procédé 10.60.0.0/24.',
      },
      {
        label: 'Lancer un rançongiciel sur le VLAN IT pour créer une diversion',
        correct: false,
        feedback:
          'C’est une déclaration de guerre : cellule de crise, coupure des accès, et vous perdez le tunnel que vous aviez posé. L’objectif ici est l’OT, pas le bruit.',
      },
      {
        label: 'Exploiter une faille zero-day de SRV-DC01',
        correct: false,
        feedback:
          'Coûteux et inutile : vous avez déjà un accès interactif. Cherchez plutôt les accès légitimes qui traînent sur la machine (caches, notes, scripts de maintenance).',
      },
    ],
  },
  {
    title: 'Le rebond vers l’OT',
    commandLines: [
      '> ssh service-maint@10.10.0.51',
      '[+] Session ouverte sur la double patte',
      '> ssh -J service-maint@10.10.0.51 admin@10.60.1.11',
      '[+] Routé vers le VLAN procédé — flux de maintenance autorisé par le pare-feu de zone',
    ],
    brief:
      'Vous tenez le compte « service-maint » sur SRV-MAINT01, un serveur double patte IT/OT hérité d’un projet d’intégration, jamais remis en question.',
    choices: [
      {
        label: 'Rebondir via SRV-MAINT01 et joindre le VLAN procédé (10.60.0.0/24)',
        correct: true,
        feedback:
          'Le pare-feu de zone autorise explicitement SRV-MAINT01 → automates : flux de maintenance déclaré à la mise en service, jamais révisé depuis. Vous êtes routé vers PLC-CH-01 (10.60.1.11, port 102/tcp, protocole S7).',
      },
      {
        label: 'Attaque par dictionnaire sur le pare-feu de zone lui-même',
        correct: false,
        feedback:
          'Aucune chance et alerte garantie : le périmètre est filtré. En revanche, SRV-MAINT01 est l’hôte légitimement autorisé — c’est par lui qu’il faut passer.',
      },
      {
        label: 'Attaquer PLC-CH-01 directement depuis Internet',
        correct: false,
        feedback:
          'L’automate n’est pas exposé : c’est exactement ce qui distingue ce site du scénario Danfoss, où les interfaces étaient sur Internet. Sans rebond, pas d’accès.',
      },
    ],
  },
  {
    title: 'Confirmation de l’accès procédé',
    commandLines: [
      '> snap7 read --host 10.60.1.11 --block DB1.DBD0',
      '[+] Lecture fiable — écriture possible : procédé sous contrôle',
    ],
    brief:
      'Depuis SRV-MAINT01, vous atteignez PLC-CH-01. Quelle action vous prouve que vous contrôlez le procédé ?',
    choices: [
      {
        label: 'Lecture des variables du programme (blocs de données) et du compteur cyclique du PLC-CH-01',
        correct: true,
        feedback:
          'Accès confirmé : lecture fiable, écriture possible. Vous avez le même pouvoir qu’un ingénieur de maintenance, avec tous les risques associés. Place à la posture de défense.',
      },
      {
        label: 'Scanner tout le VLAN procédé pour recenser les automates',
        correct: false,
        feedback:
          'La route est confirmée : inutile de balayer un VLAN où certains équipements réagissent mal au scan. Passez à la vérification de l’accès.',
      },
      {
        label: 'Envoyer une commande d’arrêt d’urgence pour tester votre pouvoir',
        correct: false,
        feedback:
          'Écriture destructive et immédiatement visible : arrêts de ligne, pertes de production, alertes générales. Un vrai attaquant chercherait d’abord la persistance silencieuse.',
      },
    ],
  },
  {
    title: 'Changement de casquette : défense',
    commandLines: [
      '> conf t',
      '  vlan 61',
      '   name MAINTENANCE',
      '  vlan 60',
      '   name PROCES',
      '  ip access-list extended FROM-IT',
      '   deny   ip 10.10.0.0 0.0.0.255 10.60.0.0 0.0.0.255',
      '   permit  tcp host 10.10.0.51 host 10.60.1.11 eq 102',
      '   deny   ip any 10.60.0.0 0.0.0.255 log',
      '  interface Vlan61',
      '   description PATTE-OT-SRV-MAINT',
      '   ip access-group FROM-IT in',
      'interface range Gi0/10-24',
      ' switchport mode access',
      ' switchport access vlan 60',
      ' no cdp enable',
      '[+] Aucun flux IT → procédé, sauf SRV-MAINT01 → PLC-CH-01:102 (S7)',
      '[+] PC-DEV-12 confiné (isolation réseau, image mémoire acquise)',
      '[+] Télé-maintenance : bastion dédié + MFA, comptes nominatifs',
    ],
    brief:
      'Vous changez de rôle : vous êtes maintenant l’ingénieur cyber-OT du même site. Comment couper définitivement ce chemin de rebond sans arrêter la production ?',
    choices: [
      {
        label: 'Confiner PC-DEV-12, deny any IT→OT au pare-feu de zone (seuls les flux déclarés restent), SRV-MAINT01 transformé en bastion dédié (MFA, comptes nominatifs) et télé-maintenance par accès distants contrôlés',
        correct: true,
        feedback:
          'Poste isolé, règles de zone revues (plus aucun flux non tracé vers les automates), accès maintenance transformé en point de contrôle. C’est précisément la lacune exploitée dans les cas réels.',
      },
      {
        label: 'Changer seulement le mot de passe « service-maint » et reprendre l’exploitation',
        correct: false,
        feedback:
          'Insuffisant : la double interface reste en place, la route vers l’OT trop permissive, et la compromission initiale (hameçonnage) n’est pas traitée. L’attaquant reviendra.',
      },
      {
        label: 'Couper l’ensemble du site (IT + OT) pendant 48 h et tout reconstruire',
        correct: false,
        feedback:
          'Réaction excessive : un site segmenté doit pouvoir confiner l’IT sans toucher au procédé. Le bon outillage, c’est le zonage et le pare-feu de zone, pas l’interrupteur général.',
      },
    ],
  },
];

export default function PivotLab({ onCompleted }: { onCompleted: () => void }) {
  return (
    <ChoiceLab
      emoji="🕸️"
      title="Pivot IT → OT"
      intro={
        'Scénario inspiré de cas réels (aciérie allemande 2014 : hameçonnage côté bureau de progression jusqu’au four ; Trisis 2017 ; rançongiciels franchissant la frontière IT/OT) : un compromis banal en informatique de bureau finit devant un automate.\n\n' +
        'Vous jouerez l’attaque étape par étape, puis la défense ingénieur cyber-OT.'
      }
      objectives={OBJECTIVES}
      phases={PHASES}
      finalNote={
        'À retenir : l’OT n’est presque jamais compromis de face — c’est le chemin légitime (télé-maintenance, serveur double patte, flux oublié) qui sert de porte. En conditions réelles : alerte SOC côté IT, enquête conjointe DSI/OT, revue des flux au pare-feu de zone, et mise en conformité avec le zonage type IEC 62443 / ANSSI sur la séparation stricte IT/OT.'
      }
      onCompleted={onCompleted}
    />
  );
}
