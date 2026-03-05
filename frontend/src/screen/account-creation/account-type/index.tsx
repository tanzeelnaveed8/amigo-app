import {FlatList, Pressable, SafeAreaView, View} from 'react-native';
import React, {useContext} from 'react';
import Header from '../../../component/atoms/header';
import RNText from '../../../component/atoms/text';
import fontWeight from '../../../constants/font-weight';
import fontSize from '../../../constants/font-size';
import {DATA} from './data';
import useNavigationHook from '../../../hooks/use_navigation';
import styles from './styles';
import Context from '../../../context';
import {useMutation} from 'react-query';
import {UpdateProfile} from '../../../apis/auth';
import {useDispatch, useSelector} from 'react-redux';
import {loginAction} from '../../../redux/actions';

const AccountTypeScreen = () => {
  const navigation = useNavigationHook();
  const {setLoader, colors} = useContext(Context);
  const userData: any = useSelector((state: any) => state.loginData);
  const dispatch = useDispatch();

  const {mutate} = useMutation(UpdateProfile, {
    onSuccess: res => {
      dispatch(loginAction({...res}));
      navigation.navigate('ContactSyncPermission');
      setLoader(false);
    },
    onError: () => {
      console.log('UPDATE_ERRPR');
      setLoader(false);
    },
  });

  return (
    <View style={[styles.container, {backgroundColor: colors.primary}]}>
      <SafeAreaView>
        <Header title="Amigo" onLeftIconPress={navigation.goBack} />
      </SafeAreaView>
      <View style={styles.secondmainView}>
        <View>
          <FlatList
            data={DATA}
            keyExtractor={(_, index) => index.toString()}
            numColumns={2}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={1}
            columnWrapperStyle={{
              justifyContent: 'space-between',
            }}
            renderItem={({item}) => {
              return (
                <Pressable
                  style={styles.flatlistview}
                  onPress={() => {
                    setLoader(true);
                    const obj = {
                      userAccountType: item.params,
                      userId: userData?.data?._id,
                    };
                    console.log('objobjobj', obj);

                    mutate(obj);
                  }}>
                  {item.icon}
                  <RNText
                    textAlign="center"
                    label={item.name}
                    marginTop={20}
                    fontSize={fontSize._16}
                    fontWeight={fontWeight._700}
                    color={colors.white}
                  />
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default AccountTypeScreen;
