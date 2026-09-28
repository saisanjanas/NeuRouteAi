import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import HazardReportScreen from '../screens/HazardReportScreen';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';
import ShipmentStatusScreen from '../screens/ShipmentStatusScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: '#FFFFFF',
  },
  headerTintColor: '#111827',
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: '#F5F7FB',
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={screenOptions}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="HazardReport"
          component={HazardReportScreen}
          options={{ title: 'Report Hazard' }}
        />

        <Stack.Screen
          name="LanguageSelect"
          component={LanguageSelectScreen}
          options={{ title: 'Language' }}
        />

        <Stack.Screen
          name="ShipmentStatus"
          component={ShipmentStatusScreen}
          options={{ title: 'Shipment Status' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}