import { useRouter } from "expo-router";
import { Heart, MapPin, DollarSign, Sparkles } from "lucide-react-native";
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

export default function OnboardingScreen() {
  const router = useRouter();
  const { updatePreferences } = useApp();
  const { addXP, completeQuest, awardBadge } = useGamification();
  const [step, setStep] = useState(0);

  const [relationshipStage, setRelationshipStage] =
    useState<RelationshipStage>("new");
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<{
    min: BudgetLevel;
    max: BudgetLevel;
  }>({ min: "$", max: "$$$" });

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleComplete = async () => {
    await updatePreferences({
      relationshipStage,
      city,
      interests,
      minBudget: budgetRange.min,
      maxBudget: budgetRange.max,
      onboardingComplete: true,
    });
    addXP(100, "Onboarding complete");
    completeQuest("onboarding_complete");
    awardBadge({ id: "first_steps", title: "First Steps", description: "Completed onboarding", icon: "🎉" });
    router.replace("/");
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <ScrollView
            style={styles.scrollStep}
            contentContainerStyle={styles.stepContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Heart size={64} color={Colors.primary} fill={Colors.primary} />
            </View>
            <Text style={styles.title}>Welcome to Date Night</Text>
            <Text style={styles.subtitle}>
              Your AI-powered date planning companion
            </Text>
            <Text style={styles.description}>
              Discover amazing date ideas tailored to your vibe, schedule dates,
              and keep track of your memories together.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setStep(1)}
            >
              <Text style={styles.primaryButtonText}>Let&apos;s Get Started</Text>
              <Sparkles size={20} color="#FFF" />
            </TouchableOpacity>
          </ScrollView>
        );

      case 1:
        return (
          <ScrollView
            style={styles.scrollStep}
            contentContainerStyle={styles.stepContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Heart size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Your Relationship</Text>
            <Text style={styles.subtitle}>
              Tell us a bit about where you are
            </Text>

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
                    relationshipStage === "new" &&
                      styles.optionTitleSelected,
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
                  relationshipStage === "long-term" &&
                    styles.optionCardSelected,
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

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setStep(2)}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 2:
        return (
          <ScrollView
            style={styles.scrollStep}
            contentContainerStyle={styles.stepContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <MapPin size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Where are you?</Text>
            <Text style={styles.subtitle}>We&apos;ll find great spots nearby</Text>

            <TextInput
              style={styles.input}
              placeholder="City or Zip Code"
              placeholderTextColor={Colors.textTertiary}
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
            />

            <TouchableOpacity
              style={[styles.primaryButton, !city && styles.buttonDisabled]}
              onPress={() => setStep(3)}
              disabled={!city}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setStep(3)}
            >
              <Text style={styles.secondaryButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 3:
        return (
          <ScrollView
            style={styles.scrollStep}
            contentContainerStyle={styles.stepContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <DollarSign size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Budget Range</Text>
            <Text style={styles.subtitle}>What&apos;s your typical spend?</Text>

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

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setStep(4)}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 4:
        return (
          <ScrollView
            style={styles.scrollStep}
            contentContainerStyle={styles.stepContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Sparkles size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>What do you enjoy?</Text>
            <Text style={styles.subtitle}>Select all that apply</Text>

            <View style={styles.interestsGrid}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestChip,
                    interests.includes(interest) &&
                      styles.interestChipSelected,
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

            <TouchableOpacity
              style={[
                styles.primaryButton,
                interests.length === 0 && styles.buttonDisabled,
              ]}
              onPress={handleComplete}
              disabled={interests.length === 0}
            >
              <Text style={styles.primaryButtonText}>Start Exploring</Text>
              <Sparkles size={20} color="#FFF" />
            </TouchableOpacity>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.progressContainer}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i <= step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {renderStep()}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  progressContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  scrollStep: {
    flex: 1,
  },
  stepContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "500" as const,
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
    marginBottom: 20,
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
