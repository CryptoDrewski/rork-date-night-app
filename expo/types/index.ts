export type BudgetLevel = "$" | "$$" | "$$$";

export type IdealTime = "day" | "night" | "flex";

export type RelationshipStage = "new" | "established" | "long-term";

export type BookingStatus = "scheduled" | "completed" | "canceled";

export interface DateIdea {
  id: string;
  title: string;
  description: string;
  budget: BudgetLevel;
  durationMinutes: number;
  tags: string[];
  idealTime: IdealTime;
  suggestedVenueTypes: string[];
  imageUrl?: string;
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  priceLevel: number;
  rating: number;
  reviewCount: number;
  photos: string[];
  types: string[];
  openNow?: boolean;
  distance?: number;
}

export interface Booking {
  id: string;
  ideaId?: string;
  idea?: DateIdea;
  venueId?: string;
  venue?: Venue;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  venueId?: string;
  rating: number;
  comment: string;
  createdAt: string;
  editedUntil: string;
}

export interface UserPreferences {
  relationshipStage: RelationshipStage;
  city: string;
  radiusKm: number;
  minBudget: BudgetLevel;
  maxBudget: BudgetLevel;
  interests: string[];
  accessibilityNeeds: string[];
  preferredDays: string[];
  onboardingComplete: boolean;
}

export interface Favorite {
  id: string;
  targetType: "idea" | "venue";
  targetId: string;
  target?: DateIdea | Venue;
  createdAt: string;
}

export type FilterOptions = {
  budget: BudgetLevel[];
  distance: number;
  tags: string[];
  openNow: boolean;
  minRating: number;
  timeframe: "today" | "tonight" | "weekend" | "custom";
};
