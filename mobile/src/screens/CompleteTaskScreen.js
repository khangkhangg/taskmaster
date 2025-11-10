import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Chip,
  HelperText,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { tasksAPI, reviewsAPI } from '../services/api';

export default function CompleteTaskScreen({ route, navigation }) {
  const { task } = route.params;
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    communication: 5,
    professionalism: 5,
    timeliness: 5,
    quality: 5,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const ratingOptions = [1, 2, 3, 4, 5];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (formData.comment.length < 20) {
      newErrors.comment = 'Please provide at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Complete the task
      await tasksAPI.completeTask(task._id, {
        rating: formData.rating,
        comment: formData.comment,
      });

      // Submit detailed review
      await reviewsAPI.createReview({
        taskId: task._id,
        rating: formData.rating,
        comment: formData.comment,
        qualityRatings: {
          communication: formData.communication,
          professionalism: formData.professionalism,
          timeliness: formData.timeliness,
          quality: formData.quality,
        },
      });

      alert(t('common.success') + '! Task completed and reviewed.');
      navigation.navigate('MyTasksList');
    } catch (error) {
      alert(t('common.error') + ': ' + (error.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.taskCard}>
        <Card.Content>
          <Title>{task.title}</Title>
          <Text style={styles.assignedTo}>
            Completed by: {task.assignedTo?.name}
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Rate the Task Doer</Text>

        <View style={styles.ratingSection}>
          <Text style={styles.label}>Overall Rating *</Text>
          <View style={styles.ratingButtons}>
            {ratingOptions.map((rating) => (
              <Chip
                key={rating}
                selected={formData.rating === rating}
                onPress={() => setFormData({ ...formData, rating })}
                style={styles.ratingChip}
              >
                {rating} ⭐
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.label}>Communication</Text>
          <View style={styles.ratingButtons}>
            {ratingOptions.map((rating) => (
              <Chip
                key={rating}
                selected={formData.communication === rating}
                onPress={() => setFormData({ ...formData, communication: rating })}
                style={styles.ratingChip}
                compact
              >
                {rating}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.label}>Professionalism</Text>
          <View style={styles.ratingButtons}>
            {ratingOptions.map((rating) => (
              <Chip
                key={rating}
                selected={formData.professionalism === rating}
                onPress={() => setFormData({ ...formData, professionalism: rating })}
                style={styles.ratingChip}
                compact
              >
                {rating}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.label}>Timeliness</Text>
          <View style={styles.ratingButtons}>
            {ratingOptions.map((rating) => (
              <Chip
                key={rating}
                selected={formData.timeliness === rating}
                onPress={() => setFormData({ ...formData, timeliness: rating })}
                style={styles.ratingChip}
                compact
              >
                {rating}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.label}>Quality of Work</Text>
          <View style={styles.ratingButtons}>
            {ratingOptions.map((rating) => (
              <Chip
                key={rating}
                selected={formData.quality === rating}
                onPress={() => setFormData({ ...formData, quality: rating })}
                style={styles.ratingChip}
                compact
              >
                {rating}
              </Chip>
            ))}
          </View>
        </View>

        <TextInput
          label="Your Review *"
          value={formData.comment}
          onChangeText={(text) => setFormData({ ...formData, comment: text })}
          mode="outlined"
          multiline
          numberOfLines={6}
          style={styles.input}
          error={!!errors.comment}
          placeholder="Share your experience working with this task doer..."
        />
        {errors.comment && <HelperText type="error">{errors.comment}</HelperText>}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>💡 Writing a great review:</Text>
          <Text style={styles.infoItem}>• Be honest and specific</Text>
          <Text style={styles.infoItem}>• Mention what went well</Text>
          <Text style={styles.infoItem}>• Provide constructive feedback</Text>
          <Text style={styles.infoItem}>• Help others make informed decisions</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={loading}
          icon="check-circle"
        >
          Complete Task & Submit Review
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  taskCard: {
    margin: 16,
    marginBottom: 0,
  },
  assignedTo: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ratingSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratingChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 13,
    marginBottom: 4,
    color: '#555',
  },
  submitButton: {
    marginTop: 8,
  },
});
