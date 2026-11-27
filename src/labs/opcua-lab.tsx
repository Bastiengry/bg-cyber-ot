import ChoiceLab, { type LabPhase } from '@/labs/choice-lab';

const OBJECTIVES = [
  'Découvrir un serveur OPC UA et ses politiques de sécurité',
  'Se connecter en mode None et lire le procédé en clair',
  'Écrire une consigne sans aucune authentification',
  'Passer côté défenseur : imposer SignAndEncrypt',
  'Verrouiller : certificats, rôles, segmentation',
];

const PHASES: LabPhase[] = [
  {
    title: 'Découverte — la vitrine du serveur',
    commandLines: [
      '> nmap -sV -p 4840 10.20.30.5',
      '[+] 4840/tcp open — OPC UA Binary',
      '> python -c "from opcua import Client; c=Client(\'opc.tcp://10.20.30.5:4840\'); print([str(e.SecurityPolicyUri) for e in c.connect_and_get_server_endpoints()])"',
      '[+] SecurityPolicy: None, Basic256Sha256 — 1 endpoint en MessageSecurityMode: None',
    ],
    brief:
      'Vous êtes sur le VLAN d’ingénierie d’un site pilote. Le serveur OPC UA d’une ligne de conditionnement écoute sur le port 4840. Premier réflexe : interroger GetEndpoints, l’opération publique qui décrit la configuration de sécurité du serveur.',
    choices: [
      {
        label: 'Interroger GetEndpoints pour lister SecurityPolicy et MessageSecurityMode supportés',
        correct: true,
        feedback:
          'GetEndpoints est accessible avant toute session : c’est la carte d’identité du serveur. Vous apprenez qu’il propose Basic256Sha256… mais expose aussi un endpoint en None. C’est le point d’entrée.',
      },
      {
        label: 'Lancer une attaque par dictionnaire sur les comptes utilisateurs Windows du serveur',
        correct: false,
        feedback:
          'Trop tôt et inutile : en mode None, le serveur n’exige même pas de compte. Vérifiez d’abord la couche de sécurité du protocole, pas l’annuaire.',
      },
      {
        label: 'Scanner les noms de variables avec un brute-force de NodeId sur tout l’espace d’adressage',
        correct: false,
        feedback:
          'NodeIds en dur, c’est du bruit. Un client UA normal obtient l’arborescence par Browse — et surtout, commencez par la couche de sécurité, comme le ferait un testeur méthodique.',
      },
    ],
  },
  {
    title: 'Connexion en clair — lecture du procédé',
    commandLines: [
      '> python - <<EOF',
      '>   from opcua import Client',
      '>   c = Client("opc.tcp://10.20.30.5:4840")',
      '>   c.connect()',
      '>   print(c.get_node("ns=2;s=Ligne1.TempFour").get_value())',
      '> EOF',
      '[+] 78.4 °C — variable lue sans certificat ni compte',
    ],
    brief:
      'L’endpoint None est confirmé. Un client UA standard se connecte sans certificat, sans identifiant. Vous naviguez l’arborescence : Ligne1.TempFour, Ligne1.PressionCircuit, Ligne1.ConsigneVitesse…',
    choices: [
      {
        label: 'Lire les variables de procédé pour reconstituer la ligne (températures, pressions, consignes)',
        correct: true,
        feedback:
          'En clair : valeurs instantanées, noms de variables, structure de la ligne. Tout ce qu’un Modbus vous donnerait péniblement registre par registre, OPC UA vous le sert structuré. Un passant du réseau verrait autant.',
      },
      {
        label: 'Injecter des trames ARP pour dégrader la communication de la ligne',
        correct: false,
        feedback:
          'Du bruit qui déclencherait des alarmes réseau sans intérêt pédagogique : la faille est que la lecture est légitime et silencieuse. Pas besoin de perturber quoi que ce soit.',
      },
      {
        label: 'Extraire le certificat du serveur pour forger un client de confiance',
        correct: false,
        feedback:
          'Inutile : en mode None, le serveur ne demande aucun certificat. La confiance mutuelle est simplement désactivée — c’est précisément le problème.',
      },
    ],
  },
  {
    title: 'Écriture — la consigne change',
    commandLines: [
      '> c.get_node("ns=2;s=Ligne1.ConsigneVitesse").set_value(850)',
      '[+] WriteValue OK — aucune authentification, aucun refus',
      '> # La consigne réelle du variateur passe de 600 à 850 tr/min',
    ],
    brief:
      'Aucun contrôle d’accès ne s’oppose à l’écriture. Vous modifiez la consigne de vitesse du variateur de la ligne. Un opérateur verrait la dérive dans quelques secondes — mais personne ne sait qui l’a écrite, ni d’où.',
    choices: [
      {
        label: 'Écrire une consigne hors plage nominale pour démontrer le sabotage possible',
        correct: true,
        feedback:
          'En production réel : dérive du procédé, pièces hors tolérance, arrêt d’urgence possible. Et aucune trace : pas de compte, pas de certificat, juste une adresse IP. C’est l’équivalent OPC UA d’une écriture FC 16 sauvage.',
      },
      {
        label: 'Tenter d’écraser le firmware du variateur par le canal OPC UA',
        correct: false,
        feedback:
          'Le canal données OPC UA ne sert pas à reprogrammer les équipements : ce vecteur passe par les serveurs d’ingénierie (cf. atelier Stuxnet). Restez dans ce que le canal expose réellement.',
      },
      {
        label: 'Supprimer des variables du modèle d’adresses du serveur',
        correct: false,
        feedback:
          'Le modèle de données est dynamique en lecture mais pas un sac de nœuds supprimable à distance par un client standard. L’impact réel, c’est l’écriture de valeurs — concentrez-vous dessus.',
      },
    ],
  },
  {
    title: 'Basculer défenseur — SignAndEncrypt obligatoire',
    commandLines: [
      '> # Configuration du serveur OPC UA (suppression du mode None)',
      '> SecurityPolicy       = Basic256Sha256',
      '> MessageSecurityMode  = SignAndEncrypt',
      '> # Rejet des sessions négociées en None ; anonymes refusées',
      '[+] 2 endpoints restants : Sign, SignAndEncrypt',
    ],
    brief:
      'Vous êtes maintenant ingénieur sécurité du site. La ligne est isolée sur son VLAN, mais des postes de supervision partagés y accèdent. Premier verrou : exiger la signature et le chiffrement de chaque message.',
    choices: [
      {
        label: 'Imposer SecurityPolicy Basic256Sha256 et MessageSecurityMode SignAndEncrypt, puis supprimer l’endpoint None',
        correct: true,
        feedback:
          'Chaque trame est désormais signée et chiffrée : un sniffeur du réseau ne voit plus les valeurs, et un faux client ne peut plus se faire passer pour légitime sans certificat approuvé. Bannissez au passage Basic128Rsa15 et Basic256 (algorithmes cassés).',
      },
      {
        label: 'Garder le mode None pour les postes de supervision, mais filtrer par pare-feu les IP autorisées',
        correct: false,
        feedback:
          'Le filtrage IP protège du réseau, pas du poste compromis : un attaquant qui contrôle un poste autorisé retrouve la lecture et l’écriture en clair. Le chiffrement protège aussi contre la compromission d’un pair.',
      },
      {
        label: 'Activer uniquement MessageSecurityMode = Sign : signer sans chiffrer',
        correct: false,
        feedback:
          'La signature prouve l’intégrité et l’origine, mais les trames restent lisibles : les valeurs de procédé, la topologie et les noms de variables continuent de fuir en clair. SignAndEncrypt est l’objectif.',
      },
    ],
  },
  {
    title: 'Verrouillage final — certificats et rôles',
    commandLines: [
      '> openssl req -x509 -newkey rsa:2048 -nodes -keyout client.key -out client.crt -subj "/CN=scada-supervision"',
      '[+] Certificat client généré',
      '> # Approbation MANUELLE du certificat sur le serveur (pas d’auto-accept)',
      '> # Rôles OPC UA : Operator=lecture seule, Engineer=écriture (fenêtre maintenance)',
      '> # Cisco — conduit verrouillé :',
      '> access-list UA-CONDUIT permit tcp host 10.20.30.40 host 10.20.30.5 eq 4840',
      '> access-list UA-CONDUIT deny   ip any any log',
      '> interface vlan 70',
      '>  ip access-group UA-CONDUIT in',
    ],
    brief:
      'Dernière ligne droite : la confiance applicative et le conduit réseau. Le serveur doit n’accepter que des certificats approuvés explicitement, les comptes doivent être nominatifs, et seul le superviseur doit joindre le 4840.',
    choices: [
      {
        label: 'Approuver manuellement les certificats des clients légitimes, comptes nominatifs avec rôles, ACL restreignant le 4840 au superviseur',
        correct: true,
        feedback:
          'La boucle est fermée : authentification applicative (certificats approuvés), authentification utilisateur (comptes nominatifs + rôles), restriction réseau (conduit unique vers 4840). Un poste compromis du VLAN ne peut plus écrire sans certificat ni compte autorisé. C’est la mise en œuvre directe de FR1/FR2/FR5 de la norme 62443.',
      },
      {
        label: 'Activer l’acceptation automatique des certificats pour simplifier la maintenance',
        correct: false,
        feedback:
          'C’est réintroduire la faille : n’importe quel attaquant génère un certificat auto-signé et est approuvé à la volée. L’approbation manuelle (ou via PKI/GDS) est le prix de la confiance.',
      },
      {
        label: 'Laisser anonymous actif, le filtrage réseau suffit',
        correct: false,
        feedback:
          'Le réseau limite d’où viennent les sessions, pas qui fait quoi. Sans comptes nominatifs, aucune traçabilité d’écriture, aucun contrôle par rôle — et un poste autorisé compromis reste indétectable.',
      },
    ],
  },
];

export default function OpcUaLab({ onCompleted }: { onCompleted: () => void }) {
  return (
    <ChoiceLab
      emoji="🔐"
      title="OPC UA : passerelle en mode None"
      intro="Un serveur OPC UA de ligne de conditionnement est configuré en SecurityPolicy=None. Vous rejouez la compromission complète — puis vous la fermez, couche par couche."
      objectives={OBJECTIVES}
      phases={PHASES}
      finalNote="À retenir : OPC UA offre une sécurité native sérieuse — à condition de l’activer. SignAndEncrypt + certificats approuvés + comptes nominatifs + conduit réseau unique : quatre verrous qui rendent le mode None inutile."
      onCompleted={onCompleted}
    />
  );
}
