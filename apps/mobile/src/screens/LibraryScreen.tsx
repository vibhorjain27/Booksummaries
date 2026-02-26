import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';

export function LibraryScreen() {
  const library = useQuery({ queryKey: ['library'], queryFn: () => api.getLibrary() });

  if (library.isLoading) return <ActivityIndicator style={styles.loading} />;
  if (library.error) return <Text style={styles.error}>{(library.error as Error).message}</Text>;

  const items = (library.data as any)?.items ?? [];

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Library</Text>
      <Text style={styles.subtitle}>Continue Reading, Completed, and Saved are retained indefinitely.</Text>

      {items.map((item: any) => (
        <Card key={item.book.id}>
          <Text style={styles.bookTitle}>{item.book.title}</Text>
          <Text style={styles.meta}>Author: {item.book.author}</Text>
          <Text style={styles.meta}>Status: {item.status}</Text>
          <Text style={styles.meta}>Current chapter: {item.progress.currentChapter}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  loading: { marginTop: 40 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 6 },
  subtitle: { color: colors.muted, marginBottom: 12 },
  bookTitle: { color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 6 },
  meta: { color: colors.muted },
  error: { margin: 16, color: '#B00020' }
});
