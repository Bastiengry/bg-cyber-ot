# BG Cyber OT

[🇬🇧 English version](./README.md)

Application mobile (React Native + Expo) d'**entraînement à la cybersécurité OT** (Operational
Technology / industrielle), conçue pour préparer à un métier du domaine : cybersécurité OT, SOC
industriel, ingénierie sécurité ICS, audit d'infrastructures SCADA.

L'orientation est la **réalité terrain** : contenu issu du modèle de Purdue, de l'IEC 62443,
du NIST SP 800-82, de MITRE ATT&CK for ICS et d'incidents réels (Stuxnet, Industroyer, TRITON,
Oldsmar).

## Contenu

- **7 modules de cours** (21 leçons) en français : fondamentaux IT/OT, protocoles industriels
  (Modbus, DNP3, S7comm, OPC UA), attaques marquantes, architecture sécurisée, durcissement,
  détection et réponse, référentiels (IEC 62443, NIS2, ATT&CK for ICS).
- **Quiz de validation** (35 questions, corrigé commenté, objectif 80 %).
- **5 ateliers pratiques** :
  - **Console Modbus sous attaque** : simulation d'un PLC en Modbus/TCP — inventaire, baseline,
    détection d'une écriture FC6 non autorisée, réponse (restauration de la valeur altérée + blocage de l'intrus).
  - **Pivot IT → OT (attaque + défense)** : rejouez la façon dont un poste bureautique compromis
    rebondit vers le réseau procédé via un serveur de maintenance double patte, puis passez côté
    défense (confinement, deny IT→OT au pare-feu de zone, bastion pour l'accès maintenance).
  - **Dégivrage forcé : Danfoss (incident réel de 2026)** : rejouez l'attaque d'octobre 2026
    contre ≈700 magasins français — contrôleurs exposés sur Internet, contournement
d'authentification, injection de commandes, dégivrage forcé sans limite — puis la défense
    (masquage des interfaces, patch/migration des modèles EOL, niveau de sécurité Strict, alertes
    de température indépendantes du contrôleur).
  - **Triage de journaux** : 12 journaux d'un site industriel à classer normal / suspect, avec
    explications.
  - **Zonage Purdue** : replacer les actifs d'une usine dans les bons niveaux (0-1, 2, 3, 3.5, 4-5).
- **Progression persistée** localement (AsyncStorage) : leçons lues, meilleurs scores, ateliers
  terminés.

## Démarrage

```bash
npm install
npm start          # Expo Dev Server
```

Puis scanner le QR code avec l'app **Expo Go** (Android/iOS), ou :

```bash
npm run android    # émulateur Android
npm run ios        # simulateur iOS (macOS)
npm run web        # navigateur
```

### Construire un APK

```bash
npx expo prebuild -p android
cd android && ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk
```

ou via le cloud (nécessite un compte Expo, quota mensuel limité sur l'offre gratuite) :

```bash
npx eas-cli build -p android --profile preview
```

Un APK signé pré-compilé est disponible dans [`apk/`](./apk).

## Vérifications

```bash
npx tsc --noEmit   # typecheck
npx expo lint      # lint
```

## Stack

- Expo (React Native, TypeScript, expo-router)
- AsyncStorage pour la progression
- Interface sombre « salle de contrôle » maison (aucune dépendance UI)

## Structure

```
src/
  app/            # routes expo-router (tabs, module, quiz, lab)
  components/     # UI kit maison
  constants/      # thème
  data/           # cours, quiz, données des ateliers
  labs/           # ateliers interactifs
  lib/            # progression persistée, types partagés
```
