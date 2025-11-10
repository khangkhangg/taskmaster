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
import ConversationsScreen from '../screens/ConversationsScreen';
import ChatScreen from '../screens/ChatScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SavedTasksScreen from '../screens/SavedTasksScreen';
import PublicProfileScreen from '../screens/PublicProfileScreen';
import SearchUsersScreen from '../screens/SearchUsersScreen';
import WalletScreen from '../screens/WalletScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import TaskModerationScreen from '../screens/TaskModerationScreen';
import AdvancedSearchScreen from '../screens/AdvancedSearchScreen';

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
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Chat' }}
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
        name="AdvancedSearch"
        component={AdvancedSearchScreen}
        options={{ title: 'Advanced Search' }}
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
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Chat' }}
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
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Chat' }}
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
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
    </Stack.Navigator>
  );
}

// Messages Stack
function MessagesStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ConversationsList"
        component={ConversationsScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
      <Stack.Screen
        name="TaskDetails"
        component={TaskDetailsScreen}
        options={{ title: t('tasks.taskDetails') }}
      />
    </Stack.Navigator>
  );
}

// Notifications Stack
function NotificationsStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NotificationsList"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="TaskDetails"
        component={TaskDetailsScreen}
        options={{ title: t('tasks.taskDetails') }}
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
      <Stack.Screen
        name="SavedTasks"
        component={SavedTasksScreen}
        options={{ title: 'Saved Tasks' }}
      />
      <Stack.Screen
        name="PublicProfile"
        component={PublicProfileScreen}
        options={{ title: 'User Profile' }}
      />
      <Stack.Screen
        name="SearchUsers"
        component={SearchUsersScreen}
        options={{ title: 'Search Users' }}
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
        name="Wallet"
        component={WalletScreen}
        options={{ title: 'Wallet & Transactions' }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard & Analytics' }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{ title: 'User Management' }}
      />
      <Stack.Screen
        name="TaskModeration"
        component={TaskModerationScreen}
        options={{ title: 'Task Moderation' }}
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
        name="Messages"
        component={MessagesStack}
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStack}
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
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
