import { View, Text, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

type Insets = { top: number; bottom: number; left: number; right: number };

export const SafeAreaProvider = ({ children }: { children: ReactNode }) => children;

export const SafeAreaConsumer = ({ children }: { children: (i: Insets) => ReactNode }) =>
  children({ top: 0, bottom: 0, left: 0, right: 0 });

export const SafeAreaView = ({
  children,
  style,
  // edges et mode sont ignorés sous les tests
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: string[];
  mode?: string;
}) => <View style={style}>{children}</View>;

export const useSafeAreaInsets = (): Insets => ({ top: 0, bottom: 0, left: 0, right: 0 });

export const useSafeAreaFrame = () => ({ x: 0, y: 0, width: 0, height: 0 });

export const initialWindowMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
};

export default {
  SafeAreaProvider,
  SafeAreaConsumer,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  initialWindowMetrics,
  Text,
};
