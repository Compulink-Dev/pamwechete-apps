import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { endpoints } from '../../utils/authApi';
import api from '../../utils/api';

interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
  };
  content: string;
  type: string;
  readBy: string[];
  createdAt: string;
}

interface ConversationData {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    profileImage?: string;
  }>;
  trade: {
    _id: string;
    title: string;
    images: { url: string }[];
    owner: string;
  };
  status: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchMessages = async () => {
    try {
      const token = await getToken();
      const response = await api.get(endpoints.messages.thread(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMessages(response.data.messages || []);
      setConversation(response.data.conversation || null);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    const tempMessage = messageText;
    setMessageText('');
    setSending(true);

    try {
      const token = await getToken();
      await api.post(
        endpoints.messages.send,
        {
          conversationId: id,
          content: tempMessage,
          type: 'text',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch messages again to show the new message
      await fetchMessages();
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(tempMessage);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const getOtherParticipant = () => {
    if (!conversation) return null;
    return conversation.participants.find(p => p._id !== user?.id);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender._id === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
            ]}
          >
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const otherUser = getOtherParticipant();
  const tradeImage = conversation?.trade?.images?.[0]?.url;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          {tradeImage && (
            <Image source={{ uri: tradeImage }} style={styles.tradeThumb} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{otherUser?.name || 'User'}</Text>
            <Text style={styles.headerTrade} numberOfLines={1}>
              {conversation?.trade?.title || 'Trade'}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push(`/trades/${conversation?.trade?._id}` as any)}
        >
          <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={COLORS.text.light} />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        }
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.text.secondary}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  backButton: {
    marginRight: SIZES.sm,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tradeThumb: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.border,
    marginRight: SIZES.sm,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Bold',
    color: COLORS.text.primary,
  },
  headerTrade: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.secondary,
  },
  headerButton: {
    padding: SIZES.xs,
  },
  messagesList: {
    padding: SIZES.padding,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: SIZES.md,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: SIZES.md,
    borderRadius: SIZES.radius,
  },
  myMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    ...SHADOWS.small,
  },
  messageText: {
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Regular',
    marginBottom: SIZES.xs,
  },
  myMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.text.primary,
  },
  messageTime: {
    fontSize: SIZES.tiny,
    fontFamily: 'Rubik-Regular',
  },
  myMessageTime: {
    color: COLORS.white + 'CC',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: COLORS.text.secondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxl * 2,
  },
  emptyText: {
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Medium',
    color: COLORS.text.primary,
    marginTop: SIZES.md,
  },
  emptySubtext: {
    fontSize: SIZES.small,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.secondary,
    marginTop: SIZES.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  attachButton: {
    marginRight: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius * 2,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    fontSize: SIZES.body,
    fontFamily: 'Rubik-Regular',
    color: COLORS.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.sm,
    ...SHADOWS.small,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
});
