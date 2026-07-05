// Live Philippine Standard Geographic Code (PSGC) data -- replaces the
// previous hand-typed REGIONS list in RegionPicker.tsx, which had made-up
// city groupings that didn't match real PH geography (e.g. cities from the
// wrong province listed under CALABARZON). Free, public, no API key.
// https://psgc.gitlab.io/api/

const PSGC_BASE = 'https://psgc.gitlab.io/api';

export type PsgcRegion = {
  code: string;
  name: string;
  regionName: string;
};

export type PsgcCity = {
  code: string;
  name: string;
  regionCode: string;
};

let regionsCache: PsgcRegion[] | null = null;
let citiesCache: PsgcCity[] | null = null;

export async function getRegions(): Promise<PsgcRegion[]> {
  if (regionsCache) return regionsCache;

  const response = await fetch(`${PSGC_BASE}/regions/`);
  if (!response.ok) throw new Error('Could not load Philippine regions.');
  const data = (await response.json()) as PsgcRegion[];
  regionsCache = data.sort((a, b) => a.name.localeCompare(b.name));
  return regionsCache;
}

/**
 * Nationwide list (~1,600 entries) fetched once and cached in memory for
 * the life of the app -- lets region expansion AND search-by-city work
 * without a network round trip per region tap.
 */
export async function getAllCities(): Promise<PsgcCity[]> {
  if (citiesCache) return citiesCache;

  const response = await fetch(`${PSGC_BASE}/cities-municipalities/`);
  if (!response.ok) throw new Error('Could not load Philippine cities and municipalities.');
  const data = (await response.json()) as PsgcCity[];
  citiesCache = data;
  return citiesCache;
}

export type RegionWithCities = {
  code: string;
  name: string;
  regionName: string;
  cities: PsgcCity[];
};

export async function getRegionsWithCities(): Promise<RegionWithCities[]> {
  const [regions, cities] = await Promise.all([getRegions(), getAllCities()]);
  const citiesByRegion = new Map<string, PsgcCity[]>();
  for (const city of cities) {
    const list = citiesByRegion.get(city.regionCode);
    if (list) list.push(city);
    else citiesByRegion.set(city.regionCode, [city]);
  }

  return regions.map((region) => ({
    ...region,
    cities: (citiesByRegion.get(region.code) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
  }));
}
