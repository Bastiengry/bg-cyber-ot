import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Text } from 'react-native';
import { Card, Screen } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import type { LabResult } from '@/lib/labs';
import { useProgress } from '@/lib/progress';
import ModbusLab from '@/labs/modbus-lab';
import TriageLab from '@/labs/triage-lab';
import ZonageLab from '@/labs/zonage-lab';

export default function LabScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { markLabDone, saveQuizScore } = useProgress();

  const onComplete = useCallback(
    (result?: LabResult) => {
      if (!id) return;
      markLabDone(id);
      if (result) {
        saveQuizScore(`lab-${id}`, result);
      }
    },
    [id, markLabDone, saveQuizScore],
  );

  if (id === 'modbus') {
    return (
      <Screen>
        <ModbusLab onCompleted={() => onComplete()} />
      </Screen>
    );
  }

  if (id === 'triage') {
    return (
      <Screen>
        <TriageLab onComplete={onComplete} />
      </Screen>
    );
  }

  if (id === 'zonage') {
    return (
      <Screen>
        <ZonageLab onComplete={onComplete} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <Text style={{ color: Colors.text, fontWeight: '700' }}>Atelier introuvable</Text>
        <Text style={{ color: Colors.muted, marginTop: Spacing.sm }}>Ateliers disponibles : modbus, triage, zonage.</Text>
      </Card>
    </Screen>
  );
}
