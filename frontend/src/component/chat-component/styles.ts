import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Uisample in-chat design – AmigoChatScreen / message-bubble / top-nav-bar
const useMergedStyle = (colors: any) => {
  const cardBg = colors?.cardBg ?? '#141422';
  const borderColor = colors?.borderColor ?? 'rgba(255,255,255,0.08)';
  const textColor = colors?.textColor ?? '#FFFFFF';
  const secondaryText = colors?.secondaryText ?? '#8B8CAD';
  const inputBG = colors?.inputBGColor ?? colors?.cardBg ?? '#141422';
  const accent = colors?.accentColor ?? '#9B7BFF';

  return StyleSheet.create({
    absolute: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 8,
      elevation: 8,
    },
    secondmain: {
      flex: 1,
      width: '100%',
    },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingBottom: 24,
    gap: 8,
  },
  inputContainerView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    minHeight: 50,
    backgroundColor: inputBG,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
  },
  inputStyle: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    fontSize: 15,
    color: textColor,
    maxHeight: 120,
  },
  plusBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sendMicBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendMicBtnEmpty: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  emojiicon: {
      padding: 6,
      marginLeft: 4,
    },
    adminpopup: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: cardBg,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor,
    },
    replyBarWrap: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 4,
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    replyBarInner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 12,
      borderLeftWidth: 4,
      borderLeftColor: accent,
      paddingVertical: 8,
    },
    replyBarLeft: {
      flex: 1,
      minWidth: 0,
    },
    replyBarClose: {
      padding: 8,
    },
    typingWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
    },
    typingAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    typingDots: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    typingText: {
      marginLeft: 4,
    },
    searchBarWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 10,
      backgroundColor: cardBg,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    searchBarInput: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 15,
      color: textColor,
      backgroundColor: inputBG,
      borderRadius: 12,
      borderWidth: 1,
      borderColor,
    },
    searchBarClose: {
      padding: 8,
    },
  });
};

export default useMergedStyle;

export const UISAMPLE_INCHAT = {
  header: {
    height: 56,
    bg: 'rgba(5,5,9,0.8)',
    borderBottom: 'rgba(255,255,255,0.08)',
    titleColor: '#FFFFFF',
    titleSize: 17,
  },
  bubble: {
    ownBg: '#7B5CFF',
    otherBg: '#1F2033',
    senderNameColor: '#B88DFF',
    borderRadius: 16,
    radiusSmall: 4,
    paddingH: 16,
    paddingV: 10,
    maxWidth: '85%',
  },
  input: {
    bg: '#141422',
    borderRadius: 24,
    minHeight: 50,
    borderColor: 'rgba(255,255,255,0.12)',
    placeholderColor: '#5E607E',
  },
  sendButton: {
    size: 48,
    accentBg: '#9B7BFF',
    emptyBg: '#141422',
  },
};
