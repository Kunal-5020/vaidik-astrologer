import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// Import your tab screens
import HomeScreen from '../screens/TabsScreen/HomeScreen';
import OrderScreen from '../screens/TabsScreen/OrderScreen';
import EarningScreen from '../screens/TabsScreen/EarningScreen';
import ProfileScreen from '../screens/TabsScreen/ProfileScreen';

const Tab = createBottomTabNavigator();

const RootTabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#FF8C42',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: '#372643',
          borderTopWidth: 0.5,
          borderTopColor: '#ddd',
          height: 60,
          paddingBottom: 5,
        },

        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'Home') {
            return (
              <Ionicons
                name={focused ? 'home' : 'home'}
                size={22}
                color={color}
              />
            );
          } else if (route.name === 'Orders') {
            return <FontAwesome5 name="list" size={20} color={color} />;
          } else if (route.name === 'Earnings') {
            return <FontAwesome5 name="dollar-sign" size={20} color={color} />;
          } else if (route.name === 'Profile') {
            return (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            );
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Orders" component={OrderScreen} />
      <Tab.Screen name="Earnings" component={EarningScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default RootTabNavigation;
