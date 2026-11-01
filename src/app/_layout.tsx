import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2447A8',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: 'bold',
        },
        headerBackVisible: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="sign-in"
        options={{
          title: 'Student Login',
        }}
      />

      <Stack.Screen
        name="sign-up"
        options={{
          title: 'Sign Up',
        }}
      />

      <Stack.Screen
        name="student-dashboard"
        options={{
          title: 'Dashboard',
        }}
      />

      <Stack.Screen
        name="student-details"
        options={{
          title: 'Student Details',
        }}
      />

      <Stack.Screen
        name="profile"
        options={{
          title: 'My Profile',
        }}
      />

      <Stack.Screen
        name="admin-login"
        options={{
          title: 'Admin Login',
        }}
      />

      <Stack.Screen
        name="admin-dashboard"
        options={{
          title: 'Admin Dashboard',
        }}
      />

      <Stack.Screen
        name="explore"
        options={{
          title: 'Explore',
        }}
      />

      <Stack.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="forgot-password"
        options={{
          title: 'Forgot Password',
        }}
      />
    </Stack>
  );
}
