import ChoiceLab, { type LabPhase } from '@/labs/choice-lab';

const OBJECTIVES = [
  'Découper le site en zones de sécurité',
  'Définir les conduits entre zones',
  'Fixer les Security Levels cibles (62443-3-2)',
  'Traduire la segmentation en VLAN et ACL Cisco',
  'Documenter et maintenir le dossier 62443',
];

const PHASES: LabPhase[] = [
  {
    title: 'Inventaire et découpage en zones',
    commandLines: [
      '> # Inventaire IACS (nmap --top-ports 200 --open 10.20.0.0/16)',
      '[+] N1 : 6 automates S7-1500 + capteurs + variateurs (cellule A/B)',
      '[+] N2 : 2 IHM + serveur OPC UA',
      '[+] N3 : serveur d’ingénierie, historian',
      '[+] N4/5 : MES, ERP, postes bureautiques',
    ],
    brief:
      'Vous êtes intégré 62443 sur une usine d’agroalimentaire. La cartographie remontée montre un réseau plat historique : tout communique avec tout. Premier pas de 62443-3-2 : regrouper les actifs aux exigences communes.',
    choices: [
      {
        label: 'Découper par fonction de procédé : une zone par ligne de production (automates + capteurs + variateurs), une zone supervision, une zone ingénierie, l’IT séparée',
        correct: true,
        feedback:
          'C’est le principe des zones : des actifs qui partagent des exigences de sécurité et de disponibilité. Chaque cellule de production devient une zone homogène ; la supervision, l’ingénierie et l’IT sont des zones distinctes. Les évolutions d’une zone n’impactent pas les autres.',
      },
      {
        label: 'Une seule grande zone OT : plus simple à administrer, tout le monde travaille déjà comme ça',
        correct: false,
        feedback:
          'Une zone unique = une SL unique = le niveau exigé par le pire voisin, appliqué partout. C’est l’état actuel du site et c’est précisément ce que 62443 vient corriger.',
      },
      {
        label: 'Une zone par niveau Purdue strictement, sans tenir compte des flux réels de procédé',
        correct: false,
        feedback:
          'Purdue est un bon point de départ mais 62443 va plus loin : une cellule complète (niveaux 0-1-2) forme souvent une seule zone, car ses composants partagent les mêmes exigences. Découpez d’abord selon le procédé et les flux, pas selon le modèle théorique seul.',
      },
    ],
  },
  {
    title: 'Les conduits — nommer et filtrer les flux',
    commandLines: [
      '> # Flux nommés attendus',
      '[+] C1 : supervision (10.20.30.40) → cellule A/B : Modbus/TCP 502, OPC UA 4840',
      '[+] C2 : ingénierie → cellules : S7 102 (fenêtres de maintenance)',
      '[+] C3 : cellules → historian : lecture seule 4840',
      '[+] C4 : historian → MES (IT) : export via diode 5440',
    ],
    brief:
      'Les zones sont posées. Maintenant : comment communiquent-elles ? Un conduit 62443 est un flux nommé, décrit (protocole, ports, sens, adresses) et filtré — tout flux non déclaré est interdit.',
    choices: [
      {
        label: 'Déclarer quatre conduits nommés (supervision→cellules, ingénierie→cellules, cellules→historian, historian→IT) avec protocoles, ports et sens explicites',
        correct: true,
        feedback:
          'Chaque conduit est un contrat : qui, vers quoi, quel port, dans quel sens. C4 traverse la frontière IT/OT par une diode — aucun chemin de retour. Le filtrage des conduits sera la traduction directe en ACL.',
      },
      {
        label: 'Autoriser tout flux interne à l’OT : le trafic industriel est imprévisible, mieux vaut ne rien filtrer',
        correct: false,
        feedback:
          '« Imprévisible » veut dire non cartographié. Un flux non documenté est soit un oubli à corriger, soit un chemin d’attaque à fermer. Le zonage sans conduits filtrés ne protège rien.',
      },
      {
        label: 'Un seul conduit global : une règle qui laisse passer tout le trafic OT d’un niveau à l’autre',
        correct: false,
        feedback:
          'Un conduit par flux utile, pas un égouttoir global. Sinon, un seul poste compromis de la zone supervision pivote librement vers toutes les cellules — l’atelier Pivot vous a montré où ça mène.',
      },
    ],
  },
  {
    title: 'Security Levels cibles',
    commandLines: [
      '> # Évaluation des menaces par zone (62443-3-2)',
      '[+] Zone cellule A/B : conséquence production = élevée → SL 3 cible',
      '[+] Zone supervision : exposition = postes partagés → SL 2 cible',
      '[+] Zone ingénierie : peut reprogrammer les PLC → SL 3 cible',
      '[+] Conduits traversant la frontière IT : SL 4 au point de contrôle',
    ],
    brief:
      'Place aux SL. Pour chaque zone : conséquence d’une attaque sur le procédé, motivation d’un attaquant, exposition. La SL cible en découle — et elle n’est jamais inférieure à celle qu’impose la zone la plus sensible connectée.',
    choices: [
      {
        label: 'SL 3 pour les cellules et l’ingénierie, SL 2 pour la supervision, conduits frontaliers contrôlés au niveau de la zone la plus sensible',
        correct: true,
        feedback:
          'Les cellules arrêtent la production si sabotées (SL 3), l’ingénierie peut reprogrammer les automates (SL 3), la supervision est plus exposée mais moins critique (SL 2) — et ses conduits vers les cellules sont filtrés au niveau SL 3, pas SL 2. La règle d’or : le conduit se calque sur la zone la plus forte.',
      },
      {
        label: 'SL 2 partout pour rester homogène et cohérent',
        correct: false,
        feedback:
          'Homogène, oui — mais insuffisant : une ligne sabotée coûte des dizaines de milliers d’euros par heure. 62443 ne demande pas d’uniformiser, elle demande de différencier selon le risque.',
      },
      {
        label: 'SL 4 partout : autant viser le maximum',
        correct: false,
        feedback:
          'SL 4 (adversaire étatique) n’est réaliste nulle part dans une usine agroalimentaire : les contre-mesures exigées (contrôle applicatif poussé, chiffrement de bout en bout, audit permanent) dépasseraient le budget et la maturité du site. Visez juste, pas haut.',
      },
    ],
  },
  {
    title: 'Traduction réseau — VLAN et ACL Cisco',
    commandLines: [
      '> # Switch de niveau 3 — segmentation des zones',
      '> vlan 60',
      '>  name CELLULES-OT',
      '> vlan 61',
      '>  name SUPERVISION-OT',
      '> vlan 62',
      '>  name INGENIERIE',
      '> ! Conduit C1 : supervision -> cellules (Modbus 502, OPC UA 4840)',
      '> ip access-list extended CONDUIT-C1',
      '>  permit tcp host 10.20.30.40 10.20.60.0 0.0.0.255 eq 502',
      '>  permit tcp host 10.20.30.40 10.20.60.0 0.0.0.255 eq 4840',
      '>  deny   ip any any log',
      '> interface vlan 60',
      '>  ip access-group CONDUIT-C1 in',
      '> ! Conduit C2 : ingénierie -> cellules, uniquement en fenêtre maintenance',
      '> ip access-list extended CONDUIT-C2',
      '>  permit tcp host 10.20.62.10 10.20.60.0 0.0.0.255 eq 102 time-range MAINTENANCE',
      '>  deny   ip any any log',
    ],
    brief:
      'Les SL sont fixées. Maintenant, la partie concrète que votre intégrateur attend : chaque conduit devient un VLAN, une ACL et des flux explicites sur les switches de niveau 3.',
    choices: [
      {
        label: 'Un VLAN par zone, une ACL par conduit : flux nommés autorisés, tout le reste refusé avec journalisation',
        correct: true,
        feedback:
          'C’est la traduction littérale du dossier 62443 en configuration : vlan 60/61/62, ACL CONDUIT-C1/C2 avec permit explicites et deny any log. La règle time-range de C2 matérialise la fenêtre de maintenance — l’écriture hors fenêtre devient impossible au niveau réseau, pas seulement interdite sur le papier.',
      },
      {
        label: 'Des VLAN, mais sans ACL : la séparation des diffusions suffit',
        correct: false,
        feedback:
          'Des VLAN sans contrôle inter-VLAN ne séparent rien : le routeur qui les relie route tout par défaut. Le conduit non filtré est une autorisation implicite — exactement ce que 62443-3-2 interdit.',
      },
      {
        label: 'Pousser la sécurité dans un seul gros pare-feu périmétrique entre IT et OT, ne rien toucher en interne',
        correct: false,
        feedback:
          'Le pare-feu périmétrique reste nécessaire, mais un attaquant déjà dans l’OT (clé USB, maintenance, pivot) traverse ensuite librement tout le réseau interne. Le zonage interne est ce qui transforme une intrusion localisée en incident non propagé.',
      },
    ],
  },
  {
    title: 'Faire vivre le dossier — exigences et maintenance',
    commandLines: [
      '> # Dossier 62443 (vivant, versionné)',
      '[+] 01-inventaire.md — actifs, propriétaires, versions',
      '[+] 02-zones-conduits.md — C1..C4, filtrage associé',
      '[+] 03-sl-cibles.md — menaces, SL cible vs atteinte, écarts',
      '[+] 04-exigences-fournisseurs.md — déclarations 62443-4-2',
      '[+] 05-revues.md — révision à chaque évolution + test annuel',
    ],
    brief:
      'L’architecture est en place. Dernier objectif : faire de votre dossier 62443 un document vivant — et l’outiller côté fournisseurs.',
    choices: [
      {
        label: 'Versionner le dossier, y consigner les écarts SL cible/SL atteinte avec plan d’action, exiger les déclarations 62443-4-2 des fournisseurs, réviser à chaque évolution',
        correct: true,
        feedback:
          'Un dossier 62443 utile documente l’écart entre ce qui est visé et ce qui est réel — chaque écart porte un plan d’action daté. Les déclarations 4-2 des fournisseurs entrent dans vos cahiers des charges, et le dossier est relu à chaque changement d’architecture. La conformité encadre la sécurité ; elle ne la remplace pas.',
      },
      {
        label: 'Archiver le dossier au format PDF après l’audit de certification : mission accomplie',
        correct: false,
        feedback:
          'Un dossier figé devient faux au premier changement d’architecture — et un dossier faux est plus dangereux qu’un dossier absent : il donne une confiance illusoire. 62443 est un processus continu, pas un certificat à accrocher.',
      },
      {
        label: 'Ne documenter que les zones, les conduits seront ajoutés plus tard si le temps le permet',
        correct: false,
        feedback:
          'Les conduits sont la moitié du modèle — c’est par eux que passent les attaques. Un dossier qui décrit des zones sans flux est une carte sans routes : inexploitable en incident.',
      },
    ],
  },
];

export default function Zones62443Lab({ onCompleted }: { onCompleted: () => void }) {
  return (
    <ChoiceLab
      emoji="🧱"
      title="Atelier IEC 62443 : segmenter le site"
      intro="Une usine agroalimentaire au réseau plat, tout qui communique avec tout. Vous menez la démarche complète 62443-3-2 : zones, conduits, SL cibles, puis la traduction en VLAN et ACL Cisco."
      objectives={OBJECTIVES}
      phases={PHASES}
      finalNote="À retenir : 62443 ne prescrit pas de marques ni d’équipements — elle impose une méthode. Zones homogènes, conduits nommés et filtrés au niveau de la zone la plus sensible, SL cibles issues des menaces, dossier vivant : c’est le squelette de toute architecture OT sérieuse."
      onCompleted={onCompleted}
    />
  );
}
