import { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import scholarships from '../data/scholarships.json';
import { supabase } from '../lib/supabase';
type Scholarship = {
  id: string | number;
  name: string;
  portal?: string;
  state?: string;
  categories?: string[];
  economicGroups?: string[];
  educationLevels?: string[];
  annualIncomeLimit?: number | null;
  eligibility?: string[];
  officialUrl?: string;
};

export default function StudentDetailsScreen() {
  const [name, setName] = useState('');
  const [education, setEducation] = useState('');
  const [marks, setMarks] = useState('');
  const [income, setIncome] = useState('');
  const [category, setCategory] = useState('');
  const [economicGroup, setEconomicGroup] = useState('None');
  const [state, setState] = useState('Maharashtra');
  const [results, setResults] = useState<Scholarship[] | null>(null);

  const findScholarships = async () => {
    if (
      !name.trim() ||
      !education.trim() ||
      !marks.trim() ||
      !income.trim() ||
      !category.trim() ||
      !state.trim()
    ) {
      Alert.alert('Missing Details', 'Please fill in all fields.');
      return;
    }

    const annualIncome = Number(income);

    if (!Number.isFinite(annualIncome) || annualIncome < 0) {
      Alert.alert('Invalid Income', 'Enter valid annual family income.');
      return;
    }

    const course = education.trim().toLowerCase();
    const studentCategory = category.trim().toUpperCase();
    const studentEconomicGroup = economicGroup.toUpperCase();
    const studentState = state.trim().toLowerCase();

    let data: Scholarship[] = scholarships as Scholarship[];

    try {
      const { data: rows, error } = await supabase
        .from('scholarships')
        .select('*');

      if (error) {
        console.log('Supabase error:', error.message);
      }

      if (!error && rows && rows.length > 0) {
        data = rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          portal: r.portal ?? undefined,
          state: r.state ?? undefined,
          categories: r.categories ?? [],
          economicGroups: r.economic_groups ?? [],
          educationLevels: r.education_levels ?? [],
          annualIncomeLimit: r.annual_income_limit,
          eligibility: r.eligibility ?? [],
          officialUrl: r.official_url ?? undefined,
        }));
      }
    } catch (e: any) {
      console.log('Supabase catch:', String(e?.message ?? e));
    }

    const matches = data.filter((item) => {
      const schemeState = (item.state ?? '').toLowerCase();

      const stateMatches =
        schemeState === 'all india' ||
        schemeState === 'india' ||
        schemeState === studentState;

      const categoryMatches =
        (item.categories ?? []).length === 0 ||
        (item.categories ?? []).some(
          (c) =>
            c.trim().toUpperCase() === studentCategory ||
            c.trim().toUpperCase() === 'ALL'
        );

      const groups = item.economicGroups ?? [];

      const economicGroupMatches =
        groups.length === 0 ||
        groups.some((g) => g.toUpperCase() === studentEconomicGroup);

      const educationMatches = (item.educationLevels ?? []).some(
        (level) => {
          const l = level.toLowerCase();

          if (l.includes('post-matric')) {
            return /diploma|b\.?\s?tech|bachelor|degree|college|undergraduate|postgraduate|m\.?\s?tech|mba|mca/i.test(course);
          }

          if (l.includes('diploma')) {
            return /diploma|polytechnic/i.test(course);
          }

          if (l.includes('postgraduate')) {
            return /postgraduate|master|m\.?\s?tech|mba|mca|m\.?\s?sc/i.test(course);
          }

          if (l.includes('degree') || l.includes('technical')) {
            return /degree|b\.?\s?tech|bachelor|engineering|technical/i.test(course);
          }

          return course.includes(l);
        }
      );

      const incomeMatches =
        item.annualIncomeLimit == null ||
        annualIncome <= item.annualIncomeLimit;

      return (
        stateMatches &&
        categoryMatches &&
        economicGroupMatches &&
        educationMatches &&
        incomeMatches
      );
    });

    setResults(matches);
  };

  const isValidUrl = (urlString?: string): boolean => {
    if (!urlString || typeof urlString !== 'string') {
      return false;
    }

    const trimmed = urlString.trim();
    if (!trimmed) {
      return false;
    }

    try {
      const parsed = new URL(trimmed);
      return (
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        Boolean(parsed.hostname)
      );
    } catch {
      return false;
    }
  };

  const handleApplyNow = async (url?: string) => {
    if (!url || typeof url !== 'string' || !url.trim()) {
      Alert.alert(
        'Missing URL',
        'Official scholarship application link is not available.'
      );
      return;
    }

    const trimmedUrl = url.trim();

    if (!isValidUrl(trimmedUrl)) {
      Alert.alert(
        'Invalid URL',
        'The official scholarship URL is invalid or malformed.'
      );
      return;
    }

    try {
      const supported = await Linking.canOpenURL(trimmedUrl);
      if (!supported) {
        Alert.alert(
          'Invalid URL',
          'Cannot open this scholarship application link on this device.'
        );
        return;
      }

      await Linking.openURL(trimmedUrl);
    } catch {
      Alert.alert(
        'Unable to Open Link',
        'Could not open the official scholarship website. Please try again later.'
      );
    }
  };

  const openPortal = handleApplyNow;


  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Student Details 🎓</Text>

      <Text style={styles.subtitle}>
        Enter your details to find possible scholarships.
      </Text>

      <Text style={styles.label}>Student Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Education Level</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. B.Tech, Diploma"
        value={education}
        onChangeText={setEducation}
      />

      <Text style={styles.label}>Percentage or CGPA</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 8.5 CGPA"
        value={marks}
        onChangeText={setMarks}
        keyboardType="default"
      />

      <Text style={styles.label}>Annual Family Income (₹)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 200000"
        value={income}
        onChangeText={setIncome}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.options}>
        {['Open', 'OBC', 'SC', 'ST', 'SBC'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.option,
              category === item && styles.selectedOption,
            ]}
            onPress={() => {
              setCategory(item);
              setResults(null);
            }}
          >
            <Text
              style={[
                styles.optionText,
                category === item && styles.selectedOptionText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Economic Group</Text>
      <View style={styles.options}>
        {['None', 'EBC', 'EWS'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.option,
              economicGroup === item && styles.selectedOption,
            ]}
            onPress={() => {
              setEconomicGroup(item);
              setResults(null);
            }}
          >
            <Text
              style={[
                styles.optionText,
                economicGroup === item && styles.selectedOptionText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.smallNote}>
        Select EBC or EWS only if applicable and if you meet the official
        scheme requirements.
      </Text>

      <Text style={styles.label}>State</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Maharashtra"
        value={state}
        onChangeText={setState}
      />

      <TouchableOpacity style={styles.button} onPress={findScholarships}>
        <Text style={styles.buttonText}>Find Scholarships</Text>
      </TouchableOpacity>

      {results !== null && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>
            Possible Scholarship Matches
          </Text>

          <Text style={styles.note}>
            These are preliminary matches only. Check the official scheme
            rules before applying.
          </Text>

          {results.length === 0 ? (
            <Text style={styles.empty}>
              No matching scholarships found. Check your details or dataset.
            </Text>
          ) : (
            results.map((item) => (
              <View key={String(item.id)} style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.meta}>
                  Portal: {item.portal ?? 'Not specified'}
                </Text>
                <Text style={styles.meta}>
                  State: {item.state ?? 'Not specified'}
                </Text>

                <Text style={styles.cardHeading}>
                  Eligibility conditions to check:
                </Text>

                {(item.eligibility ?? []).map((condition, index) => (
                  <Text
                    key={`${String(item.id)}-${index}`}
                    style={styles.condition}
                  >
                    {'• '}{condition}
                  </Text>
                ))}

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => handleApplyNow(item.officialUrl)}
                >
                  <Text style={styles.applyButtonText}>Apply Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => openPortal(item.officialUrl)}
                >
                  <Text style={styles.linkText}>
                    Visit Official Portal ↗
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F6FF',
  },
  container: {
    flexGrow: 1,
    padding: 22,
    paddingTop: 35,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2447A8',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#58647A',
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18264A',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8DFEF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    fontSize: 16,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 18,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8DFEF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9,
  },
  selectedOption: {
    backgroundColor: '#2447A8',
    borderColor: '#2447A8',
  },
  optionText: {
    color: '#18264A',
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  smallNote: {
    color: '#58647A',
    fontSize: 12,
    lineHeight: 18,
    marginTop: -8,
    marginBottom: 18,
  },
  button: {
    backgroundColor: '#2447A8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  results: {
    marginBottom: 30,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2447A8',
    marginBottom: 12,
  },
  note: {
    color: '#58647A',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  empty: {
    color: '#18264A',
    fontSize: 16,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D8DFEF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18264A',
    marginBottom: 10,
  },
  meta: {
    color: '#58647A',
    fontSize: 14,
    marginBottom: 6,
  },
  cardHeading: {
    color: '#18264A',
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  condition: {
    color: '#58647A',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 5,
  },
  applyButton: {
    backgroundColor: '#2447A8',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    backgroundColor: '#EAF0FA',
    borderWidth: 1,
    borderColor: '#2447A8',
    padding: 12,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    color: '#2447A8',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
