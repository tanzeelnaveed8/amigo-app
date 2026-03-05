import React, { forwardRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  DimensionValue,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  KeyboardTypeOptions,
  Platform,
} from 'react-native';
import { Control, Controller } from 'react-hook-form';
import useMergedStyle from './style';
import colors from '../../../constants/color';
import RNText from '../text';
import { getHeightInPercentage } from '../../../utils/dimensions';
import fontWeight from '../../../constants/font-weight';

export interface inputFieldProps {
  title?: string;
  value?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  isPassword?: boolean;
  maskInput?: boolean;
  onIconPress?: () => void;
  onRightIconPress?: () => void;
  name: string;
  control?: Control<any>;
  errors: any;
  onChangeText?: any;
  borderBottomWidth?: any;
  marginTop?: number;
  multiline?: boolean;
  countryPicker?: boolean;
  height?: DimensionValue;
  width?: DimensionValue;
  textAlignVertical?: 'auto' | 'center' | 'bottom' | 'top';
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  backgroundColor?: string;
  Editable?: any;
  fontFamily?: any;
  onSelectCountry?: () => void;
  countrycode?: string;
  defaultValue?: string;
  titleColor?: string;
  contextMenuHidden?: boolean;
  borderColor?: any;
  borderWidth?: any;
  color?: any;
  onKeyPress?: any;
  returnKeyType?: 'default' | 'go' | 'google' | 'join' | 'next' | 'route' | 'search' | 'send' | 'yahoo' | 'done' | 'emergency-call' | undefined
  onSubmitEditing?: any;
  fontSize?: number;
  padding?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters" | undefined;
  autoFocus?: boolean;
  borderRadius?: number;
  placeholderTextColor?: any;
  rightIcon?: any;
}

const InputField = forwardRef(
  (props: inputFieldProps, ref: React.LegacyRef<TextInput>) => {
    const {
      name,
      icon,
      placeholder,
      isPassword,
      onIconPress,
      control,
      title,
      errors,
      multiline,
      countryPicker,
      onFocus,
      keyboardType,
      maxLength,
      Editable,
      onSelectCountry,
      countrycode,
      defaultValue,
      onChangeText,
      titleColor,
      fontFamily,
      contextMenuHidden,
      textAlignVertical,
      onKeyPress,
      autoFocus, onSubmitEditing,
      returnKeyType, autoCapitalize, fontSize, placeholderTextColor,
      rightIcon, onRightIconPress
    } = props;
    const styles = useMergedStyle(props);

    return (
      <View style={styles.container}>
        {title ? (
          <RNText
            label={title}
            fontSize={fontSize ?? 18}
            color={titleColor}
            fontFamily={fontFamily}
            fontWeight={fontWeight._600}
          />
        ) : null}
        <View style={styles.body}>
          {countryPicker ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.countryPicker}
              onPress={onSelectCountry}>
              <RNText label={countrycode} fontSize={12} />
            </TouchableOpacity>
          ) : null}
          <View style={styles.innerContainer}>
            {icon ? (
              <TouchableOpacity style={{ position: 'absolute', paddingHorizontal: 10 }}
                activeOpacity={0.7}
                onPress={onIconPress}
                disabled={!onIconPress}>
                {icon}
              </TouchableOpacity>
            ) : null}
            <Controller
              name={name}
              control={control}
              render={({ field: { onBlur, onChange, value } }) => {
                return <TextInput
                  textAlignVertical={textAlignVertical}
                  defaultValue={defaultValue}
                  autoCapitalize={autoCapitalize}
                  ref={ref}
                  textContentType='oneTimeCode'
                  placeholder={placeholder}
                  placeholderTextColor={placeholderTextColor ?? '#8B8CAD'}
                  style={styles.contentText}
                  value={value}
                  onChangeText={e => {
                    if (defaultValue && e.length === 0) {
                      onChange(defaultValue);
                    } else {
                      onChange(e);
                      onChangeText(e);
                    }
                  }}
                  onBlur={onBlur}
                  secureTextEntry={isPassword ?? false}
                  multiline={multiline}
                  onFocus={onFocus}
                  keyboardType={keyboardType}
                  maxLength={maxLength}
                  editable={Editable}
                  onSubmitEditing={onSubmitEditing}
                  contextMenuHidden={contextMenuHidden}
                  onKeyPress={onKeyPress}
                  autoFocus={autoFocus}
                  returnKeyType={returnKeyType}
                />
              }}
            />
            {rightIcon ? (
              <TouchableOpacity style={{ position: 'absolute', paddingHorizontal: 10, right: 5 }}
                activeOpacity={0.7}
                onPress={onRightIconPress}
                disabled={!onRightIconPress}>
                {rightIcon}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        {errors?.[name] ? (
          <RNText
            label={errors?.[name].message}
            color={colors.red}
            marginTop={5}
            fontSize={12}
          />
        ) : <View style={{ marginTop: Platform.OS === 'ios' ? getHeightInPercentage(2.2) : getHeightInPercentage(2.8) }} />}
      </View>
    );
  },
);

export default InputField;
