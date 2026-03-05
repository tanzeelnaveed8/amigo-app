import React from 'react';
import {Plus} from 'lucide-react-native';

const PlusIcon = ({size, color}: {size?: number; color?: any}) => (
  <Plus size={size ?? 24} color={color ?? '#9B7BFF'} strokeWidth={2.5} />
);

export default PlusIcon;
