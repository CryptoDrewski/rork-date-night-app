import { useRouter } from "expo-router";
import XPHeader from "@/components/XPHeader";
import { Sparkles, Search, TrendingUp, DollarSign, MapPin, RefreshCw } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useGamification } from "@/context/GamificationContext";

const QUICK_FILTERS = [
  { id: "tonight", label: "Tonight", icon: "🌙" },
  { id: "weekend", label: "This Weekend", icon: "📅" },
  { id: "budget", label: "Under $30", icon: "💰" },
  { id: "outdoors", label: "Outdoors", icon: "🌳" },
  { id: "cozy", label: "Cozy", icon: "☕" },
  { id: "adventure", label: "Adventurous", icon: "🎢" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { preferences, isLoading } = useApp();
  const { addXP, completeQuest } = useGamification();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [popularIdeas, setPopularIdeas] = useState(POPULAR_IDEAS);
  const [budgetIdeas, setBudgetIdeas] = useState(BUDGET_IDEAS);

  useEffect(() => {
    if (!isLoading && !preferences.onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [isLoading, preferences.onboardingComplete, router]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    addXP(25, "Daily login");
    completeQuest("daily_login");
  }, [fadeAnim, addXP, completeQuest]);

  const handleAIGenerate = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: "/ideas",
        params: { prompt: searchQuery },
      });
    }
  };

  const handleQuickFilter = (filterId: string) => {
    let prompt = "";
    switch (filterId) {
      case "tonight":
        prompt = "Perfect date ideas for tonight";
        break;
      case "weekend":
        prompt = "Fun weekend date ideas";
        break;
      case "budget":
        prompt = "Amazing date ideas under $30";
        break;
      case "outdoors":
        prompt = "Outdoor date ideas";
        break;
      case "cozy":
        prompt = "Cozy and intimate date ideas";
        break;
      case "adventure":
        prompt = "Adventurous and exciting date ideas";
        break;
    }
    router.push({
      pathname: "/ideas",
      params: { prompt },
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const refreshPopularIdeas = () => {
    console.log('[Home] Refreshing Popular Right Now ideas');
    setPopularIdeas(shuffleArray(ALL_POPULAR_IDEAS).slice(0, 4));
  };

  const refreshBudgetIdeas = () => {
    console.log('[Home] Refreshing Budget-Friendly ideas');
    setBudgetIdeas(shuffleArray(ALL_BUDGET_IDEAS).slice(0, 4));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}!</Text>
            <Text style={styles.subtitle}>Plan something great tonight?</Text>
          </View>
          <XPHeader />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Sparkles size={20} color={Colors.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Describe your ideal date..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleAIGenerate}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleAIGenerate} style={styles.searchButton}>
                <Search size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.searchHint}>
            Try: &quot;Romantic dinner under $100&quot; or &quot;Fun outdoor activity&quot;
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Ideas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickFiltersScroll}
          >
            {QUICK_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={styles.quickFilterChip}
                onPress={() => handleQuickFilter(filter.id)}
              >
                <Text style={styles.quickFilterEmoji}>{filter.icon}</Text>
                <Text style={styles.quickFilterText}>{filter.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Popular Right Now</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={refreshPopularIdeas}
              testID="refresh-popular"
            >
              <RefreshCw size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.ideaCardsContainer}>
            {popularIdeas.map((idea) => (
              <TouchableOpacity
                key={idea.id}
                style={styles.ideaCard}
                onPress={() =>
                  router.push({
                    pathname: "/ideas",
                    params: { prompt: idea.title },
                  })
                }
              >
                <View style={styles.ideaCardContent}>
                  <Text style={styles.ideaCardEmoji}>{idea.emoji}</Text>
                  <View style={styles.ideaCardText}>
                    <Text style={styles.ideaCardTitle}>{idea.title}</Text>
                    <View style={styles.ideaCardMeta}>
                      <Text style={styles.ideaCardBudget}>{idea.budget}</Text>
                      <Text style={styles.ideaCardDot}>•</Text>
                      <Text style={styles.ideaCardTime}>{idea.time}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {preferences.city && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Near {preferences.city}</Text>
            </View>
            <TouchableOpacity
              style={styles.exploreCard}
              onPress={() =>
                router.push({
                  pathname: "/ideas",
                  params: { prompt: `Date ideas in ${preferences.city}` },
                })
              }
            >
              <Text style={styles.exploreCardTitle}>
                Explore Local Spots
              </Text>
              <Text style={styles.exploreCardSubtitle}>
                Discover hidden gems and popular venues nearby
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color={Colors.budget.low} />
            <Text style={styles.sectionTitle}>Budget-Friendly</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={refreshBudgetIdeas}
              testID="refresh-budget"
            >
              <RefreshCw size={20} color={Colors.budget.low} />
            </TouchableOpacity>
          </View>
          <View style={styles.budgetIdeasContainer}>
            {budgetIdeas.map((idea) => (
              <TouchableOpacity
                key={idea.id}
                style={styles.budgetIdeaCard}
                onPress={() =>
                  router.push({
                    pathname: "/ideas",
                    params: { prompt: idea.title },
                  })
                }
              >
                <Text style={styles.budgetIdeaEmoji}>{idea.emoji}</Text>
                <Text style={styles.budgetIdeaTitle}>{idea.title}</Text>
                <Text style={styles.budgetIdeaPrice}>{idea.price}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const ALL_POPULAR_IDEAS = [
  {
    id: "1",
    emoji: "🍷",
    title: "Wine Tasting & Sunset",
    budget: "$",
    time: "2-3 hrs",
  },
  {
    id: "2",
    emoji: "🎨",
    title: "Art Gallery Afternoon",
    budget: "$",
    time: "1-2 hrs",
  },
  {
    id: "3",
    emoji: "🎵",
    title: "Live Jazz & Cocktails",
    budget: "$$",
    time: "3-4 hrs",
  },
  {
    id: "4",
    emoji: "🌮",
    title: "Food Truck Tour",
    budget: "$",
    time: "2 hrs",
  },
  {
    id: "5",
    emoji: "🎭",
    title: "Theater Show",
    budget: "$",
    time: "2-3 hrs",
  },
  {
    id: "6",
    emoji: "🧁",
    title: "Baking Together",
    budget: "$",
    time: "2 hrs",
  },
  {
    id: "7",
    emoji: "🎳",
    title: "Bowling Night",
    budget: "$",
    time: "2 hrs",
  },
  {
    id: "8",
    emoji: "🌺",
    title: "Botanical Garden",
    budget: "$",
    time: "1-2 hrs",
  },
  {
    id: "9",
    emoji: "🎪",
    title: "Local Fair",
    budget: "$",
    time: "3-4 hrs",
  },
  {
    id: "10",
    emoji: "🎸",
    title: "Live Music Venue",
    budget: "$",
    time: "2-3 hrs",
  },
];

const ALL_BUDGET_IDEAS = [
  { id: "1", emoji: "☕", title: "Coffee & Walk", price: "$5-15" },
  { id: "2", emoji: "🎬", title: "Movie Night", price: "$10-25" },
  { id: "3", emoji: "🏞️", title: "Hiking Adventure", price: "Free" },
  { id: "4", emoji: "🍕", title: "Pizza Making", price: "$15-30" },
  { id: "5", emoji: "🎮", title: "Game Night", price: "Free" },
  { id: "6", emoji: "📚", title: "Library Date", price: "Free" },
  { id: "7", emoji: "🌅", title: "Sunrise/Sunset", price: "Free" },
  { id: "8", emoji: "🍦", title: "Ice Cream Walk", price: "$5-10" },
  { id: "9", emoji: "🚴", title: "Bike Ride", price: "Free" },
  { id: "10", emoji: "🎨", title: "Free Museum Day", price: "Free" },
];

const POPULAR_IDEAS = ALL_POPULAR_IDEAS.slice(0, 4);
const BUDGET_IDEAS = ALL_BUDGET_IDEAS.slice(0, 4);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 8,
    marginLeft: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  refreshButton: {
    marginLeft: "auto" as const,
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  quickFiltersScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  quickFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  quickFilterEmoji: {
    fontSize: 18,
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  ideaCardsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  ideaCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ideaCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  ideaCardEmoji: {
    fontSize: 36,
  },
  ideaCardText: {
    flex: 1,
  },
  ideaCardTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  ideaCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ideaCardBudget: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  ideaCardDot: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  ideaCardTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  exploreCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
  },
  exploreCardTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFF",
    marginBottom: 8,
  },
  exploreCardSubtitle: {
    fontSize: 15,
    color: "#FFF",
    opacity: 0.9,
  },
  budgetIdeasContainer: {
    paddingHorizontal: 20,
    flexDirection: "row",
    gap: 12,
  },
  budgetIdeaCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  budgetIdeaEmoji: {
    fontSize: 32,
  },
  budgetIdeaTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "center",
  },
  budgetIdeaPrice: {
    fontSize: 12,
    color: Colors.budget.low,
    fontWeight: "500" as const,
  },
});
