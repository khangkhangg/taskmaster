import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Searchbar,
  List,
  Avatar,
  Text,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { usersAPI } from '../services/api';

export default function SearchUsersScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const response = await usersAPI.searchUsers({ query });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }) => (
    <List.Item
      title={item.name}
      description={item.bio || item.expertise || 'No bio available'}
      left={() => (
        <Avatar.Text
          size={48}
          label={item.name.charAt(0).toUpperCase()}
        />
      )}
      right={() => (
        <View style={styles.rightContainer}>
          <Text style={styles.rating}>⭐ {item.rating.average.toFixed(1)}</Text>
          <Text style={styles.reviews}>{item.rating.count} reviews</Text>
        </View>
      )}
      onPress={() => navigation.navigate('PublicProfile', { userId: item._id })}
      style={styles.listItem}
    />
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search users by name, skills, or expertise..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={() => handleSearch()}
        style={styles.searchbar}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : searched && users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>
            Try different search terms
          </Text>
        </View>
      ) : !searched ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Search for users</Text>
          <Text style={styles.emptySubtext}>
            Find task doers and posters by name or skills
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  listItem: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviews: {
    fontSize: 12,
    color: '#666',
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
});
