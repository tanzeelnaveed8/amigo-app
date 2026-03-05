import React, { useContext } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useMergedStyle } from './style';
import BackArrow from '../../../assets/svg/backArrow';
import Context from '../../../context';


export interface HeaderPropType {
  title: string;
  color?: string;
  leftImageSource?: any;
  leftImageSource1?: any;
  rightImageSource?: React.ReactNode;
  rightImageSource1?: React.ReactNode;
  userImage?: any;
  onRightIconPress?: () => void;
  onRightIconPress1?: () => void;
  onLeftIconPress?: () => void;
  onLeftIconPress1?: () => void;
  size?: number;
  tintColor?: string;
  fontFamily?: string;
  paddingHorizontal?: number;
  backgroundColor?: string;
  onpressbutton?: () => void;
  onpressprofile?: () => void;
  disablesave?: any;
  SaveButtonLabel?: any;
}

const Header = (props: HeaderPropType) => {
  const {
    title,
    leftImageSource,
    leftImageSource1,
    rightImageSource,
    rightImageSource1,
    onLeftIconPress,
    onRightIconPress,
    onRightIconPress1,
    userImage,
    onpressbutton,
    disablesave,
    onpressprofile,
    SaveButtonLabel, onLeftIconPress1
  } = props;
  const { colors: themeColors } = useContext(Context);
  const { styles } = useMergedStyle({ ...props, color: props.color ?? themeColors.textColor });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onLeftIconPress}
        activeOpacity={0.7}
        hitSlop={styles.hitSlop}>
        {leftImageSource ?? <BackArrow />}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onLeftIconPress1}
        style={{ position: 'absolute', left: 40 }}
        activeOpacity={0.7}
        hitSlop={styles.hitSlop}>
        {leftImageSource1 ?? null}
      </TouchableOpacity>
      <View style={styles.userImage}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={onpressprofile}>
          <Text style={styles.title} numberOfLines={1} >
            {title}
          </Text>
        </TouchableOpacity>
      </View>
      {rightImageSource1 ? (
        <TouchableOpacity
          style={{ position: 'absolute', right: 35, }}
          onPress={onRightIconPress1}
          activeOpacity={0.7}
          hitSlop={styles.hitSlop1}>
          {rightImageSource1}
        </TouchableOpacity>
      ) : null}
      {rightImageSource ? (
        <TouchableOpacity
          hitSlop={styles.hitSlop1}
          onPress={onRightIconPress}
          activeOpacity={0.7}>
          {rightImageSource}
        </TouchableOpacity>
      ) : null}

    </View>
  );
};

export default Header;
