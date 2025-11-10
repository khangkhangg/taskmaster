import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Text,
  Chip,
  SegmentedButtons,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchMyBids } from '../redux/slices/bidsSlice';

export default function MyBidsScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { myBids, loading } = useSelector((state) => state.bids);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMyBids();
  }, [statusFilter]);

  const loadMyBids = () => {
    const params = statusFilter !== 'all' ? { status: statusFilter } : {};
    dispatch(fetchMyBids(params));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyBids();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      case 'withdrawn':
        return '#9E9E9E';
      default:
        return '#FF9800';
    }
  };

  const renderBid = ({ item }) => (
    <Card
      style={styles.bidCard}
      onPress={() =>
        item.task && navigation.navigate('TaskDetails', { taskId: item.task._id })
      }
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={{ color: '#fff' }}
          >
            {item.status.toUpperCase()}
          </Chip>
          <Text style={styles.timeAgo}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {item.task && (
          <>
            <Title numberOfLines={2} style={styles.taskTitle}>
              {item.task.title}
            </Title>

            <Text numberOfLines={2} style={styles.description}>
              {item.task.description}
            </Text>
          </>
        )}

        <View style={styles.bidInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('bids.amount')}:</Text>
            <Text style={styles.amount}>
              {item.amount.toLocaleString()} {item.currency}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('bids.timeline')}:</Text>
            <Text style={styles.value}>{item.proposedTimeline}</Text>
          </View>

          {item.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.label}>Message:</Text>
              <Text style={styles.message} numberOfLines={3}>
                {item.message}
              </Text>
            </View>
          )}
        </View>

        {item.task && (
          <View style={styles.taskInfo}>
            <Text style={styles.taskBudget}>
              Task Budget: {item.task.budget?.min.toLocaleString()} -{' '}
              {item.task.budget?.max.toLocaleString()} {item.task.budget?.currency}
            </Text>
            {item.task.bidsCount && (
              <Text style={styles.competitionText}>
                {item.task.bidsCount} total bids
              </Text>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const filteredBids = statusFilter === 'all'
    ? myBids
    : myBids.filter(bid => bid.status === statusFilter);

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'rejected', label: 'Rejected' },
          ]}
        />
      </View>

      <FlatList
        data={filteredBids}
        renderItem={renderBid}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? t('common.loading') : 'No bids found'}
            </Text>
            <Text style={styles.emptySubtext}>
              Browse tasks and place your first bid!
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
  filterContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  listContent: {
    padding: 16,
  },
  bidCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusChip: {
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
    marginBottom: 16,
  },
  bidInfo: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
  },
  messageContainer: {
    marginTop: 4,
  },
  message: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    fontStyle: 'italic',
  },
  taskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskBudget: {
    fontSize: 12,
    color: '#999',
  },
  competitionText: {
    fontSize: 12,
    color: '#999',
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
});
