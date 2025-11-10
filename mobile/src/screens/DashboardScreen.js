import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Chip,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { analyticsAPI } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Failed to load dashboard</Text>
      </View>
    );
  }

  const { taskStats, bidStats, financialSummary, recentTasks, recentBids } = dashboard;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadDashboard} />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title>Financial Overview</Title>
          <Divider style={styles.divider} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="arrow-down" size={24} color="#4CAF50" />
              <Text style={styles.statLabel}>Received</Text>
              <Text style={styles.statValue}>
                {financialSummary.totalReceived?.toLocaleString() || 0} VND
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="arrow-up" size={24} color="#F44336" />
              <Text style={styles.statLabel}>Sent</Text>
              <Text style={styles.statValue}>
                {financialSummary.totalSent?.toLocaleString() || 0} VND
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="lock" size={24} color="#FF9800" />
              <Text style={styles.statLabel}>In Escrow</Text>
              <Text style={styles.statValue}>
                {financialSummary.inEscrow?.toLocaleString() || 0} VND
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Task Statistics</Title>
          <Divider style={styles.divider} />
          <View style={styles.statsGrid}>
            {Object.entries(taskStats || {}).map(([status, data]) => (
              <View key={status} style={styles.gridItem}>
                <Chip mode="outlined">{status}</Chip>
                <Text style={styles.gridValue}>{data.count}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Bid Statistics</Title>
          <Divider style={styles.divider} />
          <View style={styles.statsGrid}>
            {Object.entries(bidStats || {}).map(([status, count]) => (
              <View key={status} style={styles.gridItem}>
                <Chip mode="outlined">{status}</Chip>
                <Text style={styles.gridValue}>{count}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Recent Tasks</Title>
          <Divider style={styles.divider} />
          {recentTasks && recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <View key={task._id} style={styles.listItem}>
                <Text style={styles.listTitle} numberOfLines={1}>
                  {task.title}
                </Text>
                <View style={styles.listMeta}>
                  <Chip mode="outlined" compact>
                    {task.status}
                  </Chip>
                  <Text style={styles.listDate}>
                    {task.bidsCount} bids
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent tasks</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Recent Bids</Title>
          <Divider style={styles.divider} />
          {recentBids && recentBids.length > 0 ? (
            recentBids.map((bid) => (
              <View key={bid._id} style={styles.listItem}>
                <Text style={styles.listTitle} numberOfLines={1}>
                  {bid.task?.title || 'Task'}
                </Text>
                <View style={styles.listMeta}>
                  <Text style={styles.bidAmount}>
                    {bid.amount.toLocaleString()} VND
                  </Text>
                  <Chip mode="outlined" compact>
                    {bid.status}
                  </Chip>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent bids</Text>
          )}
        </Card.Content>
      </Card>
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
    marginBottom: 0,
  },
  divider: {
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridItem: {
    alignItems: 'center',
    margin: 8,
  },
  gridValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listDate: {
    fontSize: 12,
    color: '#666',
  },
  bidAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
});
