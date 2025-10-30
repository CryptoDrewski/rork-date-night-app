import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar as CalendarIcon } from "lucide-react-native";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useGamification } from "@/context/GamificationContext";
import type { DateIdea } from "@/types";

export default function ScheduleScreen() {
  const router = useRouter();
  const { ideaId, ideaData } = useLocalSearchParams<{
    ideaId?: string;
    ideaData?: string;
  }>();
  const { addBooking } = useApp();
  const { addXP, trackSchedule, progressQuest, completeQuest } = useGamification();

  const idea: DateIdea | undefined = ideaData ? JSON.parse(ideaData) : undefined;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState("19:00");
  const [notes, setNotes] = useState("");

  const handleSchedule = async () => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(startDateTime);
    if (idea) {
      endDateTime.setMinutes(endDateTime.getMinutes() + idea.durationMinutes);
    } else {
      endDateTime.setHours(endDateTime.getHours() + 2);
    }

    await addBooking({
      ideaId,
      idea,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      status: "scheduled",
      notes: notes || undefined,
    });

    trackSchedule();
    addXP(75, "Scheduled a date");
    progressQuest("schedule_date", 1);
    progressQuest("schedule_3_dates", 1);
    
    const scheduleQuest = await new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 100);
    });
    
    if (scheduleQuest === 1) {
      completeQuest("schedule_date");
    }

    router.back();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const generateDateOptions = () => {
    const options = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      options.push(date);
    }
    return options;
  };

  const timeOptions = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <CalendarIcon size={32} color={Colors.primary} />
          <Text style={styles.title}>Schedule Your Date</Text>
          {idea && <Text style={styles.ideaTitle}>{idea.title}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}
          >
            {generateDateOptions().map((date, index) => {
              const isSelected =
                date.toDateString() === selectedDate.toDateString();
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateOption,
                    isSelected && styles.dateOptionSelected,
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text
                    style={[
                      styles.dateDayName,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </Text>
                  <Text
                    style={[
                      styles.dateDay,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  <Text
                    style={[
                      styles.dateMonth,
                      isSelected && styles.dateTextSelected,
                    ]}
                  >
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text style={styles.selectedDateText}>{formatDate(selectedDate)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeScroll}
          >
            {timeOptions.map((time) => {
              const isSelected = time === startTime;
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    isSelected && styles.timeOptionSelected,
                  ]}
                  onPress={() => setStartTime(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      isSelected && styles.timeTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any special notes or reminders..."
            placeholderTextColor={Colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.scheduleButton} onPress={handleSchedule}>
          <Text style={styles.scheduleButtonText}>Confirm & Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  ideaTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.primary,
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  dateScroll: {
    gap: 12,
    paddingBottom: 16,
  },
  dateOption: {
    width: 70,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dateOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateDayName: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  dateTextSelected: {
    color: "#FFF",
  },
  selectedDateText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  timeScroll: {
    gap: 12,
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  timeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  timeTextSelected: {
    color: "#FFF",
  },
  notesInput: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 2,
    borderColor: Colors.border,
    minHeight: 100,
  },
  scheduleButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  scheduleButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "500" as const,
  },
});
