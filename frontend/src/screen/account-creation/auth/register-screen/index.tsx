import React, {useContext, useState} from 'react';
import RegisterComponent from '../../../../component/register-component';
import useNavigationHook from '../../../../hooks/use_navigation';
import Context from '../../../../context';
import { Animated } from 'react-native';
import useTopEnterAnim from '../../../../hooks/useTopEnterAnim';

const RegisterScreen = () => {
  const navigation = useNavigationHook();
  const {setLoader, setToastMsg} = useContext(Context);
  const [data, setData] = useState<any>('');
  const enterStyle = useTopEnterAnim({ offsetY: -40 });

  return (
    <Animated.View style={[{ flex: 1 }, enterStyle]}>
      <RegisterComponent
        message={data.message}
        error={data.status === '401'}
        onSendOTP={async (val: any) => {
          const phoneNumber = val.phone.trim(); // This should include country code from PhoneInput

          setLoader(true);
          setData(''); // Clear any previous error messages

          try {
            // Navigate to OTP screen after MSG91 OTP is sent (OTP is already sent in RegisterComponent)
            (navigation as any).navigate('OtpScreen', {
              phone: phoneNumber,
              flowType: 'register',
            });
            setLoader(false);
          } catch (error) {
            console.log('❌ Error in OTP process:', error);
            setLoader(false);
            setToastMsg('Failed to send OTP. Please try again.');
          }
        }}
      />
    </Animated.View>
  );
};

export default RegisterScreen;
