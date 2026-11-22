export type TriageLog = {
  id: string;
  time: string;
  source: string;
  text: string;
  suspicious: boolean;
  why: string;
};

export const TRIAGE_LOGS: TriageLog[] = [
  {
    id: 'log-1',
    time: '06:02:11',
    source: 'SCADA (10.42.1.10)',
    text: 'Modbus TCP FC3 lecture registres 1-8 → PLC_P101 (10.42.1.101) — polling nominal',
    suspicious: false,
    why: 'Lecture récurrente depuis le SCADA déclaré : trafic de supervision attendu.',
  },
  {
    id: 'log-2',
    time: '06:15:47',
    source: 'Historian (10.42.3.30)',
    text: 'Réplication vers BDD miroir DMZ (10.42.3.100) — flux unidirectionnel autorisé',
    suspicious: false,
    why: 'Flux de sortie documenté vers la DMZ, conforme à la matrice.',
  },
  {
    id: 'log-3',
    time: '06:58:03',
    source: 'Pare-feu DMZ',
    text: 'Connexions RDP depuis 91.214.x.x (Internet, pays non répertorié) vers jump host',
    suspicious: true,
    why: 'Accès distant vers la DMZ depuis une source externe jamais vue : possible compromission de compte, à investiguer immédiatement.',
  },
  {
    id: 'log-4',
    time: '07:12:19',
    source: 'PLC_MIX01 (10.42.1.104)',
    text: 'Cycle nominal : lecture E/S, régulation niveau cuve 100 ms',
    suspicious: false,
    why: 'Cycle automate normal, aucun événement de maintenance.',
  },
  {
    id: 'log-5',
    time: '07:41:52',
    source: 'IDS OT',
    text: 'Modbus TCP FC6 écriture registre 40002 (consigne) depuis 10.42.8.66 — station non inventoriée',
    suspicious: true,
    why: 'Écriture dans une consigne depuis une adresse hors inventaire : c’est l’alerte de base d’un réseau Modbus.',
  },
  {
    id: 'log-6',
    time: '08:03:34',
    source: 'Serveur MAJ (DMZ)',
    text: 'Mise à jour signatures antivirus distribuées aux postes IHM via miroir',
    suspicious: false,
    why: 'Distribution de correctifs via miroir DMZ : mécanisme prévu par l’architecture.',
  },
  {
    id: 'log-7',
    time: '08:20:14',
    source: 'Switch n°2',
    text: 'Nouvelle adresse MAC 00:1D:9C:xx:xx:xx détectée sur VLAN production — appareil inconnu',
    suspicious: true,
    why: 'Un périphérique inconnu (PC portable non déclaré, boîtier Wi-Fi, imprimante récemment branchée) apparaît sur un VLAN de production : à qualifier en urgence.',
  },
  {
    id: 'log-8',
    time: '09:05:28',
    source: 'IHM_MIX01',
    text: 'Opérateur lance la recette « Lot A-42 » depuis l’écran de conduite',
    suspicious: false,
    why: 'Action opérateur normale, horaire de bon, depuis un poste déclaré.',
  },
  {
    id: 'log-9',
    time: '09:17:02',
    source: 'Serveur d’ingénierie',
    text: 'Téléchargement de projet vers PLC_DOS01 hors fenêtre de maintenance programmée',
    suspicious: true,
    why: 'Reprogrammation d’un automate en dehors de toute fenêtre : la leçon de Stuxnet, à alerter comme une tentative de sabotage.',
  },
  {
    id: 'log-10',
    time: '09:44:59',
    source: 'Pare-feu DMZ',
    text: 'Flux HTTPS sortant du poste de supervision vers domaine analytics.cloud-vendor.example',
    suspicious: true,
    why: 'Un poste niveau 2 ne parle pas à Internet : flux non déclaré depuis la zone OT, probable détournement ou exfiltration.',
  },
  {
    id: 'log-11',
    time: '10:12:40',
    source: 'PLC_FINAL (10.42.1.150)',
    text: 'Commande explicitée par l’équipe production : bascule du poste en mode local pour maintenance',
    suspicious: false,
    why: 'Intervention planifiée, documentée par l’exploitation : pas d’alerte.',
  },
  {
    id: 'log-12',
    time: '10:31:13',
    source: 'EDR poste IHM',
    text: 'Agent EDR arrêté manuellement sur IHM_MIX01 (compte admin local)',
    suspicious: true,
    why: 'Désactivation d’un agent de protection : technique classique de déblaiement avant mouvement latéral.',
  },
];

export type ZonageItem = {
  id: string;
  asset: string;
  hint: string;
  zone: 'Purdue 0-1' | 'Purdue 2' | 'Purdue 3' | 'DMZ 3.5' | 'Purdue 4-5';
  why: string;
};

export const ZONAGE_ITEMS: ZonageItem[] = [
  {
    id: 'z-1',
    asset: 'Cellule automate Siemens S7-1500 pour piloter un four',
    hint: 'Il exécute la boucle de régulation.',
    zone: 'Purdue 0-1',
    why: 'Le niveau 0/1 rassemble les capteurs, actionneurs et automates qui agissent directement sur le procédé.',
  },
  {
    id: 'z-2',
    asset: 'Poste IHM de conduite en salle de contrôle',
    hint: 'Il affiche les mesures et permet de lancer des recettes.',
    zone: 'Purdue 2',
    why: 'La supervision (IHM/SCADA) opère au niveau 2 : conduite, mais pas de logique de procédé.',
  },
  {
    id: 'z-3',
    asset: 'Historian PI System, base de mesures sur 5 ans',
    hint: 'Il collecte et archive, il ne commande pas.',
    zone: 'Purdue 3',
    why: 'Historian, MES et services d’exploitation vivent au niveau 3.',
  },
  {
    id: 'z-4',
    asset: 'Serveur ERP de l’entreprise (commandes, finance)',
    hint: 'Il vit dans le SI bureautique.',
    zone: 'Purdue 4-5',
    why: 'Le réseau d’entreprise (ERP, messagerie, bureautique) correspond aux niveaux 4/5.',
  },
  {
    id: 'z-5',
    asset: 'Jump host d’accès distant avec MFA et enregistrement de session',
    hint: 'Point de passage unique entre IT et OT.',
    zone: 'DMZ 3.5',
    why: 'Le jump host fait partie des services d’échange hébergés en DMZ industrielle (3.5).',
  },
  {
    id: 'z-6',
    asset: 'RTU de station de pompage distante',
    hint: 'Elle agit sur des vannes et relève ses mesures au SCADA.',
    zone: 'Purdue 0-1',
    why: 'Comme un automate, la RTU agit directement sur le procédé : niveau 0/1.',
  },
  {
    id: 'z-7',
    asset: 'Miroir de mises à jour antivirus pour les IHM',
    hint: 'Il distribue des correctifs de l’IT vers l’OT sans chemin de retour.',
    zone: 'DMZ 3.5',
    why: 'Le miroir de mise à jour est un service d’analyse typique de la DMZ industrielle.',
  },
  {
    id: 'z-8',
    asset: 'Poste de télémaintenance fournisseur, résident sur le VLAN supervision, accès permanent',
    hint: 'Il n’est ni automation, ni supervision, ni service d’échange contrôlé.',
    zone: 'Purdue 2',
    why: 'C’est un piège : un accès fournisseur permanent au niveau 2 est une erreur d’architecture — il doit être déplacé en DMZ (jump host), frontalisé et journalisé.',
  },
];

export const ZONAGE_ZONES = ['Purdue 0-1', 'Purdue 2', 'Purdue 3', 'DMZ 3.5', 'Purdue 4-5'] as const;
