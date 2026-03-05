import React from 'react';
import {Pause} from 'lucide-react-native';

const PauseIcon = ({size, color}: {size?: number; color?: string}) => (
  <Pause size={size ?? 20} color={color ?? '#FFFFFF'} fill={color ?? '#FFFFFF'} strokeWidth={0} />
);

export default PauseIcon;
