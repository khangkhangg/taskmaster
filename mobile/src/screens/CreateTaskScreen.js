import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  SegmentedButtons,
  Chip,
  HelperText,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { createTask } from '../redux/slices/tasksSlice';

const CATEGORIES = [
  'cleaning',
  'delivery',
  'handyman',
  'moving',
  'design',
  'programming',
  'writing',
  'photography',
  'tutoring',
  'other',
];

export default function CreateTaskScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.tasks);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budgetMin: '',
    budgetMax: '',
    locationType: 'onsite',
    address: '',
    city: '',
    deadline: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('tasks.title') + ' is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = t('tasks.description') + ' is required';
    }

    if (!formData.category) {
      newErrors.category = t('tasks.category') + ' is required';
    }

    if (!formData.budgetMin || parseFloat(formData.budgetMin) <= 0) {
      newErrors.budgetMin = 'Minimum budget is required';
    }

    if (!formData.budgetMax || parseFloat(formData.budgetMax) <= 0) {
      newErrors.budgetMax = 'Maximum budget is required';
    }

    if (
      formData.budgetMin &&
      formData.budgetMax &&
      parseFloat(formData.budgetMax) < parseFloat(formData.budgetMin)
    ) {
      newErrors.budgetMax = 'Maximum must be greater than minimum';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Calculate deadline (for demo, using days from now)
      const deadlineDays = parseInt(formData.deadline) || 7;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + deadlineDays);

      const taskData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: {
          min: parseFloat(formData.budgetMin),
          max: parseFloat(formData.budgetMax),
          currency: 'VND',
        },
        location: {
          type: formData.locationType,
          address: formData.address,
          city: formData.city,
          country: 'Vietnam',
        },
        deadline: deadline.toISOString(),
        images: [],
        requiredSkills: [],
      };

      await dispatch(createTask(taskData)).unwrap();

      // Show success message
      alert(t('common.success') + '!');

      // Navigate back or to task details
      navigation.goBack();
    } catch (error) {
      alert(t('common.error') + ': ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          label={t('tasks.title') + ' *'}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          mode="outlined"
          style={styles.input}
          error={!!errors.title}
        />
        {errors.title && <HelperText type="error">{errors.title}</HelperText>}

        <TextInput
          label={t('tasks.description') + ' *'}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          error={!!errors.description}
        />
        {errors.description && <HelperText type="error">{errors.description}</HelperText>}

        <Text style={styles.label}>{t('tasks.category')} *</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((category) => (
            <Chip
              key={category}
              selected={formData.category === category}
              onPress={() => setFormData({ ...formData, category })}
              style={styles.categoryChip}
            >
              {t(`categories.${category}`)}
            </Chip>
          ))}
        </View>
        {errors.category && <HelperText type="error">{errors.category}</HelperText>}

        <Text style={styles.label}>{t('tasks.budget')} (VND) *</Text>
        <View style={styles.budgetRow}>
          <TextInput
            label="Min"
            value={formData.budgetMin}
            onChangeText={(text) => setFormData({ ...formData, budgetMin: text })}
            mode="outlined"
            keyboardType="numeric"
            style={styles.budgetInput}
            error={!!errors.budgetMin}
          />
          <Text style={styles.budgetSeparator}>-</Text>
          <TextInput
            label="Max"
            value={formData.budgetMax}
            onChangeText={(text) => setFormData({ ...formData, budgetMax: text })}
            mode="outlined"
            keyboardType="numeric"
            style={styles.budgetInput}
            error={!!errors.budgetMax}
          />
        </View>
        {errors.budgetMin && <HelperText type="error">{errors.budgetMin}</HelperText>}
        {errors.budgetMax && <HelperText type="error">{errors.budgetMax}</HelperText>}

        <Text style={styles.label}>{t('tasks.location')} *</Text>
        <SegmentedButtons
          value={formData.locationType}
          onValueChange={(value) => setFormData({ ...formData, locationType: value })}
          buttons={[
            { value: 'onsite', label: 'On-site' },
            { value: 'remote', label: 'Remote' },
          ]}
          style={styles.input}
        />

        {formData.locationType === 'onsite' && (
          <>
            <TextInput
              label="Address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="City *"
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              mode="outlined"
              style={styles.input}
              error={!!errors.city}
            />
            {errors.city && <HelperText type="error">{errors.city}</HelperText>}
          </>
        )}

        <TextInput
          label={t('tasks.deadline') + ' (days from now) *'}
          value={formData.deadline}
          onChangeText={(text) => setFormData({ ...formData, deadline: text })}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          placeholder="7"
          error={!!errors.deadline}
        />
        {errors.deadline && <HelperText type="error">{errors.deadline}</HelperText>}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={loading}
        >
          {t('tasks.createTask')}
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
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryChip: {
    margin: 4,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetInput: {
    flex: 1,
  },
  budgetSeparator: {
    marginHorizontal: 8,
    fontSize: 18,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});
