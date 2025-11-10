import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Searchbar,
  Chip,
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  ActivityIndicator,
  SegmentedButtons,
  Divider
} from 'react-native-paper';
import { searchAPI } from '../services/api';

const AdvancedSearchScreen = ({ navigation }) => {
  const [searchType, setSearchType] = useState('tasks');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Task filters
  const [category, setCategory] = useState('all');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [location, setLocation] = useState('');
  const [locationType, setLocationType] = useState('');

  // User filters
  const [minRating, setMinRating] = useState('');
  const [skills, setSkills] = useState('');
  const [verified, setVerified] = useState(false);

  const categories = [
    'all',
    'cleaning',
    'delivery',
    'handyman',
    'moving',
    'design',
    'programming',
    'writing',
    'photography',
    'tutoring',
    'other'
  ];

  const handleSearch = async () => {
    if (!query || query.length < 2) {
      return;
    }

    setLoading(true);
    try {
      if (searchType === 'tasks') {
        const params = {
          query,
          category: category !== 'all' ? category : undefined,
          minBudget: minBudget || undefined,
          maxBudget: maxBudget || undefined,
          location: location || undefined,
          locationType: locationType || undefined,
        };

        const response = await searchAPI.searchTasks(params);
        setResults(response.data.tasks || []);
      } else if (searchType === 'users') {
        const params = {
          query,
          minRating: minRating || undefined,
          skills: skills ? skills.split(',').map(s => s.trim()) : undefined,
          verified: verified || undefined,
        };

        const response = await searchAPI.searchUsers(params);
        setResults(response.data.users || []);
      } else if (searchType === 'global') {
        const response = await searchAPI.globalSearch({ query });
        setResults({
          tasks: response.data.results.tasks.items || [],
          users: response.data.results.users.items || []
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setCategory('all');
    setMinBudget('');
    setMaxBudget('');
    setLocation('');
    setLocationType('');
    setMinRating('');
    setSkills('');
    setVerified(false);
  };

  const renderTaskItem = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('TaskDetails', { taskId: item._id })}>
      <Card.Content>
        <Title>{item.title}</Title>
        <Paragraph numberOfLines={2}>{item.description}</Paragraph>
        <View style={styles.metaRow}>
          <Chip mode="flat" style={styles.categoryChip}>
            {item.category}
          </Chip>
          <Text style={styles.budget}>
            {item.budget?.min?.toLocaleString()} - {item.budget?.max?.toLocaleString()} VND
          </Text>
        </View>
        {item.poster && (
          <Text style={styles.poster}>
            Posted by: {item.poster.name} {item.poster.verification?.identity ? '✓' : ''}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderUserItem = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('PublicProfile', { userId: item._id })}>
      <Card.Content>
        <Title>{item.name}</Title>
        {item.expertise && <Paragraph>{item.expertise}</Paragraph>}
        <View style={styles.metaRow}>
          <Text>⭐ {item.rating?.average?.toFixed(1) || 'N/A'}</Text>
          {item.verification?.identity && (
            <Chip mode="flat" style={styles.verifiedChip}>
              ✓ Verified
            </Chip>
          )}
        </View>
        <Text style={styles.stats}>
          {item.stats?.tasksCompleted || 0} tasks completed
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <Searchbar
          placeholder="Search tasks, users, or skills..."
          onChangeText={setQuery}
          value={query}
          onSubmitEditing={handleSearch}
          style={styles.searchbar}
        />

        <SegmentedButtons
          value={searchType}
          onValueChange={setSearchType}
          buttons={[
            { value: 'tasks', label: 'Tasks' },
            { value: 'users', label: 'Users' },
            { value: 'global', label: 'All' },
          ]}
          style={styles.segmented}
        />

        <Button
          mode="outlined"
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </View>

      {/* Filters */}
      {showFilters && (
        <ScrollView style={styles.filters}>
          {searchType === 'tasks' && (
            <>
              <Text style={styles.filterLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map(cat => (
                  <Chip
                    key={cat}
                    selected={category === cat}
                    onPress={() => setCategory(cat)}
                    style={styles.filterChip}
                  >
                    {cat}
                  </Chip>
                ))}
              </ScrollView>

              <TextInput
                label="Min Budget (VND)"
                value={minBudget}
                onChangeText={setMinBudget}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Max Budget (VND)"
                value={maxBudget}
                onChangeText={setMaxBudget}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Location (City)"
                value={location}
                onChangeText={setLocation}
                mode="outlined"
                style={styles.input}
              />
            </>
          )}

          {searchType === 'users' && (
            <>
              <TextInput
                label="Min Rating (0-5)"
                value={minRating}
                onChangeText={setMinRating}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Skills (comma-separated)"
                value={skills}
                onChangeText={setSkills}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., design, programming"
              />
            </>
          )}

          <View style={styles.filterActions}>
            <Button mode="outlined" onPress={clearFilters}>
              Clear Filters
            </Button>
            <Button mode="contained" onPress={handleSearch}>
              Apply Filters
            </Button>
          </View>
          <Divider />
        </ScrollView>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={searchType === 'global' ? [...(results.tasks || []), ...(results.users || [])] : results}
          renderItem={searchType === 'users' ? renderUserItem : renderTaskItem}
          keyExtractor={(item, index) => item._id || index.toString()}
          style={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {query ? 'No results found' : 'Enter a search query to get started'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 10,
    elevation: 2,
  },
  searchbar: {
    marginBottom: 10,
  },
  segmented: {
    marginBottom: 10,
  },
  filterButton: {
    marginBottom: 5,
  },
  filters: {
    backgroundColor: '#fff',
    padding: 15,
    maxHeight: 400,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 10,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  resultsList: {
    flex: 1,
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  categoryChip: {
    backgroundColor: '#E3F2FD',
    marginRight: 10,
  },
  verifiedChip: {
    backgroundColor: '#C8E6C9',
    marginLeft: 10,
  },
  budget: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  poster: {
    marginTop: 8,
    color: '#666',
    fontSize: 13,
  },
  stats: {
    marginTop: 5,
    color: '#666',
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
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
    textAlign: 'center',
  },
});

export default AdvancedSearchScreen;
