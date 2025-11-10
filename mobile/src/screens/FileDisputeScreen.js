import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  RadioButton,
  HelperText,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { disputesAPI } from '../services/api';

const DISPUTE_REASONS = [
  { value: 'not_completed', label: 'Work Not Completed' },
  { value: 'poor_quality', label: 'Poor Quality Work' },
  { value: 'late_delivery', label: 'Late Delivery' },
  { value: 'non_payment', label: 'Non-Payment' },
  { value: 'unprofessional', label: 'Unprofessional Behavior' },
  { value: 'not_as_described', label: 'Not As Described' },
  { value: 'other', label: 'Other' },
];

export default function FileDisputeScreen({ route, navigation }) {
  const { task } = route.params;
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    reason: 'not_completed',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Please describe the issue';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Please provide at least 50 characters';
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

      await disputesAPI.createDispute({
        taskId: task._id,
        reason: formData.reason,
        description: formData.description,
      });

      alert('Dispute filed successfully. Our team will review it shortly.');
      navigation.goBack();
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
          <Text style={styles.taskInfo}>
            {task.assignedTo
              ? `Assigned to: ${task.assignedTo.name}`
              : `Posted by: ${task.poster?.name}`}
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>File a Dispute</Text>

        <Text style={styles.warningText}>
          ⚠️ Please try to resolve the issue directly with the other party first.
          File a dispute only if you cannot reach an agreement.
        </Text>

        <Text style={styles.label}>Reason for Dispute *</Text>
        <RadioButton.Group
          onValueChange={(value) => setFormData({ ...formData, reason: value })}
          value={formData.reason}
        >
          {DISPUTE_REASONS.map((reason) => (
            <View key={reason.value} style={styles.radioItem}>
              <RadioButton value={reason.value} />
              <Text style={styles.radioLabel}>{reason.label}</Text>
            </View>
          ))}
        </RadioButton.Group>

        <TextInput
          label="Description *"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          mode="outlined"
          multiline
          numberOfLines={8}
          style={styles.input}
          error={!!errors.description}
          placeholder="Please provide detailed information about the issue, including dates, specific problems, and any attempts to resolve it..."
        />
        {errors.description && (
          <HelperText type="error">{errors.description}</HelperText>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>📋 What Happens Next:</Text>
          <Text style={styles.infoItem}>
            1. Our team will review your dispute within 24-48 hours
          </Text>
          <Text style={styles.infoItem}>
            2. We may contact both parties for additional information
          </Text>
          <Text style={styles.infoItem}>
            3. A resolution will be provided based on our policies
          </Text>
          <Text style={styles.infoItem}>
            4. You'll receive updates via email and in-app notifications
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={loading}
          icon="alert-circle"
        >
          Submit Dispute
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
  taskInfo: {
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
  warningText: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 14,
    color: '#E65100',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#666',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  input: {
    marginTop: 16,
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
    marginBottom: 6,
    color: '#555',
  },
  submitButton: {
    marginTop: 8,
  },
});
