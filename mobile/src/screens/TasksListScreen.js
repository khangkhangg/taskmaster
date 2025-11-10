import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Text,
  Chip,
  FAB,
  Searchbar,
  Menu,
  Button,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchTasks } from '../redux/slices/tasksSlice';

const CATEGORIES = [
  'all',
  'cleaning',
  'delivery',
  'handyman',
  'moving',
  'design',
  'programming',
  'writing',
  'photography',
  'tutoring',
  'other',
];

export default function TasksListScreen({ navigation, route }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { tasks, loading, pagination } = useSelector((state) => state.tasks);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'all');
  const [statusFilter, setStatusFilter] = useState('open');
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [selectedCategory, statusFilter]);

  const loadTasks = () => {
    const params = {
      status: statusFilter,
      limit: 20,
    };

    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }

    dispatch(fetchTasks(params));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
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
          <Text style={styles.timeAgo}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <Title numberOfLines={2} style={styles.taskTitle}>
          {item.title}
        </Title>

        <Text numberOfLines={3} style={styles.description}>
          {item.description}
        </Text>

        <View style={styles.taskFooter}>
          <Text style={styles.budget}>
            {item.budget.min.toLocaleString()} - {item.budget.max.toLocaleString()} {item.budget.currency}
          </Text>
          {item.bidsCount > 0 && (
            <Chip icon="gavel" compact>
              {item.bidsCount}
            </Chip>
          )}
        </View>

        {item.location && (
          <Text style={styles.location}>
            📍 {item.location.type === 'remote' ? 'Remote' : item.location.city}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilter}>
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Chip
            selected={selectedCategory === item}
            onPress={() => setSelectedCategory(item)}
            style={styles.filterChip}
          >
            {item === 'all' ? t('tasks.allTasks') : t(`categories.${item}`)}
          </Chip>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder={t('common.search')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              icon="filter"
              style={styles.filterButton}
            >
              {t(`status.${statusFilter}`)}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setStatusFilter('open');
              setMenuVisible(false);
            }}
            title={t('status.open')}
          />
          <Menu.Item
            onPress={() => {
              setStatusFilter('in_progress');
              setMenuVisible(false);
            }}
            title={t('status.in_progress')}
          />
          <Menu.Item
            onPress={() => {
              setStatusFilter('completed');
              setMenuVisible(false);
            }}
            title={t('status.completed')}
          />
        </Menu>
      </View>

      {renderCategoryFilter()}

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
            <Text style={styles.emptyText}>
              {loading ? t('common.loading') : 'No tasks found'}
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  filterButton: {
    minWidth: 80,
  },
  categoryFilter: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterChip: {
    marginRight: 8,
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
  timeAgo: {
    fontSize: 12,
    color: '#666',
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
  location: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
