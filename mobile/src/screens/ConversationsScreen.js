import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import {
  List,
  Avatar,
  Badge,
  Text,
  ActivityIndicator,
  Searchbar,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { messagesAPI } from '../services/api';
import socketService from '../services/socket';

export default function ConversationsScreen({ navigation }) {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();

    // Listen for new messages
    const handleNewMessage = (data) => {
      loadConversations();
    };

    socketService.on('new_message', handleNewMessage);

    return () => {
      socketService.off('new_message', handleNewMessage);
    };
  }, []);

  useEffect(() => {
    filterConversations();
  }, [searchQuery, conversations]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, []);

  const filterConversations = () => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter(conv =>
      conv.task.title.toLowerCase().includes(query) ||
      conv.otherUser.name.toLowerCase().includes(query)
    );
    setFilteredConversations(filtered);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Chat', {
        taskId: item.task._id,
        taskTitle: item.task.title,
        otherUser: item.otherUser
      })}
    >
      <List.Item
        title={item.otherUser.name}
        description={
          <View>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {item.task.title}
            </Text>
            <Text
              style={[
                styles.lastMessage,
                item.unreadCount > 0 && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {item.lastMessage?.message || 'No messages yet'}
            </Text>
          </View>
        }
        left={() => (
          <View>
            <Avatar.Text
              size={50}
              label={item.otherUser.name.charAt(0).toUpperCase()}
            />
            {item.unreadCount > 0 && (
              <Badge style={styles.badge}>{item.unreadCount}</Badge>
            )}
          </View>
        )}
        right={() => (
          <Text style={styles.time}>
            {item.lastMessage && formatTime(item.lastMessage.createdAt)}
          </Text>
        )}
        style={[
          styles.conversationItem,
          item.unreadCount > 0 && styles.unreadConversation
        ]}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search conversations..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              Start bidding on tasks to begin conversations
            </Text>
          </View>
        }
      />
    </View>
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
  searchbar: {
    margin: 12,
    elevation: 2,
  },
  conversationItem: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  unreadConversation: {
    backgroundColor: '#E3F2FD',
  },
  taskTitle: {
    fontSize: 12,
    color: '#2196F3',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#000',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F44336',
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
