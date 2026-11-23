import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card, Pill, PrimaryButton } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';

const REGISTERS = [
  { addr: '40001', name: 'Consigne de pression (hPa)', normal: 85 },
  { addr: '40002', name: 'Température procédé (°C)', normal: 71 },
  { addr: '40003', name: 'Débit pompe P101 (m³/h)', normal: 240 },
  { addr: '40004', name: 'Vitesse variateur VFD1 (rpm)', normal: 1450 },
];

const COILS = [
  { addr: 'Coil 0', name: 'Pompe P101' },
  { addr: 'Coil 1', name: 'Vanne V-3' },
  { addr: 'Coil 2', name: 'Alarme procédé' },
];

type LogLine = { time: string; text: string; tone: 'muted' | 'accent' | 'red' | 'amber' };

const OBJECTIVES = [
  'Exécuter une lecture complète (FC1 + FC3) pour établir l’inventaire',
  'Établir la baseline : relever la température procédé (40002)',
  'Détecter l’écriture non autorisée dans la température (40002)',
  'Restaurer la température nominale (71 °C) puis bloquer la station inconnue',
];

export default function ModbusLab({ onCompleted }: { onCompleted: () => void }) {
  const [started, setStarted] = useState(false);
  const [registers, setRegisters] = useState(REGISTERS.map((r) => r.normal));
  const [coils, setCoils] = useState([1, 0, 0]);
  const [fc, setFc] = useState<'FC1' | 'FC3' | 'FC5' | 'FC6'>('FC3');
  const [addrText, setAddrText] = useState('');
  const [valueText, setValueText] = useState('');
  const [log, setLog] = useState<LogLine[]>([]);
  const [objectivesDone, setObjectivesDone] = useState<boolean[]>([false, false, false, false]);
  const [blocked, setBlocked] = useState(false);
  const [attackActive, setAttackActive] = useState(false);
  const attackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seen = useRef({ fc1: false, fc3: false, baseline: false });

  const addLog = useCallback((text: string, tone: LogLine['tone'] = 'muted') => {
    const time = new Date().toTimeString().slice(0, 8);
    setLog((prev) => [{ time, text, tone }, ...prev].slice(0, 40));
  }, []);

  const checkFirstObjective = useCallback(() => {
    if (seen.current.fc1 && seen.current.fc3) setObjectivesDone((p) => (p[0] ? p : Object.assign([...p], { 0: true })));
  }, []);

  const startAttack = () => {
    if (attackRef.current) return;
    setAttackActive(true);
    addLog('SONDE OT : flux inconnu détecté entre 10.42.8.66 et PLC_P101 …', 'amber');
    attackRef.current = setInterval(() => {
      if (blocked) return;
      const bad = [12, 24, 36, 8][Math.floor(Math.random() * 4)];
      setRegisters((prev) => {
        const next = [...prev];
        next[1] = bad;
        return next;
      });
      addLog('10.42.8.66 → PLC_P101 | FC6 write register 40002 = ' + bad, 'red');
    }, 4000);
  };

  useEffect(() => {
    if (objectivesDone.every(Boolean)) onCompleted();
  }, [objectivesDone, onCompleted]);

  useEffect(() => {
    return () => {
      if (attackRef.current) clearInterval(attackRef.current);
    };
  }, []);

  const sendFrame = () => {
    switch (fc) {
      case 'FC1': {
        seen.current.fc1 = true;
        addLog('SCADA → PLC_P101 | FC1 read coils 0-2 (unit 1)');
        addLog(`← PLC_P101 | coils: ${coils.join(', ')}`, 'accent');
        checkFirstObjective();
        break;
      }
      case 'FC3': {
        seen.current.fc3 = true;
        addLog('SCADA → PLC_P101 | FC3 read holding registers 40001-40004 (unit 1)');
        addLog(`← PLC_P101 | ${REGISTERS.map((r, i) => `${r.addr}=${registers[i]}`).join(' | ')}`, 'accent');
        checkFirstObjective();
        if (registers[1] < 60 && attackActive) {
          setObjectivesDone((p) => (p[2] ? p : Object.assign([...p], { 2: true })));
          addLog('ALERTE : 40002 en dérive alors que la baseline relevait 71 °C (aucune maintenance déclarée)', 'amber');
        } else if (!attackActive && !seen.current.baseline) {
          seen.current.baseline = true;
          setObjectivesDone((p) => (p[1] ? p : Object.assign([...p], { 1: true })));
        }
        if (blocked && registers[1] === 71) {
          setObjectivesDone((p) => {
            if (p[3]) return p;
            const next = [...p];
            next[3] = true;
            return next;
          });
        }
        break;
      }
      case 'FC5': {
        const coil = parseInt(addrText, 10);
        if (Number.isNaN(coil) || coil < 0 || coil > 2) {
          addLog('Erreur : saisir une bobine entre 0 et 2', 'amber');
          return;
        }
        const value = valueText.trim() === '1' ? 1 : 0;
        setCoils((prev) => {
          const next = [...prev];
          next[coil] = value;
          return next;
        });
        addLog(`SCADA → PLC_P101 | FC5 write single coil ${coil} = ${value}`);
        break;
      }
      case 'FC6': {
        const reg = parseInt(addrText, 10);
        const value = parseInt(valueText, 10);
        if (Number.isNaN(reg) || reg < 1 || reg > 4 || Number.isNaN(value)) {
          addLog('Erreur : registre 1 à 4 et valeur numérique attendus', 'amber');
          return;
        }
        setRegisters((prev) => {
          const next = [...prev];
          next[reg - 1] = value;
          return next;
        });
        addLog(`SCADA → PLC_P101 | FC6 write register ${REGISTERS[reg - 1].addr} = ${value}`);
        if (reg === 2 && value === 71) {
          addLog('Température restaurée à 71 °C. Vérifiez le retour à la normale par FC3.', 'accent');
        }
        break;
      }
    }
  };

  const blockStation = () => {
    setBlocked(true);
    if (attackRef.current) {
      clearInterval(attackRef.current);
      attackRef.current = null;
    }
    addLog('Pare-feu de zone : règle DENY 10.42.8.66 → 10.42.1.101:502 appliquée', 'accent');
    addLog('Rappel : après l’incident, ouvrez une investigation (comment cette station a-t-elle atteint le VLAN procédé ?)', 'amber');
  };

  if (!started) {
    return (
      <View style={styles.intro}>
        <Text style={styles.introEmoji}>🛠️</Text>
        <Text style={styles.introTitle}>Console Modbus sous attaque</Text>
        <Text style={styles.introText}>
          Vous êtes en astreinte sur un process de traitement d’eau. Le SCADA parle Modbus/TCP au
          PLC_P101 (10.42.1.101, port 502). Une écriture non authentifiée suffit à agir sur le
          procédé.{'\n\n'}Objectifs : 1) inventaire des variables, 2) baseline des valeurs normales,
          3) détection d’une écriture suspecte, 4) réponse (restauration de la température puis
          blocage de la station).
        </Text>
        <PrimaryButton label="Lancer la simulation" onPress={() => setStarted(true)} style={{ marginTop: Spacing.lg }} />
      </View>
    );
  }

  const allDone = objectivesDone.every(Boolean);

  return (
    <View style={{ flex: 1, gap: Spacing.md }}>
      <View style={styles.objectives}>
        {OBJECTIVES.map((o, i) => (
          <Text key={i} style={[styles.objective, objectivesDone[i] && styles.objectiveDone]}>
            {objectivesDone[i] ? '✔' : '○'} {o}
          </Text>
        ))}
      </View>

      <Card>
        <Text style={styles.sectionTitle}>PLC_P101 — 10.42.1.101:502</Text>
        <Text style={styles.tableHead}>REGISTRES D’ENTRÉE / TÉNUE (FC3)</Text>
        {REGISTERS.map((r, i) => (
          <View key={r.addr} style={styles.tableRow}>
            <Text style={styles.mono}>{r.addr}</Text>
            <Text style={styles.tableName}>{r.name}</Text>
            <Text style={[styles.mono, registers[i] === r.normal ? styles.valueOk : styles.valueBad]}>
              {registers[i]}
            </Text>
          </View>
        ))}
        <Text style={styles.tableHead}>BOBINES (FC1)</Text>
        {COILS.map((c, i) => (
          <View key={c.addr} style={styles.tableRow}>
            <Text style={styles.mono}>{c.addr}</Text>
            <Text style={styles.tableName}>{c.name}</Text>
            <Text style={[styles.mono, coils[i] ? styles.valueOk : styles.valueMuted]}>{coils[i]}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Console maître Modbus</Text>
        <View style={styles.fcRow}>
          {(['FC1', 'FC3', 'FC5', 'FC6'] as const).map((f) => (
            <Pressable key={f} onPress={() => setFc(f)} style={[styles.fcButton, fc === f && styles.fcActive]}>
              <Text style={[styles.fcText, fc === f && styles.fcTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </View>
        {(fc === 'FC5' || fc === 'FC6') && (
          <View style={styles.writeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.writeLabel}>{fc === 'FC5' ? 'Bobine (0-2)' : 'Registre (1-4)'}</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={addrText}
                onChangeText={(t) => setAddrText(t.replace(/[^0-9]/g, ''))}
                placeholder={fc === 'FC5' ? '0' : '1'}
                placeholderTextColor={Colors.muted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.writeLabel}>{fc === 'FC5' ? 'État (0/1)' : 'Valeur'}</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={valueText}
                onChangeText={(t) => setValueText(t.replace(/[^0-9]/g, ''))}
                placeholder={fc === 'FC5' ? '1' : '71'}
                placeholderTextColor={Colors.muted}
              />
            </View>
          </View>
        )}
        <PrimaryButton label="Envoyer la trame" tone="blue" onPress={sendFrame} />
        {objectivesDone[1] && !attackActive && !objectivesDone[2] && (
          <PrimaryButton
            label="▶ Simuler le trafic de l’attaquant"
            tone="red"
            onPress={startAttack}
            style={{ marginTop: Spacing.sm }}
          />
        )}
        {attackActive && !blocked && (
          <View style={{ marginTop: Spacing.sm }}>
            <Pill label="⚠ Écritures entrantes depuis 10.42.8.66 (non inventoriée)" tone="red" />
          </View>
        )}
      </Card>

      {objectivesDone[2] && !blocked && (
        <Card>
          <Text style={styles.sectionTitle}>Réponse à incident</Text>
          <Text style={styles.introText}>
            Deux actions : restaurer la température (FC6, registre 2, valeur 71) et bloquer la
            station inconnue au pare-feu de zone. L’ordre importe peu (tant que la station
            écrit encore, elle peut écraser votre restauration) ; terminez par une lecture FC3
            pour confirmer le retour à la normale.
          </Text>
          <PrimaryButton
            label="Bloquer 10.42.8.66 au pare-feu de zone"
            tone="red"
            onPress={blockStation}
            style={{ marginTop: Spacing.sm }}
          />
        </Card>
      )}

      <Card style={{ maxHeight: 300 }}>
        <Text style={styles.sectionTitle}>Journal de bord</Text>
        <ScrollView style={{ maxHeight: 230 }} nestedScrollEnabled showsVerticalScrollIndicator>
          {log.length === 0 ? (
            <Text style={styles.mono}>Aucune trame émise. Commencez par FC1 puis FC3.</Text>
          ) : (
            log.map((l, i) => (
              <Text
                key={i}
                style={[
                  styles.mono,
                  l.tone === 'red' && styles.logRed,
                  l.tone === 'accent' && styles.logAccent,
                  l.tone === 'amber' && styles.logAmber,
                ]}
              >
                [{l.time}] {l.text}
              </Text>
            ))
          )}
        </ScrollView>
      </Card>

      {allDone && (
        <Card style={{ borderColor: Colors.accent }}>
          <Text style={styles.sectionTitle}>Atelier réussi ✅</Text>
          <Text style={styles.introText}>
            Séquence à retenir : inventaire → baseline → détection d’une écriture hors inventaire →
            restauration et blocage. En conditions réelles, l’alerte part au SOC avec capture des
            trames, et l’enquête vise à déterminer comment 10.42.8.66 a atteint le VLAN de procédé
            (poste de maintenance compromis, jonction non contrôlée, équipement pirate branché…).
          </Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { flex: 1, padding: Spacing.lg, justifyContent: 'center' },
  introEmoji: { fontSize: 40, marginBottom: Spacing.md },
  introTitle: { color: Colors.text, fontSize: 22, fontWeight: '800', marginBottom: Spacing.md },
  introText: { color: Colors.muted, fontSize: 14, lineHeight: 21 },
  objectives: { gap: 4 },
  objective: { color: Colors.muted, fontSize: 13, lineHeight: 20 },
  objectiveDone: { color: Colors.accent },
  sectionTitle: { color: Colors.text, fontWeight: '800', fontSize: 14, marginBottom: Spacing.sm },
  tableHead: { color: Colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: Spacing.sm, marginBottom: 4 },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 2 },
  tableName: { color: Colors.text, fontSize: 13, flex: 1 },
  mono: { color: Colors.muted, fontSize: 12, fontFamily: 'monospace' },
  valueOk: { color: Colors.accent },
  valueBad: { color: Colors.red, fontWeight: '800' },
  valueMuted: { color: Colors.muted },
  fcRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  fcButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cardAlt,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fcActive: { borderColor: Colors.accent, backgroundColor: 'rgba(57,217,138,0.12)' },
  fcText: { color: Colors.muted, fontWeight: '800', fontSize: 13 },
  fcTextActive: { color: Colors.accent },
  writeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  writeLabel: { color: Colors.muted, fontSize: 11, marginBottom: 4 },
  input: {
    backgroundColor: Colors.cardAlt,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.sm,
    color: Colors.text,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontFamily: 'monospace',
  },
  logRed: { color: Colors.red },
  logAccent: { color: Colors.accent },
  logAmber: { color: Colors.amber },
});
