import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';

export function ProfileScreen() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile & Settings</Text>

      <Card>
        <Text style={styles.sectionTitle}>Reading Goal</Text>
        <Text style={styles.body}>120 books/year, 60 minutes/day.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={styles.body}>Daily drop: 6:00 AM local time</Text>
        <Text style={styles.body}>Resume reminder: 24 hours inactive</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.body}>Synced cloud profile: demo@distill.app</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontWeight: '700', marginBottom: 6 },
  body: { color: colors.muted }
});
