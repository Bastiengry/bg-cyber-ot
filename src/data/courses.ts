export type Lesson = {
  id: string;
  title: string;
  duration: string;
  body: string[];
  keyPoints: string[];
};

export type CourseModule = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  lessons: Lesson[];
};

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'fondamentaux-ot',
    title: 'Fondamentaux des environnements OT',
    subtitle: 'Ce qui distingue un site industriel d\u2019un SI classique',
    emoji: '🏭',
    level: 'Débutant',
    lessons: [
      {
        id: 'it-vs-ot',
        title: 'IT vs OT : deux mondes, deux priorités',
        duration: '8 min',
        body: [
          'L\u2019OT (Operational Technology) désigne l\u2019ensemble des systèmes qui pilotent le monde physique : automates (PLC/RTU), SCADA, IHM, vaisseaux de mesure. L\u2019IT protège les données ; l\u2019OT protège des procédés dont un dysfonctionnement peut casser une machine, couper une eau potable, voire blesser des personnes.',
          'Cette différence inverse la triade classique de la sécurité. En IT, on raisonne CIA : confidentialité, intégrité, disponibilité. En OT, l\u2019ordre devient AIC : d\u2019abord la disponibilité et la sûreté de fonctionnement, puis l\u2019intégrité des commandes, et enfin la confidentialité. Un chiffrement qui retarde une commande de soupape de 40 ms est un échec, pas une victoire.',
          'Conséquence pratique : impossible d\u2019arrêter un four verrier pour patcher un serveur Windows 2012 ; un redémarrage peut coûter des centaines de milliers d\u2019euros et des semaines de remise en qualité. Toute la discipline de la cyber-OT consiste à sécuriser sans casser l\u2019exploitation : fenêtres d\u2019arrêt planifiées, bascules en mode manuel, environnement de test.',
          'Dernier point souvent sous-estimé : la durée de vie. Un SI bureautique se renouvelle en 3 à 5 ans ; une cuve, un automate ou une IHM reste en service 20 ou 30 ans. Vous serez forcément amenés à protéger des machines conçues avant que la cybersécurité n\u2019existe.',
        ],
        keyPoints: [
          'OT = bien physique : un incident peut causer des dégâts matériels ou humains.',
          'Priorités OT : Dispo > Intégrité > Confidentialité (AIC).',
          'Les correctifs ne s\u2019appliquent que sur fenêtres d\u2019arrêt, jamais à chaud sans justification.',
          'Durée de vie des équipements : 20-30 ans, équipements anciens inévitables.',
        ],
      },
      {
        id: 'composants',
        title: 'La chaîne d\u2019automatisation et ses composants',
        duration: '10 min',
        body: [
          'Au niveau 0, les capteurs et actionneurs : sondes de température, vannes, variateurs, moteurs. Ils parlent en boucles électriques 4-20 mA, Modbus RTU sur RS-485, IO-Link, HART, ou PROFINET.',
          'Au niveau 1, les automates : PLC (Siemens S7, Schneider M340/M580, Allen-Bradley ControlLogix) et RTU pour les sites distants (postes de transformation, stations de pompage). L\u2019automate exécute une boucle cyclique déterministe : lecture des entrées, exécution du programme (ladder, ST, FBD), écriture des sorties, quelques millisecondes, indépendamment du réseau.',
          'Au niveau 2, la supervision : IHM locales, postes SCADA (WinCC, Citect, iFix, Ignition) et les objets connectés aux automates en polling. Au niveau 3, l\u2019historian (base de données de mesures, souvent Wonderware ou PI System), le MES qui fait le lien avec la production, le serveur d\u2019ingénierie qui déploie les projets automates.',
          'Ce vocabulaire n\u2019est pas décoratif : c\u2019est la langue des rapports d\u2019incident et des cahiers des charges. « Un attaquant a compromis le jump server de la DMZ et poussé un projet d\u2019ingénierie vers le PLC via le port 102 » signifie précisément que le serveur qui déploie les programmes a été utilisé comme relais pour reprogrammer les automates.',
        ],
        keyPoints: [
          'Niveau 0 : capteurs/actionneurs. Niveau 1 : PLC/RTU. Niveau 2 : IHM/SCADA. Niveau 3 : historian/MES.',
          'L\u2019automate exécute sa logique en local : couper le réseau ne l\u2019arrête pas, mais aveugle la supervision.',
          'Le serveur d\u2019ingénierie est l\u2019équipement le plus critique pour la maîtrise des programmes.',
        ],
      },
      {
        id: 'contraintes',
        title: 'Temps réel, safety et cyber-sécurité',
        duration: '7 min',
        body: [
          'Un automate est déterministe : il répond en millisecondes. Beaucoup de protocoles OT n\u2019ont donc ni chiffrement ni retransmission type TCP complexe ; on privilégie la latence contrôlée. Ajouter un pare-feu applicatif profond au milieu d\u2019une boucle de régulation peut la désynchroniser : ça place ses filtres avec mesure, sur les flux inter-zones, pas entre un capteur et son automate.',
          'La sécurité fonctionnelle (safety) est un domaine distinct mais connexe : arrêts d\u2019urgence, soupapes de sécurité, SIS (Safety Instrumented System) certifiés SIL selon l\u2019IEC 61511. La cyber-sécurité doit préserver la safety : c\u2019est exactement la leçon de TRITON, qui a visé des contrôleurs de sécurité pour les rendre muets avant une attaque du procédé.',
          'Retenez aussi le concept de mode manuel et de mode dégradé : en cas d\u2019incident cyber, les équipes doivent pouvoir revenir à un pilotage local, hors réseau. Ça se prépare et se répète, comme un exercice incendie.',
        ],
        keyPoints: [
          'Le temps réel contraint le placement des équipements de sécurité.',
          'Safety (IEC 61511, SIL) ≠ sécurité cyber, mais la cyber doit défendre la safety.',
          'Le mode manuel est le plan B de dernière défense : connaître les procédures locales.',
        ],
      },
    ],
  },
  {
    id: 'protocoles-industriels',
    title: 'Protocoles industriels',
    subtitle: 'Modbus, DNP3, S7comm, OPC UA : le langage des automates',
    emoji: '🔌',
    level: 'Débutant',
    lessons: [
      {
        id: 'modbus',
        title: 'Modbus : le protocole que tout attaquant connaît',
        duration: '10 min',
        body: [
          'Modbus date de 1979. C\u2019est un client-serveur rudimentaire : un maître (SCADA, IHM) interroge des esclaves (automates) par des codes fonctions. FC1 lit les bobines, FC3 lit les registres de tenue, FC5 écrit une bobine, FC6 écrit un registre, FC15/16 écrit par groupes. Simple, universel, et totalement dépourvu d\u2019authentification : n\u2019importe qui sur un segment peut lire… et écrire.',
          'Sur TCP, Modbus occupe le port 502. Une trame tient en une poignée d\u2019octets : identifiant d\u2019unité, code fonction, adresse, valeur. Un seul paquet suffit à arrêter une pompe : FC5, bobine numéro 4000, valeur 0. C\u2019est pourquoi tout analyseur de trafic OT commence par tracer les codes fonctions d\u2019écriture par adresse source.',
          'Ce que ça implique pour vous : segmentation et filtrage strict. Le maître Modbus vit dans la salle de contrôle seulement ; personne ne doit pouvoir écrire dans un automate depuis le réseau bureautique, ni depuis un PC portable de maintenance non déclaré.',
        ],
        keyPoints: [
          'Modbus est non authentifié : lecture ET écriture ouverts à tous sur le segment.',
          'FC5/FC6/FC15/FC16 = écritures : les surveiller en priorité.',
          'Port TCP 502, trames minuscules, identification par IP source.',
        ],
      },
      {
        id: 'dnp3-s7',
        title: 'DNP3, S7comm et EtherNet/IP',
        duration: '9 min',
        body: [
          'DNP3 est le standard des utilities (électricité, eau). Plus riche que Modbus : horodatage des événements, file d\u2019attente, contre-appels. Il prévoit une sécurisation optionnelle (DNP3-SA, chiffrement et authentification), encore rarement déployée dans les réseaux réels.',
          'S7comm est le protocole propriétaire de Siemens (port TCP 102). Il permet, outre la lecture/écriture de variables, le téléchargement de programmes et de blocs de données (DB). Industroyer en 2016 a justement utilisé S7comm pour arrêter des disjoncteurs en Ukraine : le protocole n\u2019a pas été « cassé », il a été employé normalement depuis un PC déjà compromis.',
          'EtherNet/IP (Rockwell, ports 44818 et 2222) et PROFINET dominent les usines. CIP, la couche applicative, embarque une authentification optionnelle (CIP Security) : encore une fois, standard prévu, déploiement rare.',
        'Le pattern à retenir : les protocoles modernes offrent des mécanismes de sécurité, mais la base installée — des années de fenêtres de maintenance manquées — les explique très rarement actifs. En audit, « le protocole le supporte » n\u2019est pas, en soi, une conclusion.',
        ],
        keyPoints: [
          'DNP3 : utilities, événements horodatés, sécurisation optionnelle rarement active.',
          'S7comm (port 102) permet le rechargement de programmes : cible de choix.',
          'Les standards prévoient la sécurité ; les installations réelles rarement.',
        ],
      },
      {
        id: 'opc-ua',
        title: 'OPC UA et la convergence IT/OT',
        duration: '7 min',
        body: [
          'OPC UA est le protocole de passage entre l\u2019OT et le monde IT : historians, MES, analytics. Il est authentifié et chiffrable (certificats X.509, signatures de messages), modélise les données en arborescence d\u2019objets et devient le standard d\u2019interopérabilité jusqu\u2019au temps réel (OPC UA over TSN).',
          'C\u2019est aussi la porte d\u2019entrée favorite des flux OT vers l\u2019extérieur : cloud, télémaintenance, data lakes. Chaque lien OPC UA sortant de la DMZ doit être explicité : qui parle à qui, avec quels certificats, au bénéfice de quel usage métier. La règle de contrôle : un flux inconnu est un flux interdit.',
          'En parallèle, la convergence IT/OT réduit les différences technologiques : Linux embarqué, containers, TLS… Cela attire des attaquants classiques avec des techniques bureautiques (phishing, VPN, RDP dump). Vos défenses OT doivent donc couvrir tout le cycle d\u2019attaque, pas seulement les automates.',
        ],
        keyPoints: [
          'OPC UA : sécurisable, mais multiplicant les flux vers l\u2019IT et le cloud.',
          'Chaque flux OT → extérieur est un risque à justifier.',
          'La convergence IT/OT étend la surface d\u2019attaque au-delà des protocoles industriels.',
        ],
      },
    ],
  },
  {
    id: 'attaques-marquantes',
    title: 'Attaques marquantes',
    subtitle: 'Stuxnet, Industroyer, TRITON : ce qu\u2019elles nous ont appris',
    emoji: '💥',
    level: 'Intermédiaire',
    lessons: [
      {
        id: 'stuxnet',
        title: 'Stuxnet (2010) : le sabotage ciblé',
        duration: '9 min',
        body: [
          'Stuxnet est la première arme cyber connue qui a détruit du matériel physique : environ 1000 centrifugeuses iraniennes, en les sur-régulant par à-coups tout en affichant des valeurs normales aux opérateurs. Cible : automates Siemens S7-417 et S7-315, via un projet d\u2019ingénierie infecté sur les postes Step 7.',
          'Trois enseignements. Un : un attaquant patient et bien financé franchira l\u2019air gap — ici par clé USB, dans un contexte de maintenance. Deux : le mensonge des capteurs (fausses données en retour) est la marque du sabotage avancé ; la supervision ne voyait rien. Trois : l\u2019hygiène de base aurait détecté la propagation longtemps avant l\u2019effet : un ver qui se réplique sur XP via un partage réseau, ça se repère.',
          'Pour la détection : surveillez les écritures dans les programmes d\u2019automates (téléchargements de blocs), les accès anormaux aux serveurs d\u2019ingénierie, et les incohérences entre capteurs physiques redondants.',
        ],
        keyPoints: [
          'L\u2019air gap ne protège pas d\u2019un attaquant déterminé (USB, maintenance).',
          'Fausses mesures = signature du sabotage sophistiqué (mimicry).',
          'Les téléchargements d\u2019ingénierie vers les PLC sont des événements à alerter.',
        ],
      },
      {
        id: 'industroyer',
        title: 'Industroyer (2016) : le kill switch du réseau électrique',
        duration: '8 min',
        body: [
          'Le 23 décembre 2016, des sous-stations ukrainiennes perdent le contrôle de leurs disjoncteurs. Le malware Industroyer (CrashOverride) implémente nativement IEC 101, IEC 104, IEC 61850 et OPC UA — les protocoles électriques standards. Il envoie des commandes d\u2019ouverture, puis s\u2019efface et brouille l\u2019infrastructure.',
          'Point décisif : contrairement à Stuxnet, Industroyer n\u2019est pas spécifique à un site. C\u2019est un cadre réutilisable : donner la bonne adresse IEC 104 à un nouveau malware et il s\u2019adapte. La défense passe par le filtrage inter-zones (seuls les SCADA désignés parlent aux RTU), l\u2019alerte sur des commandes d\u2019ouverture hors horaires de maintenance, et surtout la maîtrise des accès distants.',
          'Le retour d\u2019expérience ukrainien (2015 et 2016) montre aussi la chaîne complète : phishing → vol de mots de passe → VPN d\u2019accès distant compromis → traversée de la DMZ → commandes. Chaque maillon isolé était corrigeable.',
        ],
        keyPoints: [
          'Industroyer est un cadre attaqueur multi-protocoles, réutilisable.',
          'Filtrer strictement qui parle aux RTU et alerter sur les commandes anormales.',
          'La chaîne d\u2019attaque classique : phishing → VPN → DMZ → protocole.',
        ],
      },
      {
        id: 'triton',
        title: 'TRITON et Oldsmar : viser la sécurité et les citoyens',
        duration: '8 min',
        body: [
          'TRITON/TRISIS (2017, usine pétrochimique saoudienne) a visé des contrôleurs de sécurité Schneider (SIS) pour les faire échouer (fail-safe critique), ouvrant la voie à un sabotage du procédé. C\u2019est l\u2019attaque de référence contre la couche safety : la cyber-sécurité doit couvrir les systèmes d\u2019arrêt d\u2019urgence, pas seulement la régulation.',
          'L\u2019incident d\u2019Oldsmar (Floride, 2021) illustre la menace sur les infrastructures civiles : un opérateur voit, en direct, une session d\u2019accès distant modifier un réglage (soude, passage à un niveau dangereux). L\u2019équipe a annulé l\u2019action ; pas de dommage. Mais les conditions : mot de passe partagé, accès distant TeamViewer exposé, absence de verrouillage à double personne (règle des quatre yeux sur les modifications sensibles).',
          'Ces cas font émerger les réflexes de base : MFA sur tout accès distant OT, principe du quatre yeux pour les écritures sensibles, alerting temps réel sur les modifications de paramètres de procédé, et plans de secours manuels testés.',
        ],
        keyPoints: [
          'Les systèmes de sécurité (SIS) sont des cibles : TRITON les a rendus indisponibles.',
          'Oldsmar : accès distant mal sécurisé + modifications sans double validation.',
          'Contre-mesures : MFA, règle des quatre yeux, alerting temps réel, procédures manuelles.',
        ],
      },
    ],
  },
  {
    id: 'architecture-securisee',
    title: 'Architecture sécurisée',
    subtitle: 'Purdue, zones et conduits, DMZ industrielle',
    emoji: '🏗️',
    level: 'Intermédiaire',
    lessons: [
      {
        id: 'purdue',
        title: 'Le modèle de Purdue et la segmentation',
        duration: '9 min',
        body: [
          'Le modèle de Purdue (référence IEC 62443-3-3 via les niveaux 0 à 5) structure un site industriel en étages cloisonnés : niveau 0/1 (procédé et automates), niveau 2 (supervision), niveau 3 (exploitation : historian, MES, domaine AD industriel), puis la DMZ industrielle (niveau 3.5) et enfin IT (niveaux 4/5).',
          'Chaque passage entre niveaux traverse un point de contrôle unique : pare-feu. Le flux est toujours explicite : un SCADA parle à ses automates, pas l\u2019inverse ; l\u2019historian collecte, mais ne commande pas. En audit, la première question est « qui parle à qui, sur quel port, dans quel sens ? ». Si personne ne le sait, c\u2019est un plan d\u2019action instantané.',
          'La segmentation ne s\u2019arrête pas au pare-feu : VLANs par cellule de production, routes inter-VLAN interdites par défaut, pas d\u2019interface directe entre les postes opérateurs et Internet. Un attaquant qui gagne un poste bureautique doit buter sur une frontière marquée et journalisée.',
        ],
        keyPoints: [
          'Purdue 0-1-2-3 + DMZ 3.5 + IT 4-5, flux nommés et unidirectionnels au besoin.',
          'Un seul point de contrôle entre niveaux ; pas de flux implicites.',
          'La segmentation s\u2019appuie sur VLANs, ACLs et pare-feu, jamais sur un seul équipement.',
        ],
      },
      {
        id: 'dmz-industrielle',
        title: 'DMZ industrielle, jump hosts et diodes',
        duration: '8 min',
        body: [
          'La DMZ industrielle est la zone tampon entre IT et OT. Elle héberge les services d\u2019échange : miroirs de mise à jour antivirus/Windows Update, broker de fichiers, réplication d\u2019historian à sens unique, serveur d\u2019accès distant (jump host) avec MFA et enregistrement de session.',
          'Le jump host est un point de passage unique, durci, avec un compte nominatif et un enregistrement (RDP/SSH proxyisé, webcam si besoin). Cette seule mesure éradique une typologie entière d\u2019attaques : sans MFA et sans enregistrement, un mot de passe volé dans l\u2019IT traverse librement.',
          'Pour la donnée qui doit sortir (mesures vers le cloud, reporting), la diode de données est l\u2019option forte : unidirectionnelle côté physique (pas de chemin retour), c\u2019est la réponse la plus robuste. Sinon, proxy applicatif avec inspection approfondie des protocoles, et jamais de flux direct Internet ↔ automates.',
        ],
        keyPoints: [
          'DMZ industrielle : services d\u2019échange uniquement, aucun utilisateur final.',
          'Jump host : unique, MFA, session enregistrée, compte nominatif.',
          'Diode de données pour l\u2019export unidirectionnel ; sinon proxy applicatif strict.',
        ],
      },
      {
        id: 'ids-ot',
        title: 'Détection réseau en environnement OT',
        duration: '8 min',
        body: [
          'Les IDS classiques (Snort, Suricata) s\u2019appuient sur des signatures IT ; en OT, ils génèrent du bruit et peinent à analyser un trafic déterministe. Des outils dédiés (Nozomi, Claroty, Dragos) apprennent la topologie, cartographient les automates et alertent sur les déviations du trafic industriel : code fonction d\u2019écriture inattendu, nouvel esclave Modbus, changement de programme.',
          'Deux réflexes de déploiement : capturer aux frontières de zones (SPAN sur les ports des pare-feux, avant les VLANs), et construire des règles d\u2019alerte avec le métier (bassin de sécurité, « une écriture dans l\u2019automate du compteur d\u2019eau = alerte critique »).',
          'Enfin, captez aussi la partie basse (niveau 0/1) : beaucoup d\u2019attaques en environnement OT se passent au niveau des trames série ou de PROFINET ; les pièges (honeypots) soigneusement placés, comme une IHM bidon, dressent la liste des scans et des connexions indiscrètes.',
        ],
        keyPoints: [
          'IDS OT : cartographie automatique + détection de déviations de protocoles.',
          'Capturer aux frontières de zones ; alerter en vocabulaire métier.',
          'Surveiller aussi le niveau 0/1 (trames série, PROFINET).',
        ],
      },
    ],
  },
  {
    id: 'durcissement',
    title: 'Durcissement des composants',
    subtitle: 'Automates, IHM, postes : réduire la surface, gérer le cycle de vie',
    emoji: '🔒',
    level: 'Avancé',
    lessons: [
      {
        id: 'inventaire',
        title: 'Inventaire et cartographie : on ne protège pas l\u2019inconnu',
        duration: '6 min',
        body: [
          'Le premier livrable d\u2019un programme cyber-OT est un inventaire exact : automates, RTU, IHM, serveurs, commutateurs, avec modèle, firmware, VLAN, localisation, criticité, propriétaire métier. Les outils IDS OT et des scans passifs (pas de scan actif agressif sur des automates, plusieurs modèles crashent lors d\u2019un scan nmap classique).',
          'Cet inventaire nourrit le reste : matrice de flux, durée de vie, confrontation des firmwares aux CVE (CISA ICS Advisories), plan de segmentation. Il doit être maintenu à jour à chaque évolution projet — c\u2019est un processus, pas un document.',
        ],
        keyPoints: [
          'Inventaire sans actif oublié : capteurs IIoT, impression 3D, automates temporaires.',
          'Scan passif ou manuel : jamais de scan actif agressif sur le cœur du procédé.',
          'Source de vérité vivante, alignée sur les évolutions de production.',
        ],
      },
      {
        id: 'comptes-acces',
        title: 'Comptes, mots de passe et authentification',
        duration: '8 min',
        body: [
          'Le constat d\u2019audit le plus fréquent : des comptes d\u2019automates en défaut usine, des mots de passe communs sur tout le parc, des sessions partagées entre équipes de quart. Or les automates modernes (S7-1500, M580 avec module de cybersécurité) supportent l\u2019authentification des clients, la protection des blocs et la limite des commandes de maintenance.',
          'Bonne pratique : comptes nominatifs pour l\u2019ingénierie, comptes de service documentés, suppression des accès anonymes, rotation des secrets à chaque départ, coffre-fort partagé supervisé pour les secrets d\u2019urgence. Sans oublier la règle des quatre yeux sur toute modification de programme ou de consigne sensible.',
          'Côté postes : IHM durcies (pas d\u2019applicatifs bureautiques, pas de comptes admin), AppLocker ou équivalent, et les PC portables de maintenance traités comme des vecteurs : antivirus, scan avant et après intervention, station dédiée pour les mises à jour.',
        ],
        keyPoints: [
          'Constater et éradiquer les comptes défaut/usine et le tout-partagé.',
          'Activer les protections natives des automates (authentification, protection des blocs).',
          'Les PC de maintenance sont un vecteur d\u2019attaque majeur : les encadrer.',
        ],
      },
      {
        id: 'patchs-sauvegardes',
        title: 'Correctifs, sauvegardes et gestion de crise',
        duration: '8 min',
        body: [
          'Impossible de patcher comme en IT. La stratégie : classer les équipements par criticité, suivre les advisories ICS de CISA et les CVE des éditeurs, prioriser les correctifs exploitables dans le monde physique des fenêtres d\u2019arrêt, et documenter les compensations quand on ne peut pas patcher (filtrage strict, retrait du flux, IDS focalisé).',
          'Les sauvegardes doivent couvrir tout le cycle : firmwares, projets d\u2019ingénierie (les sources ladder/ST !), configurations d\u2019appareils réseau, images des IHM, bases d\u2019historian. Testez la restauration : un projet d\u2019ingénierie sans source est un projet perdu. Et gardez une copie hors du site, protégée par la sauvegarde 3-2-1.',
          'Enfin, la gestion de crise : qui décide de quelle bascule, comment on isole une zone sans casser le procédé, comment on revient en mode manuel. Ces décisions ne s\u2019improvisent pas : elles se scénarisent (exercices annuels, « Storm » game days) avec exploitation et IT.',
        ],
        keyPoints: [
          'Priorisation par criticité + CVE réellement exploitables, compensations assumées.',
          'Sauvegarder firmwares, projets, configurations ; tester la restauration.',
          'Exercer la gestion de crise avec bascule manuelle et isolement de zones.',
        ],
      },
    ],
  },
  {
    id: 'detection-reponse',
    title: 'Détection et réponse',
    subtitle: 'Voir tôt, comprendre vite, agir sans casser le procédé',
    emoji: '🎯',
    level: 'Avancé',
    lessons: [
      {
        id: 'cas-usage-alertes',
        title: 'Cas d\u2019usage d\u2019alertes qui comptent',
        duration: '8 min',
        body: [
          'Le SOC d\u2019un site OT doit vivre avec des règles simples et déterminantes : écriture Modbus/s7comm depuis une source non répertoriée ; téléchargement d\u2019un programme vers un automate hors fenêtre de maintenance ; nouvelle adresse MAC industrielle (nouveaux équipements auto-déclarés ou spoof) ; session d\u2019accès distant depuis un pays ou un réseau jamais vu ; arrêt d\u2019un agent EDR sur un poste opérateur ; incohérence entre mesures redondantes.',
          'Chaque alerte doit déclencher une procédure : qui appeler, quel premier geste technique, à partir de quand isoler. Une alerte sans réponse opérable n\u2019a aucune valeur : on privilégie la précision plutôt que le volume.',
        ],
        keyPoints: [
          'Écritures non déclarées, changements de programme, MAC inconnues : alertes de base.',
          'Chaque alerte = procédure nommée (qui, quoi, seuil d\u2019escalade).',
          'Précision > volume : une alerte ignorée est plus dangereuse que pas d\u2019alerte.',
        ],
      },
      {
        id: 'journaux-siem',
        title: 'Journaux et SIEM en environnement OT',
        duration: '7 min',
        body: [
          'Les automates ne journalisent presque rien de natif ; il faut collecter côté superviseur, pare-feux, jump hosts, serveurs Windows (Sysmon), et les flux réseau à l\u2019aide de sondes passives. Les journaux partent vers un SIEM — idéalement un SIEM dédié par zone ou une architecture en deux étages (collecte OT locale, centralisation DMZ) pour ne pas ouvrir de flux continu vers l\u2019IT.',
          'Attention à la conservation : beaucoup d\u2019appareils OT limitent les logs (flux rotatifs à 1000 entrées) et tolèrent mal un agent lourd. On agrège en local via des collecteurs légers (rsyslog, syslog-ng) plutôt que d\u2019instrumenter directement les machines.',
        ],
        keyPoints: [
          'Collecter là où les logs existent (pare-feux, Windows, superviseurs), sonder le réseau.',
          'Architecture en deux étages pour éviter les flux continus IT → OT.',
          'Agents légers et collecteurs : ne jamais instrumenter lourdement un automate.',
        ],
      },
      {
        id: 'playbook',
        title: 'Réponse à incident : agir sans casser le procédé',
        duration: '9 min',
        body: [
          'Un playbook OT assume la contrainte dominante : le procédé continue de tourner. On ne « coupe tout » pas par défaut. Isoler une cellule, basculer un poste en manuel, couper un flux DMZ : tout cela s\u2019organise en amont, avec l\u2019exploitant, dans un vocabulaire commun (RACI, critères de décision, seuils).',
          'Un bon playbook comporte : déclencheur, rôles (coordinateur cyber, responsable production, soutien IT), gestes immédiats (bloquer l\u2019IP source au pare-feu, déconnecter le portable, geler les comptes d\u2019ingénierie), preuves à préserver (captures réseau, images disque), et décision de sortie de crise. Il se teste au moins une fois par an sur le réel, pas sur une diapositive.',
          'Enfin, la confrontation : un jeu de rôle (tabletop) simple avec les opérateurs révèle, en deux heures, tous les trous de l\u2019organisation. C\u2019est l\u2019exercice au meilleur ROI de toute la discipline.',
        ],
        keyPoints: [
          'Constater et éradiquer les comptes défaut/usine et le tout-partagé.',
          'Activer les protections natives des automates (authentification, protection des blocs).',
          'Les PC de maintenance sont un vecteur d\u2019attaque majeur : les encadrer.',
        ],
      },
    ],
  },
  {
    id: 'referentiels',
    title: 'Référentiels et normes',
    subtitle: 'IEC 62443, NIST 800-82, MITRE ATT&CK for ICS',
    emoji: '📚',
    level: 'Intermédiaire',
    lessons: [
      {
        id: 'iec-62443',
        title: 'IEC 62443 : le référentiel pivot',
        duration: '8 min',
        body: [
          'L\u2019IEC 62443 est LE référentiel international de la cyber-sécurité industrielle. Sa logique en couches : acteurs (propriétaire d\u2019actif, intégrateur, fournisseur), zones et conduits, et des niveaux de sécurité (SL 1 à SL 4) par zone, définis face à des profils d\u2019attaquant (SL2 = attaquant simple à distance, SL3 = attaquant compétent et motivé, SL4 = acteur étatique).',
          'Ce découpage évite l\u2019imprécision : au lieu de dire « sécurisé », on écrit « la zone supervision atteint SL2, avec ces exigences (FR1-FR10) ». Les exigences fonctionnelles FR (identification, contrôle d\u2019accès, intégrité système…) donnent un vocabulaire commun entre exploitation, intégrateur et DSI.',
          'En pratique : tout périmètre nouveau (ligne de production, retrofit) s\u2019appuie sur un cahier des charges 62443 avec SL cible par zone. C\u2019est aussi la référence attendue dans les appels d\u2019offres industriels.',
        ],
        keyPoints: [
          'Zones, conduits et Security Levels (SL1-SL4) : vocabulaire universel.',
          'SL cible par zone, face à un profil d\u2019attaquant explicite.',
          'FR1-FR10 structurent les exigences obtenables auprès des fournisseurs.',
        ],
      },
      {
        id: 'nist-800-82',
        title: 'NIST SP 800-82 et MITRE ATT&CK for ICS',
        duration: '7 min',
        body: [
          'Le NIST SP 800-82 (rev. 3) est le guide de référence de l\u2019OT au sens large : il transpose le NIST Cybersecurity Framework à l\u2019industriel (Identifier, Protect, Detect, Respond, Recover) avec des architectures types et des cas sectoriels (électricité, eau, pétrochimie).',
          'MITRE ATT&CK for ICS complète la boîte à outils : il catégorise les techniques observées en environnement industriel (commandes autorisées envoyées hors fenêtre, altération des données de supervision, rechargement de blocs…) avec des études de cas réels. Utile pour écrire des règles de détection à partir de techniques réellement observées.',
        ],
        keyPoints: [
          '800-82 : déclinaison opérationnelle du NIST CSF pour l\u2019OT.',
          'ATT&CK for ICS : catalogue de techniques + études de cas réels.',
          'Combiner référentiel (objectifs) et ATT&CK (techniques) pour un programme complet.',
        ],
      },
      {
        id: 'nis2-gouvernance',
        title: 'NIS2 et la gouvernance',
        duration: '6 min',
        body: [
          'La directive NIS2 impose, pour les entités essentielles et importantes (énergie, eau, santé, transport, chimie…), une gestion des risques cyber formalisée : politiques approuvées par la direction, gestion des incidents avec notification sous 24 h (alerte précoce) et 72 h (rapport), gestion de la chaîne d\u2019approvisionnement (fournisseurs de maintenance inclus), et responsabilisation personnelle des dirigeants.',
          'Pour un exploitant industriel, NIS2 se concrète souvent par : cartographie OT à jour, registre des incidents, plan de réponse testé (les exercices sont exigés), et clauses cyber dans les contrats intégrateurs et de maintenance. La conformité n\u2019est pas la sécurité, mais elle force la structure qui la rend possible.',
        ],
        keyPoints: [
          'NIS2 : gouvernance formelle, notification 24 h / 72 h, supply chain.',
          'Exercices de crise exigés ; responsabilité de la direction.',
          'La conformité ne remplace pas la sécurité : elle l\u2019encadre.',
        ],
      },
    ],
  },

  {
    id: 'modbus-tcp',
    title: 'Modbus/TCP en profondeur',
    subtitle: 'Trames, registres, absence de sécurité et durcissement du protocole le plus répandu',
    emoji: '🔌',
    level: 'Intermédiaire',
    lessons: [
      {
        id: 'modbus-fil-trame',
        title: 'Sur le fil : MBAP, codes fonction et registres',
        duration: '9 min',
        body: [
          'Une trame Modbus/TCP commence par un en-tête MBAP de 7 octets : identifiant de transaction (2), identifiant de protocole (2, toujours 0), longueur (2) et identifiant d’unité (1). Suit la PDU : un code fonction (FC) sur 1 octet puis les données. FC 1/2 lisent des bits (bobines, entrées discrètes), FC 3/4 lisent des mots (registres holding, registres d’entrée), FC 5/6 écrivent un bit ou un mot, FC 15/16 écrivent en bloc. Les réponses d’erreur portent le FC + 0x80 et un code d’exception : 01 fonction illégale, 02 adresse illégale, 06 esclave occupé.',
          'La numérotation des registres est un piège classique : l’adresse « 40001 » de la documentation est une convention humaine (bloc 4xxxx = registres holding), la vraie adresse sur le fil est l’offset 0. De nombreux incidents de debug — et de nombreuses erreurs d’attaque — viennent de ce décalage d’un. Lire le registre 100 en FC3, c’est demander offset 100, soit le « 40101 » de la doc.',
          'Sur le réseau, une session Modbus se réduit souvent à du polling : le maître (superviseur) interroge en boucle quelques dizaines de registres toutes les 100 à 1000 ms. Cette régularité est une mine d’or pour la détection : toute rupture du rythme, tout FC jamais vu, toute écriture hors fenêtre planifiée saute aux yeux d’un parseur passif.',
        ],
        keyPoints: [
          'MBAP 7 octets + PDU (FC + données) : la trame tient en quelques lignes.',
          'FC 3/4 = lecture, FC 5/6/15/16 = écriture ; exceptions 01/02/06 à connaître.',
          '« 40001 » de la doc = offset 0 sur le fil : attention au décalage.',
        ],
      },
      {
        id: 'modbus-sans-auth',
        title: 'Aucune authentification : ce que cela implique',
        duration: '8 min',
        body: [
          'Modbus/TCP de base n’embarque ni authentification, ni chiffrement, ni contrôle d’intégrité : pas de mot de passe, pas de certificat, pas de compteur anti-rejeu. Quiconque peut ouvrir une session TCP sur le port 502 d’un automate peut lire tous les registres (mémoire vive du procédé) et écrire partout où l’application l’autorise, avec un simple client open source.',
          'Côté attaque, la chaîne est courte : découverte du port 502 (nmap, scripts modbus-discover), lecture massive des registres pour reconstruire le procédé, puis écriture ciblée par FC 6 ou FC 16 — une consigne, un compteur, un bit de défaut. Le rejeu est trivial : les trames ne comportent ni horodatage ni nonce. Le seul garde-fou possible est ailleurs : le réseau et l’application.',
          'Pour le défenseur, cela fixe la doctrine : le port 502 ne doit jamais être joignable depuis l’IT ni depuis Internet ; la lecture des registres constitue la baseline de référence ; toute écriture Modbus doit être exception, planifiée et traçable. MITRE ATT&CK for ICS documente ces techniques (T0886 : commande hors fenêtre, T0843 : écriture de programme…).',
        ],
        keyPoints: [
          'Zéro auth, zéro chiffrement dans Modbus/TCP : 502 ouvert = lecture + écriture.',
          'Rejeu trivial (pas d’horodatage ni de nonce) : la protection est réseau, pas protocole.',
          'Baseline des registres + fenêtres d’écriture = socle de la détection.',
        ],
      },
      {
        id: 'modbus-durcir',
        title: 'Durcir Modbus : défense en profondeur',
        duration: '9 min',
        body: [
          'On ne chiffrera pas Modbus : le protocole ne le prévoit pas (des variantes propriétaires existent, rarement déployées). La défense se joue donc en couches : segmentation d’abord — un VLAN dédié par cellule ou ligne, des ACL qui n’autorisent le 502 que depuis le superviseur et l’historian, et l’interdiction absolue de routage IT → 502.',
          'Ensuite, interposer : un proxy Modbus (ou une règle de pare-feu applicatif) qui filtre par code fonction et par registre — par exemple, n’autoriser la lecture (FC 3/4) que depuis le niveau 2/3, et ne tolérer les écritures (FC 6/16) que depuis le serveur d’ingénierie, pendant les fenêtres de maintenance. Pour l’export de données vers l’IT (MES, ERP), une diode de données garantit l’absence de chemin de retour.',
          'Enfin, surveiller : un parseur passif qui apprend la baseline (quels registres, quels FC, quelles adresses sources, quel rythme) et alerte sur toute déviation — écriture hors fenêtre, FC jamais observé, requête d’une IP inconnue. Modbus est si prévisible qu’un comportement anormal est un signal très fort.',
        ],
        keyPoints: [
          'VLAN dédié + ACL stricte sur le 502 : seuls superviseur et historien y accèdent.',
          'Proxy filtrant par FC et registre ; diode de données pour l’export OT → IT.',
          'Parseur passif : baseline + écritures hors fenêtre = alertes de premier rang.',
        ],
      },
    ],
  },
  {
    id: 'opc-ua',
    title: 'OPC UA et sa sécurité',
    subtitle: 'Le protocole moderne de l’industrie : bien conçu, souvent mal configuré',
    emoji: '🔐',
    level: 'Avancé',
    lessons: [
      {
        id: 'opcua-modele',
        title: 'Un protocole pensé avec la sécurité',
        duration: '8 min',
        body: [
          'OPC UA (IEC 62541) succède à l’OPC classique fondé sur COM/DCOM, dont la traversée de pare-feu était un cauchemar. Il apporte un modèle de données objet (nœuds, variables, méthodes, événements), des sessions avec abonnements (le serveur pousse les changements de valeur au lieu du polling), et un empilement de sécurité natif — une nouveauté majeure face à Modbus ou S7comm.',
          'La sécurité s’exprime par deux paramètres, négociés à chaque connexion via l’opération GetEndpoints : la SecurityPolicy (None, Basic256Sha256, Aes256_Sha256_RsaPss…) qui définit les algorithmes, et le MessageSecurityMode (None, Sign, SignAndEncrypt) qui dit si les messages sont signés et/ou chiffrés. Les applications (client et serveur) s’authentifient mutuellement par des certificats X.509 qu’elles échangent et approuvent.',
          'Les utilisateurs, eux, s’authentifient de trois façons possibles : anonyme, par identifiant/mot de passe (éventuellement adossé à l’Active Directory), ou par certificat utilisateur. Le serveur applique ensuite son modèle de rôles (RoleSet) pour autoriser lecture, écriture ou exécution de méthodes.',
        ],
        keyPoints: [
          'Port binaire 4840 ; sessions + abonnements remplacent le polling.',
          'GetEndpoints révèle SecurityPolicy et MessageSecurityMode supportés.',
          'Auth applicative par certificats X.509 ; auth utilisateur anonyme / login / certificat.',
        ],
      },
      {
        id: 'opcua-none',
        title: 'Le piège du mode None',
        duration: '8 min',
        body: [
          'Par facilité d’intégration — compatibilité avec les vieux clients, débogage, « ce n’est qu’un réseau interne » — de très nombreux serveurs OPC UA sont déployés avec SecurityPolicy=None et MessageSecurityMode=None. Conséquence : les trames sont lisibles en clair (valeurs, noms de variables, topologie du procédé) et le serveur n’exige aucune preuve d’identité du client.',
          'Un attaquant positionné sur le réseau découvre le serveur (port 4840, nmap ou client UA), interroge GetEndpoints pour obtenir la carte d’identité de la configuration, puis se comporte comme n’importe quel client légitime : lecture des variables, écriture des consignes, appel de méthodes. Tout ce que Modbus offre à l’attaquant, OPC UA en mode None le lui offre aussi — avec en bonus une vision structurée du procédé.',
          'Les chercheurs (Claroty Team82, entre autres) ont recensé des serveurs OPC UA exposés directement sur Internet, et plusieurs incidents industriels ont impliqué des canaux OPC UA mal sécurisés. Le mode None n’est pas toujours une faute : sur un VLAN cellulaire fermé, derrière un pare-feu, le compromis peut être assumé. Sur un réseau partagé avec l’IT, c’est une impasse.',
        ],
        keyPoints: [
          'None = ni chiffrement, ni signature, ni authentification du client.',
          'GetEndpoints = carte d’identité du serveur, interrogée par n’importe qui.',
          'None acceptable uniquement sur un segment fermé et documenté comme tel.',
        ],
      },
      {
        id: 'opcua-durcir',
        title: 'Durcir une infrastructure OPC UA',
        duration: '9 min',
        body: [
          'Premier verrou : imposer SignAndEncrypt avec une politique moderne — Basic256Sha256 au minimum, Aes256_Sha256_RsaPss si les clients le supportent. Bannir Basic128Rsa15 et Basic256 (algorithmes cassés) et rejeter purement et simplement les sessions négociées en None sur les serveurs exposés au-delà du VLAN cellulaire.',
          'Deuxième verrou : les certificats. Une PKI industrielle (ou un serveur GDS, Global Discovery Server, pour les grandes flottes) émet et renouvelle les certificats applicatifs ; l’approbation manuelle systématique remplace l’acceptation automatique des pairs, qui réduit la confiance mutuelle à une formalité. Surveiller les dates d’expiration, stocker les clés protégées, révoquer proprement les appareils sortis du parc.',
          'Troisième verrou : l’accès. Comptes nominatifs plutôt qu’anonymous, rôles OPC UA calés sur le besoin (lecture seule pour la supervision, écriture réservée au régulation), endpoint jamais joignable depuis l’IT (passerelle + flux explicites), et monitoring : alerte sur certificat invalide, session anonyme, écriture inhabituelle ou méthode exécutée hors fenêtre.',
        ],
        keyPoints: [
          'SignAndEncrypt + Basic256Sha256 minimum ; bannir Basic128Rsa15/Basic256.',
          'PKI/GDS + approbation manuelle des certificats pairs, pas d’auto-approbation.',
          'Comptes nominatifs, rôles limités, endpoint jamais exposé à l’IT.',
        ],
      },
    ],
  },
  {
    id: 'iec-62443',
    title: 'IEC 62443 : la norme de référence',
    subtitle: 'Zones, conduits, Security Levels : traduire la norme en architecture réelle',
    emoji: '🧱',
    level: 'Avancé',
    lessons: [
      {
        id: '62443-panorama',
        title: 'La norme, ses parties et ses acteurs',
        duration: '8 min',
        body: [
          'IEC 62443 est la série de normes de cybersécurité pour les systèmes de contrôle industriel (IACS). Sa force est de couvrir toute la chaîne : les parties -1 posent les concepts, les parties -2 traitent des politiques et processus (2-1 pour l’exploitant, 2-4 pour les fournisseurs de maintenance), les parties -3 couvrent la gestion du risque (3-2 : analyse de risque et zonage), et les parties -4 les exigences sur les produits (4-1 : cycle de développement sécurisé, 4-2 : exigences techniques sur les composants).',
          'La norme définit quatre rôles avec leurs responsabilités : l’exploitant (asset owner) qui porte le risque, le fournisseur de services (maintenance, intégration), l’intégrateur de systèmes qui conçoit l’architecture, et le fournisseur de produits. Ce vocabulaire partagé sert de base contractuelle : on peut exiger d’un fournisseur un produit conforme 62443-4-2 niveau SL 2, ou d’un intégrateur une architecture documentée selon 3-2.',
          'Retenir la logique d’ensemble : 62443 ne prescrit pas d’équipements ni de marques, elle définit un processus et des exigences mesurables. Le travail de l’exploitant est de traduire ces exigences en décisions concrètes : VLAN, ACL, comptes, sauvegardes, maintenance.',
        ],
        keyPoints: [
          'Une norme = quatre familles : concepts, processus, gestion du risque, produits.',
          '62443-3-2 (zonage et SL cibles) et 62443-4-2 (exigences produits) sont les plus utilisées.',
          'Quatre rôles aux responsabilités contractuelles explicites.',
        ],
      },
      {
        id: '62443-zones',
        title: 'Zones et conduits',
        duration: '9 min',
        body: [
          'Le modèle central de 62443-3-2 est simple : découper l’IACS en zones (zones de sécurité) reliées par des conduits. Une zone regroupe des actifs aux exigences communes — par exemple un automate, ses capteurs et sa régulation locale. Un conduit est un canal de communication maîtrisé entre deux zones : un flux nommé, décrit (protocoles, ports, sens), et filtré — tout le reste est interdit.',
          'Chaque zone reçoit une Security Level cible (SL 1 à 4) : SL 1 protège contre l’erreur ou l’usage accidentel ; SL 2 contre l’attaquant intentionnel et simple ; SL 3 contre un attaquant intentionnel aux moyens sophistiqués (outils spécialisés, ingénierie sociale) ; SL 4 contre un adversaire étatique. La SL cible découle de l’évaluation des menaces sur la zone : conséquence sur le procédé, motivation d’un attaquant, exposition.',
          'Règle d’or souvent violée : la SL d’une zone ne peut pas dépendre de la bonne volonté de ses voisines. Une zone de niveau 2 reliée à une zone de niveau 4 exige un conduit contrôlé au niveau 4 (filtrage strict, contrôle applicatif) — sinon la zone la plus faible devient la porte d’entrée de la plus forte. C’est exactement la leçon du pivot IT → OT.',
        ],
        keyPoints: [
          'Zone = actifs + exigences communes ; conduit = flux nommé et filtré.',
          'SL 1 (accidentel) → SL 4 (adversaire étatique) : SL cible issue de l’analyse de menaces.',
          'Le conduit vers une zone sensible est contrôlé au niveau de cette zone.',
        ],
      },
      {
        id: '62443-mise-en-oeuvre',
        title: 'Passer du papier au réel',
        duration: '9 min',
        body: [
          'La démarche 62443-3-2 tient en cinq pas : inventaire des actifs (avec leurs données critiques) ; partitionnement en zones ; évaluation des menaces zone par zone ; fixation des SL cibles ; choix des contre-mesures pour combler l’écart entre SL cible et SL atteinte. Les contre-mesures s’organisent en sept familles (FR) : FR1 identification et authentification, FR2 contrôle d’accès, FR3 intégrité du système, FR4 confidentialité, FR5 restriction des flux de données, FR6 réponse rapide aux incidents, FR7 disponibilité des ressources.',
          'Côté produits, l’exploitant ne développe rien : il exige. Demander aux fournisseurs les déclarations de conformité 62443-4-2 (quelles SR/CR sont couvertes, à quel SL), intégrer ces exigences dans les cahiers des charges, et ne plus accepter un automate « sans aucune capacité d’authentification ni de journalisation » sans contre-mesures documentées.',
          'La mise en œuvre concrète — le vrai travail — traduit chaque exigence en décision : un VLAN par zone, une ACL par conduit, des comptes nominatifs (FR1), des sauvegardes testées (FR7), un journal centralisé en lecture seule (FR3/FR6), des fenêtres de maintenance (FR2). Et elle se maintient : revue des zones à chaque évolution d’architecture, tests annuels, dossier 62443 vivant et non archivé.',
        ],
        keyPoints: [
          '5 pas : inventaire → zones → menaces → SL cibles → contre-mesures.',
          'FR1 à FR7 : les sept familles de contre-mesures à couvrir.',
          'Exiger 62443-4-2 des fournisseurs ; tenir le dossier à jour, pas un document d’audit figé.',
        ],
      },
    ],
  },
];
