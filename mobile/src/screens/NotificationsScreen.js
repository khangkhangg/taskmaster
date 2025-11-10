import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import {
  List,
  Text,
  ActivityIndicator,
  IconButton,
  Badge,
  Chip,
  Menu,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { notificationsAPI } from '../services/api';
import socketService from '../services/socket';

const NOTIFICATION_ICONS = {
  new_bid: 'gavel',
  bid_accepted: 'check-circle',
  bid_rejected: 'close-circle',
  task_assigned: 'account-check',
  task_completed: 'checkbox-marked-circle',
  new_message: 'message',
  task_deadline: 'clock-alert',
  new_review: 'star',
  dispute_update: 'alert-circle',
  system: 'information',
};

const NOTIFICATION_COLORS = {
  new_bid: '#2196F3',
  bid_accepted: '#4CAF50',
  bid_rejected: '#F44336',
  task_assigned: '#9C27B0',
  task_completed: '#4CAF50',
  new_message: '#00BCD4',
  task_deadline: '#FF9800',
  new_review: '#FF9800',
  dispute_update: '#F44336',
  system: '#757575',
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadNotifications();

    // Listen for new notifications
    const handleNewNotification = (data) => {
      setNotifications((prev) => [data, ...prev]);
    };

    socketService.on('new_notification', handleNewNotification);

    return () => {
      socketService.off('new_notification', handleNewNotification);
    };
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'unread') params.read = 'false';
      if (filter === 'read') params.read = 'true';

      const response = await notificationsAPI.getNotifications(params);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, [filter]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date() }))
      );
      setMenuVisible(false);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }

    // Navigate based on notification type and data
    if (notification.data.taskId) {
      navigation.navigate('TaskDetails', { taskId: notification.data.taskId });
    }
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

  const renderNotification = ({ item }) => (
    <TouchableOpacity onPress={() => handleNotificationPress(item)}>
      <List.Item
        title={item.title}
        description={item.message}
        left={() => (
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={NOTIFICATION_ICONS[item.type] || 'bell'}
              size={24}
              color={NOTIFICATION_COLORS[item.type] || '#757575'}
            />
            {!item.read && <Badge style={styles.unreadBadge} />}
          </View>
        )}
        right={() => (
          <View style={styles.rightContainer}>
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDelete(item._id)}
            />
          </View>
        )}
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification,
        ]}
        titleStyle={!item.read && styles.unreadTitle}
      />
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterChips}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={styles.chip}
          >
            All
          </Chip>
          <Chip
            selected={filter === 'unread'}
            onPress={() => setFilter('unread')}
            style={styles.chip}
          >
            Unread
          </Chip>
          <Chip
            selected={filter === 'read'}
            onPress={() => setFilter('read')}
            style={styles.chip}
          >
            Read
          </Chip>
        </View>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={handleMarkAllAsRead}
            title="Mark all as read"
            leadingIcon="check-all"
          />
        </Menu>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'No notifications yet'
                : filter === 'unread'
                ? 'No unread notifications'
                : 'No read notifications'}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChips: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: 8,
  },
  notificationItem: {
    backgroundColor: 'white',
  },
  unreadNotification: {
    backgroundColor: '#E3F2FD',
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F44336',
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
