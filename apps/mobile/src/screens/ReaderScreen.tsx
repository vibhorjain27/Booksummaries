import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';

export function ReaderScreen() {
  const active = useQuery({ queryKey: ['daily-active'], queryFn: () => api.getDailyActive() });

  const bookId = (active.data as any)?.book?.id;
  const distillation = useQuery({
    queryKey: ['distillation', bookId],
    queryFn: () => api.getDistillation(bookId),
    enabled: Boolean(bookId)
  });

  if (active.isLoading || distillation.isLoading) return <ActivityIndicator style={styles.loading} />;
  if (active.error) return <Text style={styles.error}>{(active.error as Error).message}</Text>;
  if (distillation.error) return <Text style={styles.error}>{(distillation.error as Error).message}</Text>;

  const data = distillation.data as any;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Reader</Text>
      <Card>
        <Text style={styles.sectionTitle}>Book Summary</Text>
        <Text style={styles.body}>{data?.book_summary}</Text>
      </Card>

      {(data?.chapter_summaries ?? []).map((chapter: any) => (
        <Card key={chapter.id}>
          <Text style={styles.sectionTitle}>{chapter.chapterNumber}. {chapter.title}</Text>
          <Text style={styles.body}>{chapter.summary}</Text>
          <Text style={styles.context}>Why it matters: {chapter.contextWhyItMatters}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  loading: { marginTop: 40 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  body: { color: colors.text, lineHeight: 20 },
  context: { color: colors.warning, marginTop: 8 },
  error: { margin: 16, color: '#B00020' }
});
