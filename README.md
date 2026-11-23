# BG Cyber OT

[🇫🇷 Version française](./README.fr.md)

Mobile app (React Native + Expo) for **OT (Operational Technology) cybersecurity training**,
built to prepare for a career in the field: OT cybersecurity, industrial SOC, ICS security
engineering, SCADA infrastructure auditing.

The focus is **field realism**: content based on the Purdue model, IEC 62443, NIST SP 800-82,
MITRE ATT&CK for ICS and real incidents (Stuxnet, Industroyer, TRITON, Oldsmar).

⚠️ Course content is currently written in French.

## Content

- **7 course modules** (21 lessons, in French): IT/OT fundamentals, industrial protocols
  (Modbus, DNP3, S7comm, OPC UA), landmark attacks, secure architecture, hardening,
  detection & response, standards (IEC 62443, NIS2, ATT&CK for ICS).
- **Validation quizzes** (35 questions, with explained answers, target score 80%).
- **6 hands-on labs**:
  - **Modbus console under attack**: simulation of a PLC over Modbus/TCP — asset inventory,
    baseline, detection of an unauthorized FC6 write, incident response (restore the tampered value + block the intruder).
  - **IT → OT pivot (attack + defense)**: replay how a phished workstation pivots to the process
    network through a dual-homed maintenance server, then switch to the defender's chair (containment,
    zone firewall deny IT→OT, bastion for maintenance access).
  - **Danfoss forced defrost (2026, real incident)**: replay the actual October 2026 attack on
    ~700 French supermarkets — internet-exposed controllers, auth bypass, command injection,
    unlimited defrost cycle — then the defense (remove exposure, patch/migrate EOL models, strict
    security level, temperature alerts outside the controller).
  - **Stuxnet: sabotaged centrifuges (attack + defense)**: replay the June 2010 weapon against the
    Natanz IR-1 cascades — air-gap breach via USB, S7-315/417 block injection with a Step 7 rootkit,
    data replay to blind the control room, rotor frequency swinging 1 410 / 2 Hz — then the defense
    (measurement independent from the controller, removable-media policy, signed program blocks).
  - **Log triage**: 12 logs from an industrial site to classify as normal / suspicious,
    with explanations.
  - **Purdue zoning**: place factory assets in the right levels (0-1, 2, 3, 3.5, 4-5).
- **Progress persistence** (AsyncStorage): lessons read, best quiz scores, labs completed.

## Getting started

```bash
npm install
npm start          # Expo Dev Server
```

Then scan the QR code with the **Expo Go** app (Android/iOS), or:

```bash
npm run android    # Android emulator
npm run ios        # iOS simulator (macOS)
npm run web        # browser
```

### Building an APK

```bash
npx expo prebuild -p android
cd android && ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk
```

or via the cloud (requires an Expo account, free tier has a monthly quota):

```bash
npx eas-cli build -p android --profile preview
```

A prebuilt signed APK is available in [`apk/`](./apk).

## Checks

```bash
npx tsc --noEmit   # typecheck
npx expo lint      # lint
```

## Stack

- Expo (React Native, TypeScript, expo-router)
- AsyncStorage for progress
- Custom dark "control room" UI (no UI dependencies)

## Structure

```
src/
  app/            # expo-router routes (tabs, module, quiz, lab)
  components/     # in-house UI kit
  constants/      # theme
  data/           # courses, quizzes, lab datasets
  labs/           # interactive labs
  lib/            # persisted progress, shared types
```
