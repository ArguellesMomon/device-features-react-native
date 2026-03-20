import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image, View, Text, StyleSheet } from 'react-native';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';
import ThemeToggle from './src/components/ThemeToggle';
import { setupNotifications } from './src/utils/notifications';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const HeaderTitle: React.FC<{ tintColor?: string }> = ({ tintColor }) => (
  <View style={styles.headerTitleContainer}>
    <Image
      source={require('./assets/CircleLogo.png')}
      style={styles.headerLogo}
      resizeMode="contain"
    />
    <Text style={[styles.headerTitleText, { color: tintColor }]}>
      Travel Diary
    </Text>
  </View>
);

const AppNavigator: React.FC = () => {
  const { theme, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.headerBg,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.headerBg },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitle: ({ tintColor }) => <HeaderTitle tintColor={tintColor} />,
            headerRight: () => <ThemeToggle />,
          }}
        />
        <Stack.Screen
          name="AddEntry"
          component={AddEntryScreen}
          options={{
            title: 'New Entry',
            headerRight: () => <ThemeToggle />,
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="EntryDetail"
          component={EntryDetailScreen}
          options={{
            title: 'Entry Detail',
            headerRight: () => <ThemeToggle />,
            headerBackTitle: 'Diary',
          }}
        />
      </Stack.Navigator>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  headerTitleText: {
    fontWeight: '700',
    fontSize: 18,
  },
});

const App: React.FC = () => {
  useEffect(() => {
    setupNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;