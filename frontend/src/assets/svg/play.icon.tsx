import React from 'react';
import {Play} from 'lucide-react-native';

const PlayIcon = ({size, color}: {size?: number; color?: string}) => (
  <Play size={size ?? 20} color={color ?? '#FFFFFF'} fill={color ?? '#FFFFFF'} strokeWidth={0} />
);

export default PlayIcon;
