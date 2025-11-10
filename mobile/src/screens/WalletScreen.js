import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Chip,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { paymentsAPI } from '../services/api';

export default function WalletScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalSent: 0, totalReceived: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getTransactions();
      setTransactions(response.data.transactions || []);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTransactions();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'released': return '#4CAF50';
      case 'held': return '#FF9800';
      case 'refunded': return '#F44336';
      case 'pending': return '#2196F3';
      default: return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'released': return 'check-circle';
      case 'held': return 'lock';
      case 'refunded': return 'undo';
      case 'pending': return 'clock-outline';
      default: return 'help-circle';
    }
  };

  const renderTransaction = ({ item }) => {
    const isReceived = item.type === 'release' && item.status === 'released';
    const isSent = item.type === 'escrow' && item.status === 'released';

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={getStatusIcon(item.status)}
                size={32}
                color={getStatusColor(item.status)}
              />
            </View>
            <View style={styles.details}>
              <Text style={styles.taskTitle} numberOfLines={1}>
                {item.task?.title || 'Task Transaction'}
              </Text>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.amountContainer}>
              <Text
                style={[
                  styles.amount,
                  isReceived && styles.amountReceived,
                  isSent && styles.amountSent
                ]}
              >
                {isReceived ? '+' : '-'}
                {item.amount.toLocaleString()} {item.currency}
              </Text>
              <Chip
                mode="outlined"
                style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
                textStyle={{ color: getStatusColor(item.status), fontSize: 10 }}
              >
                {item.status}
              </Chip>
            </View>
          </View>

          {item.type === 'escrow' && item.platformFee && (
            <View style={styles.feeInfo}>
              <Text style={styles.feeText}>
                Platform fee: {item.platformFee.toLocaleString()} {item.currency}
              </Text>
              <Text style={styles.feeText}>
                Payee receives: {item.payeeAmount.toLocaleString()} {item.currency}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title>Wallet Summary</Title>
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="arrow-up" size={24} color="#F44336" />
              <Text style={styles.summaryLabel}>Total Sent</Text>
              <Text style={styles.summarySent}>
                {summary.totalSent.toLocaleString()} VND
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="arrow-down" size={24} color="#4CAF50" />
              <Text style={styles.summaryLabel}>Total Received</Text>
              <Text style={styles.summaryReceived}>
                {summary.totalReceived.toLocaleString()} VND
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="wallet" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Your payment history will appear here
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
  summaryCard: {
    margin: 16,
    elevation: 4,
  },
  divider: {
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  summarySent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 4,
  },
  summaryReceived: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  amountReceived: {
    color: '#4CAF50',
  },
  amountSent: {
    color: '#F44336',
  },
  statusChip: {
    height: 24,
  },
  feeInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  feeText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
});
