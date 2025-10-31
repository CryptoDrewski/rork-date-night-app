import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Heart, Clock, DollarSign, MapPin, Zap, AlertCircle } from "lucide-react-native";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import * as Location from "expo-location";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useGamification } from "@/context/GamificationContext";
import type { DateIdea, BudgetLevel } from "@/types";

const IDEA_GENERATION_COST = 50;

export default function IdeasScreen() {
  const router = useRouter();
  const { prompt } = useLocalSearchParams<{ prompt: string }>();
  const { preferences, saveIdea, isFavorite, addFavorite, removeFavorite } = useApp();
  const { state, addXP, spendXP, completeQuest, progressQuest, awardBadge, trackIdea } = useGamification();
  const [generatedIdeas, setGeneratedIdeas] = useState<DateIdea[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showInsufficientXP, setShowInsufficientXP] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        try {
          const result = await Location.requestForegroundPermissionsAsync();
          if (result.status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            console.log('📍 Location obtained:', loc.coords);
          } else {
            setLocationError('Location permission denied');
            console.log('⚠️ Location permission denied');
          }
        } catch (error) {
          console.log('⚠️ Location error on web:', error);
          setLocationError('Could not get location');
        }
      } else {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            console.log('📍 Location obtained:', loc.coords);
          } else {
            setLocationError('Location permission denied');
            console.log('⚠️ Location permission denied');
          }
        } catch (error) {
          console.log('⚠️ Location error:', error);
          setLocationError('Could not get location');
        }
      }
    })();
  }, []);

  const handleGenerate = () => {
    if (!prompt) return;
    
    if (state.xp < IDEA_GENERATION_COST) {
      setShowInsufficientXP(true);
      if (Platform.OS === 'web') {
        alert(`Not enough XP! You need ${IDEA_GENERATION_COST} XP to generate ideas. You have ${state.xp} XP.\n\nEarn more XP by:\n• Completing quests\n• Updating preferences\n• Scheduling dates\n• Maintaining your streak`);
      } else {
        Alert.alert(
          "Not Enough XP!",
          `You need ${IDEA_GENERATION_COST} XP to generate ideas. You have ${state.xp} XP.\n\nEarn more XP by:\n• Completing quests\n• Updating preferences\n• Scheduling dates\n• Maintaining your streak`,
          [
            { text: "View Quests", onPress: () => router.push("/quests") },
            { text: "OK" },
          ]
        );
      }
      return;
    }
    
    const success = spendXP(IDEA_GENERATION_COST, "Generate ideas");
    if (success) {
      generateMutation.mutate({
        prompt,
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
        city: preferences.city,
        relationshipStage: preferences.relationshipStage,
        minBudget: preferences.minBudget,
        maxBudget: preferences.maxBudget,
        interests: preferences.interests,
        radiusKm: preferences.radiusKm,
      });
    }
  };

  useEffect(() => {
    if (prompt && generatedIdeas.length === 0 && !generateMutation.isPending) {
      console.log('🚀 Auto-generating ideas for prompt:', prompt);
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  const generateMutation = trpc.ideas.generate.useMutation({
    onSuccess: (ideas) => {
      console.log('✅ Ideas saved to state');
      setGeneratedIdeas(ideas as DateIdea[]);
      trackIdea();
      setShowInsufficientXP(false);
      
      if (state.totalIdeasGenerated === 1) {
        awardBadge({
          id: "first_ideas",
          title: "Idea Generator",
          description: "Generated your first set of ideas",
          icon: "💡",
        });
      }
      if (state.totalIdeasGenerated === 5) {
        awardBadge({
          id: "idea_master",
          title: "Idea Master",
          description: "Generated 5 sets of ideas",
          icon: "🌟",
        });
      }
    },
    onError: (error) => {
      console.error('❌ Generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Error details:', errorMessage);
      
      addXP(IDEA_GENERATION_COST, "Refund: Idea generation failed");
      console.log(`💰 Refunded ${IDEA_GENERATION_COST} XP due to generation failure`);
      
      if (Platform.OS === 'web') {
        alert(`Failed to generate ideas: ${errorMessage}\n\nYour ${IDEA_GENERATION_COST} XP has been refunded.`);
      } else {
        Alert.alert(
          "Generation Failed",
          `Failed to generate ideas: ${errorMessage}\n\nYour ${IDEA_GENERATION_COST} XP has been refunded.`,
          [{ text: "OK" }]
        );
      }
    },
  });

  const handleToggleFavorite = async (idea: DateIdea) => {
    if (isFavorite("idea", idea.id)) {
      await removeFavorite("idea", idea.id);
    } else {
      await addFavorite("idea", idea.id, idea);
      addXP(10, "Saved favorite idea");
      progressQuest("favorite_3_ideas", 1);
      
      if (state.quests.find(q => q.id === "favorite_3_ideas" && q.progress + 1 >= q.target)) {
        completeQuest("favorite_3_ideas");
      }
    }
  };

  const handleSaveAndSchedule = async (idea: DateIdea) => {
    await saveIdea(idea);
    addXP(50, "Scheduled date idea");
    router.push({
      pathname: "/schedule",
      params: { ideaId: idea.id, ideaData: JSON.stringify(idea) },
    });
  };

  const getBudgetColor = (budget: BudgetLevel) => {
    switch (budget) {
      case "$":
        return Colors.budget.low;
      case "$$":
        return Colors.budget.medium;
      case "$$$":
        return Colors.budget.high;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Date Ideas",
          headerBackVisible: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.promptContainer}>
            <Text style={styles.promptLabel}>Your Request:</Text>
            <Text style={styles.promptText}>{prompt}</Text>
            
            {location && (
              <View style={styles.locationBadge}>
                <MapPin size={14} color={Colors.primary} />
                <Text style={styles.locationText}>
                  Using your location{preferences.city ? ` in ${preferences.city}` : ''}
                </Text>
              </View>
            )}
            
            {locationError && (
              <View style={styles.warningBadge}>
                <Text style={styles.warningText}>⚠️ {locationError} - Using city instead</Text>
              </View>
            )}
            
            {!generateMutation.isPending && generatedIdeas.length === 0 && (
              <View>
                <View style={styles.xpCostContainer}>
                  <Zap size={20} color={Colors.primary} />
                  <Text style={styles.xpCostText}>
                    Costs {IDEA_GENERATION_COST} XP • You have {state.xp} XP
                  </Text>
                </View>
                
                {showInsufficientXP && state.xp < IDEA_GENERATION_COST && (
                  <View style={styles.insufficientXPBanner}>
                    <AlertCircle size={18} color={Colors.error} />
                    <Text style={styles.insufficientXPText}>
                      Not enough XP. Complete quests to earn more!
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    state.xp < IDEA_GENERATION_COST && styles.generateButtonDisabled,
                  ]}
                  onPress={handleGenerate}
                  disabled={state.xp < IDEA_GENERATION_COST}
                  testID="generate-ideas"
                >
                  <Zap size={20} color="#FFF" />
                  <Text style={styles.generateButtonText}>Generate Ideas</Text>
                </TouchableOpacity>
                
                {state.xp < IDEA_GENERATION_COST && (
                  <TouchableOpacity
                    style={styles.earnXPButton}
                    onPress={() => router.push("/quests")}
                  >
                    <Text style={styles.earnXPButtonText}>View Quests to Earn XP</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {generateMutation.isPending && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>
                Creating perfect date ideas for you...
              </Text>
            </View>
          )}

          {generateMutation.isError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Oops! Something went wrong. Please try again.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleGenerate}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {generatedIdeas.length > 0 && (
            <View style={styles.ideasContainer}>
              <Text style={styles.ideasTitle}>
                {generatedIdeas.length} Ideas for You
              </Text>
              {generatedIdeas.map((idea) => (
                <View key={idea.id} style={styles.ideaCard}>
                  <View style={styles.ideaHeader}>
                    <Text style={styles.ideaTitle}>{idea.title}</Text>
                    <TouchableOpacity
                      onPress={() => handleToggleFavorite(idea)}
                      style={styles.favoriteButton}
                    >
                      <Heart
                        size={24}
                        color={Colors.primary}
                        fill={
                          isFavorite("idea", idea.id) ? Colors.primary : "none"
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.ideaDescription}>{idea.description}</Text>

                  <View style={styles.ideaMeta}>
                    <View style={styles.metaItem}>
                      <DollarSign
                        size={16}
                        color={getBudgetColor(idea.budget)}
                      />
                      <Text
                        style={[
                          styles.metaText,
                          { color: getBudgetColor(idea.budget) },
                        ]}
                      >
                        {idea.budget}
                      </Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Clock size={16} color={Colors.textSecondary} />
                      <Text style={styles.metaText}>
                        {Math.round(idea.durationMinutes / 60)} hrs
                      </Text>
                    </View>

                    <View style={styles.metaBadge}>
                      <Text style={styles.metaBadgeText}>
                        {idea.idealTime === "day"
                          ? "☀️ Day"
                          : idea.idealTime === "night"
                            ? "🌙 Night"
                            : "⏰ Anytime"}
                      </Text>
                    </View>
                  </View>

                  {idea.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {idea.tags.slice(0, 3).map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.scheduleButton}
                    onPress={() => handleSaveAndSchedule(idea)}
                  >
                    <Text style={styles.scheduleButtonText}>Schedule This Date</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  promptContainer: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  xpCostContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  xpCostText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  insufficientXPBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.error + "15",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.error + "30",
  },
  insufficientXPText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.error,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.accent + "20",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  locationText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500" as const,
  },
  warningBadge: {
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  generateButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.5,
  },
  generateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  earnXPButton: {
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  earnXPButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  ideasContainer: {
    gap: 16,
  },
  ideasTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  ideaCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ideaHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  ideaTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  favoriteButton: {
    padding: 4,
  },
  ideaDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  ideaMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  metaBadge: {
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  metaBadgeText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.accent + "40",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.primary,
  },
  scheduleButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  scheduleButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
