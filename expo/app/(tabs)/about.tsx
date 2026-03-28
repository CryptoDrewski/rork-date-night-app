import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  const today = useMemo(() => {
    try {
      return new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return new Date().toDateString();
    }
  }, []);

  return (
    <View style={styles.container} testID="about-screen">
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: 32 + insets.top }]}
        showsVerticalScrollIndicator={false}
        testID="about-scroll"
      >
        <View style={styles.headerWrap}>
          <Text style={styles.appName} testID="about-app-name">Date Night</Text>
          <Text style={styles.byline} testID="about-byline">by Andrew Topp</Text>
        </View>

        <View style={styles.card} testID="about-card">
          <View style={styles.row}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.value} accessibilityLabel={`Created on ${today}`}>
              {today}
            </Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.rights} testID="about-rights">
            All rights are reserved.
          </Text>
        </View>

        <Text style={styles.footerNote}>
          © {new Date().getFullYear()} Date Night. All Rights Reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    gap: 20,
  },
  headerWrap: {
    alignItems: "center",
    gap: 6,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  byline: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
  value: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "700" as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  rights: {
    fontSize: 14,
    color: Colors.text,
  },
  footerNote: {
    textAlign: "center",
    color: Colors.textTertiary,
    fontSize: 12,
    marginTop: 8,
  },
});
