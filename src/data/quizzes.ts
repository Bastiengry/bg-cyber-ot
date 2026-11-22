export type QuizQuestion = {
  id: string;
  moduleId: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-fond-1',
    moduleId: 'fondamentaux-ot',
    prompt: 'En environnement OT, quel est l’ordre habituel de priorisation de la triade de sécurité ?',
    options: [
      'Confidentialité, Intégrité, Disponibilité',
      'Disponibilité/Sûreté, Intégrité, Confidentialité',
      'Intégrité, Confidentialité, Disponibilité',
      'Les trois sont équivalents et sans ordre',
    ],
    answerIndex: 1,
    explanation:
      'L’OT protège un procédé physique : la disponibilité et la sûreté passent avant tout, vient ensuite l’intégrité des commandes, puis la confidentialité.',
  },
  {
    id: 'q-fond-2',
    moduleId: 'fondamentaux-ot',
    prompt: 'Où se situe le serveur d’ingénierie dans le modèle de Purdue, et pourquoi est-il critique ?',
    options: [
      'Niveau 0 : il interroge les capteurs directement',
      'Niveau 1 : il alimente les automates en mesures',
      'Niveau 2/3 : il déploie les programmes vers les automates',
      'Niveaux 4/5 : il réplique les données vers l’ERP',
    ],
    answerIndex: 2,
    explanation:
      'Le serveur d’ingénierie déployait les projets automates (niveau 2/3) : le compromettre permet de reprogrammer les PLC, comme l’a fait Stuxnet.',
  },
  {
    id: 'q-fond-3',
    moduleId: 'fondamentaux-ot',
    prompt: 'Pourquoi refuse-t-on souvent de déployer un filtrage applicatif lourd entre un capteur et son automate ?',
    options: [
      'Les capteurs ne supportent pas le chiffrement',
      'La boucle de régulation est temps réel et peu tolérante à la latence',
      'Le coût des licences serait trop élevé',
      'Le pare-feu empêcherait le polling de l’historian',
    ],
    answerIndex: 1,
    explanation:
      'Les boucles de régulation exigent une latence contrôlée et déterministe : on filtre les flux inter-zones, pas chaque point de mesure.',
  },
  {
    id: 'q-fond-4',
    moduleId: 'fondamentaux-ot',
    prompt: 'Qu’est-ce que la leçon de TRITON concernant les systèmes de sécurité (SIS) ?',
    options: [
      'Les SIS sont trop isolés pour être attaqués',
      'Un attaquant peut viser les contrôleurs de sécurité eux-mêmes pour désactiver la dernière ligne de défense',
      'Les SIS doivent être remplacés par des protections purement physiques',
      'La certification SIL garantit une protection contre les attaques cyber',
    ],
    answerIndex: 1,
    explanation:
      'TRITON a rendu des contrôleurs de sécurité indisponibles pour ouvrir la voie à un sabotage du procédé : la safety est une cible cyber.',
  },
  {
    id: 'q-fond-5',
    moduleId: 'fondamentaux-ot',
    prompt: 'Un équipement OT a 20 ans et n’est plus supporté par son fabricant. Quelle posture est correcte ?',
    options: [
      'Le retirer immédiatement du service, quel qu’en soit le coût',
      'Le laisser sans mesure, l’air gap suffit',
      'Risque documenté + compensations : filtrage strict, isolation réseau, surveillance dédiée',
      'Scanner salement tous les mois pour détecter les intrusions',
    ],
    answerIndex: 2,
    explanation:
      'Quand le correctif est impossible, on documente le risque et on déploie des compensations (isolement, filtrage, détection) plutôt que l’immobilisme ou une décision irréaliste.',
  },
  {
    id: 'q-proto-1',
    moduleId: 'protocoles-industriels',
    prompt: 'Quel code fonction Modbus vous alerterait immédiatement en analyse réseau ?',
    options: ['FC3 (lecture de registres)', 'FC1 (lecture de bobines)', 'FC6 (écriture d’un registre)', 'Aucun, Modbus est en lecture seule'],
    answerIndex: 2,
    explanation:
      'FC5/FC6/FC15/FC16 sont des écritures : il est normal de les surveiller en priorité car une écriture suffit à agir sur le procédé.',
  },
  {
    id: 'q-proto-2',
    moduleId: 'protocoles-industriels',
    prompt: 'Sur quel port TCP porte Modbus/TCP ?',
    options: ['102', '44818', '20000', '502'],
    answerIndex: 3,
    explanation:
      'Modbus/TCP = 502. Le port 102 est S7comm, 44818 EtherNet/IP, 20000 DNP3/TCP.',
  },
  {
    id: 'q-proto-3',
    moduleId: 'protocoles-industriels',
    prompt: 'Pourquoi Industroyer a-t-il été qualifié de « cadre réutilisable », contrairement à Stuxnet ?',
    options: [
      'Il était écrit en un langage aisément modifiable',
      'Il implémentait des protocoles standards et s’adaptait à une nouvelle cible par simple configuration',
      'Il était distribué en open source par son auteur',
      'Il opérait depuis le cloud, sans infrastructure sur site',
    ],
    answerIndex: 1,
    explanation:
      'Industroyer implémente nativement IEC 101/104, 61850 et OPC UA : changer les adresses suffit à viser une autre sous-station.',
  },
  {
    id: 'q-proto-4',
    moduleId: 'protocoles-industriels',
    prompt: 'Quelle affirmation sur S7comm est correcte ?',
    options: [
      'C’est un protocole uniquement de lecture, sans écriture',
      'Il permet notamment le téléchargement de programmes vers les automates',
      'Il est nativement chiffré de bout en bout',
      'Il opère exclusivement en série sur RS-485',
    ],
    answerIndex: 1,
    explanation:
      'S7comm (port 102) transporte aussi le rechargement de blocs et de programmes : c’est ce qui en fait une cible de choix.',
  },
  {
    id: 'q-proto-5',
    moduleId: 'protocoles-industriels',
    prompt: 'Un flux OPC UA relie l’historien à un data lake cloud. Quelle est la première action attendue ?',
    options: [
      'Interdire tout flux OPC UA par principe',
      'Documenter le flux (usage, certificats, ports) et le filtrer explicitement à la DMZ',
      'Le chiffrer et ne rien documenter, le chiffrement suffit',
      'Le faire passer par un VPN grand public pour simplifier la supervision',
    ],
    answerIndex: 1,
    explanation:
      'Tout flux OT → extérieur doit être explicité et contrôlé : usage métier, chemins, certificats, filtrage à la DMZ industrielle.',
  },
  {
    id: 'q-attaque-1',
    moduleId: 'attaques-marquantes',
    prompt: 'Comment Stuxnet est-il entré dans un réseau supposément isolé (air gap) ?',
    options: [
      'Par une compromission initiée depuis la messagerie de l’IT',
      'Par clé USB, via le canal de maintenance et d’ingénierie',
      'Par une attaque des systèmes de refroidissement',
      'Par une compromission initiée depuis Internet',
    ],
    answerIndex: 1,
    explanation:
      'L’air gap n’a pas sauté par magie : l’agent est entré par le canal physique de maintenance (clé USB, projet d’ingénierie infecté).',
  },
  {
    id: 'q-attaque-2',
    moduleId: 'attaques-marquantes',
    prompt: 'Quelle signature traduit le « mimicry » de Stuxnet côté supervision ?',
    options: [
      'Des journaux effacés intégralement',
      'Des mesures affichées normales alors que le procédé dérape réellement',
      'Un pic d’écritures dans les registres de consigne',
      'La disparition des postes IHM',
    ],
    answerIndex: 1,
    explanation:
      'L’attaquant servait de fausses valeurs d’entrée aux opérateurs : c’est la marque d’un sabotage visant à rester invisible.',
  },
  {
    id: 'q-attaque-3',
    moduleId: 'attaques-marquantes',
    prompt: 'Quelle est la chaîne d’attaque type des incidents ukrainiens (2015-2016) ?',
    options: [
      'Scan Internet → exploitation d’un PLC directement',
      'Phishing → vol de credentials → VPN distant compromis → traversée de la DMZ → commandes industrielles',
      'Malware USB → escalade intérieure → sabotage',
      'Attaque physique sur les relais de protection',
    ],
    answerIndex: 1,
    explanation:
      'La chaîne part de l’humain (phishing), vole des accès distants, traverse la DMZ puis envoie les commandes industrielles : chaque maillon était corrigeable.',
  },
  {
    id: 'q-attaque-4',
    moduleId: 'attaques-marquantes',
    prompt: 'À Oldsmar (2021), quelles conditions ont permis l’incident (pas de dommage subi) ?',
    options: [
      'Un ransomware a chiffré la supervision',
      'Accès distant mal sécurisé et réglage modifié sans double validation',
      'Un opérateur interne a saturé les historiques',
      'Une panne électrique a fait dérailler les consignes',
    ],
    answerIndex: 1,
    explanation:
      'Mots de passe partagés, accès distant exposé, absence de règle des quatre yeux : la base des recommandations industrielles sur les accès distants.',
  },
  {
    id: 'q-attaque-5',
    moduleId: 'attaques-marquantes',
    prompt: 'Quelle mesure est la plus directement liée à la leçon de TRITON ?',
    options: [
      'Surveiller les modifications de configurations des contrôleurs de sécurité (SIS)',
      'Chiffrer les bases d’historian',
      'Interdire les clés USB dans l’IT bureautique',
      'Filtrer le port 44818 depuis Internet',
    ],
    answerIndex: 0,
    explanation:
      'TRITON a visé les SIS : toute modification de configuration ou de programme qui touche la sécurité fonctionnelle est une alerte critique.',
  },
  {
    id: 'q-archi-1',
    moduleId: 'architecture-securisee',
    prompt: 'Où se situe la DMZ industrielle dans le modèle de Purdue ?',
    options: ['Entre les niveaux 0 et 1', 'Entre les niveaux 2 et 3', 'Entre le niveau 3 et l’IT (niveaux 4/5), dite zone 3.5', 'Hors du site, c’est une zone publique'],
    answerIndex: 2,
    explanation:
      'La DMZ industrielle (3.5) est la zone tampon entre l’exploitation OT (niveau 3) et le monde IT (4/5).',
  },
  {
    id: 'q-archi-2',
    moduleId: 'architecture-securisee',
    prompt: 'Quels services héberge typiquement une DMZ industrielle ?',
    options: [
      'Les IHM de conduite et les postes opérateurs',
      'Miroirs de mises à jour, broker d’échange de fichiers, jump host d’accès distant, réplication unidirectionnelle',
      'Les automates d’appoint et de secours',
      'Le serveur ERP et la messagerie',
    ],
    answerIndex: 1,
    explanation:
      'La DMZ industrielle regroupe les services d’échange entre IT et OT. Les IHM restent au niveau 2, l’ERP reste dans l’IT.',
  },
  {
    id: 'q-archi-3',
    moduleId: 'architecture-securisee',
    prompt: 'Qu’appelle-t-on une « diode de données » ?',
    options: [
      'Un pare-feu applicatif au travers d’un filtre étatique',
      'Un dispositif d’export strictement unidirectionnel, sans chemin de retour',
      'Un VPN haut de gamme avec certificats',
      'Un IDS dédié au niveau 0',
    ],
    answerIndex: 1,
    explanation:
      'La diode assure un transfert à sens unique sur le plan physique : impossibilité théorique d’aller dans l’autre sens.',
  },
  {
    id: 'q-archi-4',
    moduleId: 'architecture-securisee',
    prompt: 'Pourquoi un IDS bureautique classique a-t-il du mal sur le trafic de niveau 1 ?',
    options: [
      'Il ne décrypte pas TLS',
      'Le trafic protocole industriel est déterministe et mal décrit par des signatures bureautiques',
      'Il est trop coûteux',
      'Les automates ne parlent pas sur le réseau',
    ],
    answerIndex: 1,
    explanation:
      'Les volumes de trafic OT, les protocoles binaires aux comportements cycliques exigent des moteurs dédiés qui modélisent la topologie et les déviations.',
  },
  {
    id: 'q-archi-5',
    moduleId: 'architecture-securisee',
    prompt: 'Un gestionnaire vous annonce : « l’historian collecte des données et pilote directement les consignes ». Réaction ?',
    options: [
      'Normal, c’est son rôle',
      'Anormal : l’historian collecte, il ne commande pas ; revoyez l’architecture des flux',
      'Acceptable si le flux est chiffré',
      'Acceptable si le flux est documenté',
    ],
    answerIndex: 1,
    explanation:
      'La séparation collecte/commande est un principe d’architecture : celui qui observe ne pilote pas.',
  },
  {
    id: 'q-durc-1',
    moduleId: 'durcissement',
    prompt: 'Pourquoi un scan actif agressif de type nmap est-il déconseillé sur un réseau OT ?',
    options: [
      'Il consomme trop de bande passante',
      'Certains automates et équipements embarqués crashent lors d’un scan agressif',
      'Il est illégal en France',
      'Il perturbe la journalisation',
    ],
    answerIndex: 1,
    explanation:
      'Certains équipements industriels tombent face à des scans actifs : on privilégie le scan passif et l’inventaire par sonde.',
  },
  {
    id: 'q-durc-2',
    moduleId: 'durcissement',
    prompt: 'Quelle pratique est la plus urgente face à des comptes d’automates en défaut usine ?',
    options: [
      'Les changer tous les jours',
      'Changer les mots de passe défaut, activer l’authentification et les protections natives, supprimer les accès anonymes',
      'Les documenter et laisser ainsi',
      'Interdire toute connexion au fur et à mesure',
    ],
    answerIndex: 1,
    explanation:
      'Les comptes défaut et les mots de passe communs sont les vecteurs les plus exploités : changements + activations natives + suppression des comptes anonymes.',
  },
  {
    id: 'q-durc-3',
    moduleId: 'durcissement',
    prompt: 'Qu’est-ce que la règle des quatre yeux en OT ?',
    options: [
      'Aucune modification sans double validation (deux personnes)',
      'Une supervision vidéo en continu',
      'Un contrôle antivirus à deux niveaux',
      'La vérification systématique des sauvegardes',
    ],
    answerIndex: 0,
    explanation:
      'Toute écriture sensible (consigne, programme) est validée par une seconde personne, c’est le contrôle qui manquait à Oldsmar.',
  },
  {
    id: 'q-durc-4',
    moduleId: 'durcissement',
    prompt: 'Que doit couvrir une sauvegarde OT complète ?',
    options: [
      'Les IHM uniquement',
      'Firmwares, projets d’ingénierie (sources), configurations réseau, images système, bases d’historian',
      'Le dossier d’exploitation papier',
      'Les données bureautiques de l’usine',
    ],
    answerIndex: 1,
    explanation:
      'On sauvegarde tout ce qui permet de restaurer un état connu : firmwares, sources des projets, configurations, images, bases.',
  },
  {
    id: 'q-durc-5',
    moduleId: 'durcissement',
    prompt: 'Un équipement critique ne peut pas être patché avant 6 mois. Quelle est la bonne réaction ?',
    options: [
      'Attendre, il n’y a rien à faire',
      'Arrêter l’installation',
      'Déployer des compensations : filtrage strict, isolation, surveillance ciblée et suivre l’advisory',
      'Le remplacer par un équivalent neuf, même hors budget',
    ],
    answerIndex: 2,
    explanation:
      'La gestion du risque industriel s’organise autour de compensations documentées quand l’exécution du correctif est impossible.',
  },
  {
    id: 'q-detec-1',
    moduleId: 'detection-reponse',
    prompt: 'Quelle alerte est la plus importante dans un réseau Modbus ?',
    options: [
      'Un pic de lectures (FC3) depuis la salle de contrôle',
      'Une écriture (FC6) depuis une adresse IP non inventoriée',
      'Une connexion HTTPS depuis l’IT bureautique',
      'Un redémarrage planifié d’un segment',
    ],
    answerIndex: 1,
    explanation:
      'L’écriture depuis une source inconnue combine les deux critères : action sur le procédé + origine non autorisée.',
  },
  {
    id: 'q-detec-2',
    moduleId: 'detection-reponse',
    prompt: 'Pourquoi privilégier une architecture SIEM à deux étages en OT ?',
    options: [
      'Pour économiser des licences',
      'Pour éviter d’ouvrir un flux continu IT → OT depuis la collecte',
      'Parce que le SIEM central ne supporte pas les logs OT',
      'Pour respecter les contraintes de flux entre zones',
    ],
    answerIndex: 1,
    explanation:
      'On collecte en local côté OT et centralise via la DMZ : pas de flux permanent ouvert depuis l’IT vers le cœur industriel.',
  },
  {
    id: 'q-detec-3',
    moduleId: 'detection-reponse',
    prompt: 'Qu’est-ce qui fait qu‘une alerte OT est utile ?',
    options: [
      'Son volume élevé qui montre l’activité du SOC',
      'Sa précision et l’existence d’une procédure de réponse associée',
      'Sa génération automatique par l’IA',
      'Sa capacité à couvrir tous les équipements',
    ],
    answerIndex: 1,
    explanation:
      'Une alerte sans procédure exploitée est décorative : on privilégie la précision et la réponse organisée.',
  },
  {
    id: 'q-detec-4',
    moduleId: 'detection-reponse',
    prompt: 'Lors d’un incident cyber OT, quelle est la bonne attitude de premier réflexe ?',
    options: [
      'Couper tous les liens réseaux du site immédiatement',
      'Agir avec mesure : bloquer la source ciblée, préserver les preuves, évaluer l’impact procédé avant toute coupure',
      'Redémarrer les automates concernés',
      'Faire une levée de fonds pour un EDR',
    ],
    answerIndex: 1,
    explanation:
      'Couper le réseau peut être pire que l’attaque. On isole de façon ciblée et on préserve les preuves.',
  },
  {
    id: 'q-detec-5',
    moduleId: 'detection-reponse',
    prompt: 'Pourquoi pratiquer des tabletop (jeux de rôle) avec l’exploitation ?',
    options: [
      'Pour impressionner la direction',
      'Pour révéler les trous organisationnels et entraîner les décisions réelles (qui, quoi, quand)',
      'Parce qu’ils remplacent les tests techniques',
      'Pour respecter les contraintes de flux entre zones',
    ],
    answerIndex: 1,
    explanation:
      'Le tabletop est l’exercice au meilleur ROI : il révèle les manques organisationnels sans risque pour le procédé.',
  },
  {
    id: 'q-ref-1',
    moduleId: 'referentiels',
    prompt: 'Dans l’IEC 62443, à quoi correspond un « Security Level » (SL) ?',
    options: [
      'Un niveau de certification du personnel',
      'Un niveau de protection attendu pour une zone, face à un profil d’attaquant donné',
      'Un grade de pare-feu',
      'Une catégorie de correctif',
    ],
    answerIndex: 1,
    explanation:
      'Le SL (1 à 4) traduit la menace visée par zone : il rend exigible un ensemble de mesures concrètes.',
  },
  {
    id: 'q-ref-2',
    moduleId: 'referentiels',
    prompt: 'Que couvrent les exigences fonctionnelles (FR) de l’IEC 62443 ?',
    options: [
      'Les exigences de qualité logicielle des interfaces web',
      'Des familles de besoins : identification, contrôle d’accès, intégrité, journalisation, réponse…',
      'Les niveaux de sécurité fonctionnelle SIL',
      'Les formats d’échange de données industrielles',
    ],
    answerIndex: 1,
    explanation:
      'FR1 à FR10 structurent les besoins de sécurité par zone/équipement : un langage commun entre exploitant, intégrateur et fournisseur.',
  },
  {
    id: 'q-ref-3',
    moduleId: 'referentiels',
    prompt: 'À quoi sert MITRE ATT&CK for ICS dans un programme OT ?',
    options: [
      'À cataloguer les vulnérabilités par gravité CVSS',
      'À cartographier les techniques réellement observées et nourrir la détection/incident response',
      'À lister les équipements certifiés',
      'À comparer les prix des pare-feux',
    ],
    answerIndex: 1,
    explanation:
      'ATT&CK for ICS décrit des techniques observées avec des études de cas : base idéale pour construire ses règles de détection et se réviser.',
  },
  {
    id: 'q-ref-4',
    moduleId: 'referentiels',
    prompt: 'Quelles obligations clés NIS2 impose-t-elle en cas d’incident ?',
    options: [
      'Aucune obligation de notification, tout reste interne',
      'Une notification sous 24 h (alerte précoce) puis un rapport sous 72 h',
      'Une notification sous 6 mois, par courrier recommandé',
      'La publication immédiate sur Internet de tous les détails',
    ],
    answerIndex: 1,
    explanation:
      'NIS2 impose une notification 24 h / 72 h et formalise la gouvernance, la supply chain et la responsabilisation des dirigeants.',
  },
  {
    id: 'q-ref-5',
    moduleId: 'referentiels',
    prompt: 'Conformité ≠ sécurité : que signifie ce principe en OT ?',
    options: [
      'La conformité ne sert à rien, elle est purement administrative',
      'Être conforme à un référentiel n’empêche pas une intrusion, mais structure la démarche qui rend la sécurité possible',
      'Il suffit d’être conforme pour être sécurisé',
      'Les référentiels sont réservés aux grandes entreprises',
    ],
    answerIndex: 1,
    explanation:
      'La conformité encadre (cartographie, tests, incidents, supply chain) sans garantir l’absence d’attaque : elle impose la structure, la sécurité reste un travail quotidien.',
  },
];
