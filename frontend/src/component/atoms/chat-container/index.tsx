import React, { memo, useContext } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as FastImage } from 'expo-image';
import RNText from '../text';
import AudioPlayer from './audio-player';
import fontSize from '../../../constants/font-size';
import fontWeight from '../../../constants/font-weight';
import Context from '../../../context';

// Uisample: own gradient from theme, other from theme cardBg
const BUBBLE_FALLBACK = {
  ownGradient: ['#9B7BFF', '#7C5FD4'] as const,
  otherBg: '#1A1A2E',
  senderNameColor: '#B88DFF',
  timeOwn: 'rgba(255,255,255,0.6)',
  timeOther: '#8B8CAD',
  radiusBig: 20,
  radiusSmall: 4,
  paddingH: 16,
  paddingV: 10,
  maxWidthPercent: 0.85,
};

interface ChatContainerProps {
  id?: string;
  message?: string;
  person?: 'sender' | 'reciver';
  type?: string;
  image?: string | null;
  isdeleted?: string;
  Doc?: string | null;
  replay?: string | null;
  audio?: string | null;
  video?: string | null;
  index?: number;
  likesDislikes?: any;
  reaction?: any;
  seenBy?: string | null;
  time?: string;
  senderProfile?: string | null;
  receiverProfile?: string | null;
  senderName?: string | undefined;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onMessagePress?: (e: any) => void;
}

