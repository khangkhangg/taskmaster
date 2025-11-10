import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  HelperText,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { createBid } from '../redux/slices/bidsSlice';

export default function PlaceBidScreen({ route, navigation }) {
  const { taskId } = route.params;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.bids);
  const { currentTask } = useSelector((state) => state.tasks);

  const [formData, setFormData] = useState({
    amount: '',
    proposedTimeline: '',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Bid amount is required';
    }

    if (
      currentTask &&
      parseFloat(formData.amount) < currentTask.budget.min
    ) {
      newErrors.amount = `Amount must be at least ${currentTask.budget.min.toLocaleString()}`;
    }

    if (!formData.proposedTimeline.trim()) {
      newErrors.proposedTimeline = 'Timeline is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const bidData = {
        taskId,
        amount: parseFloat(formData.amount),
        proposedTimeline: formData.proposedTimeline,
        message: formData.message,
      };

      await dispatch(createBid(bidData)).unwrap();

      alert(t('bids.bidSuccess'));
      navigation.goBack();
    } catch (error) {
      alert(t('common.error') + ': ' + (error.error || error.message));
    }
  };

  return (
    <ScrollView style={styles.container}>
      {currentTask && (
        <Card style={styles.taskCard}>
          <Card.Content>
            <Title>{currentTask.title}</Title>
            <Text style={styles.budget}>
              Budget: {currentTask.budget.min.toLocaleString()} -{' '}
              {currentTask.budget.max.toLocaleString()} {currentTask.budget.currency}
            </Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>{t('bids.placeBid')}</Text>

        <TextInput
          label={t('bids.amount') + ' (VND) *'}
          value={formData.amount}
          onChangeText={(text) => setFormData({ ...formData, amount: text })}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          error={!!errors.amount}
          placeholder={currentTask ? currentTask.budget.min.toString() : ''}
        />
        {errors.amount && <HelperText type="error">{errors.amount}</HelperText>}

        <TextInput
          label={t('bids.timeline') + ' *'}
          value={formData.proposedTimeline}
          onChangeText={(text) =>
            setFormData({ ...formData, proposedTimeline: text })
          }
          mode="outlined"
          style={styles.input}
          error={!!errors.proposedTimeline}
          placeholder="e.g., 2 days, 1 week"
        />
        {errors.proposedTimeline && (
          <HelperText type="error">{errors.proposedTimeline}</HelperText>
        )}

        <TextInput
          label={t('bids.message')}
          value={formData.message}
          onChangeText={(text) => setFormData({ ...formData, message: text })}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          placeholder="Tell the poster why you're the best fit for this task..."
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>💡 Tips for a great bid:</Text>
          <Text style={styles.infoItem}>• Be realistic with your pricing</Text>
          <Text style={styles.infoItem}>• Explain your relevant experience</Text>
          <Text style={styles.infoItem}>• Propose a clear timeline</Text>
          <Text style={styles.infoItem}>• Ask questions if needed</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={loading}
          icon="gavel"
        >
          {t('common.submit')}
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
  budget: {
    marginTop: 8,
    fontSize: 16,
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
  input: {
    marginBottom: 8,
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
