import {Platform, Pressable, StyleSheet, TextInput, View} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import RNText from '../text';
import fontSize from '../../../constants/font-size';
import fontWeight from '../../../constants/font-weight';
import Context from '../../../context';

interface props {
  onOtp: (value: string) => void;
}

const OtpInput = (props: props) => {
  const {onOtp} = props;
  const [otp, setOtp] = useState<string>('');
  const {colors} = useContext(Context);
  const ref_input = useRef<any>(null);

  useEffect(() => {
    ref_input?.current?.focus();
    onOtp(otp);
    if (otp.length === 6) {
      ref_input?.current?.blur();
    }
  }, [ref_input, otp]);

  return (
    <>
      <Pressable
        style={styles.container}
        onPress={() => ref_input?.current?.focus()}>
        {Array(6)
          .fill(0)
          .map((_, i) => {
            return (
              <Pressable
                onPress={() => ref_input?.current?.focus()}
                style={{alignItems: 'center'}}
                key={i.toString()}>
                <View style={[styles.line, {borderColor: colors.textColor}]}>
                  <RNText
                    label={otp[i]}
                    color={colors.textColor}
                    fontSize={fontSize._20}
                    fontWeight={fontWeight._700}
                  />
                </View>
              </Pressable>
            );
          })}
      </Pressable>
      <TextInput
        style={
          Platform.OS === 'android'
            ? {position: 'absolute', color: colors.transparent}
            : {display: 'none'}
        }
        ref={ref_input}
        cursorColor={colors.transparent}
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />
    </>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  line: {
    height: 52,
    width: 47,
    marginHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    marginTop: 50,
    alignItems: 'center',
    alignSelf: 'center',
  },
  image: {
    marginBottom: 15,
    marginLeft: 15,
  },
});
