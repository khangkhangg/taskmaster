import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Text,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { usersAPI } from '../services/api';

export default function SavedTasksScreen({ navigation }) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSavedTasks();
  }, []);

  const loadSavedTasks = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getSavedTasks();
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error loading saved tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSavedTasks();
  }, []);

  const handleUnsaveTask = async (taskId) => {
    try {
      await usersAPI.unsaveTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Error unsaving task:', error);
      alert('Failed to unsave task');
    }
  };

  const renderTask = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('TaskDetails', { taskId: item._id })}
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Title style={styles.title}>{item.title}</Title>
            <Chip
              mode="outlined"
              style={styles.statusChip}
              textStyle={styles.statusText}
            >
              {item.status}
            </Chip>
          </View>
          <IconButton
            icon="bookmark"
            size={24}
            iconColor="#F44336"
            onPress={() => handleUnsaveTask(item._id)}
          />
        </View>

        <Paragraph numberOfLines={2} style={styles.description}>
          {item.description}
        </Paragraph>

        <View style={styles.footer}>
          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Budget:</Text>
            <Text style={styles.budget}>
              {item.budget.min.toLocaleString()} - {item.budget.max.toLocaleString()} {item.budget.currency}
            </Text>
          </View>

          {item.poster && (
            <Text style={styles.poster}>
              By: {item.poster.name}
            </Text>
          )}
        </View>

        {item.location && (
          <View style={styles.locationRow}>
            <Chip icon="map-marker" mode="outlined" compact>
              {item.location.type === 'remote' ? 'Remote' : item.location.city}
            </Chip>
          </View>
        )}
      </Card.Content>
    </Card>
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
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved tasks yet</Text>
            <Text style={styles.emptySubtext}>
              Bookmark tasks to save them for later
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
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 18,
    marginRight: 8,
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    fontSize: 12,
  },
  description: {
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    marginBottom: 8,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  budget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  poster: {
    fontSize: 12,
    color: '#666',
  },
  locationRow: {
    flexDirection: 'row',
    marginTop: 8,
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
