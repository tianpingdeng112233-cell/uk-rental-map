export interface City {
  id: string;
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  zoom: number;
}

export interface ListingGeo {
  id: string;
  lat: number;
  lng: number;
  price: number;
  roomType: string;
  rentalType: "SHORT" | "LONG";
}

export interface Listing {
  id: string;
  lat: number;
  lng: number;
  address: string;
  buildingName: string | null;
  cityId: string;
  price: number;
  roomType: string;
  rentalType: "SHORT" | "LONG";
  availableFrom: string | null;
  description: string | null;
  amenities: string[];
  billsIncluded: boolean;
  photos: string[];
  contactWechat: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  source: "EDITORIAL" | "USER";
  sourceUrl: string | null;
  sourcePlatform: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED";
  createdAt: string;
  city?: City;
}

export interface ReviewScores {
  transport: number;
  safety: number;
  value: number;
  overall: number;
}

export interface Review {
  id: string;
  lat: number;
  lng: number;
  address: string;
  buildingName: string | null;
  transportScore: number;
  safetyScore: number;
  valueScore: number;
  overallScore: number;
  content: string;
  userId: string;
  createdAt: string;
  user?: { nickname: string };
}

export interface FilterState {
  cityId: string | null;
  minPrice: number;
  maxPrice: number;
  roomType: string | null;
  rentalType: string | null;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
