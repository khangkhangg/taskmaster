import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Avatar,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchTaskBids } from '../redux/slices/bidsSlice';
import { bidsAPI } from '../services/api';

export default function TaskBidsScreen({ route, navigation }) {
  const { taskId } = route.params;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { taskBids, loading } = useSelector((state) => state.bids);
  const [processing, setProcessing] = React.useState(null);

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = () => {
    dispatch(fetchTaskBids(taskId));
  };

  const handleAcceptBid = async (bidId) => {
    try {
      setProcessing(bidId);
      await bidsAPI.acceptBid(bidId);
      alert(t('common.success') + '! Bid accepted.');
      loadBids();
      navigation.goBack();
    } catch (error) {
      alert(t('common.error') + ': ' + (error.error || error.message));
    } finally {
      setProcessing(null);
    }
  };

  const renderBid = ({ item }) => (
    <Card style={styles.bidCard}>
      <Card.Content>
        <View style={styles.bidderInfo}>
          <Avatar.Text
            size={50}
            label={item.bidder?.name?.charAt(0) || 'U'}
          />
          <View style={styles.bidderDetails}>
            <Title style={styles.bidderName}>{item.bidder?.name}</Title>
            <View style={styles.ratingRow}>
              <Text style={styles.rating}>
                ⭐ {item.bidder?.rating?.average?.toFixed(1) || 'New'}
              </Text>
              <Text style={styles.ratingCount}>
                ({item.bidder?.rating?.count || 0} reviews)
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.stat}>
                ✅ {item.bidder?.stats?.tasksCompleted || 0} completed
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bidDetails}>
          <View style={styles.bidRow}>
            <Text style={styles.label}>{t('bids.amount')}:</Text>
            <Text style={styles.amount}>
              {item.amount.toLocaleString()} {item.currency}
            </Text>
          </View>

          <View style={styles.bidRow}>
            <Text style={styles.label}>{t('bids.timeline')}:</Text>
            <Text style={styles.value}>{item.proposedTimeline}</Text>
          </View>

          {item.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.label}>Message:</Text>
              <Text style={styles.message}>{item.message}</Text>
            </View>
          )}

          <View style={styles.metadata}>
            <Chip
              style={[
                styles.statusChip,
                item.status === 'accepted' && styles.acceptedChip,
                item.status === 'rejected' && styles.rejectedChip,
              ]}
            >
              {item.status.toUpperCase()}
            </Chip>
            <Text style={styles.timeAgo}>
              Placed {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {item.status === 'pending' && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => handleAcceptBid(item._id)}
              style={styles.acceptButton}
              loading={processing === item._id}
              disabled={processing !== null}
            >
              {t('bids.acceptBid')}
            </Button>
          </View>
        )}

        {item.status === 'accepted' && (
          <View style={styles.acceptedBanner}>
            <Text style={styles.acceptedText}>
              ✓ This bid has been accepted
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (loading && taskBids.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {taskBids.length} {taskBids.length === 1 ? 'bid' : 'bids'} received
        </Text>
      </View>

      <FlatList
        data={taskBids}
        renderItem={renderBid}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bids yet</Text>
            <Text style={styles.emptySubtext}>
              Wait for service providers to bid on your task
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
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  bidCard: {
    marginBottom: 16,
  },
  bidderInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bidderDetails: {
    marginLeft: 12,
    flex: 1,
  },
  bidderName: {
    fontSize: 18,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    marginRight: 8,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
  },
  statsRow: {
    marginTop: 4,
  },
  stat: {
    fontSize: 12,
    color: '#666',
  },
  bidDetails: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  bidRow: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
  },
  messageContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  message: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    lineHeight: 20,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  statusChip: {
    height: 28,
  },
  acceptedChip: {
    backgroundColor: '#4CAF50',
  },
  rejectedChip: {
    backgroundColor: '#F44336',
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    marginTop: 16,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  acceptedBanner: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
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
    textAlign: 'center',
  },
});
