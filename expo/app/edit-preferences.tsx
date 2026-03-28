import { useRouter } from "expo-router";
import { Heart, MapPin, DollarSign, Sparkles, X } from "lucide-react-native";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useGamification } from "@/context/GamificationContext";
import type { BudgetLevel, RelationshipStage } from "@/types";

const INTERESTS = [
  "Foodie",
  "Outdoors",
  "Arts & Culture",
  "Couples Arts and crafts",
  "Nightlife",
  "Cozy & Quiet",
  "Adventure",
  "Games & Fun",
  "Learning",
  "Live Music",
  "Seasonal",
];

export default function EditPreferencesScreen() {
  const router = useRouter();
  const { preferences, updatePreferences } = useApp();
  const { addXP, completeQuest, awardBadge, trackPreferencesUpdate } = useGamification();

  const [relationshipStage, setRelationshipStage] =
    useState<RelationshipStage>(preferences.relationshipStage);
  const [city, setCity] = useState(preferences.city);
  const [interests, setInterests] = useState<string[]>(preferences.interests);
  const [budgetRange, setBudgetRange] = useState<{
    min: BudgetLevel;
    max: BudgetLevel;
  }>({ min: preferences.minBudget, max: preferences.maxBudget });
  const milesFromKm = (km: number) => Math.round((km / 1.60934) / 5) * 5;
  const clampMiles = (m: number) => Math.max(20, Math.min(100, m));
  const [distanceMiles, setDistanceMiles] = useState<number>(clampMiles(milesFromKm(preferences.radiusKm)));

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSave = async () => {
    await updatePreferences({
      relationshipStage,
      city,
      interests,
      minBudget: budgetRange.min,
      maxBudget: budgetRange.max,
      radiusKm: Math.round(distanceMiles * 1.60934),
    });
    trackPreferencesUpdate();
    addXP(40, "Updated preferences");
    completeQuest("save_preferences");
    awardBadge({ id: "dialed_in", title: "Dialed In", description: "Updated preferences", icon: "🛠️" });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Preferences</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Relationship</Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                relationshipStage === "new" && styles.optionCardSelected,
              ]}
              onPress={() => setRelationshipStage("new")}
            >
              <Text
                style={[
                  styles.optionTitle,
                  relationshipStage === "new" && styles.optionTitleSelected,
                ]}
              >
                Just Started Dating
              </Text>
              <Text style={styles.optionDescription}>
                Getting to know each other
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                relationshipStage === "established" &&
                  styles.optionCardSelected,
              ]}
              onPress={() => setRelationshipStage("established")}
            >
              <Text
                style={[
                  styles.optionTitle,
                  relationshipStage === "established" &&
                    styles.optionTitleSelected,
                ]}
              >
                In a Relationship
              </Text>
              <Text style={styles.optionDescription}>
                Keeping things fresh
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                relationshipStage === "long-term" && styles.optionCardSelected,
              ]}
              onPress={() => setRelationshipStage("long-term")}
            >
              <Text
                style={[
                  styles.optionTitle,
                  relationshipStage === "long-term" &&
                    styles.optionTitleSelected,
                ]}
              >
                Long-Term / Married
              </Text>
              <Text style={styles.optionDescription}>
                Making every date count
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="City or Zip Code"
            placeholderTextColor={Colors.textTertiary}
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Search Radius</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.distanceScroll}
            testID="distance-scroll"
          >
            {Array.from({ length: 17 }, (_, i) => 20 + i * 5).map((miles) => {
              const selected = miles === distanceMiles;
              return (
                <TouchableOpacity
                  key={miles}
                  style={[styles.distanceChip, selected && styles.distanceChipSelected]}
                  onPress={() => setDistanceMiles(miles)}
                  testID={`distance-${miles}`}
                >
                  <Text style={[styles.distanceText, selected && styles.distanceTextSelected]}>
                    {miles} mi
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Budget Range</Text>
          </View>

          <View style={styles.budgetContainer}>
            <TouchableOpacity
              style={[
                styles.budgetOption,
                budgetRange.max === "$" && styles.budgetOptionSelected,
              ]}
              onPress={() => setBudgetRange({ min: "$", max: "$" })}
            >
              <Text
                style={[
                  styles.budgetSymbol,
                  budgetRange.max === "$" && styles.budgetSymbolSelected,
                ]}
              >
                $
              </Text>
              <Text style={styles.budgetLabel}>Budget-Friendly</Text>
              <Text style={styles.budgetAmount}>Under $30</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.budgetOption,
                budgetRange.max === "$$" && styles.budgetOptionSelected,
              ]}
              onPress={() => setBudgetRange({ min: "$", max: "$$" })}
            >
              <Text
                style={[
                  styles.budgetSymbol,
                  budgetRange.max === "$$" && styles.budgetSymbolSelected,
                ]}
              >
                $$
              </Text>
              <Text style={styles.budgetLabel}>Moderate</Text>
              <Text style={styles.budgetAmount}>$30-100</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.budgetOption,
                budgetRange.max === "$$$" && styles.budgetOptionSelected,
              ]}
              onPress={() => setBudgetRange({ min: "$", max: "$$$" })}
            >
              <Text
                style={[
                  styles.budgetSymbol,
                  budgetRange.max === "$$$" && styles.budgetSymbolSelected,
                ]}
              >
                $$$
              </Text>
              <Text style={styles.budgetLabel}>All Budgets</Text>
              <Text style={styles.budgetAmount}>Any amount</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Interests</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>

          <View style={styles.interestsGrid}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestChip,
                  interests.includes(interest) && styles.interestChipSelected,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.interestText,
                    interests.includes(interest) &&
                      styles.interestTextSelected,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accent + "20",
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: Colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.card,
    padding: 18,
    borderRadius: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  budgetContainer: {
    gap: 12,
  },
  budgetOption: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
  },
  budgetOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accent + "20",
  },
  budgetSymbol: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  budgetSymbolSelected: {
    color: Colors.primary,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  distanceScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  distanceChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  distanceChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  distanceTextSelected: {
    color: "#FFF",
  },
  interestChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  interestChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  interestText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  interestTextSelected: {
    color: "#FFF",
  },
});
