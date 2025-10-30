import { useRouter } from "expo-router";
import { Trophy, Flame } from "lucide-react-native";
import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "@/constants/colors";
import { useGamification } from "@/context/GamificationContext";

export default function XPHeader() {
  const router = useRouter();
  const { state } = useGamification();

  const levelLabel = useMemo(() => `Lv ${state.level}`, [state.level]);
  const progressWidth = Math.max(4, Math.round(state.levelProgress * 100));

  return (
    <View style={styles.container} testID="xp-header">
      <View style={styles.left}>
        <Text style={styles.level} testID="xp-level">{levelLabel}</Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${progressWidth}%` }]} />
        </View>
        <Text style={styles.xpText} testID="xp-total">{state.xp} XP</Text>
      </View>

      <View style={styles.right}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push({ pathname: "/quests" })}
          testID="open-quests"
        >
          <Flame size={18} color={Colors.primary} />
          <Text style={styles.iconLabel}>{state.streakDays}d</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push({ pathname: "/badges" })}
          testID="open-badges"
        >
          <Trophy size={18} color={Colors.primary} />
          <Text style={styles.iconLabel}>{state.badges.length}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  left: {
    flex: 1,
  },
  level: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  barBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  xpText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.text,
  },
});
