import Svg, { Rect, Circle, Path } from 'react-native-svg';

/** Indian tricolour flag chip. */
export function FlagIN({ w = 22 }: { w?: number }) {
  const h = w * 0.68;
  return (
    <Svg width={w} height={h} viewBox="0 0 22 15">
      <Rect width={22} height={5} y={0} fill="#FF9933" />
      <Rect width={22} height={5} y={5} fill="#fff" />
      <Rect width={22} height={5} y={10} fill="#138808" />
      <Circle cx={11} cy={7.5} r={1.9} fill="none" stroke="#054aa0" strokeWidth={0.7} />
    </Svg>
  );
}

/** WhatsApp brand glyph (green). */
export function WhatsAppGlyph({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill="#25D366" d="M12 2a10 10 0 0 0-8.6 15l-1.3 4 4.1-1.3A10 10 0 1 0 12 2z" />
      <Path
        fill="#fff"
        d="M9 7c-.3 0-.6.1-.8.4-.3.3-1 1-1 2.3s1 2.6 1.1 2.8c.2.2 2 3.1 5 4.3 2.4 1 2.9.8 3.4.7.5 0 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3l-2-1c-.3-.1-.5-.2-.7.1l-.6.9c-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.5l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5L9.7 7.4C9.5 7 9.3 7 9 7z"
      />
    </Svg>
  );
}
