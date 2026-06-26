// Indian city → climate zone mapping
// Used to filter and rank plants based on user's location

export type ClimateZone =
  | "north_plains"      // UP, Bihar, Haryana, Punjab — hot summers, cold winters
  | "south_tropical"    // Kerala, Tamil Nadu, Karnataka coast — tropical, high rainfall
  | "west_arid"         // Rajasthan, Gujarat — hot & dry, desert climate
  | "central_deccan"    // Maharashtra, MP, Telangana — semi-arid, moderate
  | "east_humid"        // West Bengal, Odisha, Jharkhand — humid, heavy monsoon
  | "northeast"         // Assam, Meghalaya — very high rainfall, lush
  | "himalayan"         // HP, Uttarakhand, J&K — cold, temperate
  | "coastal_west"      // Goa, Konkan coast — tropical coastal
  | "south_interior"    // Bangalore, Hyderabad plateau — mild, moderate

export interface CityInfo {
  zone: ClimateZone;
  state: string;
  label: string; // human-readable zone name
}

const CITY_MAP: Record<string, CityInfo> = {
  // North Plains
  "agra":        { zone: "north_plains", state: "Uttar Pradesh", label: "North Plains" },
  "lucknow":     { zone: "north_plains", state: "Uttar Pradesh", label: "North Plains" },
  "varanasi":    { zone: "north_plains", state: "Uttar Pradesh", label: "North Plains" },
  "kanpur":      { zone: "north_plains", state: "Uttar Pradesh", label: "North Plains" },
  "allahabad":   { zone: "north_plains", state: "Uttar Pradesh", label: "North Plains" },
  "prayagraj":   { zone: "north_plains", state: "Uttar Pradesh", label: "North Plains" },
  "meerut":      { zone: "north_plains", state: "Uttar Pradesh", label: "North Plains" },
  "patna":       { zone: "north_plains", state: "Bihar", label: "North Plains" },
  "gaya":        { zone: "north_plains", state: "Bihar", label: "North Plains" },
  "delhi":       { zone: "north_plains", state: "Delhi", label: "North Plains" },
  "new delhi":   { zone: "north_plains", state: "Delhi", label: "North Plains" },
  "faridabad":   { zone: "north_plains", state: "Haryana", label: "North Plains" },
  "gurugram":    { zone: "north_plains", state: "Haryana", label: "North Plains" },
  "gurgaon":     { zone: "north_plains", state: "Haryana", label: "North Plains" },
  "amritsar":    { zone: "north_plains", state: "Punjab", label: "North Plains" },
  "ludhiana":    { zone: "north_plains", state: "Punjab", label: "North Plains" },
  "chandigarh":  { zone: "north_plains", state: "Punjab/Haryana", label: "North Plains" },
  "jalandhar":   { zone: "north_plains", state: "Punjab", label: "North Plains" },

  // West Arid
  "jaipur":      { zone: "west_arid", state: "Rajasthan", label: "Arid West" },
  "jodhpur":     { zone: "west_arid", state: "Rajasthan", label: "Arid West" },
  "udaipur":     { zone: "west_arid", state: "Rajasthan", label: "Arid West" },
  "bikaner":     { zone: "west_arid", state: "Rajasthan", label: "Arid West" },
  "ajmer":       { zone: "west_arid", state: "Rajasthan", label: "Arid West" },
  "kota":        { zone: "west_arid", state: "Rajasthan", label: "Arid West" },
  "ahmedabad":   { zone: "west_arid", state: "Gujarat", label: "Arid West" },
  "surat":       { zone: "west_arid", state: "Gujarat", label: "Arid West" },
  "vadodara":    { zone: "west_arid", state: "Gujarat", label: "Arid West" },
  "rajkot":      { zone: "west_arid", state: "Gujarat", label: "Arid West" },

  // Central Deccan
  "mumbai":      { zone: "central_deccan", state: "Maharashtra", label: "Central Deccan" },
  "pune":        { zone: "central_deccan", state: "Maharashtra", label: "Central Deccan" },
  "nagpur":      { zone: "central_deccan", state: "Maharashtra", label: "Central Deccan" },
  "nashik":      { zone: "central_deccan", state: "Maharashtra", label: "Central Deccan" },
  "aurangabad":  { zone: "central_deccan", state: "Maharashtra", label: "Central Deccan" },
  "bhopal":      { zone: "central_deccan", state: "Madhya Pradesh", label: "Central Deccan" },
  "indore":      { zone: "central_deccan", state: "Madhya Pradesh", label: "Central Deccan" },
  "jabalpur":    { zone: "central_deccan", state: "Madhya Pradesh", label: "Central Deccan" },
  "hyderabad":   { zone: "central_deccan", state: "Telangana", label: "Central Deccan" },
  "warangal":    { zone: "central_deccan", state: "Telangana", label: "Central Deccan" },
  "raipur":      { zone: "central_deccan", state: "Chhattisgarh", label: "Central Deccan" },

  // South Interior
  "bangalore":   { zone: "south_interior", state: "Karnataka", label: "South Plateau" },
  "bengaluru":   { zone: "south_interior", state: "Karnataka", label: "South Plateau" },
  "mysore":      { zone: "south_interior", state: "Karnataka", label: "South Plateau" },
  "mysuru":      { zone: "south_interior", state: "Karnataka", label: "South Plateau" },
  "hubli":       { zone: "south_interior", state: "Karnataka", label: "South Plateau" },
  "coimbatore":  { zone: "south_interior", state: "Tamil Nadu", label: "South Plateau" },
  "madurai":     { zone: "south_tropical", state: "Tamil Nadu", label: "South Tropical" },
  "salem":       { zone: "south_interior", state: "Tamil Nadu", label: "South Plateau" },

  // South Tropical
  "chennai":     { zone: "south_tropical", state: "Tamil Nadu", label: "South Tropical" },
  "madras":      { zone: "south_tropical", state: "Tamil Nadu", label: "South Tropical" },
  "kochi":       { zone: "south_tropical", state: "Kerala", label: "South Tropical" },
  "cochin":      { zone: "south_tropical", state: "Kerala", label: "South Tropical" },
  "thiruvananthapuram": { zone: "south_tropical", state: "Kerala", label: "South Tropical" },
  "trivandrum":  { zone: "south_tropical", state: "Kerala", label: "South Tropical" },
  "kozhikode":   { zone: "south_tropical", state: "Kerala", label: "South Tropical" },
  "thrissur":    { zone: "south_tropical", state: "Kerala", label: "South Tropical" },
  "visakhapatnam": { zone: "south_tropical", state: "Andhra Pradesh", label: "South Tropical" },
  "vijayawada":  { zone: "south_tropical", state: "Andhra Pradesh", label: "South Tropical" },

  // East Humid
  "kolkata":     { zone: "east_humid", state: "West Bengal", label: "East Humid" },
  "calcutta":    { zone: "east_humid", state: "West Bengal", label: "East Humid" },
  "howrah":      { zone: "east_humid", state: "West Bengal", label: "East Humid" },
  "bhubaneswar": { zone: "east_humid", state: "Odisha", label: "East Humid" },
  "cuttack":     { zone: "east_humid", state: "Odisha", label: "East Humid" },
  "ranchi":      { zone: "east_humid", state: "Jharkhand", label: "East Humid" },
  "jamshedpur":  { zone: "east_humid", state: "Jharkhand", label: "East Humid" },

  // Northeast
  "guwahati":    { zone: "northeast", state: "Assam", label: "Northeast" },
  "shillong":    { zone: "northeast", state: "Meghalaya", label: "Northeast" },
  "imphal":      { zone: "northeast", state: "Manipur", label: "Northeast" },
  "agartala":    { zone: "northeast", state: "Tripura", label: "Northeast" },
  "aizawl":      { zone: "northeast", state: "Mizoram", label: "Northeast" },

  // Himalayan
  "shimla":      { zone: "himalayan", state: "Himachal Pradesh", label: "Himalayan" },
  "manali":      { zone: "himalayan", state: "Himachal Pradesh", label: "Himalayan" },
  "dehradun":    { zone: "himalayan", state: "Uttarakhand", label: "Himalayan" },
  "nainital":    { zone: "himalayan", state: "Uttarakhand", label: "Himalayan" },
  "srinagar":    { zone: "himalayan", state: "J&K", label: "Himalayan" },
  "jammu":       { zone: "himalayan", state: "J&K", label: "Himalayan" },
  "darjeeling":  { zone: "himalayan", state: "West Bengal", label: "Himalayan" },

  // Coastal West
  "goa":         { zone: "coastal_west", state: "Goa", label: "Coastal West" },
  "panaji":      { zone: "coastal_west", state: "Goa", label: "Coastal West" },
  "margao":      { zone: "coastal_west", state: "Goa", label: "Coastal West" },
  "mangalore":   { zone: "coastal_west", state: "Karnataka", label: "Coastal West" },
  "mangaluru":   { zone: "coastal_west", state: "Karnataka", label: "Coastal West" },
  "udupi":       { zone: "coastal_west", state: "Karnataka", label: "Coastal West" },
};

