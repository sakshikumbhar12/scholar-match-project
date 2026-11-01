import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('student');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace('/sign-in');
          return;
        }

        const uid = session.user.id;
        setUserId(uid);

        // Fetch user's row from public.profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, role')
          .eq('id', uid)
          .single();

        if (isMounted) {
          if (profile) {
            setFullName(profile.full_name || '');
            setEmail(profile.email || session.user.email || '');
            setRole(profile.role || 'student');
          } else {
            // If profile row does not exist yet, fallback to session values
            setFullName(session.user.user_metadata?.full_name || '');
            setEmail(session.user.email || '');
            setRole('student');
          }
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setStatusMessage(null);

    if (!fullName.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Full name cannot be empty.',
      });
      return;
    }

    setSaving(true);

    try {
      // Update ONLY the full_name column of their own row
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', userId);

      if (error) {
        setStatusMessage({
          type: 'error',
          text: error.message || 'Failed to update profile.',
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: 'Profile updated successfully!',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Something went wrong while saving profile.',
      });
    } finally {
      setSaving(false);
    }
  };

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
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2447A8" />

      {/* Tricolor Accent */}
      <View style={styles.tricolorStripe}>
        <View style={[styles.tricolorBand, { backgroundColor: '#FF9933' }]} />
        <View style={[styles.tricolorBand, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.tricolorBand, { backgroundColor: '#138808' }]} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {fullName ? fullName.charAt(0).toUpperCase() : '👤'}
            </Text>
          </View>
          <Text style={styles.nameHeader}>{fullName || 'Student User'}</Text>
          <Text style={styles.roleTag}>{role.toUpperCase()}</Text>
        </View>

        {/* Status Message Banner */}
        {statusMessage && (
          <View
            style={[
              styles.statusBanner,
              statusMessage.type === 'success'
                ? styles.statusSuccess
                : styles.statusError,
            ]}
          >
            <Text style={styles.statusIcon}>
              {statusMessage.type === 'success' ? '✅' : '⚠️'}
            </Text>
            <Text style={styles.statusText}>{statusMessage.text}</Text>
          </View>
        )}

        {/* Profile Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Details</Text>

          {/* Read-Only Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address (Read-only)</Text>
            <View style={styles.readOnlyWrapper}>
              <Text style={styles.fieldIcon}>✉️</Text>
              <Text style={styles.readOnlyText}>{email || 'Not specified'}</Text>
            </View>
          </View>

          {/* Read-Only Role */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Account Role (Read-only)</Text>
            <View style={styles.readOnlyWrapper}>
              <Text style={styles.fieldIcon}>🛡️</Text>
              <Text style={styles.readOnlyText}>
                {role === 'admin' ? 'Administrator' : 'Student'}
              </Text>
            </View>
          </View>

          {/* Editable Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name (Editable)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldIcon}>👤</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <Text style={styles.helpText}>
              You can modify your full name here. Tap save to apply.
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutButtonText}>🚪 Logout from Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2447A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#2447A8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nameHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: '#071E42',
    marginBottom: 6,
  },
  roleTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2447A8',
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    letterSpacing: 0.5,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  statusError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  statusText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#071E42',
    marginBottom: 18,
    letterSpacing: -0.2,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  readOnlyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  readOnlyText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  fieldIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 11,
    fontSize: 15,
    color: '#0F172A',
  },
  helpText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#2447A8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#2447A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },
});
