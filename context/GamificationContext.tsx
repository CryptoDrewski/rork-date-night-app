import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number;
  target: number;
  completedAt?: string;
};

export type GamificationState = {
  xp: number;
  level: number;
  levelProgress: number;
  streakDays: number;
  lastActiveISO?: string;
  lastCheckInISO?: string;
  badges: Badge[];
  quests: Quest[];
  totalIdeasGenerated: number;
  totalDatesScheduled: number;
  totalPreferencesUpdates: number;
};

const STORAGE_KEY = "@datenight_gamification_state";

const baseQuests: Quest[] = [
  {
    id: "onboarding_complete",
    title: "Kickoff!",
    description: "Complete onboarding",
    xp: 100,
    progress: 0,
    target: 1,
  },
  {
    id: "save_preferences",
    title: "Tune Your Vibe",
    description: "Update your preferences",
    xp: 50,
    progress: 0,
    target: 1,
  },
  {
    id: "schedule_date",
    title: "Lock It In",
    description: "Schedule a date",
    xp: 100,
    progress: 0,
    target: 1,
  },
  {
    id: "daily_login",
    title: "Daily Check-In",
    description: "Open the app daily",
    xp: 25,
    progress: 0,
    target: 1,
  },
  {
    id: "favorite_3_ideas",
    title: "Curator",
    description: "Save 3 favorite ideas",
    xp: 75,
    progress: 0,
    target: 3,
  },
  {
    id: "schedule_3_dates",
    title: "Date Master",
    description: "Schedule 3 dates",
    xp: 150,
    progress: 0,
    target: 3,
  },
];

function levelForXP(xp: number): number {
  // Simple curve: lvl 1 at 0 XP, each level requires +200 * lvl XP
  let level = 1;
  let remaining = xp;
  while (true) {
    const need = 200 * level;
    if (remaining >= need) {
      remaining -= need;
      level += 1;
    } else {
      break;
    }
  }
  return level;
}

function levelProgressForXP(xp: number): { level: number; progress: number } {
  let level = 1;
  let remaining = xp;
  while (true) {
    const need = 200 * level;
    if (remaining >= need) {
      remaining -= need;
      level += 1;
    } else {
      const progress = need === 0 ? 0 : remaining / need;
      return { level, progress };
    }
  }
}

