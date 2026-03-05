import React, { memo, useCallback, useImperativeHandle, useRef } from 'react';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import ChatContainer from '../atoms/chat-container';
import RNText from '../atoms/text';
import fontSize from '../../constants/font-size';
import fontWeight from '../../constants/font-weight';

function formatMessageDate(dateKey: string): string {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  if (dateKey === today) return 'Today';
  if (dateKey === yesterdayStr) return 'Yesterday';
  const [y, m, d] = dateKey.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

interface ChatListProps {
  data: any[];
  isLoading: boolean;
  isChanel: boolean;
  isAdmin: boolean;
  onItemPress: (item: any, pageY: number, locationY: number) => void;
}

const ChatList = memo(
  React.forwardRef<FlatList, ChatListProps>(({ data, isLoading, isChanel, isAdmin, onItemPress }, ref) => {
    const innerRef = useRef<FlatList>(null);

    useImperativeHandle(ref, () => innerRef.current as FlatList);

    const renderItem = useCallback(
      ({ item, index }: { item: any; index: number }) => {
        const prevMsg = data[index - 1];
        const nextMsg = data[index + 1];
        const showDateHeader = !prevMsg || (prevMsg.dateKey !== item.dateKey);
        const isFirstInGroup = !prevMsg || prevMsg.person !== item.person;
        const isLastInGroup = !nextMsg || nextMsg.person !== item.person;

        return (
          <>
            {showDateHeader && item.dateKey && (
              <View style={styles.datePillWrap}>
                <View style={styles.datePill}>
                  <RNText
                    label={formatMessageDate(item.dateKey)}
                    fontSize={fontSize._12}
                    fontWeight={fontWeight._600}
                    color="rgba(255,255,255,0.5)"
                  />
                </View>
              </View>
            )}
            <ChatContainer
              id={item.id}
              message={item.message}
              person={item.person}
              type={item.type}
              image={item.image}
              isdeleted={item.isdeleted}
              Doc={item.doc}
              replay={item.replay}
              audio={item.audio}
              index={index}
              video={item.video}
              likesDislikes={item?.likesDislikes}
              reaction={isChanel ? item.reaction : null}
              seenBy={isAdmin && isChanel ? item.seenBy : null}
              time={item.time ?? '10:00 am'}
              senderProfile={item.senderProfile}
              receiverProfile={item.receiverProfile}
              senderName={item.senderName}
              isFirstInGroup={isFirstInGroup}
              isLastInGroup={isLastInGroup}
              onMessagePress={(e: any) => {
                onItemPress(item, e?.nativeEvent?.pageY ?? 0, e?.nativeEvent?.locationY ?? 0);
              }}
            />
          </>
        );
      },
      [data, isChanel, isAdmin, onItemPress]
    );

    const keyExtractor = useCallback(
      (item: any, index: number) => (item.id ? item.id.toString() : `msg-${index}`),
      []
    );

    return (
      <View style={styles.listWrap}>
        <FlatList
          ref={innerRef}
          data={data}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          ListEmptyComponent={null}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={Platform.OS === 'android'}
          windowSize={11}
          onEndReachedThreshold={0.3}
        />
      </View>
    );
  })
);

export default ChatList;

const styles = StyleSheet.create({
  listWrap: {
    flex: 1,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 10,
  },
  datePillWrap: {
    alignItems: 'center',
    marginVertical: 16,
  },
  datePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
