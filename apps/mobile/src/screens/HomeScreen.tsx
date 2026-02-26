import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';

export function HomeScreen() {
  const activeQuery = useQuery({
    queryKey: ['daily-active'],
    queryFn: () => api.getDailyActive()
  });

  if (activeQuery.isLoading) return <ActivityIndicator style={styles.loading} />;
  if (activeQuery.error) return <Text style={styles.error}>{(activeQuery.error as Error).message}</Text>;

  const payload = activeQuery.data as any;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Today</Text>

      <Card>
        <Text style={styles.cardLabel}>Active Book</Text>
        <Text style={styles.cardTitle}>{payload?.book?.title ?? 'No active assignment'}</Text>
        <Text style={styles.cardBody}>Remaining minutes: {Math.max(0, 60 - Math.floor((payload?.progress?.readingSeconds ?? 0) / 60))}</Text>
      </Card>

      <Card>
        <Text style={styles.cardLabel}>Progress Snapshot</Text>
        <Text style={styles.cardBody}>Current chapter: {payload?.progress?.currentChapter ?? 0}</Text>
        <Text style={styles.cardBody}>Completed chapters: {(payload?.progress?.completedChapterIds ?? []).length}</Text>
      </Card>

      <Card>
        <Text style={styles.cardLabel}>Daily Plan</Text>
        <Text style={styles.cardBody}>Read 2 chapters in the morning, 2 at lunch, 2 in the evening.</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  loading: { marginTop: 40 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 12 },
  cardLabel: { color: colors.accent, fontWeight: '600', marginBottom: 6 },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 6 },
  cardBody: { color: colors.muted },
  error: { margin: 16, color: '#B00020' }
});
