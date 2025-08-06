import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider } from './components/services/UserContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Header from './components/navigation/Header';

import LoginScreen from './components/login/LoginScreen';
import RegisterScreen from './components/login/RegisterScreen';

import HomeScreen from './components/HomeScreen';

import Chatbot from './components/Chatbot';
import ChatBotRead from './components/ChatBotRead';


import ProductPage from './components/product/ProductPage';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DummyScreen = ({ title }) => (
  <View style={styles.screen}>
    <Text>{title}</Text>
  </View>
);


export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Chatbot" component={Chatbot} options={{ headerShown: true, header: () => <Header /> }} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: true, header: () => <Header /> }} />
            <Stack.Screen name="ChatBotRead" component={ChatBotRead} options={{ headerShown: true, header: () => <Header /> }} />
            <Stack.Screen name="ProductPage" component={ProductPage} options={{ headerShown: true, header: () => <Header /> }} />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#e67828',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
