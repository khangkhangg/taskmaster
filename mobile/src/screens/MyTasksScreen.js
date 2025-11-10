import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Text,
  Chip,
  FAB,
  SegmentedButtons,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchMyTasks } from '../redux/slices/tasksSlice';

export default function MyTasksScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { myTasks, loading } = useSelector((state) => state.tasks);
  const [statusFilter, setStatusFilter] = useState('open');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMyTasks();
  }, [statusFilter]);

  const loadMyTasks = () => {
    const params = statusFilter !== 'all' ? { status: statusFilter } : {};
    dispatch(fetchMyTasks(params));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyTasks();
    setRefreshing(false);
  };

  const renderTask = ({ item }) => (
    <Card
      style={styles.taskCard}
      onPress={() => navigation.navigate('TaskDetails', { taskId: item._id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Chip style={styles.categoryChip}>{t(`categories.${item.category}`)}</Chip>
          <Chip
            style={[
              styles.statusChip,
              item.status === 'completed' && styles.completedChip,
              item.status === 'in_progress' && styles.inProgressChip,
            ]}
          >
            {t(`status.${item.status}`)}
          </Chip>
        </View>

        <Title numberOfLines={2} style={styles.taskTitle}>
          {item.title}
        </Title>

        <Text numberOfLines={2} style={styles.description}>
          {item.description}
        </Text>

        <View style={styles.taskFooter}>
          <Text style={styles.budget}>
            {item.budget.min.toLocaleString()} - {item.budget.max.toLocaleString()} {item.budget.currency}
          </Text>

          {item.bidsCount > 0 && (
            <Chip icon="gavel" compact style={styles.bidsChip}>
              {item.bidsCount} {item.bidsCount === 1 ? 'bid' : 'bids'}
            </Chip>
          )}
        </View>

        <View style={styles.metadata}>
          <Text style={styles.metaText}>
            Posted: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {item.assignedTo && (
            <Text style={styles.metaText}>
              Assigned to: {item.assignedTo.name}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const filteredTasks = statusFilter === 'all'
    ? myTasks
    : myTasks.filter(task => task.status === statusFilter);

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'open', label: t('status.open') },
            { value: 'in_progress', label: 'Active' },
            { value: 'completed', label: t('status.completed') },
          ]}
        />
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? t('common.loading') : 'No tasks found'}
            </Text>
            <Text style={styles.emptySubtext}>
              Create your first task to get started!
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask')}
        label={t('tasks.createTask')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  listContent: {
    padding: 16,
  },
  taskCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryChip: {
    height: 28,
  },
  statusChip: {
    height: 28,
  },
  completedChip: {
    backgroundColor: '#4CAF50',
  },
  inProgressChip: {
    backgroundColor: '#FF9800',
  },
  taskTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  bidsChip: {
    backgroundColor: '#E3F2FD',
  },
  metadata: {
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
