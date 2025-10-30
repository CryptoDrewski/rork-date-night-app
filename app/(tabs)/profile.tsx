import { useRouter } from "expo-router";
import { User, Heart, MapPin, DollarSign, Edit2 } from "lucide-react-native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { preferences, favorites, bookings } = useApp();
  const insets = useSafeAreaInsets();

  const upcomingCount = bookings.filter(
    (b) => new Date(b.startTime) >= new Date() && b.status !== "canceled"
  ).length;

  const completedCount = bookings.filter(
    (b) => new Date(b.startTime) < new Date() && b.status === "completed"
  ).length;

  const getRelationshipLabel = () => {
    switch (preferences.relationshipStage) {
      case "new":
        return "Just Started Dating";
      case "established":
        return "In a Relationship";
      case "long-term":
        return "Long-Term / Married";
      default:
        return "Not Set";
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <User size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Dates</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{upcomingCount}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.preferenceCard}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceIcon}>
                <Heart size={20} color={Colors.primary} />
              </View>
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceLabel}>Relationship</Text>
                <Text style={styles.preferenceValue}>
                  {getRelationshipLabel()}
                </Text>
              </View>
            </View>

            {preferences.city && (
              <View style={styles.preferenceRow}>
                <View style={styles.preferenceIcon}>
                  <MapPin size={20} color={Colors.primary} />
                </View>
                <View style={styles.preferenceContent}>
                  <Text style={styles.preferenceLabel}>Location</Text>
                  <Text style={styles.preferenceValue}>{preferences.city}</Text>
                </View>
              </View>
            )}

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceIcon}>
                <DollarSign size={20} color={Colors.primary} />
              </View>
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceLabel}>Budget Range</Text>
                <Text style={styles.preferenceValue}>
                  {preferences.minBudget} - {preferences.maxBudget}
                </Text>
              </View>
            </View>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceIcon}>
                <MapPin size={20} color={Colors.primary} />
              </View>
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceLabel}>Search Radius</Text>
                <Text style={styles.preferenceValue}>
                  {Math.round((preferences.radiusKm / 1.60934))} mi
                </Text>
              </View>
            </View>
          </View>
        </View>

        {preferences.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsContainer}>
              {preferences.interests.map((interest) => (
                <View key={interest} style={styles.interestChip}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Ideas</Text>
          {favorites.length > 0 ? (
            <View style={styles.favoritesContainer}>
              {favorites.map((fav) => (
                <View key={fav.id} style={styles.favoriteCard}>
                  <Text style={styles.favoriteTitle}>
                    {(fav.target as { title?: string })?.title || "Saved Idea"}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyFavorites}>
              <Heart size={32} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>
                No saved ideas yet. Favorite ideas from the Home screen!
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/edit-preferences")}
        >
          <Edit2 size={20} color={Colors.primary} />
          <Text style={styles.editButtonText}>Edit Preferences</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent + "40",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  preferenceCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent + "40",
    alignItems: "center",
    justifyContent: "center",
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  interestChip: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  interestText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#FFF",
  },
  favoritesContainer: {
    gap: 12,
  },
  favoriteCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  emptyFavorites: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.card,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
});
