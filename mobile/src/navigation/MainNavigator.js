import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TasksListScreen from '../screens/TasksListScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import PlaceBidScreen from '../screens/PlaceBidScreen';
import MyTasksScreen from '../screens/MyTasksScreen';
import MyBidsScreen from '../screens/MyBidsScreen';
import TaskBidsScreen from '../screens/TaskBidsScreen';
import CompleteTaskScreen from '../screens/CompleteTaskScreen';
import UserReviewsScreen from '../screens/UserReviewsScreen';
import FileDisputeScreen from '../screens/FileDisputeScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack
function HomeStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: t('tabs.home') }}
      />
      <Stack.Screen
        name="TaskDetails"
        component={TaskDetailsScreen}
        options={{ title: t('tasks.taskDetails') }}
      />
      <Stack.Screen
        name="PlaceBid"
        component={PlaceBidScreen}
        options={{ title: t('bids.placeBid') }}
      />
      <Stack.Screen
        name="TaskBids"
        component={TaskBidsScreen}
        options={{ title: t('tasks.viewBids') }}
      />
      <Stack.Screen
        name="UserReviews"
        component={UserReviewsScreen}
        options={{ title: 'Reviews & Trust Score' }}
      />
      <Stack.Screen
        name="CompleteTask"
        component={CompleteTaskScreen}
        options={{ title: 'Complete Task' }}
      />
      <Stack.Screen
        name="FileDispute"
        component={FileDisputeScreen}
        options={{ title: 'File a Dispute' }}
      />
    </Stack.Navigator>
  );
}

// Tasks Stack
function TasksStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TasksList"
        component={TasksListScreen}
        options={{ title: t('tasks.allTasks') }}
      />
      <Stack.Screen
        name="TaskDetails"
        component={TaskDetailsScreen}
        options={{ title: t('tasks.taskDetails') }}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{ title: t('tasks.createTask') }}
      />
      <Stack.Screen
        name="PlaceBid"
        component={PlaceBidScreen}
        options={{ title: t('bids.placeBid') }}
      />
      <Stack.Screen
        name="TaskBids"
        component={TaskBidsScreen}
        options={{ title: t('tasks.viewBids') }}
      />
      <Stack.Screen
        name="UserReviews"
        component={UserReviewsScreen}
        options={{ title: 'Reviews & Trust Score' }}
      />
      <Stack.Screen
        name="CompleteTask"
        component={CompleteTaskScreen}
        options={{ title: 'Complete Task' }}
      />
      <Stack.Screen
        name="FileDispute"
        component={FileDisputeScreen}
        options={{ title: 'File a Dispute' }}
      />
    </Stack.Navigator>
  );
}

// My Tasks Stack
function MyTasksStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyTasksList"
        component={MyTasksScreen}
        options={{ title: t('tasks.myTasks') }}
      />
      <Stack.Screen
        name="TaskDetails"
        component={TaskDetailsScreen}
        options={{ title: t('tasks.taskDetails') }}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{ title: t('tasks.createTask') }}
      />
      <Stack.Screen
        name="TaskBids"
        component={TaskBidsScreen}
        options={{ title: t('tasks.viewBids') }}
      />
      <Stack.Screen
        name="CompleteTask"
        component={CompleteTaskScreen}
        options={{ title: 'Complete Task' }}
      />
      <Stack.Screen
        name="FileDispute"
        component={FileDisputeScreen}
        options={{ title: 'File a Dispute' }}
      />
    </Stack.Navigator>
  );
}

// My Bids Stack
function MyBidsStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyBidsList"
        component={MyBidsScreen}
        options={{ title: t('bids.myBids') }}
      />
      <Stack.Screen
        name="TaskDetails"
        component={TaskDetailsScreen}
        options={{ title: t('tasks.taskDetails') }}
      />
      <Stack.Screen
        name="UserReviews"
        component={UserReviewsScreen}
        options={{ title: 'Reviews & Trust Score' }}
      />
      <Stack.Screen
        name="FileDispute"
        component={FileDisputeScreen}
        options={{ title: 'File a Dispute' }}
      />
    </Stack.Navigator>
  );
}

// Profile Stack
function ProfileStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: t('tabs.profile') }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
export default function MainNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksStack}
        options={{
          title: t('tabs.tasks'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="briefcase" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MyTasks"
        component={MyTasksStack}
        options={{
          title: 'My Tasks',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MyBids"
        component={MyBidsStack}
        options={{
          title: t('tabs.myBids'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="gavel" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
