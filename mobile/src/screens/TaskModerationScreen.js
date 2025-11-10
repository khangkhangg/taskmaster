import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  Chip,
  ActivityIndicator,
  Dialog,
  Portal,
  TextInput
} from 'react-native-paper';
import { adminAPI } from '../services/api';

const TaskModerationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('flagged');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [removalReason, setRemovalReason] = useState('');
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [selectedFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let response;
      if (selectedFilter === 'flagged') {
        response = await adminAPI.getFlaggedTasks();
      } else {
        response = await adminAPI.getTasks({ status: selectedFilter });
      }
      setTasks(response.data.tasks);
    } catch (err) {
      console.error('Fetch tasks error:', err);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const openDialog = (task, type) => {
    setSelectedTask(task);
    setActionType(type);
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setSelectedTask(null);
    setFlagReason('');
    setRemovalReason('');
    setActionType(null);
  };

  const handleFlag = async () => {
    try {
      await adminAPI.flagTask(selectedTask._id, { reason: flagReason });
      Alert.alert('Success', 'Task flagged successfully');
      closeDialog();
      fetchTasks();
    } catch (err) {
      Alert.alert('Error', 'Failed to flag task');
    }
  };

  const handleUnflag = async () => {
    try {
      await adminAPI.unflagTask(selectedTask._id);
      Alert.alert('Success', 'Task unflagged successfully');
      closeDialog();
      fetchTasks();
    } catch (err) {
      Alert.alert('Error', 'Failed to unflag task');
    }
  };

  const handleRemove = async () => {
    try {
      await adminAPI.removeTask(selectedTask._id, { reason: removalReason });
      Alert.alert('Success', 'Task removed successfully');
      closeDialog();
      fetchTasks();
    } catch (err) {
      Alert.alert('Error', 'Failed to remove task');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filters */}
      <ScrollView horizontal style={styles.filterRow} showsHorizontalScrollIndicator={false}>
        <Chip selected={selectedFilter === 'flagged'} onPress={() => setSelectedFilter('flagged')} style={styles.filterChip}>
          Flagged
        </Chip>
        <Chip selected={selectedFilter === 'open'} onPress={() => setSelectedFilter('open')} style={styles.filterChip}>
          Open
        </Chip>
        <Chip selected={selectedFilter === 'in_progress'} onPress={() => setSelectedFilter('in_progress')} style={styles.filterChip}>
          In Progress
        </Chip>
        <Chip selected={selectedFilter === 'completed'} onPress={() => setSelectedFilter('completed')} style={styles.filterChip}>
          Completed
        </Chip>
      </ScrollView>

      {/* Tasks List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {tasks.map((task) => (
          <Card key={task._id} style={styles.taskCard}>
            <Card.Content>
              <Title>{task.title}</Title>
              <Text style={styles.description} numberOfLines={2}>
                {task.description}
              </Text>
              <View style={styles.metaRow}>
                <Chip mode="flat" style={styles.categoryChip}>
                  {task.category}
                </Chip>
                <Chip mode="flat" style={styles.statusChip}>
                  {task.status}
                </Chip>
                {task.isFlagged && (
                  <Chip mode="flat" style={styles.flaggedChip}>
                    🚩 Flagged
                  </Chip>
                )}
              </View>
              {task.flagReason && (
                <Text style={styles.flagReason}>Flag Reason: {task.flagReason}</Text>
              )}
              <Text style={styles.poster}>Posted by: {task.poster?.name}</Text>
              <View style={styles.actionRow}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('TaskDetails', { taskId: task._id })}
                  style={styles.actionButton}
                >
                  View Details
                </Button>
                {!task.isFlagged ? (
                  <Button
                    mode="contained"
                    onPress={() => openDialog(task, 'flag')}
                    style={styles.actionButton}
                  >
                    Flag
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    onPress={() => openDialog(task, 'unflag')}
                    style={styles.actionButton}
                  >
                    Unflag
                  </Button>
                )}
                <Button
                  mode="contained"
                  buttonColor="#f44336"
                  onPress={() => openDialog(task, 'remove')}
                  style={styles.actionButton}
                >
                  Remove
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}

        {tasks.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks found</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Dialogs */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>
            {actionType === 'flag' && 'Flag Task'}
            {actionType === 'unflag' && 'Unflag Task'}
            {actionType === 'remove' && 'Remove Task'}
          </Dialog.Title>
          <Dialog.Content>
            {actionType === 'flag' && (
              <TextInput
                label="Flag Reason"
                value={flagReason}
                onChangeText={setFlagReason}
                mode="outlined"
                multiline
                numberOfLines={3}
              />
            )}
            {actionType === 'unflag' && (
              <Text>Are you sure you want to unflag this task?</Text>
            )}
            {actionType === 'remove' && (
              <TextInput
                label="Removal Reason"
                value={removalReason}
                onChangeText={setRemovalReason}
                mode="outlined"
                multiline
                numberOfLines={3}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button
              onPress={
                actionType === 'flag'
                  ? handleFlag
                  : actionType === 'unflag'
                  ? handleUnflag
                  : handleRemove
              }
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    backgroundColor: '#fff',
    padding: 10,
    elevation: 2,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    flex: 1,
  },
  taskCard: {
    margin: 10,
    elevation: 2,
  },
  description: {
    marginVertical: 10,
    color: '#666',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  categoryChip: {
    backgroundColor: '#E3F2FD',
    marginRight: 5,
    marginBottom: 5,
  },
  statusChip: {
    backgroundColor: '#F3E5F5',
    marginRight: 5,
    marginBottom: 5,
  },
  flaggedChip: {
    backgroundColor: '#FFEBEE',
    marginRight: 5,
    marginBottom: 5,
  },
  flagReason: {
    color: 'red',
    fontStyle: 'italic',
    marginTop: 5,
  },
  poster: {
    marginTop: 10,
    color: '#666',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default TaskModerationScreen;
