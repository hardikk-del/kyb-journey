import type { ViewStyle } from 'react-native';

/** Soft card elevation matching the web reference's `--shadow-xs`. */
export const shadowXs: ViewStyle = {
  shadowColor: '#0f172a',
  shadowOpacity: 0.06,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};

/** Slightly stronger elevation for selected / floating surfaces (`--shadow-sm`). */
export const shadowSm: ViewStyle = {
  shadowColor: '#0f172a',
  shadowOpacity: 0.1,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

/** Icon colours — lucide-react-native takes a color prop, not a class. */
export const C = {
  brand: 'rgb(9, 78, 255)',
  ink: 'rgb(27, 27, 27)',
  ink2: 'rgb(73, 73, 73)',
  ink3: 'rgb(118, 118, 118)',
  lineStrong: 'rgb(209, 209, 209)',
  pos: 'rgb(0, 155, 84)',
  posFg: 'rgb(0, 112, 48)',
  neg: 'rgb(184, 0, 0)',
  amber: 'rgb(251, 176, 22)',
  amberFg: 'rgb(173, 117, 0)',
  white: '#ffffff',
} as const;
