import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';

export function ProgressScreen() {
  const summary = useQuery({ queryKey: ['gamification-summary'], queryFn: () => api.getProgressSummary() });

  if (summary.isLoading) return <ActivityIndicator style={styles.loading} />;
  if (summary.error) return <Text style={styles.error}>{(summary.error as Error).message}</Text>;

  const data = summary.data as any;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Progress</Text>

      <Card>
        <Text style={styles.metric}>XP: {data?.xp ?? 0}</Text>
        <Text style={styles.metric}>Streak: {data?.streak_count ?? 0} days</Text>
        <Text style={styles.metric}>Level: {data?.level ?? 1}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Badges</Text>
        {(data?.badges ?? []).length === 0 ? <Text style={styles.meta}>No badges yet.</Text> : null}
        {(data?.badges ?? []).map((badge: any) => (
          <Text key={badge.id} style={styles.meta}>- {badge.badgeCode} ({badge.claimed ? 'claimed' : 'unclaimed'})</Text>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  loading: { marginTop: 40 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 12 },
  metric: { color: colors.text, fontSize: 18, marginBottom: 6 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  meta: { color: colors.muted },
  error: { margin: 16, color: '#B00020' }
});
