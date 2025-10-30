import { Stack, useRouter } from "expo-router";
import { ArrowLeft, CheckCircle } from "lucide-react-native";
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useGamification } from "@/context/GamificationContext";

export default function QuestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, completeQuest } = useGamification();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Quests",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Daily & Core Quests</Text>
        <View style={styles.list}>
          {state.quests.map((q) => {
            const completed = !!q.completedAt || q.progress >= q.target;
            const pct = Math.round((q.progress / q.target) * 100);
            return (
              <View key={q.id} style={styles.card} testID={`quest-${q.id}`}>
                <View style={styles.rowTop}>
                  <Text style={styles.cardTitle}>{q.title}</Text>
                  {completed ? (
                    <CheckCircle size={20} color={Colors.success} />
                  ) : (
                    <Text style={styles.xp}>+{q.xp} XP</Text>
                  )}
                </View>
                <Text style={styles.desc}>{q.description}</Text>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
                <View style={styles.rowBottom}>
                  <Text style={styles.meta}>{q.progress}/{q.target}</Text>
                  {!completed && (
                    <TouchableOpacity
                      style={styles.completeBtn}
                      onPress={() => completeQuest(q.id)}
                      testID={`complete-${q.id}`}
                    >
                      <Text style={styles.completeText}>Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: "700" as const, color: Colors.text },
  list: { gap: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 16, fontWeight: "700" as const, color: Colors.text },
  desc: { fontSize: 14, color: Colors.textSecondary },
  progressBg: { height: 8, backgroundColor: Colors.border, borderRadius: 6, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: Colors.primary },
  rowBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  meta: { fontSize: 12, color: Colors.textSecondary },
  xp: { fontSize: 12, color: Colors.primary, fontWeight: "700" as const },
  completeBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: Colors.primary, borderRadius: 10 },
  completeText: { color: "#FFF", fontSize: 12, fontWeight: "700" as const },
});
