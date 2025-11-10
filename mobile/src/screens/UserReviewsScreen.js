import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import {
  Card,
  Title,
  Text,
  Avatar,
  Chip,
  ProgressBar,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { reviewsAPI } from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function UserReviewsScreen({ route }) {
  const { userId, userName } = route.params;
  const { t } = useTranslation();

  const [reviews, setReviews] = useState([]);
  const [trustScore, setTrustScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewsRes, trustScoreRes] = await Promise.all([
        reviewsAPI.getUserReviews(userId, { limit: 20 }),
        reviewsAPI.getTrustScore(userId),
      ]);

      setReviews(reviewsRes.data.reviews || []);
      setTrustScore(trustScoreRes.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTrustScore = () => {
    if (!trustScore) return null;

    const { score, level, factors } = trustScore.trustScore;
    const { user } = trustScore;

    return (
      <Card style={styles.trustCard}>
        <Card.Content>
          <View style={styles.trustHeader}>
            <View>
              <Text style={styles.trustScoreLabel}>Trust Score</Text>
              <Title style={styles.trustScoreValue}>{score}/100</Title>
              <Chip style={styles.trustLevelChip}>{level}</Chip>
            </View>
            <MaterialCommunityIcons name="shield-check" size={60} color="#4CAF50" />
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          {factors.map((factor, index) => (
            <View key={index} style={styles.factorRow}>
              <View style={styles.factorInfo}>
                <Text style={styles.factorName}>{factor.name}</Text>
                <Text style={styles.factorScore}>
                  {factor.score.toFixed(0)}/{factor.maxScore}
                </Text>
              </View>
              <ProgressBar
                progress={factor.score / factor.maxScore}
                color="#2196F3"
                style={styles.progressBar}
              />
            </View>
          ))}

          <Divider style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {user.rating.average.toFixed(1)}</Text>
              <Text style={styles.statLabel}>{user.rating.count} reviews</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.tasksCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user.verification.email && user.verification.phone ? '✓' : '—'}
              </Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderReview = ({ item }) => (
    <Card style={styles.reviewCard}>
      <Card.Content>
        <View style={styles.reviewHeader}>
          <Avatar.Text size={40} label={item.reviewer?.name?.charAt(0) || 'U'} />
          <View style={styles.reviewerInfo}>
            <Text style={styles.reviewerName}>{item.reviewer?.name}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.rating}>
                {'⭐'.repeat(item.rating)} ({item.rating}.0)
              </Text>
              <Text style={styles.reviewDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {item.task && (
          <Chip style={styles.taskChip} icon="briefcase">
            {item.task.title}
          </Chip>
        )}

        <Text style={styles.reviewComment}>{item.comment}</Text>

        {item.qualityRatings && (
          <View style={styles.qualityRatings}>
            <View style={styles.qualityRow}>
              <Text style={styles.qualityLabel}>Communication:</Text>
              <Text style={styles.qualityValue}>
                {'⭐'.repeat(item.qualityRatings.communication)}
              </Text>
            </View>
            <View style={styles.qualityRow}>
              <Text style={styles.qualityLabel}>Professionalism:</Text>
              <Text style={styles.qualityValue}>
                {'⭐'.repeat(item.qualityRatings.professionalism)}
              </Text>
            </View>
            <View style={styles.qualityRow}>
              <Text style={styles.qualityLabel}>Timeliness:</Text>
              <Text style={styles.qualityValue}>
                {'⭐'.repeat(item.qualityRatings.timeliness)}
              </Text>
            </View>
            <View style={styles.qualityRow}>
              <Text style={styles.qualityLabel}>Quality:</Text>
              <Text style={styles.qualityValue}>
                {'⭐'.repeat(item.qualityRatings.quality)}
              </Text>
            </View>
          </View>
        )}

        {item.response && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseLabel}>Response from {userName}:</Text>
            <Text style={styles.responseText}>{item.response.text}</Text>
            <Text style={styles.responseDate}>
              {new Date(item.response.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        {item.helpful > 0 && (
          <Text style={styles.helpful}>{item.helpful} people found this helpful</Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderTrustScore}
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reviews yet</Text>
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
  listContent: {
    padding: 16,
  },
  trustCard: {
    marginBottom: 16,
  },
  trustHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trustScoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  trustScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  trustLevelChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  factorRow: {
    marginBottom: 12,
  },
  factorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  factorName: {
    fontSize: 14,
    color: '#666',
  },
  factorScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  reviewCard: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    marginRight: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  taskChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  qualityRatings: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  qualityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  qualityLabel: {
    fontSize: 13,
    color: '#666',
  },
  qualityValue: {
    fontSize: 13,
  },
  responseContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 13,
    marginBottom: 4,
  },
  responseDate: {
    fontSize: 11,
    color: '#666',
  },
  helpful: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
