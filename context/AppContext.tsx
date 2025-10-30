import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Booking,
  DateIdea,
  Favorite,
  Review,
  UserPreferences,
} from "@/types";

const STORAGE_KEYS = {
  PREFERENCES: "@datenight_preferences",
  BOOKINGS: "@datenight_bookings",
  FAVORITES: "@datenight_favorites",
  REVIEWS: "@datenight_reviews",
  IDEAS: "@datenight_ideas",
} as const;

const DEFAULT_PREFERENCES: UserPreferences = {
  relationshipStage: "new",
  city: "",
  radiusKm: Math.round(20 * 1.60934),
  minBudget: "$",
  maxBudget: "$$",
  interests: [],
  accessibilityNeeds: [],
  preferredDays: [],
  onboardingComplete: false,
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<DateIdea[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prefsData, bookingsData, favoritesData, reviewsData, ideasData] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES),
          AsyncStorage.getItem(STORAGE_KEYS.BOOKINGS),
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
          AsyncStorage.getItem(STORAGE_KEYS.REVIEWS),
          AsyncStorage.getItem(STORAGE_KEYS.IDEAS),
        ]);

      if (prefsData) {
        setPreferences(JSON.parse(prefsData));
      }
      if (bookingsData) {
        setBookings(JSON.parse(bookingsData));
      }
      if (favoritesData) {
        setFavorites(JSON.parse(favoritesData));
      }
      if (reviewsData) {
        setReviews(JSON.parse(reviewsData));
      }
      if (ideasData) {
        setSavedIdeas(JSON.parse(ideasData));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = useCallback(async (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    await AsyncStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify(updated),
    );
  }, [preferences]);

  const addBooking = useCallback(async (booking: Omit<Booking, "id" | "createdAt">) => {
    const newBooking: Booking = {
      ...booking,
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...bookings, newBooking];
    setBookings(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
    return newBooking;
  }, [bookings]);

  const updateBooking = useCallback(async (
    id: string,
    updates: Partial<Booking>,
  ): Promise<void> => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setBookings(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
  }, [bookings]);

  const deleteBooking = useCallback(async (id: string): Promise<void> => {
    const updated = bookings.filter((b) => b.id !== id);
    setBookings(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
  }, [bookings]);

  const addFavorite = useCallback(async (
    targetType: "idea" | "venue",
    targetId: string,
    target: DateIdea,
  ) => {
    const existing = favorites.find(
      (f) => f.targetType === targetType && f.targetId === targetId,
    );
    if (existing) return;

    const newFavorite: Favorite = {
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      targetType,
      targetId,
      target,
      createdAt: new Date().toISOString(),
    };
    const updated = [...favorites, newFavorite];
    setFavorites(updated);
    await AsyncStorage.setItem(
      STORAGE_KEYS.FAVORITES,
      JSON.stringify(updated),
    );
  }, [favorites]);

  const removeFavorite = useCallback(async (
    targetType: "idea" | "venue",
    targetId: string,
  ) => {
    const updated = favorites.filter(
      (f) => !(f.targetType === targetType && f.targetId === targetId),
    );
    setFavorites(updated);
    await AsyncStorage.setItem(
      STORAGE_KEYS.FAVORITES,
      JSON.stringify(updated),
    );
  }, [favorites]);

  const isFavorite = useCallback((targetType: "idea" | "venue", targetId: string): boolean => {
    return favorites.some(
      (f) => f.targetType === targetType && f.targetId === targetId,
    );
  }, [favorites]);

  const addReview = useCallback(async (review: Omit<Review, "id" | "createdAt" | "editedUntil">) => {
    const now = new Date();
    const editedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const newReview: Review = {
      ...review,
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now.toISOString(),
      editedUntil: editedUntil.toISOString(),
    };
    const updated = [...reviews, newReview];
    setReviews(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    return newReview;
  }, [reviews]);

  const updateReview = useCallback(async (
    id: string,
    updates: { rating?: number; comment?: string },
  ): Promise<void> => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setReviews(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
  }, [reviews]);

  const deleteReview = useCallback(async (id: string): Promise<void> => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
  }, [reviews]);

  const saveIdea = useCallback(async (idea: DateIdea) => {
    const existing = savedIdeas.find((i) => i.id === idea.id);
    if (existing) return;

    const updated = [...savedIdeas, idea];
    setSavedIdeas(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(updated));
  }, [savedIdeas]);

  const removeSavedIdea = useCallback(async (ideaId: string) => {
    const updated = savedIdeas.filter((i) => i.id !== ideaId);
    setSavedIdeas(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(updated));
  }, [savedIdeas]);

  return useMemo(() => ({
    isLoading,
    preferences,
    updatePreferences,
    bookings,
    addBooking,
    updateBooking,
    deleteBooking,
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    reviews,
    addReview,
    updateReview,
    deleteReview,
    savedIdeas,
    saveIdea,
    removeSavedIdea,
  }), [
    isLoading,
    preferences,
    updatePreferences,
    bookings,
    addBooking,
    updateBooking,
    deleteBooking,
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    reviews,
    addReview,
    updateReview,
    deleteReview,
    savedIdeas,
    saveIdea,
    removeSavedIdea,
  ]);
});
