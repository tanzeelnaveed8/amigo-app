import React from 'react';
import {View} from 'react-native';
import {SendHorizontal} from 'lucide-react-native';

const Forwardicon = ({sizeh, sizew}: {sizeh?: number; sizew?: number}) => {
  const s = sizeh ?? 44;
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
      <SendHorizontal size={s * 0.45} color="#FFFFFF" strokeWidth={2} />
    </View>
  );
};

export default Forwardicon;
