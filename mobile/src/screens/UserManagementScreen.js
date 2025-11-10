import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  Searchbar,
  Chip,
  Avatar,
  Menu,
  Divider,
  ActivityIndicator,
  Dialog,
  Portal,
  TextInput,
  RadioButton
} from 'react-native-paper';
import { adminAPI } from '../services/api';

const UserManagementScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionDuration, setSuspensionDuration] = useState('7');
  const [verificationType, setVerificationType] = useState('identity');

  useEffect(() => {
    fetchUsers();
  }, [selectedFilter]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(page === 1);
      const params = {
        page,
        limit: 20
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedFilter === 'suspended') params.isSuspended = true;
      if (selectedFilter === 'active') params.isActive = true;

      const response = await adminAPI.getUsers(params);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Fetch users error:', err);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const openMenu = (userId) => {
    setMenuVisible(userId);
  };

  const closeMenu = () => {
    setMenuVisible(null);
  };

  const openDialog = (type, user) => {
    setDialogType(type);
    setSelectedUser(user);
    setDialogVisible(true);
    closeMenu();
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setDialogType(null);
    setSelectedUser(null);
    setSuspensionReason('');
    setSuspensionDuration('7');
    setVerificationType('identity');
  };

  const handleSuspend = async () => {
    try {
      await adminAPI.suspendUser(selectedUser._id, {
        reason: suspensionReason,
        duration: parseInt(suspensionDuration)
      });
      Alert.alert('Success', 'User suspended successfully');
      closeDialog();
      fetchUsers();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to suspend user');
    }
  };

  const handleUnsuspend = async () => {
    try {
      await adminAPI.unsuspendUser(selectedUser._id);
      Alert.alert('Success', 'User unsuspended successfully');
      closeDialog();
      fetchUsers();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to unsuspend user');
    }
  };

  const handleVerify = async () => {
    try {
      await adminAPI.verifyUser(selectedUser._id, {
        verificationType
      });
      Alert.alert('Success', 'User verified successfully');
      closeDialog();
      fetchUsers();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to verify user');
    }
  };

  const handleViewDetails = (userId) => {
    closeMenu();
    navigation.navigate('UserDetails', { userId });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search users by name, email, phone"
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchbar}
        />
        <ScrollView horizontal style={styles.filterRow} showsHorizontalScrollIndicator={false}>
          <Chip
            selected={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
            style={styles.filterChip}
          >
            All Users
          </Chip>
          <Chip
            selected={selectedFilter === 'active'}
            onPress={() => setSelectedFilter('active')}
            style={styles.filterChip}
          >
            Active
          </Chip>
          <Chip
            selected={selectedFilter === 'suspended'}
            onPress={() => setSelectedFilter('suspended')}
            style={styles.filterChip}
          >
            Suspended
          </Chip>
        </ScrollView>
      </View>

      {/* Users List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {users.map((user) => (
          <Card key={user._id} style={styles.userCard}>
            <Card.Content>
              <View style={styles.userHeader}>
                <Avatar.Text size={50} label={user.name.substring(0, 2).toUpperCase()} />
                <View style={styles.userInfo}>
                  <Title style={styles.userName}>{user.name}</Title>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.statusRow}>
                    {user.isSuspended && (
                      <Chip mode="flat" style={styles.suspendedChip} textStyle={styles.chipText}>
                        Suspended
                      </Chip>
                    )}
                    {user.verification?.identity && (
                      <Chip mode="flat" style={styles.verifiedChip} textStyle={styles.chipText}>
                        ✓ Verified
                      </Chip>
                    )}
                    {user.accountType === 'admin' && (
                      <Chip mode="flat" style={styles.adminChip} textStyle={styles.chipText}>
                        Admin
                      </Chip>
                    )}
                  </View>
                </View>
                <Menu
                  visible={menuVisible === user._id}
                  onDismiss={closeMenu}
                  anchor={
                    <Button onPress={() => openMenu(user._id)} icon="dots-vertical">
                      Actions
                    </Button>
                  }
                >
                  <Menu.Item
                    onPress={() => handleViewDetails(user._id)}
                    title="View Details"
                    leadingIcon="eye"
                  />
                  <Divider />
                  {!user.isSuspended ? (
                    <Menu.Item
                      onPress={() => openDialog('suspend', user)}
                      title="Suspend User"
                      leadingIcon="block-helper"
                    />
                  ) : (
                    <Menu.Item
                      onPress={() => openDialog('unsuspend', user)}
                      title="Unsuspend User"
                      leadingIcon="check-circle"
                    />
                  )}
                  {!user.verification?.identity && (
                    <>
                      <Divider />
                      <Menu.Item
                        onPress={() => openDialog('verify', user)}
                        title="Verify User"
                        leadingIcon="check-decagram"
                      />
                    </>
                  )}
                </Menu>
              </View>
              <View style={styles.userStats}>
                <Text>Tasks Posted: {user.stats?.tasksPosted || 0}</Text>
                <Text>Tasks Completed: {user.stats?.tasksCompleted || 0}</Text>
                <Text>Rating: ⭐ {user.rating?.average?.toFixed(1) || 'N/A'}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}

        {users.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        )}
      </ScrollView>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <View style={styles.pagination}>
          <Button
            disabled={pagination.page === 1}
            onPress={() => fetchUsers(pagination.page - 1)}
          >
            Previous
          </Button>
          <Text>
            Page {pagination.page} of {pagination.pages}
          </Text>
          <Button
            disabled={pagination.page === pagination.pages}
            onPress={() => fetchUsers(pagination.page + 1)}
          >
            Next
          </Button>
        </View>
      )}

      {/* Dialogs */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>
            {dialogType === 'suspend' && 'Suspend User'}
            {dialogType === 'unsuspend' && 'Unsuspend User'}
            {dialogType === 'verify' && 'Verify User'}
          </Dialog.Title>
          <Dialog.Content>
            {dialogType === 'suspend' && (
              <>
                <TextInput
                  label="Suspension Reason"
                  value={suspensionReason}
                  onChangeText={setSuspensionReason}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
                <TextInput
                  label="Duration (days)"
                  value={suspensionDuration}
                  onChangeText={setSuspensionDuration}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </>
            )}
            {dialogType === 'unsuspend' && (
              <Text>Are you sure you want to unsuspend {selectedUser?.name}?</Text>
            )}
            {dialogType === 'verify' && (
              <>
                <Text style={styles.dialogText}>Select verification type:</Text>
                <RadioButton.Group onValueChange={setVerificationType} value={verificationType}>
                  <View style={styles.radioItem}>
                    <RadioButton value="email" />
                    <Text>Email Verification</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="phone" />
                    <Text>Phone Verification</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="identity" />
                    <Text>Identity Verification</Text>
                  </View>
                </RadioButton.Group>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button
              onPress={
                dialogType === 'suspend'
                  ? handleSuspend
                  : dialogType === 'unsuspend'
                  ? handleUnsuspend
                  : handleVerify
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
  searchSection: {
    backgroundColor: '#fff',
    padding: 10,
    elevation: 2,
  },
  searchbar: {
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    flex: 1,
  },
  userCard: {
    margin: 10,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suspendedChip: {
    backgroundColor: '#FFCDD2',
    marginRight: 5,
    marginBottom: 5,
  },
  verifiedChip: {
    backgroundColor: '#C8E6C9',
    marginRight: 5,
    marginBottom: 5,
  },
  adminChip: {
    backgroundColor: '#BBDEFB',
    marginRight: 5,
    marginBottom: 5,
  },
  chipText: {
    fontSize: 12,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
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
  input: {
    marginBottom: 10,
  },
  dialogText: {
    marginBottom: 10,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
});

export default UserManagementScreen;
