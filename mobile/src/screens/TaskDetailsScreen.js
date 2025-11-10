import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  Avatar,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchTask } from '../redux/slices/tasksSlice';
import { fetchTaskBids } from '../redux/slices/bidsSlice';

export default function TaskDetailsScreen({ route, navigation }) {
  const { taskId } = route.params;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { currentTask, loading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const { taskBids } = useSelector((state) => state.bids);

  useEffect(() => {
    dispatch(fetchTask(taskId));
  }, [taskId]);

  const isMyTask = currentTask?.poster?._id === user?._id;

  const handlePlaceBid = () => {
    navigation.navigate('PlaceBid', { taskId: currentTask._id });
  };

  const handleViewBids = () => {
    dispatch(fetchTaskBids(taskId));
    navigation.navigate('TaskBids', { taskId: currentTask._id });
  };

  if (loading || !currentTask) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatBudget = (budget) => {
    return `${budget.min.toLocaleString()} - ${budget.max.toLocaleString()} ${budget.currency}`;
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Chip style={styles.categoryChip}>{t(`categories.${currentTask.category}`)}</Chip>
            <Chip style={styles.statusChip}>{t(`status.${currentTask.status}`)}</Chip>
          </View>

          <Title style={styles.title}>{currentTask.title}</Title>

          <Text style={styles.description}>{currentTask.description}</Text>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('tasks.budget')}:</Text>
            <Text style={styles.value}>{formatBudget(currentTask.budget)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('tasks.location')}:</Text>
            <Text style={styles.value}>
              {currentTask.location.type === 'remote'
                ? 'Remote'
                : `${currentTask.location.city || ''}, ${currentTask.location.address || ''}`}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('tasks.deadline')}:</Text>
            <Text style={styles.value}>{formatDate(currentTask.deadline)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('tasks.bidsCount')}:</Text>
            <Text style={styles.value}>{currentTask.bidsCount}</Text>
          </View>

          {currentTask.requiredSkills && currentTask.requiredSkills.length > 0 && (
            <View style={styles.skillsContainer}>
              <Text style={styles.label}>Required Skills:</Text>
              <View style={styles.skillsRow}>
                {currentTask.requiredSkills.map((skill, index) => (
                  <Chip key={index} style={styles.skillChip}>
                    {skill}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          <Divider style={styles.divider} />

          <View style={styles.posterInfo}>
            <Avatar.Text
              size={40}
              label={currentTask.poster?.name?.charAt(0) || 'U'}
            />
            <View style={styles.posterDetails}>
              <Text style={styles.posterName}>{currentTask.poster?.name}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>
                  ⭐ {currentTask.poster?.rating?.average?.toFixed(1) || 'N/A'}
                </Text>
                <Text style={styles.ratingCount}>
                  ({currentTask.poster?.rating?.count || 0} {t('profile.reviews')})
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        {isMyTask ? (
          <>
            {currentTask.bidsCount > 0 && (
              <Button
                mode="contained"
                onPress={handleViewBids}
                style={styles.button}
                icon="format-list-bulleted"
              >
                {t('tasks.viewBids')} ({currentTask.bidsCount})
              </Button>
            )}
            {currentTask.status === 'open' && (
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('EditTask', { taskId: currentTask._id })}
                style={styles.button}
                icon="pencil"
              >
                {t('tasks.editTask')}
              </Button>
            )}
          </>
        ) : (
          <>
            {currentTask.status === 'open' && (
              <Button
                mode="contained"
                onPress={handlePlaceBid}
                style={styles.button}
                icon="gavel"
              >
                {t('bids.placeBid')}
              </Button>
            )}
          </>
        )}
      </View>
    </ScrollView>
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
  card: {
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  skillsContainer: {
    marginTop: 12,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillChip: {
    margin: 4,
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  posterDetails: {
    marginLeft: 12,
    flex: 1,
  },
  posterName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    marginRight: 8,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    padding: 16,
  },
  button: {
    marginBottom: 12,
  },
});
