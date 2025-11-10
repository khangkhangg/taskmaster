import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, Title, Chip, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchTasks } from '../redux/slices/tasksSlice';

const CATEGORIES = [
  'cleaning',
  'delivery',
  'handyman',
  'moving',
  'design',
  'programming',
  'writing',
  'photography',
];

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks, loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks({ status: 'open', limit: 10 }));
  }, []);

  const renderTask = ({ item }) => (
    <Card
      style={styles.taskCard}
      onPress={() => navigation.navigate('TaskDetails', { taskId: item._id })}
    >
      <Card.Content>
        <Title numberOfLines={2}>{item.title}</Title>
        <Text numberOfLines={2}>{item.description}</Text>
        <View style={styles.taskInfo}>
          <Chip style={styles.chip}>{t(`categories.${item.category}`)}</Chip>
          <Text style={styles.budget}>
            {item.budget?.min.toLocaleString()} - {item.budget?.max.toLocaleString()} {item.budget?.currency}
          </Text>
        </View>
        {item.bidsCount > 0 && (
          <Text style={styles.bidsCount}>{t('tasks.bidsCount', { count: item.bidsCount })}</Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title>{t('home.welcomeBack', { name: user?.name || '' })}</Title>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.categories')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {CATEGORIES.map((category) => (
            <Chip
              key={category}
              style={styles.categoryChip}
              onPress={() =>
                navigation.getParent()?.navigate('Tasks', {
                  screen: 'TasksList',
                  params: { category }
                })
              }
            >
              {t(`categories.${category}`)}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.recentTasks')}</Text>
          <Button onPress={() => navigation.getParent()?.navigate('Tasks')}>
            {t('tasks.allTasks')}
          </Button>
        </View>
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {loading ? t('common.loading') : 'No tasks available'}
            </Text>
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categories: {
    flexDirection: 'row',
  },
  categoryChip: {
    marginRight: 10,
  },
  taskCard: {
    marginBottom: 15,
  },
  taskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  budget: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  bidsCount: {
    marginTop: 5,
    color: '#666',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#999',
  },
});
