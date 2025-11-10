import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Title, Paragraph, Button, DataTable, Chip, ActivityIndicator } from 'react-native-paper';
import { adminAPI } from '../services/api';

const AdminDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Fetch stats error:', err);
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchStats} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Title style={styles.header}>Admin Dashboard</Title>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="account-group"
              style={styles.actionButton}
              onPress={() => navigation.navigate('UserManagement')}
            >
              Manage Users
            </Button>
            <Button
              mode="contained"
              icon="flag"
              style={styles.actionButton}
              onPress={() => navigation.navigate('TaskModeration')}
            >
              Moderate Tasks
            </Button>
            <Button
              mode="contained"
              icon="gavel"
              style={styles.actionButton}
              onPress={() => navigation.navigate('DisputeResolution')}
            >
              Resolve Disputes
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Users Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Users Overview</Title>
          <DataTable>
            <DataTable.Row>
              <DataTable.Cell>Total Users</DataTable.Cell>
              <DataTable.Cell numeric>
                <Text style={styles.statValue}>{stats?.users?.total || 0}</Text>
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Active Users</DataTable.Cell>
              <DataTable.Cell numeric>
                <Chip mode="flat" style={styles.successChip}>
                  {stats?.users?.active || 0}
                </Chip>
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Suspended</DataTable.Cell>
              <DataTable.Cell numeric>
                <Chip mode="flat" style={styles.warningChip}>
                  {stats?.users?.suspended || 0}
                </Chip>
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Verified</DataTable.Cell>
              <DataTable.Cell numeric>{stats?.users?.verified || 0}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>New (30d)</DataTable.Cell>
              <DataTable.Cell numeric>
                <Chip mode="flat" style={styles.infoChip}>
                  {stats?.users?.new30d || 0}
                </Chip>
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card.Content>
      </Card>

      {/* Tasks Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Tasks Overview</Title>
          <DataTable>
            <DataTable.Row>
              <DataTable.Cell>Total Tasks</DataTable.Cell>
              <DataTable.Cell numeric>
                <Text style={styles.statValue}>{stats?.tasks?.total || 0}</Text>
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Open</DataTable.Cell>
              <DataTable.Cell numeric>
                <Chip mode="flat" style={styles.successChip}>
                  {stats?.tasks?.open || 0}
                </Chip>
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>In Progress</DataTable.Cell>
              <DataTable.Cell numeric>{stats?.tasks?.inProgress || 0}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Completed</DataTable.Cell>
              <DataTable.Cell numeric>{stats?.tasks?.completed || 0}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Flagged</DataTable.Cell>
              <DataTable.Cell numeric>
                <Chip mode="flat" style={styles.errorChip}>
                  {stats?.tasks?.flagged || 0}
                </Chip>
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Completion Rate</DataTable.Cell>
              <DataTable.Cell numeric>{stats?.tasks?.completionRate || 0}%</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card.Content>
      </Card>

      {/* Financial Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Financial Overview</Title>
          <DataTable>
            <DataTable.Row>
              <DataTable.Cell>Total Volume</DataTable.Cell>
              <DataTable.Cell numeric>
                <Text style={styles.statValue}>
                  {(stats?.financial?.totalVolume || 0).toLocaleString()} {stats?.financial?.currency}
                </Text>
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Platform Fees</DataTable.Cell>
              <DataTable.Cell numeric>
                <Chip mode="flat" style={styles.successChip}>
                  {(stats?.financial?.totalPlatformFees || 0).toLocaleString()} {stats?.financial?.currency}
                </Chip>
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>In Escrow</DataTable.Cell>
              <DataTable.Cell numeric>
                <Chip mode="flat" style={styles.warningChip}>
                  {(stats?.financial?.totalInEscrow || 0).toLocaleString()} {stats?.financial?.currency}
                </Chip>
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Released</DataTable.Cell>
              <DataTable.Cell numeric>
                {(stats?.financial?.totalReleased || 0).toLocaleString()} {stats?.financial?.currency}
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Refunded</DataTable.Cell>
              <DataTable.Cell numeric>
                {(stats?.financial?.totalRefunded || 0).toLocaleString()} {stats?.financial?.currency}
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card.Content>
      </Card>

      {/* Disputes Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Disputes Overview</Title>
          <DataTable>
            <DataTable.Row>
              <DataTable.Cell>Total Disputes</DataTable.Cell>
              <DataTable.Cell numeric>
                <Text style={styles.statValue}>{stats?.disputes?.total || 0}</Text>
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Open</DataTable.Cell>
              <DataTable.Cell numeric>
                <Chip mode="flat" style={styles.errorChip}>
                  {stats?.disputes?.open || 0}
                </Chip>
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Resolved</DataTable.Cell>
              <DataTable.Cell numeric>{stats?.disputes?.resolved || 0}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Resolution Rate</DataTable.Cell>
              <DataTable.Cell numeric>{stats?.disputes?.resolutionRate || 0}%</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card.Content>
      </Card>

      {/* Reviews & Ratings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Reviews & Ratings</Title>
          <DataTable>
            <DataTable.Row>
              <DataTable.Cell>Total Reviews</DataTable.Cell>
              <DataTable.Cell numeric>{stats?.reviews?.total || 0}</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>Average Rating</DataTable.Cell>
              <DataTable.Cell numeric>
                <Chip mode="flat" style={styles.successChip}>
                  ⭐ {stats?.reviews?.averageRating || 0}
                </Chip>
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card.Content>
      </Card>
    </ScrollView>
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
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  actionButtons: {
    marginTop: 10,
  },
  actionButton: {
    marginVertical: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  successChip: {
    backgroundColor: '#C8E6C9',
  },
  warningChip: {
    backgroundColor: '#FFE0B2',
  },
  errorChip: {
    backgroundColor: '#FFCDD2',
  },
  infoChip: {
    backgroundColor: '#BBDEFB',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 10,
  },
});

export default AdminDashboardScreen;
