import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Trophy } from "lucide-react-native";
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useGamification } from "@/context/GamificationContext";

export default function BadgesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state } = useGamification();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Badges",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your Badges</Text>
        <View style={styles.grid}>
          {state.badges.length === 0 ? (
            <View style={styles.empty}>
              <Trophy size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No badges yet</Text>
              <Text style={styles.emptySubtitle}>Complete quests to earn badges</Text>
            </View>
          ) : (
            state.badges.map((b) => (
              <View key={b.id} style={styles.badge} testID={`badge-${b.id}`}>
                <Text style={styles.badgeIcon}>{b.icon}</Text>
                <Text style={styles.badgeTitle}>{b.title}</Text>
                <Text style={styles.badgeDate}>{new Date(b.earnedAt).toLocaleDateString()}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: "700" as const, color: Colors.text },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  badge: {
    width: "48%",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    gap: 6,
  },
  badgeIcon: { fontSize: 28 },
  badgeTitle: { fontSize: 14, fontWeight: "700" as const, color: Colors.text, textAlign: "center" },
  badgeDate: { fontSize: 12, color: Colors.textSecondary },
  empty: { paddingVertical: 60, alignItems: "center", gap: 8, width: "100%" },
  emptyTitle: { fontSize: 18, fontWeight: "700" as const, color: Colors.text },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary },
});
