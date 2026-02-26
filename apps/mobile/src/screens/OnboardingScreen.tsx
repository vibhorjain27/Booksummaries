import React from 'react';
import { ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<any, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Welcome to OneHour Distill</Text>
      <Text style={styles.subtitle}>Set your reading system once and receive one active 1-hour book daily.</Text>

      <Card>
        <Text style={styles.cardTitle}>Books per year goal</Text>
        <Text style={styles.cardBody}>Default: 120 books/year (editable in Profile).</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Daily pace</Text>
        <Text style={styles.cardBody}>Default: 60 min/day with chapter-level progress memory.</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Notifications</Text>
        <Text style={styles.cardBody}>Daily 6:00 AM drop + 24-hour resume reminder.</Text>
      </Card>

      <Pressable onPress={() => navigation.replace('Main')} style={styles.button}>
        <Text style={styles.buttonText}>Start Reading</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 6 },
  cardBody: { color: colors.muted },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700'
  }
});
