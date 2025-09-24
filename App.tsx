import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { StatusBar } from 'expo-status-bar';

// 画面のインポート
import HomeScreen from './src/screens/Home/HomeScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import ScheduleScreen from './src/screens/Schedule/ScheduleScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              tabBarStyle: {
                backgroundColor: '#fff',
                borderTopColor: '#ddd',
                borderTopWidth: 1,
              },
              tabBarActiveTintColor: '#007AFF',
              tabBarInactiveTintColor: '#666',
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: '連絡',
                tabBarIcon: ({ color, size }) => (
                  <Text style={{ fontSize: size, color }}>🍚</Text>
                ),
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: '設定',
                tabBarIcon: ({ color, size }) => (
                  <Text style={{ fontSize: size, color }}>⚙️</Text>
                ),
              }}
            />
            <Tab.Screen
              name="Schedule"
              component={ScheduleScreen}
              options={{
                title: 'スケジュール',
                tabBarIcon: ({ color, size }) => (
                  <Text style={{ fontSize: size, color }}>📅</Text>
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </PersistGate>
    </Provider>
  );
}
