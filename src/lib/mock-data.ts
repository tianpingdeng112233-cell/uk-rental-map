import type { City, Listing, ListingGeo } from "@/types";

export const MOCK_CITIES: City[] = [
  { id: "city-london", name: "伦敦", nameEn: "London", lat: 51.5074, lng: -0.1278, zoom: 12 },
  { id: "city-manchester", name: "曼彻斯特", nameEn: "Manchester", lat: 53.4808, lng: -2.2426, zoom: 13 },
  { id: "city-birmingham", name: "伯明翰", nameEn: "Birmingham", lat: 52.4862, lng: -1.8904, zoom: 13 },
  { id: "city-edinburgh", name: "爱丁堡", nameEn: "Edinburgh", lat: 55.9533, lng: -3.1883, zoom: 13 },
  { id: "city-leeds", name: "利兹", nameEn: "Leeds", lat: 53.8008, lng: -1.5491, zoom: 13 },
  { id: "city-glasgow", name: "格拉斯哥", nameEn: "Glasgow", lat: 55.8642, lng: -4.2518, zoom: 13 },
  { id: "city-bristol", name: "布里斯托", nameEn: "Bristol", lat: 51.4545, lng: -2.5879, zoom: 13 },
  { id: "city-sheffield", name: "谢菲尔德", nameEn: "Sheffield", lat: 53.3811, lng: -1.4701, zoom: 13 },
];

const baseListing = {
  availableFrom: null,
  description: null,
  billsIncluded: false,
  photos: [] as string[],
  contactWechat: null,
  contactPhone: null,
  contactEmail: null,
  source: "EDITORIAL" as const,
  sourceUrl: null,
  sourcePlatform: null,
  status: "APPROVED" as const,
  createdAt: "2026-03-01T00:00:00Z",
};

