import React, { useState, useRef, useEffect, useContext } from 'react';
import { Animated } from 'react-native';
import { styles } from './style';
import Context from '../../../context';
import RNText from '../text';
import colors from '../../../constants/color';

const Toast = () => {
  const { toastMsg, setToastMsg } = useContext(Context);
  const [showToast, setShowToast] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  fadeAnim.addListener(() => {
    return;
  });

  useEffect(() => {
    const toast = () => {
      if (!showToast) {
        setShowToast(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            setShowToast(false);
            setToastMsg('');
          });
        }, 3000);
      }
    };
    if (toastMsg !== '') {
      toast();
    }
  }, [toastMsg]);

  return showToast ? (
    <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
      <RNText label={toastMsg} color={colors.white} textAlign="center" />
    </Animated.View>
  ) : null;
};

export default Toast;
