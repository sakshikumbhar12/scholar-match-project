import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

export default function StudentDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<string>('student');

  useEffect(() => {
    let isMounted = true;

    async function loadStudent() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace('/sign-in');
          return;
        }

        // Fetch user profile from public.profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, role')
          .eq('id', session.user.id)
          .single();

        if (isMounted) {
          if (profile?.full_name) {
            setFullName(profile.full_name);
          } else if (session.user.user_metadata?.full_name) {
            setFullName(session.user.user_metadata.full_name);
          } else {
            setFullName(session.user.email?.split('@')[0] || 'Student');
          }

          if (profile?.role) {
            setRole(profile.role);
          }
        }
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStudent();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/');
    } catch {
      router.replace('/');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2447A8" />
        <ActivityIndicator size="large" color="#2447A8" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#2447A8" />

      {/* Tricolor Stripe Accent */}
      <View style={styles.tricolorStripe}>
        <View style={[styles.tricolorBand, { backgroundColor: '#FF9933' }]} />
        <View style={[styles.tricolorBand, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.tricolorBand, { backgroundColor: '#138808' }]} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Hero Banner */}
        <View style={styles.welcomeCard}>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarEmoji}>🎓</Text>
          </View>
          <Text style={styles.greetingText}>Hello, {fullName} 👋</Text>
          <Text style={styles.roleBadgeText}>
            {role === 'admin' ? 'Administrator' : 'Student Portal'}
          </Text>
          <Text style={styles.subtitleText}>
            Welcome to your scholarship dashboard. Discover verified schemes tailored for you.
          </Text>
        </View>

        {/* Action Buttons Container */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionHeader}>Quick Actions</Text>

          {/* Button 1: Find Scholarships */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/student-details')}
            activeOpacity={0.85}
          >
            <View style={styles.buttonIconWrapper}>
              <Text style={styles.buttonIcon}>🔍</Text>
            </View>
            <View style={styles.buttonTextWrapper}>
              <Text style={styles.primaryButtonText}>Find Scholarships</Text>
              <Text style={styles.buttonSubText}>
                Filter schemes by marks, category & income
              </Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

          {/* Button 2: My Profile */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/profile' as any)}
            activeOpacity={0.85}
          >
            <View style={[styles.buttonIconWrapper, styles.profileIconWrapper]}>
              <Text style={styles.buttonIcon}>👤</Text>
            </View>
            <View style={styles.buttonTextWrapper}>
              <Text style={styles.secondaryButtonText}>My Profile</Text>
              <Text style={styles.buttonSubText}>View and edit your personal details</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

          {/* Button 3: Logout */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <View style={[styles.buttonIconWrapper, styles.logoutIconWrapper]}>
              <Text style={styles.buttonIcon}>🚪</Text>
            </View>
            <View style={styles.buttonTextWrapper}>
              <Text style={styles.logoutButtonText}>Logout</Text>
              <Text style={styles.buttonSubText}>Sign out from your account</Text>
            </View>
            <Text style={styles.logoutArrowIcon}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Informational Cards */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Pro Tip for Students</Text>
          <Text style={styles.infoDescription}>
            Complete your scholarship profile details accurately to calculate 100% accurate eligibility scores and cutoff matches.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F6FF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F3F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#2447A8',
  },
  tricolorStripe: {
    flexDirection: 'row',
    height: 4,
    width: '100%',
  },
  tricolorBand: {
    flex: 1,
    height: '100%',
  },
  scrollArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2447A8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  avatarBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#071E42',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2447A8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2447A8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#2447A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileIconWrapper: {
    backgroundColor: '#EFF6FF',
  },
  logoutIconWrapper: {
    backgroundColor: '#FEF2F2',
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonTextWrapper: {
    flex: 1,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 2,
  },
  buttonSubText: {
    fontSize: 12.5,
    color: '#94A3B8',
  },
  arrowIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: 8,
  },
  logoutArrowIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F87171',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
