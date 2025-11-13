import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CandidateCard } from '@/components/candidates/CandidateCard';
import { TabView } from '@/components/candidates/TabView';
import { CandidateStatus } from '@/types/candidate';
import { candidatesService } from '@/services/candidatesService';
import type { Candidate } from '@/types/candidate';

export default function CandidatesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<CandidateStatus | 'all'>('all');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filters: Array<{ label: string; value: CandidateStatus | 'all' }> = [
    { label: 'All', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'Screening', value: 'screening' },
    { label: 'Interview', value: 'interview' },
    { label: 'Offer', value: 'offer' },
  ];

  // Load candidates on mount and subscribe to realtime
  useEffect(() => {
    loadCandidates();

    // Subscribe to realtime updates
    const unsubscribe = candidatesService.subscribeToAllCandidates((candidate) => {
      console.log('Realtime update received:', candidate);
      setCandidates((prev) => {
        const exists = prev.find((c) => c.id === candidate.id);
        if (exists) {
          // Update existing candidate
          return prev.map((c) => (c.id === candidate.id ? candidate : c));
        } else {
          // Add new candidate
          return [candidate, ...prev];
        }
      });
    });

    return unsubscribe;
  }, []);

  // Reload when screen comes into focus (after adding candidate)
  useFocusEffect(
    React.useCallback(() => {
      loadCandidates();
    }, [])
  );

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await candidatesService.getAllCandidates();
      console.log('Loaded candidates:', data.length);
      setCandidates(data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
      Alert.alert('Error', 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCandidates();
    setRefreshing(false);
  };

  const getFilteredCandidates = (filter: CandidateStatus | 'all') => {
    return candidates.filter((candidate: any) => {
      const matchesSearch =
        candidate.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.position?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = filter === 'all' || candidate.status === filter;

      return matchesSearch && matchesFilter;
    });
  };

  const renderCandidatesList = (filter: CandidateStatus | 'all') => {
    const filteredCandidates = getFilteredCandidates(filter);

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading candidates...
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredCandidates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CandidateCard candidate={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {candidates.length === 0 
                ? 'No candidates yet. Tap + to add one!' 
                : 'No candidates match your search'}
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[BrandColors.teal[500], BrandColors.teal[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>RecruitFlow</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/add-candidate')}
          >
            <Ionicons name="add-circle" size={32} color={BrandColors.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="search" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search candidates..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.icon} />
            </TouchableOpacity>
          )}
        </View>

        {/* Wave decoration */}
        <View style={styles.waveContainer}>
          <View style={[styles.wave, { backgroundColor: colors.background }]} />
        </View>
      </LinearGradient>

      {/* Tabs */}
      <TabView
        tabs={[
          { key: 'all', label: 'All' },
          { key: 'new', label: 'New' },
          { key: 'screening', label: 'Screening' },
          { key: 'interview', label: 'Interview' },
          { key: 'offer', label: 'Offer' },
        ]}
      >
        {{
          all: renderCandidatesList('all'),
          new: renderCandidatesList('new'),
          screening: renderCandidatesList('screening'),
          interview: renderCandidatesList('interview'),
          offer: renderCandidatesList('offer'),
        }}
      </TabView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: BrandColors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: BrandColors.teal[50],
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: -50,
    right: -50,
    height: 60,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  filtersContainer: {
    paddingVertical: 16,
  },
  filtersList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
