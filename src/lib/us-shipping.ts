export interface USState {
  code: string;
  name: string;
}

export const US_STATES: USState[] = [
  { code: "FL", name: "Florida" },
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export type FloridaCountyOption =
  | "Miami-Dade County"
  | "Broward County"
  | "Other County";

export const SHIPPING_RATE_OUTSIDE = 25.0;

/**
 * Checks whether a 5-digit US ZIP code belongs to Miami-Dade County or Broward County, FL.
 */
export function detectCountyByZip(zipRaw: string): FloridaCountyOption | null {
  const clean = zipRaw.replace(/\D/g, "").slice(0, 5);
  if (clean.length < 5) return null;
  const num = Number(clean);
  if (!Number.isFinite(num)) return null;

  // Miami-Dade County ZIP ranges
  if (
    (num >= 33010 && num <= 33018) ||
    (num >= 33030 && num <= 33039) ||
    (num >= 33054 && num <= 33056) ||
    num === 33090 ||
    num === 33092 ||
    (num >= 33101 && num <= 33299)
  ) {
    return "Miami-Dade County";
  }

  // Broward County ZIP ranges
  if (
    num === 33004 ||
    (num >= 33008 && num <= 33009) ||
    (num >= 33019 && num <= 33029) ||
    (num >= 33060 && num <= 33077) ||
    (num >= 33081 && num <= 33084) ||
    (num >= 33301 && num <= 33394)
  ) {
    return "Broward County";
  }

  // Other Florida ZIPs (32000 - 34999)
  if (num >= 32000 && num <= 34999) {
    return "Other County";
  }

  return null;
}

const MIAMI_DADE_CITIES = new Set([
  "miami",
  "miami beach",
  "hialeah",
  "doral",
  "coral gables",
  "kendall",
  "homestead",
  "north miami",
  "north miami beach",
  "aventura",
  "sunny isles beach",
  "sunny isles",
  "miami gardens",
  "miami lakes",
  "palmetto bay",
  "cutler bay",
  "pinecrest",
  "key biscayne",
  "sweetwater",
  "opa-locka",
  "miami springs",
  "south miami",
  "florida city",
  "bal harbour",
  "surfside",
  "bay harbor islands",
  "biscayne park",
  "el portal",
  "golden beach",
  "hialeah gardens",
  "indian creek",
  "medley",
  "miami shores",
  "north bay village",
  "virginia gardens",
  "west miami",
]);

const BROWARD_CITIES = new Set([
  "fort lauderdale",
  "ft lauderdale",
  "ft. lauderdale",
  "hollywood",
  "pembroke pines",
  "miramar",
  "coral springs",
  "pompano beach",
  "davie",
  "plantation",
  "sunrise",
  "deerfield beach",
  "LAUDERHILL".toLowerCase(),
  "weston",
  "tamarac",
  "margate",
  "coconut creek",
  "oakland park",
  "north lauderdale",
  "hallandale beach",
  "hallandale",
  "lauderdale lakes",
  "dania beach",
  "Dania".toLowerCase(),
  "cooper city",
  "parkland",
  "wilton manors",
  "lighthouse point",
  "southwest ranches",
  "pembroke park",
  "west park",
  "lauderdale-by-the-sea",
  "hillsboro beach",
  "sea ranch lakes",
  "lazy lake",
]);

export function detectCountyByCity(cityRaw: string): FloridaCountyOption | null {
  const c = cityRaw.trim().toLowerCase();
  if (!c) return null;
  if (MIAMI_DADE_CITIES.has(c)) return "Miami-Dade County";
  if (BROWARD_CITIES.has(c)) return "Broward County";
  return null;
}

export function isFreeDeliveryEligible(opts: {
  state: string;
  county?: string;
  zip?: string;
  city?: string;
}): boolean {
  const stateCode = (opts.state || "").trim().toUpperCase();
  if (stateCode !== "FL" && stateCode !== "FLORIDA") {
    return false;
  }

  if (
    opts.county === "Miami-Dade County" ||
    opts.county === "Broward County"
  ) {
    return true;
  }

  if (opts.county === "Other County") {
    return false;
  }

  // Fallback to ZIP or City detection if county wasn't explicitly set
  if (opts.zip) {
    const byZip = detectCountyByZip(opts.zip);
    if (byZip === "Miami-Dade County" || byZip === "Broward County") return true;
    if (byZip === "Other County") return false;
  }

  if (opts.city) {
    const byCity = detectCountyByCity(opts.city);
    if (byCity === "Miami-Dade County" || byCity === "Broward County") return true;
  }

  return false;
}

export function calculateShipping(opts: {
  state: string;
  county?: string;
  zip?: string;
  city?: string;
}): {
  shippingFee: number;
  isFreeDelivery: boolean;
  countyResolved: string;
} {
  const stateCode = (opts.state || "").trim().toUpperCase();
  const isFL = stateCode === "FL" || stateCode === "FLORIDA";

  let countyResolved = opts.county || "";
  if (isFL && !countyResolved) {
    countyResolved =
      (opts.zip && detectCountyByZip(opts.zip)) ||
      (opts.city && detectCountyByCity(opts.city)) ||
      "";
  }

  const free = isFreeDeliveryEligible({
    state: stateCode,
    county: countyResolved,
    zip: opts.zip,
    city: opts.city,
  });

  return {
    shippingFee: free ? 0 : SHIPPING_RATE_OUTSIDE,
    isFreeDelivery: free,
    countyResolved: isFL ? countyResolved || "Other County" : "Out of State",
  };
}

/**
 * Queries the public Zippopotam.us API for a 5-digit US ZIP code.
 */
export async function lookupUsZipCode(zipRaw: string): Promise<{
  city: string;
  stateCode: string;
  stateName: string;
  county: FloridaCountyOption | "";
} | null> {
  const clean = zipRaw.replace(/\D/g, "").slice(0, 5);
  if (clean.length !== 5) return null;

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${clean}`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      places?: Array<{
        "place name"?: string;
        state?: string;
        "state abbreviation"?: string;
      }>;
    };
    const place = data.places?.[0];
    if (!place) return null;

    const city = place["place name"] || "";
    const stateCode = (place["state abbreviation"] || "").toUpperCase();
    const stateName = place.state || "";

    let county: FloridaCountyOption | "" = "";
    if (stateCode === "FL") {
      county =
        detectCountyByZip(clean) ||
        detectCountyByCity(city) ||
        "Other County";
    }

    return {
      city,
      stateCode,
      stateName,
      county,
    };
  } catch {
    return null;
  }
}

