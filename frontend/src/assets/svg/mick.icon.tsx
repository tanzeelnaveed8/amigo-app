import React from 'react';
import {View} from 'react-native';
import {Mic} from 'lucide-react-native';

const MickIcon = ({size, color}: {size?: number; color?: any}) => {
  const s = size ?? 44;
  return (
    <View
      style={{
        width: s,
        height: s,
        borderRadius: s / 2,
        backgroundColor: '#9B7BFF',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Mic size={s * 0.45} color="#FFFFFF" strokeWidth={2} />
    </View>
  );
};

export default MickIcon;
