import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

export default function IndexScreen() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);
  const [profileName, setProfileName] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          if (isMounted) {
            setCurrentUser(session.user);
          }

          // Fetch profile role and name from public.profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', session.user.id)
            .single();

          if (isMounted) {
            setUserRole(profile?.role || 'student');
            setProfileName(
              profile?.full_name ||
                session.user.user_metadata?.full_name ||
                session.user.email?.split('@')[0] ||
                'User'
            );
          }
        } else {
          if (isMounted) {
            setCurrentUser(null);
            setUserRole(null);
            setProfileName('');
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', session.user.id)
          .single();

        setUserRole(profile?.role || 'student');
        setProfileName(
          profile?.full_name ||
            session.user.user_metadata?.full_name ||
            session.user.email?.split('@')[0] ||
            'User'
        );
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setProfileName('');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleGoToDashboard = () => {
    if (userRole === 'admin') {
      router.push('/admin-dashboard' as any);
    } else {
      router.push('/student-dashboard' as any);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setUserRole(null);
      setProfileName('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#071E42" />
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>🎓</Text>
        </View>
        <Text style={styles.splashTitle}>ScholarMatch</Text>
        <Text style={styles.splashTagline}>Scholarship Discovery Portal</Text>
        <ActivityIndicator size="large" color="#FF9933" style={{ marginTop: 28 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071E42" />

      {/* Indian National Tricolor Accent Stripe */}
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
        {/* Top Header & Branding */}
        <View style={styles.heroSection}>
          <View style={styles.glowCircle1} />
          <View style={styles.glowCircle2} />

          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeEmoji}>🎓</Text>
            </View>
            <View>
              <Text style={styles.brandName}>ScholarMatch</Text>
              <Text style={styles.brandSub}>Government & Private Scholarships</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Unlock Your Future</Text>
          <Text style={styles.heroSubtitle}>
            Discover verified scholarships matched to your education, caste category, and annual family income.
          </Text>
        </View>

        {/* Main Action Card */}
        <View style={styles.authCard}>
          {currentUser ? (
            /* ================= LOGGED IN STATE ================= */
            <View style={styles.cardContent}>
              <View style={styles.userBadgeRow}>
                <View style={styles.userAvatarCircle}>
                  <Text style={styles.userAvatarEmoji}>
                    {userRole === 'admin' ? '🛡️' : '🎓'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.welcomeUserGreeting}>Welcome Back,</Text>
                  <Text style={styles.welcomeUserName} numberOfLines={1}>
                    {profileName}
                  </Text>
                  <Text style={styles.userRoleTag}>
                    {userRole === 'admin' ? 'ADMINISTRATOR' : 'STUDENT ACCOUNT'}
                  </Text>
                </View>
              </View>

              <Text style={styles.signedInEmailText}>
                Signed in as: {currentUser.email}
              </Text>

              {/* Go to Dashboard CTA */}
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={handleGoToDashboard}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionButtonText}>
                  Go to Dashboard →
                </Text>
              </TouchableOpacity>

              {/* Find Scholarships CTA */}
              <TouchableOpacity
                style={styles.findScholarshipsButton}
                onPress={() => router.push('/student-details')}
                activeOpacity={0.85}
              >
                <Text style={styles.findButtonEmoji}>🔍</Text>
                <Text style={styles.findScholarshipsButtonText}>
                  Find Scholarships
                </Text>
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.85}
              >
                <Text style={styles.logoutButtonText}>🚪 Logout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ================= LOGGED OUT STATE ================= */
            <View style={styles.cardContent}>
              <Text style={styles.portalTitle}>Student & Admin Portal</Text>
              <Text style={styles.portalSubtitle}>
                Log in to view personalized scholarship matches, save eligibility, and manage portal schemes.
              </Text>

              {/* Button 1: Student Login */}
              <TouchableOpacity
                style={styles.studentLoginButton}
                onPress={() => router.push('/sign-in')}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonEmoji}>🎓</Text>
                <Text style={styles.studentLoginButtonText}>Student Login</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </TouchableOpacity>

              {/* Button 2: Sign Up */}
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => router.push('/sign-up' as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonEmoji}>✨</Text>
                <Text style={styles.signUpButtonText}>Sign Up</Text>
                <Text style={styles.buttonArrowDark}>→</Text>
              </TouchableOpacity>

              {/* Button 3: Find Scholarships */}
              <TouchableOpacity
                style={styles.findScholarshipsButton}
                onPress={() => router.push('/student-details')}
                activeOpacity={0.85}
              >
                <Text style={styles.findButtonEmoji}>🔍</Text>
                <Text style={styles.findScholarshipsButtonText}>
                  Find Scholarships
                </Text>
                <Text style={styles.buttonArrowBlue}>→</Text>
              </TouchableOpacity>

              {/* Divider for Admin */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ADMINISTRATOR ACCESS</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Button 4: Smaller Admin Login */}
              <TouchableOpacity
                style={styles.adminLoginButton}
                onPress={() => router.push('/admin-login' as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.adminEmoji}>🛡️</Text>
                <Text style={styles.adminLoginText}>Admin Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Feature Highlights / Trust Badges */}
        <View style={styles.highlightsContainer}>
          <Text style={styles.highlightsTitle}>Why Register with ScholarMatch?</Text>

          <View style={styles.highlightCard}>
            <Text style={styles.highlightIcon}>🏛️</Text>
            <View style={styles.highlightTextContainer}>
              <Text style={styles.highlightHeadline}>Verified Government & Trust Schemes</Text>
              <Text style={styles.highlightDesc}>
                Direct links to NSP, MahaDBT, UP Scholarship & Tata Trusts.
              </Text>
            </View>
          </View>

          <View style={styles.highlightCard}>
            <Text style={styles.highlightIcon}>🎯</Text>
            <View style={styles.highlightTextContainer}>
              <Text style={styles.highlightHeadline}>Personalized Smart Match</Text>
              <Text style={styles.highlightDesc}>
                Calculates eligibility using marks, category, state, and income.
              </Text>
            </View>
          </View>

          <View style={styles.highlightCard}>
            <Text style={styles.highlightIcon}>🔒</Text>
            <View style={styles.highlightTextContainer}>
              <Text style={styles.highlightHeadline}>100% Free & Secure</Text>
              <Text style={styles.highlightDesc}>
                No fees, no middlemen. Direct student-to-portal scholarship assistance.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🇮🇳 ScholarMatch • Built for Indian Students Nationwide
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071E42',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#071E42',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#FF9933',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#FF9933',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 42,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  splashTagline: {
    fontSize: 14,
    color: '#93C5FD',
    marginTop: 6,
    fontWeight: '500',
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    backgroundColor: '#071E42',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 48 : 34,
    paddingBottom: 48,
    position: 'relative',
    overflow: 'hidden',
  },
  glowCircle1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(37, 99, 235, 0.18)',
    top: -80,
    right: -60,
  },
  glowCircle2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    bottom: -30,
    left: -40,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandBadgeEmoji: {
    fontSize: 22,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  brandSub: {
    fontSize: 11.5,
    color: '#BAE6FD',
    fontWeight: '500',
    marginTop: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 21,
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: -26,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#071E42',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardContent: {
    width: '100%',
  },
  portalTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#071E42',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  portalSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 20,
  },
  userBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  userAvatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  userAvatarEmoji: {
    fontSize: 24,
  },
  welcomeUserGreeting: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  welcomeUserName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#071E42',
    letterSpacing: -0.2,
  },
  userRoleTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2447A8',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  signedInEmailText: {
    fontSize: 13,
    color: '#64748B',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  studentLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2447A8',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#2447A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  studentLoginButtonText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    marginLeft: 10,
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  signUpButtonText: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15.5,
    fontWeight: '700',
    marginLeft: 10,
  },
  primaryActionButton: {
    backgroundColor: '#2447A8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#2447A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  findScholarshipsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  findScholarshipsButtonText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1D4ED8',
    marginLeft: 8,
  },
  findButtonEmoji: {
    fontSize: 16,
  },
  buttonEmoji: {
    fontSize: 18,
  },
  buttonArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonArrowDark: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
  },
  buttonArrowBlue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    marginTop: 4,
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 14.5,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    paddingHorizontal: 10,
  },
  adminLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adminEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  adminLoginText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  highlightsContainer: {
    marginTop: 26,
    paddingHorizontal: 18,
  },
  highlightsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#071E42',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#071E42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  highlightIcon: {
    fontSize: 22,
    marginRight: 12,
    marginTop: 2,
  },
  highlightTextContainer: {
    flex: 1,
  },
  highlightHeadline: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  highlightDesc: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
});