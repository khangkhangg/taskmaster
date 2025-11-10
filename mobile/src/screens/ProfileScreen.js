import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Avatar, Title, Text, Button, Divider, Switch } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { logout } from '../redux/slices/authSlice';
import { saveLanguage } from '../locales/i18n';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    await i18n.changeLanguage(newLang);
    await saveLanguage(newLang);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={80} label={user?.name?.charAt(0) || 'U'} />
        <Title style={styles.name}>{user?.name}</Title>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.rating?.average?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.statLabel}>{t('profile.rating')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.stats?.tasksPosted || 0}</Text>
            <Text style={styles.statLabel}>{t('profile.tasksPosted')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.stats?.tasksCompleted || 0}</Text>
            <Text style={styles.statLabel}>{t('profile.tasksCompleted')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <List.Section>
          <List.Subheader>{t('profile.settings')}</List.Subheader>

          <List.Item
            title={t('profile.language')}
            description={i18n.language === 'vi' ? 'Tiếng Việt' : 'English'}
            left={(props) => <List.Icon {...props} icon="translate" />}
            right={() => (
              <Switch
                value={i18n.language === 'en'}
                onValueChange={toggleLanguage}
              />
            )}
          />

          <Divider />

          <List.Item
            title={t('profile.editProfile')}
            left={(props) => <List.Icon {...props} icon="account-edit" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />

          <List.Item
            title={t('profile.notifications')}
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />

          <Divider />

          <List.Item
            title={t('profile.about')}
            left={(props) => <List.Icon {...props} icon="information" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
        >
          {t('auth.logout')}
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  name: {
    marginTop: 10,
    fontSize: 24,
  },
  email: {
    color: '#666',
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  content: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  logoutButton: {
    margin: 20,
  },
});