const ChatContainer = (props: ChatContainerProps) => {
  const {
    message,
    person,
    type,
    image,
    isdeleted,
    Doc,
    replay,
    audio,
    video,
    seenBy,
    time,
    senderName,
    isFirstInGroup = true,
    isLastInGroup = true,
    onMessagePress,
  } = props;

  const { width: screenWidth } = useWindowDimensions();
  const colors = useContext(Context)?.colors ?? {};
  const accent = colors.accentColor ?? BUBBLE_FALLBACK.ownGradient[0];
  const accentLight = colors.accentLight ?? BUBBLE_FALLBACK.ownGradient[1];
  const otherBg = colors.receiverBubble ?? colors.cardBg ?? BUBBLE_FALLBACK.otherBg;
  const senderNameColor = colors.accentLight ?? colors.lightgrey ?? BUBBLE_FALLBACK.senderNameColor;
  const cardBg = colors.cardBg ?? '#141422';

  const maxBubbleWidth = screenWidth * BUBBLE_FALLBACK.maxWidthPercent;
  const isOwn = person === 'sender';

  // Uisample grouped radius: first in group = 20px outer, last = 4px inner
  const r = BUBBLE_FALLBACK.radiusBig;
  const s = BUBBLE_FALLBACK.radiusSmall;
  const borderTopLeft = isOwn ? r : (isFirstInGroup ? r : s);
  const borderTopRight = isOwn ? (isFirstInGroup ? r : s) : r;
  const borderBottomRight = isOwn ? (isLastInGroup ? s : s) : r;
  const borderBottomLeft = isOwn ? r : (isLastInGroup ? s : s);

  const timeColor = isOwn ? BUBBLE_FALLBACK.timeOwn : BUBBLE_FALLBACK.timeOther;
  const bubbleText = '#FFFFFF';

  const bubbleBorderRadius = {
    borderTopLeftRadius: borderTopLeft,
    borderTopRightRadius: borderTopRight,
    borderBottomRightRadius: borderBottomRight,
    borderBottomLeftRadius: borderBottomLeft,
  };

  const bubbleContent = (
    <>
      {!isOwn && senderName && (
        <RNText
          label={senderName}
          fontSize={fontSize._11}
          fontWeight={fontWeight._600}
          color={senderNameColor}
          style={styles.senderName}
        />
      )}
      {replay && (
        <View style={[styles.replyBar, isOwn && styles.replyBarOwn, !isOwn && { borderLeftColor: accent }]}>
          <RNText
            numberOfLines={1}
            label={replay}
            fontSize={fontSize._12}
            fontWeight={fontWeight._500}
            color={isOwn ? 'rgba(255,255,255,0.9)' : '#8B8CAD'}
          />
        </View>
      )}
      {type === 'image' && image && (
        <View style={styles.mediaWrap}>
          <FastImage source={{ uri: image }} style={styles.mediaImage} contentFit="cover" />
        </View>
      )}
      {type === 'video' && video && (
        <View style={styles.mediaWrap}>
          <Image source={{ uri: video }} style={styles.mediaImage} resizeMode="cover" />
        </View>
      )}
      {type === 'doc' && Doc && (
        <TouchableOpacity
          style={styles.docWrap}
          onPress={() => Linking.openURL(Doc).catch(() => {})}
          activeOpacity={0.8}
        >
          <RNText numberOfLines={1} label="Document" fontSize={fontSize._14} fontWeight={fontWeight._600} color={bubbleText} />
          <RNText numberOfLines={1} label="Tap to open" fontSize={fontSize._11} fontWeight={fontWeight._400} color={timeColor} />
        </TouchableOpacity>
      )}
      {type === 'audio' && audio && (
        <View style={styles.audioWrap}>
          <AudioPlayer audioUri={audio} person={person} message={message} bubbleText={bubbleText} black={timeColor} />
        </View>
      )}
      {(type === 'text' || type === 'replay' || (message && type !== 'audio')) && (
        <RNText label={message || ''} fontSize={fontSize._15} fontWeight={fontWeight._400} color={bubbleText} style={styles.text} />
      )}
      <View style={styles.footer}>
        {seenBy != null && (
          <RNText label={seenBy} fontSize={fontSize._10} fontWeight={fontWeight._500} color={timeColor} style={styles.seenBy} />
        )}
        <RNText label={time ?? '10:00 am'} fontSize={fontSize._10} fontWeight={fontWeight._500} color={timeColor} />
      </View>
    </>
  );

  if (isdeleted === '1') {
    return (
      <View style={[styles.wrapper, isOwn && styles.wrapperOwn]}>
        <View style={[styles.bubble, bubbleBorderRadius, { backgroundColor: cardBg, opacity: 0.8, maxWidth: maxBubbleWidth }]}>
          <RNText label="This message was deleted" fontSize={fontSize._14} fontWeight={fontWeight._500} color="#8B8CAD" style={{ fontStyle: 'italic' }} />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onMessagePress}
      style={[styles.wrapper, isOwn && styles.wrapperOwn]}
    >
      {isOwn ? (
        <LinearGradient
          colors={[accent, accentLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, bubbleBorderRadius, { maxWidth: maxBubbleWidth, alignSelf: 'flex-end' }]}
        >
          {bubbleContent}
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, bubbleBorderRadius, { backgroundColor: otherBg, maxWidth: maxBubbleWidth, alignSelf: 'flex-start' }]}>
          {bubbleContent}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default memo(ChatContainer);

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 2,
    maxWidth: '85%',
  },
  wrapperOwn: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: BUBBLE_FALLBACK.paddingH,
    paddingVertical: BUBBLE_FALLBACK.paddingV,
    overflow: 'hidden',
  },
  senderName: {
    marginBottom: 4,
  },
  replyBar: {
    borderLeftWidth: 3,
    borderLeftColor: '#9B7BFF',
    paddingLeft: 10,
    marginBottom: 6,
    opacity: 0.95,
  },
  replyBarOwn: {
    borderLeftColor: 'rgba(255,255,255,0.5)',
  },
  mediaWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  mediaImage: {
    minWidth: 200,
    maxWidth: 280,
    height: 200,
    borderRadius: 12,
  },
  docWrap: {
    paddingVertical: 10,
    paddingRight: 8,
  },
  audioWrap: {
    marginBottom: 4,
    minWidth: 175,
  },
  text: {
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 6,
  },
  seenBy: {
    marginRight: 2,
  },
});