export const [GamificationProvider, useGamification] = createContextHook(() => {
  const [state, setState] = useState<GamificationState>({
    xp: 0,
    level: 1,
    levelProgress: 0,
    streakDays: 0,
    badges: [],
    quests: baseQuests,
    totalIdeasGenerated: 0,
    totalDatesScheduled: 0,
    totalPreferencesUpdates: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as GamificationState;
          const lp = levelProgressForXP(parsed.xp);
          setState((prev) => ({
            ...prev,
            ...parsed,
            level: lp.level,
            levelProgress: lp.progress,
          }));
        }
      } catch (e) {
        console.log("Gamification load error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: GamificationState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.log("Gamification persist error", e);
    }
  }, []);

  const touchDailyStreak = useCallback((s: GamificationState): GamificationState => {
    const today = new Date();
    const lastISO = s.lastActiveISO;
    if (!lastISO) {
      return { ...s, streakDays: 1, lastActiveISO: today.toISOString() };
    }
    const last = new Date(lastISO);
    const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return { ...s, lastActiveISO: today.toISOString() };
    if (diffDays === 1) return { ...s, streakDays: s.streakDays + 1, lastActiveISO: today.toISOString() };
    return { ...s, streakDays: 1, lastActiveISO: today.toISOString() };
  }, []);

  const addXP = useCallback((amount: number, reason?: string) => {
    setState((prev) => {
      const withStreak = touchDailyStreak(prev);
      const nextXP = withStreak.xp + Math.max(0, amount);
      const lp = levelProgressForXP(nextXP);
      const next = {
        ...withStreak,
        xp: nextXP,
        level: lp.level,
        levelProgress: lp.progress,
      };
      void persist(next);
      console.log(`[XP] +${amount} ${reason ?? ""} → total ${nextXP}, lvl ${lp.level}`);
      return next;
    });
  }, [persist, touchDailyStreak]);

  const completeQuest = useCallback((id: string) => {
    setState((prev) => {
      const q = prev.quests.find((qq) => qq.id === id);
      if (!q || q.completedAt) return prev;
      const updatedQuests = prev.quests.map((qq) => qq.id === id ? { ...qq, progress: qq.target, completedAt: new Date().toISOString() } : qq);
      const add = q.xp;
      const withStreak = touchDailyStreak({ ...prev, quests: updatedQuests });
      const nextXP = withStreak.xp + add;
      const lp = levelProgressForXP(nextXP);
      const next = { ...withStreak, xp: nextXP, level: lp.level, levelProgress: lp.progress };
      void persist(next);
      console.log(`[Quest] Completed ${q.title} (+${add} XP)`);
      return next;
    });
  }, [persist, touchDailyStreak]);

  const progressQuest = useCallback((id: string, inc = 1) => {
    setState((prev) => {
      const updated = prev.quests.map((q) => {
        if (q.id !== id || q.completedAt) return q;
        const nextProg = Math.min(q.target, q.progress + inc);
        return { ...q, progress: nextProg };
      });
      const next = { ...prev, quests: updated };
      void persist(next);
      return next;
    });
  }, [persist]);

  const awardBadge = useCallback((badge: Omit<Badge, "earnedAt">) => {
    setState((prev) => {
      const exists = prev.badges.some((b) => b.id === badge.id);
      if (exists) return prev;
      const nextBadges = [...prev.badges, { ...badge, earnedAt: new Date().toISOString() }];
      const next = { ...prev, badges: nextBadges };
      void persist(next);
      console.log(`[Badge] Earned ${badge.title}`);
      return next;
    });
  }, [persist]);

  const spendXP = useCallback((amount: number, reason?: string): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.xp < amount) {
        console.log(`[XP] Cannot spend ${amount}, only have ${prev.xp}`);
        return prev;
      }
      const nextXP = prev.xp - amount;
      const lp = levelProgressForXP(nextXP);
      const next = {
        ...prev,
        xp: nextXP,
        level: lp.level,
        levelProgress: lp.progress,
      };
      void persist(next);
      console.log(`[XP] -${amount} ${reason ?? ""} → remaining ${nextXP}, lvl ${lp.level}`);
      success = true;
      return next;
    });
    return success;
  }, [persist]);

  const trackIdea = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, totalIdeasGenerated: prev.totalIdeasGenerated + 1 };
      void persist(next);
      return next;
    });
  }, [persist]);

  const trackSchedule = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, totalDatesScheduled: prev.totalDatesScheduled + 1 };
      void persist(next);
      return next;
    });
    
    setState((prev) => {
      if (prev.totalDatesScheduled === 1) {
        const q = prev.quests.find((qq) => qq.id === "schedule_date");
        if (q && !q.completedAt) {
          progressQuest("schedule_date", 1);
        }
      }
      if (prev.totalDatesScheduled === 3) {
        const q = prev.quests.find((qq) => qq.id === "schedule_3_dates");
        if (q && !q.completedAt) {
          completeQuest("schedule_3_dates");
        }
      }
      return prev;
    });
  }, [persist, progressQuest, completeQuest]);

  const trackPreferencesUpdate = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, totalPreferencesUpdates: prev.totalPreferencesUpdates + 1 };
      void persist(next);
      return next;
    });
  }, [persist]);

  const canCheckIn = useCallback(() => {
    let result = true;
    setState((prev) => {
      if (!prev.lastCheckInISO) {
        result = true;
        return prev;
      }
      const now = new Date();
      const lastCheckIn = new Date(prev.lastCheckInISO);
      const diff = now.getTime() - lastCheckIn.getTime();
      const hours = diff / (1000 * 60 * 60);
      result = hours >= 24;
      return prev;
    });
    return result;
  }, []);

  const timeUntilNextCheckIn = useCallback(() => {
    let result = 0;
    setState((prev) => {
      if (!prev.lastCheckInISO) {
        result = 0;
        return prev;
      }
      const now = new Date();
      const lastCheckIn = new Date(prev.lastCheckInISO);
      const nextCheckIn = new Date(lastCheckIn.getTime() + 24 * 60 * 60 * 1000);
      const diff = nextCheckIn.getTime() - now.getTime();
      result = Math.max(0, diff);
      return prev;
    });
    return result;
  }, []);

  const dailyCheckIn = useCallback(() => {
    let success = false;
    setState((prev) => {
      if (prev.lastCheckInISO) {
        const now = new Date();
        const lastCheckIn = new Date(prev.lastCheckInISO);
        const diff = now.getTime() - lastCheckIn.getTime();
        const hours = diff / (1000 * 60 * 60);
        if (hours < 24) {
          console.log("[Check-in] Not ready yet");
          return prev;
        }
      }
      const withStreak = touchDailyStreak(prev);
      const nextXP = withStreak.xp + 100;
      const lp = levelProgressForXP(nextXP);
      const next = {
        ...withStreak,
        xp: nextXP,
        level: lp.level,
        levelProgress: lp.progress,
        lastCheckInISO: new Date().toISOString(),
      };
      void persist(next);
      console.log("[Check-in] Daily check-in complete! +100 XP");
      success = true;
      return next;
    });
    return success;
  }, [persist, touchDailyStreak]);

  return useMemo(() => ({
    loading,
    state,
    addXP,
    spendXP,
    completeQuest,
    progressQuest,
    awardBadge,
    trackIdea,
    trackSchedule,
    trackPreferencesUpdate,
    canCheckIn,
    timeUntilNextCheckIn,
    dailyCheckIn,
  }), [loading, state, addXP, spendXP, completeQuest, progressQuest, awardBadge, trackIdea, trackSchedule, trackPreferencesUpdate, canCheckIn, timeUntilNextCheckIn, dailyCheckIn]);
});
