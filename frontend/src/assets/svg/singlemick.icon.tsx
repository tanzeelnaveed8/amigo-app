import React from 'react';
import {Mic} from 'lucide-react-native';

const SingleMickIcon = ({size, color}: {size?: number; color?: string; colorIcon?: string}) => (
  <Mic size={size ?? 20} color={color ?? '#FF4D4D'} strokeWidth={2.5} />
);

export default SingleMickIcon;
