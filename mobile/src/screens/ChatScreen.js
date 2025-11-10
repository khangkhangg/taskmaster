import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  IconButton,
  Avatar,
  ActivityIndicator,
  Card,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { messagesAPI } from '../services/api';
import socketService from '../services/socket';

export default function ChatScreen({ route }) {
  const { taskId, taskTitle, otherUser } = route.params;
  const currentUser = useSelector((state) => state.auth.user);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadMessages();
    socketService.joinTaskRoom(taskId);

    // Listen for new messages
    const handleNewMessage = (data) => {
      if (data.task === taskId) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    };

    // Listen for typing indicators
    const handleTyping = (data) => {
      if (data.taskId === taskId && data.userId !== currentUser._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data.taskId === taskId) {
        setIsTyping(false);
      }
    };

    socketService.on('new_message', handleNewMessage);
    socketService.on('typing', handleTyping);
    socketService.on('stop_typing', handleStopTyping);

    return () => {
      socketService.leaveTaskRoom(taskId);
      socketService.off('new_message', handleNewMessage);
      socketService.off('typing', handleTyping);
      socketService.off('stop_typing', handleStopTyping);
    };
  }, [taskId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getTaskMessages(taskId);
      setMessages(response.data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Stop typing indicator
    socketService.sendStopTyping(taskId, otherUser._id);

    try {
      // Send via REST API (which will trigger Socket.io broadcast)
      await messagesAPI.sendMessage({
        taskId,
        receiverId: otherUser._id,
        message: messageText,
      });

      // Message will be added via socket event
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleTextChange = (text) => {
    setNewMessage(text);

    // Send typing indicator
    if (text.trim()) {
      socketService.sendTyping(taskId, otherUser._id);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendStopTyping(taskId, otherUser._id);
      }, 2000);
    } else {
      socketService.sendStopTyping(taskId, otherUser._id);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender._id === currentUser._id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMyMessage && (
          <Avatar.Text
            size={32}
            label={item.sender.name.charAt(0).toUpperCase()}
            style={styles.avatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {!isMyMessage && (
            <Text style={styles.senderName}>{item.sender.name}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
            ]}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Card style={styles.taskCard}>
        <Card.Content style={styles.taskContent}>
          <Text style={styles.taskTitle} numberOfLines={1}>
            {taskTitle}
          </Text>
          <Text style={styles.otherUserName}>with {otherUser.name}</Text>
        </Card.Content>
      </Card>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToBottom}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start a conversation about this task
            </Text>
          </View>
        }
      />

      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{otherUser.name} is typing...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={handleTextChange}
          style={styles.input}
          multiline
          maxLength={2000}
          disabled={sending}
        />
        <IconButton
          icon="send"
          size={28}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}
          iconColor={newMessage.trim() && !sending ? '#2196F3' : '#ccc'}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCard: {
    margin: 8,
    elevation: 2,
  },
  taskContent: {
    paddingVertical: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  otherUserName: {
    fontSize: 12,
    color: '#666',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
});
