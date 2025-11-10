import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Avatar,
  Title,
  Text,
  Button,
  Chip,
  Card,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usersAPI } from '../services/api';

export default function PublicProfileScreen({ route, navigation }) {
  const { userId } = route.params;
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUserProfile(userId);
      setProfile(response.data.user);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await usersAPI.unfollowUser(userId);
        setIsFollowing(false);
        setProfile({
          ...profile,
          stats: {
            ...profile.stats,
            followersCount: profile.stats.followersCount - 1
          }
        });
      } else {
        await usersAPI.followUser(userId);
        setIsFollowing(true);
        setProfile({
          ...profile,
          stats: {
            ...profile.stats,
            followersCount: profile.stats.followersCount + 1
          }
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert(error.error || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleViewReviews = () => {
    navigation.navigate('UserReviews', { userId, userName: profile.name });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={100} label={profile.name.charAt(0).toUpperCase()} />
        <Title style={styles.name}>{profile.name}</Title>
        {profile.expertise && <Text style={styles.expertise}>{profile.expertise}</Text>}
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {profile.rating.average.toFixed(1)}</Text>
            <Text style={styles.statLabel}>{profile.rating.count} reviews</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.stats.followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.stats.followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.stats.tasksCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            mode={isFollowing ? 'outlined' : 'contained'}
            onPress={handleFollowToggle}
            style={styles.followButton}
            loading={followLoading}
            disabled={followLoading}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
          <Button
            mode="outlined"
            onPress={handleViewReviews}
            style={styles.reviewsButton}
          >
            View Reviews
          </Button>
        </View>
      </View>

      {profile.skills && profile.skills.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Skills</Title>
            <View style={styles.skillsContainer}>
              {profile.skills.map((skill, index) => (
                <Chip key={index} style={styles.skillChip} mode="outlined">
                  {skill}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {profile.location && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Location</Title>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
              <Text style={styles.locationText}>
                {profile.location.city}, {profile.location.country}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {profile.verification && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Verification</Title>
            <View style={styles.verificationRow}>
              <MaterialCommunityIcons
                name={profile.verification.email ? 'check-circle' : 'close-circle'}
                size={20}
                color={profile.verification.email ? '#4CAF50' : '#999'}
              />
              <Text style={styles.verificationText}>Email Verified</Text>
            </View>
            <View style={styles.verificationRow}>
              <MaterialCommunityIcons
                name={profile.verification.phone ? 'check-circle' : 'close-circle'}
                size={20}
                color={profile.verification.phone ? '#4CAF50' : '#999'}
              />
              <Text style={styles.verificationText}>Phone Verified</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {profile.badges && profile.badges.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Badges</Title>
            <View style={styles.badgesContainer}>
              {profile.badges.map((badge, index) => (
                <View key={index} style={styles.badge}>
                  <Text style={styles.badgeIcon}>{badge.icon || '🏆'}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  name: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: 'bold',
  },
  expertise: {
    fontSize: 16,
    color: '#2196F3',
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 16,
  },
  followButton: {
    flex: 1,
    marginRight: 8,
  },
  reviewsButton: {
    flex: 1,
    marginLeft: 8,
  },
  card: {
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 12,
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeName: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
});
