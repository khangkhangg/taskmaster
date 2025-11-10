import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import vi from './vi.json';
import en from './en.json';

const LANGUAGE_KEY = '@taskmaster:language';

// Get stored language
const getStoredLanguage = async () => {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_KEY);
    return language || 'vi'; // Default to Vietnamese
  } catch (error) {
    return 'vi';
  }
};

// Save language preference
export const saveLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      vi: { translation: vi },
      en: { translation: en }
    },
    lng: 'vi', // Default language
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    }
  });

// Load stored language preference
getStoredLanguage().then(language => {
  i18n.changeLanguage(language);
});

export default i18n;
