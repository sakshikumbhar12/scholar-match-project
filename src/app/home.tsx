import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0B2A5B" />

      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarHeader}>
          <View style={styles.brandContainer}>
            <Text style={styles.appBarTitle}>🎓 ScholarMatch</Text>
            <Text style={styles.appBarTagline}>Student Scholarship Portal</Text>
          </View>

          {user ? (
            <View style={styles.userLoggedInContainer}>
              <Text style={styles.userGreeting} numberOfLines={1}>
                Hello, {user.user_metadata?.full_name || user.email}
              </Text>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.85}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authButtonsRow}>
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => router.push('/')}
                activeOpacity={0.85}
              >
                <Text style={styles.signInButtonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => router.push('/')}
                activeOpacity={0.85}
              >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Tricolor Accent Stripe */}
      <View style={styles.tricolorStripe}>
        <View style={[styles.tricolorBand, { backgroundColor: '#FF9933' }]} />
        <View style={[styles.tricolorBand, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.tricolorBand, { backgroundColor: '#138808' }]} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.circleLarge} />
          <View style={styles.circleMedium} />
          <View style={styles.circleSmall} />

          <Text style={styles.heading}>
            Find the Right Scholarship for You!
          </Text>

          <Text style={styles.subtitle}>
            Discover scholarships that match your education,
            marks and family income.
          </Text>
        </View>

        {/* Welcome Card (overlaps Hero) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome, Student!</Text>

          <Text style={styles.cardText}>
            Your scholarship journey starts here. Compare national and state scholarships tailored to your eligibility.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/student-details')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              Find Scholarships
            </Text>
          </TouchableOpacity>
        </View>

        {/* Why ScholarMatch Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>
            Why ScholarMatch?
          </Text>

          <View style={styles.feature}>
            <View style={[styles.iconCircle, styles.searchCircle]}>
              <Text style={styles.iconEmoji}>🔍</Text>
            </View>
            <View style={styles.featureBody}>
              <Text style={styles.featureTitle}>Easy Search</Text>
              <Text style={styles.featureText}>Find scholarships in one place.</Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={[styles.iconCircle, styles.matchingCircle]}>
              <Text style={styles.iconEmoji}>🎯</Text>
            </View>
            <View style={styles.featureBody}>
              <Text style={styles.featureTitle}>Smart Matching</Text>
              <Text style={styles.featureText}>
                Discover scholarships based on your eligibility.
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <View style={[styles.iconCircle, styles.linksCircle]}>
              <Text style={styles.iconEmoji}>🔗</Text>
            </View>
            <View style={styles.featureBody}>
              <Text style={styles.featureTitle}>Direct Links</Text>
              <Text style={styles.featureText}>
                Visit official scholarship websites.
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B2A5B',
  },
  appBar: {
    backgroundColor: '#0B2A5B',
    paddingTop: Platform.OS === 'ios' ? 52 : 38,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  appBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flex: 1,
    marginRight: 10,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  appBarTagline: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#D0E1FD',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  authButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userLoggedInContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    maxWidth: '52%',
  },
  userGreeting: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D0E1FD',
    marginBottom: 4,
    textAlign: 'right',
  },
  logoutButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F97316',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  signInButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93C5FD',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  signUpButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F97316',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  heroSection: {
    backgroundColor: '#103B75',
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 58,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  circleLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    top: -60,
    right: -50,
  },
  circleMedium: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 153, 51, 0.06)',
    bottom: -30,
    left: -30,
  },
  circleSmall: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    top: 40,
    left: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14.5,
    color: '#D2E2FC',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginHorizontal: 18,
    marginTop: -38,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B2A5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2A5B',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  cardText: {
    fontSize: 14.5,
    color: '#55657E',
    lineHeight: 21,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#F97316',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  featuresSection: {
    marginTop: 28,
    marginHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0B2A5B',
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6EDF5',
    shadowColor: '#0B2A5B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
  },
  searchCircle: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  matchingCircle: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  linksCircle: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  iconEmoji: {
    fontSize: 22,
  },
  featureBody: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2A5B',
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  featureText: {
    fontSize: 13.5,
    color: '#55657E',
    lineHeight: 19,
  },
});
