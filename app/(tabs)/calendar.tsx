import { Calendar, Clock, MapPin } from "lucide-react-native";
import { useState } from "react";
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
import type { Booking } from "@/types";

export default function CalendarScreen() {
  const { bookings } = useApp();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const now = new Date();
  const upcomingBookings = bookings
    .filter((b) => new Date(b.startTime) >= now && b.status !== "canceled")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const pastBookings = bookings
    .filter((b) => new Date(b.startTime) < now || b.status === "canceled")
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderBooking = (booking: Booking) => {
    return (
      <View key={booking.id} style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingTitle}>
            {booking.idea?.title || "Date"}
          </Text>
          {booking.status === "canceled" && (
            <View style={styles.canceledBadge}>
              <Text style={styles.canceledText}>Canceled</Text>
            </View>
          )}
        </View>

        <View style={styles.bookingMeta}>
          <View style={styles.metaRow}>
            <Calendar size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{formatDate(booking.startTime)}</Text>
          </View>

          <View style={styles.metaRow}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText}>
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </Text>
          </View>

          {booking.venue && (
            <View style={styles.metaRow}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{booking.venue.name}</Text>
            </View>
          )}
        </View>

        {booking.notes && (
          <Text style={styles.bookingNotes}>{booking.notes}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top }} />
      <View style={styles.header}>
        <Text style={styles.title}>My Dates</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "upcoming" && styles.tabTextActive,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "past" && styles.tabActive]}
          onPress={() => setActiveTab("past")}
        >
          <Text
            style={[styles.tabText, activeTab === "past" && styles.tabTextActive]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "upcoming" ? (
          upcomingBookings.length > 0 ? (
            upcomingBookings.map(renderBooking)
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Upcoming Dates</Text>
              <Text style={styles.emptySubtitle}>
                Schedule your next date from the Home screen
              </Text>
            </View>
          )
        ) : pastBookings.length > 0 ? (
          pastBookings.map(renderBooking)
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Past Dates Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your date history will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  bookingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  bookingTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  canceledBadge: {
    backgroundColor: Colors.error + "20",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  canceledText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.error,
  },
  bookingMeta: {
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bookingNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic" as const,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
