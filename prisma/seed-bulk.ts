import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROOM_TYPES = ["Studio", "1bed", "2bed", "3bed", "4bed+"];
const RENTAL_TYPES = ["SHORT", "LONG"] as const;
const PLATFORMS = ["Rightmove", "Zoopla", "SpareRoom", "OpenRent"];

const AMENITY_POOL = [
  "Furnished", "Bills Included", "Washer", "Dishwasher", "Gym",
  "Parking", "Garden", "Concierge", "Pool", "Bike Storage",
  "Rooftop", "Shared Kitchen", "Private Bath", "Balcony", "Study Room",
  "Cinema Room", "Laundry", "CCTV", "Lift", "Wheelchair Access",
];

const BUILDING_NAMES: Record<string, string[]> = {
  London: ["Canary Wharf Tower", "Battersea Power Station", "One Blackfriars", "The Shard Residences", "Royal Wharf", "Elephant Park", "Nine Elms Point", "Greenwich Peninsula", "Stratford Halo", "King's Cross Quarter"],
  Manchester: ["Beetham Tower", "Deansgate Square", "Oxygen Tower", "Vita Student", "MediaCityUK", "Circle Square", "First Street", "New Islington", "Ancoats Gardens", "Piccadilly Basin"],
  Birmingham: ["The Cube", "Rotunda", "The Mailbox", "Arena Central", "Port Loop", "Snow Hill Wharf", "Digbeth One", "Brindleyplace", "Five Ways", "Jewellery Quarter Lofts"],
  Edinburgh: ["Quartermile", "Fountainbridge", "Haymarket Yards", "New Waverley", "St James Quarter", "Canonmills Garden", "Leith Walk Studios", "Tollcross Apartments", "Marchmont Court", "Newington Place"],
  Leeds: ["Bridgewater Place", "Granary Wharf", "The Calls", "Leeds Dock", "Clarence Dock", "Mustard Wharf", "Globe Point", "Wellington Place", "Headingley Rise", "Chapel Allerton Park"],
  Glasgow: ["Finnieston Quay", "Merchant City Lofts", "Pacific Quay", "Buchanan Gardens", "Broomielaw Point", "Partick Cross", "West End Gate", "Kelvingrove Court", "Garnethill Studios", "Hillhead Residences"],
  Bristol: ["Harbourside Quarter", "Wapping Wharf", "Finzels Reach", "Castle Park View", "Temple Quarter", "Bedminster Green", "Redcliffe Quay", "Spike Island Studios", "Clifton Heights", "Cabot Circus Living"],
  Sheffield: ["Velocity Tower", "St Paul's Place", "Kelham Island Studios", "West Bar", "The Heart of the City", "Park Hill", "Devonshire Quarter", "Ecclesall Living", "Crookes Valley", "Sharrow Vale Apartments"],
};

const STREET_NAMES = [
  "High Street", "Park Road", "Station Road", "Church Lane", "Mill Lane",
  "Victoria Road", "Queen Street", "King Street", "Bridge Road", "Market Street",
  "The Crescent", "Oxford Road", "Cambridge Street", "York Place", "Bath Row",
  "George Street", "William Road", "Albert Court", "Edward Square", "Charles Place",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmenities(): string[] {
  const count = 2 + Math.floor(Math.random() * 4); // 2-5 amenities
  const shuffled = [...AMENITY_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomPrice(roomType: string): number {
  const base: Record<string, [number, number]> = {
    Studio: [450, 1200],
    "1bed": [600, 2000],
    "2bed": [900, 3000],
    "3bed": [1200, 3500],
    "4bed+": [1500, 4500],
  };
  const [min, max] = base[roomType] || [500, 2000];
  return Math.round((min + Math.random() * (max - min)) / 50) * 50; // Round to nearest 50
}

function randomDescription(building: string, roomType: string, cityEn: string): string {
  const descs = [
    `Modern ${roomType} apartment in ${building}. Excellent transport links and local amenities. Recently refurbished with high-spec fixtures.`,
    `Bright and spacious ${roomType} at ${building}, ${cityEn}. Walking distance to university campus and city centre shops.`,
    `Stylish ${roomType} in the heart of ${cityEn}. ${building} offers 24/7 security and communal facilities including a residents' lounge.`,
    `Well-maintained ${roomType} at ${building}. Perfect for students and young professionals. Close to public transport and supermarkets.`,
    `Contemporary ${roomType} in ${building}, ${cityEn}. Floor-to-ceiling windows with city views. Available for immediate move-in.`,
    `Cozy ${roomType} at ${building}. Quiet residential area with excellent schools nearby. Ideal for couples or single professionals.`,
    `Newly built ${roomType} in ${building}. Energy-efficient with modern appliances. Pet-friendly building with green outdoor spaces.`,
    `Premium ${roomType} at ${building}, ${cityEn}. High floor with panoramic views. Concierge service and underground parking available.`,
  ];
  return randomItem(descs);
}

async function main() {
  const cities = await prisma.city.findMany();
  console.log(`Found ${cities.length} cities`);

  let totalCreated = 0;

  for (const city of cities) {
    const buildings = BUILDING_NAMES[city.nameEn] || [];
    console.log(`\nSeeding 20 listings for ${city.nameEn}...`);

    for (let i = 0; i < 20; i++) {
      const roomType = randomItem(ROOM_TYPES);
      const rentalType = randomItem(RENTAL_TYPES);
      const price = randomPrice(roomType);
      const amenities = randomAmenities();
      const billsIncluded = amenities.includes("Bills Included");
      const building = buildings[i % buildings.length] || null;
      const street = randomItem(STREET_NAMES);

      // Scatter around city center
      const lat = city.lat + (Math.random() - 0.5) * 0.04;
      const lng = city.lng + (Math.random() - 0.5) * 0.06;

      const postcode = `${city.nameEn.substring(0, 1).toUpperCase()}${Math.floor(Math.random() * 20) + 1} ${Math.floor(Math.random() * 9) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
      const address = `${Math.floor(Math.random() * 200) + 1} ${street}, ${city.nameEn} ${postcode}`;

      await prisma.listing.create({
        data: {
          lat,
          lng,
          address,
          buildingName: building,
          cityId: city.id,
          price,
          roomType,
          rentalType,
          description: randomDescription(building || street, roomType, city.nameEn),
          amenities,
          billsIncluded,
          photos: [],
          source: "EDITORIAL",
          sourcePlatform: randomItem(PLATFORMS),
          status: "APPROVED",
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });
      totalCreated++;
    }
    console.log(`  ✓ ${city.nameEn}: 20 listings created`);
  }

  console.log(`\nDone! Created ${totalCreated} new listings.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
