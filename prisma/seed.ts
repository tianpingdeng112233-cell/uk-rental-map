import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const cities = [
  { name: "伦敦", nameEn: "London", lat: 51.5074, lng: -0.1278, zoom: 12 },
  { name: "曼彻斯特", nameEn: "Manchester", lat: 53.4808, lng: -2.2426, zoom: 13 },
  { name: "伯明翰", nameEn: "Birmingham", lat: 52.4862, lng: -1.8904, zoom: 13 },
  { name: "爱丁堡", nameEn: "Edinburgh", lat: 55.9533, lng: -3.1883, zoom: 13 },
  { name: "利兹", nameEn: "Leeds", lat: 53.8008, lng: -1.5491, zoom: 13 },
  { name: "格拉斯哥", nameEn: "Glasgow", lat: 55.8642, lng: -4.2518, zoom: 13 },
  { name: "布里斯托", nameEn: "Bristol", lat: 51.4545, lng: -2.5879, zoom: 13 },
  { name: "谢菲尔德", nameEn: "Sheffield", lat: 53.3811, lng: -1.4701, zoom: 13 },
];

// Mock listings for demo (spread across cities)
const mockListings = [
  // London listings
  { lat: 51.5155, lng: -0.0922, address: "Canary Wharf, London E14", buildingName: "One Park Drive", price: 2450, roomType: "Studio", rentalType: "LONG" as const, amenities: ["Gym", "Concierge", "Parking"], description: "Modern studio in Canary Wharf with stunning river views. 24/7 concierge, gym, and residents' lounge.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "Rightmove" },
  { lat: 51.4941, lng: -0.1746, address: "South Kensington, London SW7", buildingName: "Imperial Apartments", price: 1850, roomType: "1bed", rentalType: "LONG" as const, amenities: ["Bills Included", "Furnished", "Washer"], description: "Beautifully furnished 1-bed near Imperial College. Bills included, perfect for students.", photos: [], billsIncluded: true, source: "EDITORIAL" as const, sourcePlatform: "Zoopla" },
  { lat: 51.5133, lng: -0.1960, address: "Notting Hill, London W11", buildingName: null, price: 3200, roomType: "2bed", rentalType: "LONG" as const, amenities: ["Garden", "Furnished", "Dishwasher"], description: "Charming 2-bed flat in the heart of Notting Hill. Private garden and period features.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "Rightmove" },
  { lat: 51.5432, lng: -0.0027, address: "Stratford, London E20", buildingName: "East Village", price: 1600, roomType: "1bed", rentalType: "LONG" as const, amenities: ["Gym", "Concierge", "Bike Storage"], description: "Purpose-built 1-bed in Olympic Village. Great transport links to Central London.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "SpareRoom" },
  { lat: 51.5304, lng: -0.1228, address: "King's Cross, London N1", buildingName: "Urbanest King's Cross", price: 680, roomType: "Studio", rentalType: "SHORT" as const, amenities: ["Bills Included", "Shared Kitchen", "Private Bath", "Washer"], description: "Student studio at Urbanest King's Cross. All bills included. Walking distance to UCL and KCL.", photos: [], billsIncluded: true, source: "EDITORIAL" as const, sourcePlatform: "Zoopla" },
  { lat: 51.5187, lng: -0.0777, address: "Aldgate, London E1", buildingName: "Goodman's Fields", price: 2100, roomType: "1bed", rentalType: "LONG" as const, amenities: ["Gym", "Pool", "Concierge", "Rooftop"], description: "Luxury 1-bed with pool and gym access. 5 min walk to Tower of London.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "Rightmove" },
  { lat: 51.4616, lng: -0.1168, address: "Brixton, London SW9", buildingName: null, price: 920, roomType: "Studio", rentalType: "LONG" as const, amenities: ["Furnished", "Washer"], description: "Cozy studio in vibrant Brixton. Great nightlife and food scene.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "SpareRoom" },
  { lat: 51.5373, lng: -0.1428, address: "Camden Town, London NW1", buildingName: null, price: 1750, roomType: "1bed", rentalType: "SHORT" as const, amenities: ["Furnished", "Washer", "Dishwasher"], description: "Stylish 1-bed in Camden. Short let available. Walking distance to Camden Market.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "Rightmove" },
  { lat: 51.5013, lng: -0.1956, address: "Earl's Court, London SW5", buildingName: null, price: 2300, roomType: "2bed", rentalType: "LONG" as const, amenities: ["Furnished", "Garden", "Parking"], description: "Spacious 2-bed flat near Earl's Court tube. Quiet residential street.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "Zoopla" },
  // Manchester listings
  { lat: 53.4794, lng: -2.2453, address: "Deansgate, Manchester M3", buildingName: "Beetham Tower", price: 1200, roomType: "1bed", rentalType: "LONG" as const, amenities: ["Gym", "Concierge", "City View"], description: "High-rise 1-bed with panoramic city views. Walking distance to all universities.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "Rightmove" },
  { lat: 53.4723, lng: -2.2376, address: "Oxford Road, Manchester M1", buildingName: "Vita Student", price: 750, roomType: "Studio", rentalType: "SHORT" as const, amenities: ["Bills Included", "Gym", "Cinema Room", "Study Room"], description: "All-inclusive student studio on Oxford Road corridor. Next to University of Manchester.", photos: [], billsIncluded: true, source: "EDITORIAL" as const, sourcePlatform: "Zoopla" },
  { lat: 53.4836, lng: -2.2492, address: "Salford Quays, Manchester M50", buildingName: "MediaCityUK", price: 950, roomType: "1bed", rentalType: "LONG" as const, amenities: ["Waterfront", "Tram", "Furnished"], description: "Modern 1-bed at MediaCityUK. Waterfront living with direct tram to city centre.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "SpareRoom" },
  // Birmingham listings
  { lat: 52.4796, lng: -1.8982, address: "City Centre, Birmingham B1", buildingName: "The Cube", price: 1100, roomType: "1bed", rentalType: "LONG" as const, amenities: ["Gym", "Concierge", "Restaurant"], description: "Iconic Cube building. 1-bed apartment with city centre views.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "Rightmove" },
  { lat: 52.4511, lng: -1.9306, address: "Selly Oak, Birmingham B29", buildingName: null, price: 550, roomType: "Studio", rentalType: "LONG" as const, amenities: ["Furnished", "Bills Included", "Washer"], description: "Affordable student studio near University of Birmingham campus.", photos: [], billsIncluded: true, source: "EDITORIAL" as const, sourcePlatform: "SpareRoom" },
  // Edinburgh listings
  { lat: 55.9488, lng: -3.1996, address: "Old Town, Edinburgh EH1", buildingName: null, price: 1350, roomType: "1bed", rentalType: "LONG" as const, amenities: ["Historic", "Furnished", "Central"], description: "Character 1-bed in Edinburgh Old Town. Cobblestone streets and castle views.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "Rightmove" },
  { lat: 55.9445, lng: -3.1892, address: "Newington, Edinburgh EH9", buildingName: null, price: 700, roomType: "Studio", rentalType: "SHORT" as const, amenities: ["Furnished", "Near University", "Washer"], description: "Student-friendly studio near University of Edinburgh. Short let available.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "Zoopla" },
  // Leeds listings
  { lat: 53.7997, lng: -1.5492, address: "City Centre, Leeds LS1", buildingName: "Bridgewater Place", price: 900, roomType: "1bed", rentalType: "LONG" as const, amenities: ["Gym", "Concierge", "Parking"], description: "Tallest building in Leeds. Modern 1-bed with gym and concierge.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "Rightmove" },
  { lat: 53.8067, lng: -1.5550, address: "Headingley, Leeds LS6", buildingName: null, price: 500, roomType: "Studio", rentalType: "LONG" as const, amenities: ["Bills Included", "Furnished"], description: "Budget-friendly studio in student area Headingley. Bills included.", photos: [], billsIncluded: true, source: "EDITORIAL" as const, sourcePlatform: "SpareRoom" },
  // Glasgow listings
  { lat: 55.8607, lng: -4.2514, address: "City Centre, Glasgow G1", buildingName: null, price: 850, roomType: "1bed", rentalType: "LONG" as const, amenities: ["Furnished", "Central", "Washer"], description: "Well-located 1-bed in Glasgow city centre. Walking distance to University of Glasgow.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "Zoopla" },
  // Bristol listings
  { lat: 51.4556, lng: -2.5913, address: "Harbourside, Bristol BS1", buildingName: null, price: 1150, roomType: "1bed", rentalType: "LONG" as const, amenities: ["Waterfront", "Furnished", "Bike Storage"], description: "Harbourside living in Bristol. 1-bed with waterfront views.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "Rightmove" },
  // Sheffield listings
  { lat: 53.3811, lng: -1.4749, address: "City Centre, Sheffield S1", buildingName: null, price: 650, roomType: "Studio", rentalType: "LONG" as const, amenities: ["Furnished", "Bills Included", "Near University"], description: "Affordable student studio in Sheffield city centre. All bills included.", photos: [], billsIncluded: true, source: "EDITORIAL" as const, sourcePlatform: "SpareRoom" },
  { lat: 53.3784, lng: -1.4637, address: "Bramall Lane, Sheffield S2", buildingName: null, price: 780, roomType: "1bed", rentalType: "LONG" as const, amenities: ["Furnished", "Parking", "Washer"], description: "Quiet 1-bed near Sheffield Hallam University. On-site parking.", photos: [], billsIncluded: false, source: "EDITORIAL" as const, sourcePlatform: "Zoopla" },
];

async function main() {
  console.log("Seeding cities...");
  const createdCities = [];
  for (const city of cities) {
    const c = await prisma.city.upsert({
      where: { name: city.name },
      update: city,
      create: city,
    });
    createdCities.push(c);
  }
  console.log(`Seeded ${createdCities.length} cities`);

  // Map city names to IDs for listings
  const cityMap: Record<string, string> = {};
  for (const c of createdCities) {
    cityMap[c.nameEn] = c.id;
  }

  // Assign cityId based on coordinates
  function getCityId(lat: number, lng: number): string {
    let closestCity = createdCities[0];
    let minDist = Infinity;
    for (const c of createdCities) {
      const dist = Math.sqrt((c.lat - lat) ** 2 + (c.lng - lng) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closestCity = c;
      }
    }
    return closestCity.id;
  }

  console.log("Seeding mock listings...");
  for (const listing of mockListings) {
    const cityId = getCityId(listing.lat, listing.lng);
    await prisma.listing.create({
      data: {
        ...listing,
        cityId,
        status: "APPROVED",
      },
    });
  }
  console.log(`Seeded ${mockListings.length} mock listings`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