// What plants grow best in each zone
export const ZONE_PREFERRED_TAGS: Record<ClimateZone, string[]> = {
  north_plains:    ["Full sun", "Drought tolerant", "Medicinal", "Subtropical"],
  west_arid:       ["Drought tolerant", "Full sun", "Succulent", "Low water"],
  central_deccan:  ["Full sun", "Drought tolerant", "Tropical", "Subtropical"],
  south_tropical:  ["Tropical", "High water", "Coastal", "Partial shade"],
  south_interior:  ["Tropical", "Subtropical", "Partial shade", "Colorful"],
  east_humid:      ["High water", "Tropical", "Humid", "Shade"],
  northeast:       ["High water", "Tropical", "Humid", "Medicinal"],
  himalayan:       ["Subtropical", "Cold tolerant", "Temperate"],
  coastal_west:    ["Tropical", "Coastal", "High water", "Full sun"],
};

// Zone-specific plant recommendations message
export const ZONE_TIPS: Record<ClimateZone, string> = {
  north_plains:    "Your hot summers & cold winters suit drought-tolerant and subtropical plants.",
  west_arid:       "Your arid climate is ideal for drought-tolerant plants and succulents.",
  central_deccan:  "Your semi-arid Deccan climate suits most tropical and subtropical plants.",
  south_tropical:  "Your tropical climate with high rainfall is perfect for lush tropical plants.",
  south_interior:  "Your mild plateau climate suits a wide variety of tropical plants.",
  east_humid:      "Your humid climate with heavy monsoon is ideal for water-loving plants.",
  northeast:       "Your very high rainfall zone supports lush tropical and medicinal plants.",
  himalayan:       "Your cool climate suits temperate plants, not typically tropical species.",
  coastal_west:    "Your coastal tropical climate is perfect for coconut, hibiscus, and tropical fruits.",
};

export function getCityInfo(city: string): CityInfo | null {
  if (!city) return null;
  return CITY_MAP[city.toLowerCase().trim()] || null;
}

export function getZoneForCity(city: string): ClimateZone | null {
  const info = getCityInfo(city);
  return info?.zone || null;
}

export function isPlantSuitableForZone(plant: any, zone: ClimateZone): boolean {
  const preferredTags = ZONE_PREFERRED_TAGS[zone];
  const plantTags = (plant.tags || []).map((t: string) => t.toLowerCase());
  const plantClimate = (plant.climate || "").toLowerCase();

  if (zone === "himalayan") {
    return plantClimate.includes("subtropical") || plantClimate.includes("temperate");
  }
  if (zone === "west_arid") {
    return plantTags.some((t: string) =>
      t.includes("drought") || t.includes("low water") || t.includes("succulent") || t.includes("full sun")
    );
  }

  return preferredTags.some(tag =>
    plantTags.some((t: string) => t.toLowerCase().includes(tag.toLowerCase())) ||
    plantClimate.includes(tag.toLowerCase())
  );
}