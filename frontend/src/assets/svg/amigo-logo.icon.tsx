import React from 'react';
import {Text, View, StyleSheet, Platform} from 'react-native';

interface Props {
  size?: number;
}

const AmigoLogoIcon = ({size = 32}: Props) => {
  const fontSize = size * 0.65;

  return (
    <View style={[styles.container, {width: size, height: size, borderRadius: size * 0.3}]}>
      <Text
        style={[
          styles.text,
          {
            fontSize,
            lineHeight: fontSize * 1.15,
          },
        ]}>
        A
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#9B7BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default AmigoLogoIcon;
