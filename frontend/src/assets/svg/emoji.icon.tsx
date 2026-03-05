import React from 'react';
import {Smile} from 'lucide-react-native';

const EmojiIcon = ({size, color}: {size?: number; color?: string}) => (
  <Smile size={size ?? 22} color={color ?? '#8B8CAD'} strokeWidth={1.8} />
);

export default EmojiIcon;
