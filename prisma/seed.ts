// A standalone script (run via `npx prisma db seed`, wired in prisma7.config.ts),
// not part of the Next.js app itself — so it builds its own PrismaClient
// rather than reusing src/lib/prisma.ts, whose dev-hot-reload caching logic
// only matters for a long-running server process, not a one-shot script.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Real press/editorial photos of each actual model, from Wikimedia
// Commons — chosen over a generic placeholder service (LoremFlickr,
// Picsum) after LoremFlickr's free tier started returning HTTP 500 for
// most requests. Each URL is the exact "originalimage" Wikipedia's own
// REST summary API (/api/rest_v1/page/summary/<Article>) returns for
// that model's article, which is what makes it reliable: Wikimedia only
// serves already-cached thumbnail sizes to unauthenticated/automated
// traffic without rate-limiting hard, and this is the one size (the
// same one Wikipedia's own article rendering requests) guaranteed to
// already be cached, rather than a size picked by hand that has to be
// generated on demand. Still stock photos, not photos of these exact
// rental units — replaced once real uploads exist (roadmap: Supabase
// Storage wiring).
const cars = [
  {
    make: "Toyota",
    model: "Corolla",
    year: 2023,
    category: "ECONOMY" as const,
    transmission: "AUTOMATIC" as const,
    fuelType: "PETROL" as const,
    seats: 5,
    pricePerDay: "35.00",
    location: "Downtown",
    description: "Reliable and fuel-efficient, great for city driving.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg/3840px-Toyota_Corolla_Hybrid_%28E210%29_IMG_4338.jpg",
    history:
      "Introduced in 1966, the Corolla went on to become the best-selling nameplate in automotive history, with more than 50 million units sold worldwide. Its reputation for dependability made it the default choice for drivers who just wanted a car that worked, every day, without drama.",
  },
  {
    make: "Volkswagen",
    model: "Golf",
    year: 2022,
    category: "COMPACT" as const,
    transmission: "MANUAL" as const,
    fuelType: "PETROL" as const,
    seats: 5,
    pricePerDay: "42.00",
    location: "Downtown",
    description: "A well-rounded hatchback with responsive handling.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2020_Volkswagen_Golf_Style_1.5_Front.jpg/3840px-2020_Volkswagen_Golf_Style_1.5_Front.jpg",
    history:
      "Launched in 1974 as the Beetle's successor, the Golf redefined what a compact car could be. Its 1976 GTI variant is widely credited with creating the hot-hatch segment outright — a legacy that still shapes how the car is engineered today.",
  },
  {
    make: "Tesla",
    model: "Model 3",
    year: 2024,
    category: "COMPACT" as const,
    transmission: "AUTOMATIC" as const,
    fuelType: "ELECTRIC" as const,
    seats: 5,
    pricePerDay: "65.00",
    location: "Airport",
    description: "All-electric, instant torque, and Autopilot included.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg/3840px-Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg",
    history:
      "Released in 2017, the Model 3 was Tesla's first genuinely mass-market car, built to bring electric driving to a price point far below the Model S. It went on to become the best-selling electric car in the world.",
  },
  {
    make: "Toyota",
    model: "RAV4",
    year: 2023,
    category: "SUV" as const,
    transmission: "AUTOMATIC" as const,
    fuelType: "HYBRID" as const,
    seats: 5,
    pricePerDay: "58.00",
    location: "Airport",
    description: "Spacious hybrid SUV, ideal for road trips.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/2024_Toyota_RAV4_Prime_XSE_Premium_in_Silver_Sky_with_Midnight_Black_roof%2C_front_left.jpg/3840px-2024_Toyota_RAV4_Prime_XSE_Premium_in_Silver_Sky_with_Midnight_Black_roof%2C_front_left.jpg",
    history:
      "Debuting in 1994, the RAV4 is widely credited as one of the vehicles that created the modern compact crossover SUV segment — combining car-like handling with SUV practicality at a time when almost no one else was doing so.",
  },
  {
    make: "BMW",
    model: "X5",
    year: 2023,
    category: "SUV" as const,
    transmission: "AUTOMATIC" as const,
    fuelType: "DIESEL" as const,
    seats: 5,
    pricePerDay: "89.00",
    location: "Downtown",
    description: "Premium SUV with a commanding ride and full tech suite.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2019_BMW_X5_M50d_Automatic_3.0.jpg/3840px-2019_BMW_X5_M50d_Automatic_3.0.jpg",
    history:
      "The X5, launched in 1999 as the E53, was BMW's first SUV — a car the company itself branded a \"Sports Activity Vehicle\" rather than an SUV, chasing on-road handling closer to a sedan than a traditional off-roader.",
  },
  {
    make: "Mercedes-Benz",
    model: "E-Class",
    year: 2024,
    category: "LUXURY" as const,
    transmission: "AUTOMATIC" as const,
    fuelType: "PETROL" as const,
    seats: 5,
    pricePerDay: "120.00",
    location: "Downtown",
    description: "Executive sedan for when arriving in style matters.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Mercedes-Benz_W214_1X7A1841.jpg/3840px-Mercedes-Benz_W214_1X7A1841.jpg",
    history:
      "The E-Class name was formally adopted in 1993, but its mid-size executive lineage stretches back to the 1950s. It has long served as the benchmark other executive sedans are measured against.",
  },
  {
    make: "Mercedes-Benz",
    model: "Sprinter",
    year: 2022,
    category: "VAN" as const,
    transmission: "AUTOMATIC" as const,
    fuelType: "DIESEL" as const,
    seats: 9,
    pricePerDay: "95.00",
    location: "Airport",
    description: "9-seat van, ideal for group travel or moving cargo.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/2019_Mercedes-Benz_Sprinter_314_CDi_2.1.jpg/3840px-2019_Mercedes-Benz_Sprinter_314_CDi_2.1.jpg",
    history:
      "Since its 1995 debut, the Sprinter has become one of the most recognizable vans in the world — the backbone of countless delivery fleets and, more recently, the vehicle of choice for camper van conversions.",
  },
  {
    make: "Honda",
    model: "Civic",
    year: 2024,
    category: "COMPACT" as const,
    transmission: "AUTOMATIC" as const,
    fuelType: "HYBRID" as const,
    seats: 5,
    pricePerDay: "45.00",
    location: "Downtown",
    description: "A sharp-handling compact with a genuinely comfortable cabin.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Honda_Civic_e-HEV_Sport_%28XI%29_%E2%80%93_f_30062024.jpg/3840px-Honda_Civic_e-HEV_Sport_%28XI%29_%E2%80%93_f_30062024.jpg",
    history:
      "First sold in 1972, the Civic helped define what a compact car could be during the 1970s oil crisis. Now in its eleventh generation, it remains one of the best-selling nameplates in America.",
  },
  {
    make: "Ford",
    model: "Mustang",
    year: 2025,
    category: "LUXURY" as const,
    transmission: "MANUAL" as const,
    fuelType: "PETROL" as const,
    seats: 4,
    pricePerDay: "99.00",
    location: "Airport",
    description: "The classic American muscle car experience, top down or not.",
    imageUrl:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Ford_Mustang_VII_GT_Rutesheimer_Autoschau_2025_DSC_9234.jpg/3840px-Ford_Mustang_VII_GT_Rutesheimer_Autoschau_2025_DSC_9234.jpg",
    history:
      "Launched in 1964 at the New York World's Fair, the Mustang created the entire pony car segment almost single-handedly, selling over a million units in its first eighteen months on sale.",
  },
  {
    make: "Hyundai",
    model: "Tucson",
    year: 2023,
    category: "SUV" as const,
    transmission: "AUTOMATIC" as const,
    fuelType: "PETROL" as const,
    seats: 5,
    pricePerDay: "55.00",
    location: "Downtown",
    description: "A practical, well-equipped SUV for everyday driving.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c6/2022_Hyundai_Tucson_Preferred%2C_Front_Right%2C_05-24-2021.jpg",
    history:
      "Introduced in 2004, the Tucson was Hyundai's entry into the compact SUV boom and has since grown into one of the brand's best-selling models worldwide, now in its fourth generation.",
  },
  {
    make: "Kia",
    model: "Sorento",
    year: 2024,
    category: "SUV" as const,
    transmission: "AUTOMATIC" as const,
    fuelType: "HYBRID" as const,
    seats: 7,
    pricePerDay: "68.00",
    location: "Airport",
    description: "A 7-seat family SUV with room to spare for luggage and kids alike.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/84/2024_Kia_Sorento_X-Line_SX_Prestige_%28facelift%29%2C_front_12.20.24.jpg",
    history:
      "Kia's first SUV, launched in 2002, the Sorento moved to a car-like unibody platform in 2009 and has since become one of the brand's flagship models, now offered with hybrid and plug-in hybrid powertrains.",
  },
  {
    make: "Audi",
    model: "A4",
    year: 2023,
    category: "LUXURY" as const,
    transmission: "AUTOMATIC" as const,
    fuelType: "DIESEL" as const,
    seats: 5,
    pricePerDay: "85.00",
    location: "Downtown",
    description: "A refined executive sedan with quattro all-wheel drive available.",
    imageUrl:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Audi_A4_B9_sedans_%28FL%29_1X7A2441.jpg/3840px-Audi_A4_B9_sedans_%28FL%29_1X7A2441.jpg",
    history:
      "Introduced in 1994 as the successor to the Audi 80, the A4 became the car that established Audi as a genuine rival to BMW's 3 Series and the Mercedes C-Class in the executive sedan segment.",
  },
];

async function main() {
  const existing = await prisma.car.count();
  if (existing > 0) {
    console.log(`Skipping seed — ${existing} car(s) already in the database.`);
    return;
  }

  await prisma.car.createMany({ data: cars });
  console.log(`Seeded ${cars.length} cars.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
