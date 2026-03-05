import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Pencil} from 'lucide-react-native';

const AddIcon = ({size}: {size?: number}) => {
  const s = size ?? 56;
  return (
    <View style={[styles.container, {width: s, height: s, borderRadius: s / 2}]}>
      <Pencil size={s * 0.4} color="#FFFFFF" strokeWidth={2.5} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#9B7BFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9B7BFF',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default AddIcon;
