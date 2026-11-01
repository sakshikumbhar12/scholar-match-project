import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

interface ScholarshipItem {
  id: string;
  name: string;
  portal?: string;
  verified?: boolean;
  eligibility_verified?: boolean;
  state?: string;
}

export default function AdminDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [scholarships, setScholarships] = useState<ScholarshipItem[]>([]);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function verifyAdminAndFetchData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace('/admin-login' as any);
          return;
        }

        // Check user role in public.profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile || profile.role !== 'admin') {
          router.replace('/admin-login' as any);
          return;
        }

        if (isMounted) {
          setAdminEmail(session.user.email || 'Admin');
        }

        // Load scholarships from public.scholarships
        const { data } = await supabase
          .from('scholarships')
          .select('*')
          .order('name', { ascending: true });

        if (isMounted) {
          if (data) {
            setScholarships(data);
          }
        }
      } catch (err) {
        console.error('Admin dashboard verification error:', err);
        router.replace('/admin-login' as any);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifyAdminAndFetchData();

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
        <Text style={styles.loadingText}>Verifying administrator privileges...</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: ScholarshipItem }) => {
    const isVerified = Boolean(item.eligibility_verified ?? item.verified);

    return (
      <View style={styles.scholarshipCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.scholarshipName} numberOfLines={2}>
            {item.name}
          </Text>
          <View
            style={[
              styles.verifiedBadge,
              isVerified ? styles.badgeYes : styles.badgeNo,
            ]}
          >
            <Text
              style={[
                styles.verifiedBadgeText,
                isVerified ? styles.textYes : styles.textNo,
              ]}
            >
              {isVerified ? 'Verified: Yes' : 'Verified: No'}
            </Text>
          </View>
        </View>

        <View style={styles.cardMetaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Portal</Text>
            <Text style={styles.metaValue}>{item.portal || 'Direct / General'}</Text>
          </View>
          {item.state && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>State</Text>
              <Text style={styles.metaValue}>{item.state}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#2447A8" />

      {/* Tricolor Stripe Accent */}
      <View style={styles.tricolorStripe}>
        <View style={[styles.tricolorBand, { backgroundColor: '#FF9933' }]} />
        <View style={[styles.tricolorBand, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.tricolorBand, { backgroundColor: '#138808' }]} />
      </View>

      <FlatList
        data={scholarships}
        keyExtractor={(item, index) => item.id || String(index)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            {/* Top Admin Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.badgeRow}>
                <View style={styles.adminTag}>
                  <Text style={styles.adminTagText}>🛡️ ADMIN PANEL</Text>
                </View>
                <Text style={styles.adminEmailText}>{adminEmail}</Text>
              </View>

              <Text style={styles.title}>Admin Dashboard</Text>
              <Text style={styles.subtitle}>
                Overview of current verified and pending scholarships in database.
              </Text>

              {/* Total Scholarships Metric */}
              <View style={styles.metricContainer}>
                <Text style={styles.metricLabel}>Total Scholarships</Text>
                <Text style={styles.metricValue}>{scholarships.length}</Text>
              </View>

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.85}
              >
                <Text style={styles.logoutButtonText}>🚪 Logout</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listHeaderRow}>
              <Text style={styles.sectionTitle}>
                Scholarships List ({scholarships.length})
              </Text>
              <Text style={styles.readOnlyNote}>Read-only mode</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>No scholarships found in database.</Text>
          </View>
        }
      />
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
  listContent: {
    padding: 18,
    paddingBottom: 40,
  },
  headerArea: {
    marginBottom: 16,
  },
  summaryCard: {
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
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  adminTag: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  adminTagText: {
    color: '#2447A8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  adminEmailText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#071E42',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 18,
  },
  metricContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2447A8',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  readOnlyNote: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  scholarshipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  scholarshipName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 10,
    lineHeight: 20,
  },
  verifiedBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeYes: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  badgeNo: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textYes: {
    color: '#15803D',
  },
  textNo: {
    color: '#B45309',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaItem: {
    marginRight: 20,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
});