export const MOCK_LISTINGS: Listing[] = [
  { ...baseListing, id: "l1", lat: 51.5155, lng: -0.0922, address: "Canary Wharf, London E14", buildingName: "One Park Drive", cityId: "city-london", price: 2450, roomType: "Studio", rentalType: "LONG", amenities: ["Gym", "Concierge", "Parking"], description: "Modern studio in Canary Wharf with stunning river views.", sourcePlatform: "Rightmove" },
  { ...baseListing, id: "l2", lat: 51.4941, lng: -0.1746, address: "South Kensington, London SW7", buildingName: "Imperial Apartments", cityId: "city-london", price: 1850, roomType: "1bed", rentalType: "LONG", amenities: ["Bills Included", "Furnished", "Washer"], description: "Beautifully furnished 1-bed near Imperial College.", sourcePlatform: "Zoopla", billsIncluded: true },
  { ...baseListing, id: "l3", lat: 51.5133, lng: -0.1960, address: "Notting Hill, London W11", buildingName: null, cityId: "city-london", price: 3200, roomType: "2bed", rentalType: "LONG", amenities: ["Garden", "Furnished", "Dishwasher"], description: "Charming 2-bed flat in the heart of Notting Hill.", sourcePlatform: "Rightmove" },
  { ...baseListing, id: "l4", lat: 51.5432, lng: -0.0027, address: "Stratford, London E20", buildingName: "East Village", cityId: "city-london", price: 1600, roomType: "1bed", rentalType: "LONG", amenities: ["Gym", "Concierge", "Bike Storage"], description: "Purpose-built 1-bed in Olympic Village.", sourcePlatform: "SpareRoom" },
  { ...baseListing, id: "l5", lat: 51.5304, lng: -0.1228, address: "King's Cross, London N1", buildingName: "Urbanest King's Cross", cityId: "city-london", price: 680, roomType: "Studio", rentalType: "SHORT", amenities: ["Bills Included", "Shared Kitchen", "Private Bath"], description: "Student studio at Urbanest King's Cross. All bills included.", sourcePlatform: "Zoopla", billsIncluded: true },
  { ...baseListing, id: "l6", lat: 51.5187, lng: -0.0777, address: "Aldgate, London E1", buildingName: "Goodman's Fields", cityId: "city-london", price: 2100, roomType: "1bed", rentalType: "LONG", amenities: ["Gym", "Pool", "Concierge", "Rooftop"], description: "Luxury 1-bed with pool and gym access.", sourcePlatform: "Rightmove" },
  { ...baseListing, id: "l7", lat: 51.4616, lng: -0.1168, address: "Brixton, London SW9", buildingName: null, cityId: "city-london", price: 920, roomType: "Studio", rentalType: "LONG", amenities: ["Furnished", "Washer"], description: "Cozy studio in vibrant Brixton.", sourcePlatform: "SpareRoom" },
  { ...baseListing, id: "l8", lat: 51.5373, lng: -0.1428, address: "Camden Town, London NW1", buildingName: null, cityId: "city-london", price: 1750, roomType: "1bed", rentalType: "SHORT", amenities: ["Furnished", "Washer", "Dishwasher"], description: "Stylish 1-bed in Camden.", sourcePlatform: "Rightmove" },
  { ...baseListing, id: "l9", lat: 51.5013, lng: -0.1956, address: "Earl's Court, London SW5", buildingName: null, cityId: "city-london", price: 2300, roomType: "2bed", rentalType: "LONG", amenities: ["Furnished", "Garden", "Parking"], description: "Spacious 2-bed flat near Earl's Court tube.", sourcePlatform: "Zoopla" },
  { ...baseListing, id: "l10", lat: 53.4794, lng: -2.2453, address: "Deansgate, Manchester M3", buildingName: "Beetham Tower", cityId: "city-manchester", price: 1200, roomType: "1bed", rentalType: "LONG", amenities: ["Gym", "Concierge", "City View"], description: "High-rise 1-bed with panoramic city views.", sourcePlatform: "Rightmove" },
  { ...baseListing, id: "l11", lat: 53.4723, lng: -2.2376, address: "Oxford Road, Manchester M1", buildingName: "Vita Student", cityId: "city-manchester", price: 750, roomType: "Studio", rentalType: "SHORT", amenities: ["Bills Included", "Gym", "Cinema Room"], description: "All-inclusive student studio on Oxford Road.", sourcePlatform: "Zoopla", billsIncluded: true },
  { ...baseListing, id: "l12", lat: 53.4836, lng: -2.2492, address: "Salford Quays, Manchester M50", buildingName: "MediaCityUK", cityId: "city-manchester", price: 950, roomType: "1bed", rentalType: "LONG", amenities: ["Waterfront", "Tram", "Furnished"], description: "Modern 1-bed at MediaCityUK.", sourcePlatform: "SpareRoom" },
  { ...baseListing, id: "l13", lat: 52.4796, lng: -1.8982, address: "City Centre, Birmingham B1", buildingName: "The Cube", cityId: "city-birmingham", price: 1100, roomType: "1bed", rentalType: "LONG", amenities: ["Gym", "Concierge", "Restaurant"], description: "Iconic Cube building 1-bed apartment.", sourcePlatform: "Rightmove" },
  { ...baseListing, id: "l14", lat: 52.4511, lng: -1.9306, address: "Selly Oak, Birmingham B29", buildingName: null, cityId: "city-birmingham", price: 550, roomType: "Studio", rentalType: "LONG", amenities: ["Furnished", "Bills Included", "Washer"], description: "Affordable student studio near UoB.", sourcePlatform: "SpareRoom", billsIncluded: true },
  { ...baseListing, id: "l15", lat: 55.9488, lng: -3.1996, address: "Old Town, Edinburgh EH1", buildingName: null, cityId: "city-edinburgh", price: 1350, roomType: "1bed", rentalType: "LONG", amenities: ["Historic", "Furnished", "Central"], description: "Character 1-bed in Edinburgh Old Town.", sourcePlatform: "Rightmove" },
  { ...baseListing, id: "l16", lat: 55.9445, lng: -3.1892, address: "Newington, Edinburgh EH9", buildingName: null, cityId: "city-edinburgh", price: 700, roomType: "Studio", rentalType: "SHORT", amenities: ["Furnished", "Near University"], description: "Student-friendly studio near University of Edinburgh.", sourcePlatform: "Zoopla" },
  { ...baseListing, id: "l17", lat: 53.7997, lng: -1.5492, address: "City Centre, Leeds LS1", buildingName: "Bridgewater Place", cityId: "city-leeds", price: 900, roomType: "1bed", rentalType: "LONG", amenities: ["Gym", "Concierge", "Parking"], description: "Tallest building in Leeds. Modern 1-bed.", sourcePlatform: "Rightmove" },
  { ...baseListing, id: "l18", lat: 53.8067, lng: -1.5550, address: "Headingley, Leeds LS6", buildingName: null, cityId: "city-leeds", price: 500, roomType: "Studio", rentalType: "LONG", amenities: ["Bills Included", "Furnished"], description: "Budget-friendly studio in Headingley.", sourcePlatform: "SpareRoom", billsIncluded: true },
  { ...baseListing, id: "l19", lat: 55.8607, lng: -4.2514, address: "City Centre, Glasgow G1", buildingName: null, cityId: "city-glasgow", price: 850, roomType: "1bed", rentalType: "LONG", amenities: ["Furnished", "Central", "Washer"], description: "Well-located 1-bed in Glasgow city centre.", sourcePlatform: "Zoopla" },
  { ...baseListing, id: "l20", lat: 51.4556, lng: -2.5913, address: "Harbourside, Bristol BS1", buildingName: null, cityId: "city-bristol", price: 1150, roomType: "1bed", rentalType: "LONG", amenities: ["Waterfront", "Furnished", "Bike Storage"], description: "Harbourside living in Bristol.", sourcePlatform: "Rightmove" },
  { ...baseListing, id: "l21", lat: 53.3811, lng: -1.4749, address: "City Centre, Sheffield S1", buildingName: null, cityId: "city-sheffield", price: 650, roomType: "Studio", rentalType: "LONG", amenities: ["Furnished", "Bills Included"], description: "Affordable student studio in Sheffield.", sourcePlatform: "SpareRoom", billsIncluded: true },
  { ...baseListing, id: "l22", lat: 53.3784, lng: -1.4637, address: "Bramall Lane, Sheffield S2", buildingName: null, cityId: "city-sheffield", price: 780, roomType: "1bed", rentalType: "LONG", amenities: ["Furnished", "Parking", "Washer"], description: "Quiet 1-bed near Sheffield Hallam University.", sourcePlatform: "Zoopla" },
];

export function filterMockListings(params: {
  cityId?: string;
  minPrice?: number;
  maxPrice?: number;
  roomType?: string;
  rentalType?: string;
}): Listing[] {
  return MOCK_LISTINGS.filter((l) => {
    if (params.cityId && l.cityId !== params.cityId) return false;
    if (params.minPrice && l.price < params.minPrice) return false;
    if (params.maxPrice && l.price > params.maxPrice) return false;
    if (params.roomType && l.roomType !== params.roomType) return false;
    if (params.rentalType && l.rentalType !== params.rentalType) return false;
    return true;
  });
}

export function getMockListingGeo(params: {
  cityId?: string;
  minPrice?: number;
  maxPrice?: number;
  roomType?: string;
  rentalType?: string;
}): ListingGeo[] {
  return filterMockListings(params).map((l) => ({
    id: l.id,
    lat: l.lat,
    lng: l.lng,
    price: l.price,
    roomType: l.roomType,
    rentalType: l.rentalType,
  }));
}
