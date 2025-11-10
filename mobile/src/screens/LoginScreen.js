import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { login, register } from '../redux/slices/authSlice';

export default function LoginScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const handleSubmit = () => {
    if (isRegister) {
      dispatch(register(formData));
    } else {
      dispatch(login({ email: formData.email, password: formData.password }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Title style={styles.title}>{t('common.appName')}</Title>

        {isRegister && (
          <TextInput
            label={t('auth.name')}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={styles.input}
            mode="outlined"
          />
        )}

        <TextInput
          label={t('auth.email')}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          style={styles.input}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label={t('auth.password')}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          style={styles.input}
          mode="outlined"
          secureTextEntry
        />

        {isRegister && (
          <TextInput
            label={t('auth.phone')}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
          />
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          {isRegister ? t('auth.register') : t('auth.login')}
        </Button>

        <Button onPress={() => setIsRegister(!isRegister)}>
          {isRegister ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 32,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});
