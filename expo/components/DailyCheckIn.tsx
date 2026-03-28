import { Gift, Clock } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import Colors from "@/constants/colors";
import { useGamification } from "@/context/GamificationContext";

export default function DailyCheckIn() {
  const { canCheckIn, timeUntilNextCheckIn, dailyCheckIn } = useGamification();
  const [timeRemaining, setTimeRemaining] = useState<number>(timeUntilNextCheckIn());
  const [scaleAnim] = useState(new Animated.Value(1));
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(timeUntilNextCheckIn());
    }, 1000);

    return () => clearInterval(interval);
  }, [timeUntilNextCheckIn]);

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const handleCheckIn = () => {
    const success = dailyCheckIn();
    if (success) {
      setShowSuccess(true);
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }
  };

  const isAvailable = canCheckIn();

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.button,
          isAvailable && styles.buttonAvailable,
          !isAvailable && styles.buttonDisabled,
        ]}
        onPress={handleCheckIn}
        disabled={!isAvailable}
        testID="daily-checkin-button"
      >
        <View style={styles.iconContainer}>
          <Gift size={24} color={isAvailable ? "#FFF" : Colors.textTertiary} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, !isAvailable && styles.titleDisabled]}>
            Daily Check-In
          </Text>
          {isAvailable ? (
            <Text style={styles.reward}>+100 XP Available!</Text>
          ) : (
            <View style={styles.timerContainer}>
              <Clock size={12} color={Colors.textTertiary} />
              <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {showSuccess && (
        <View style={styles.successBadge}>
          <Text style={styles.successText}>+100 XP 🎉</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 16,
    borderWidth: 2,
  },
  buttonAvailable: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  buttonDisabled: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFF",
    marginBottom: 4,
  },
  titleDisabled: {
    color: Colors.text,
  },
  reward: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600" as const,
    opacity: 0.9,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timer: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
  },
  successBadge: {
    position: "absolute" as const,
    top: -10,
    right: -10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  successText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFF",
  },
});
