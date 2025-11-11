/**
 * Parse CSV data from public/data folder
 */
export interface HotelData {
  id: string;
  name: string;
  image_url: string;
  category: string;
  city: string;
}

export interface ShowData {
  id: string;
  name: string;
  image_url: string;
  category: string;
  location: string;
}

export interface FlightData {
  id: string;
  name: string;
  image_url: string;
  airline: string;
  route: string;
}

function parseCSV<T>(csvText: string): T[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const data: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row as T);
  }

  return data;
}

export async function loadHotels(): Promise<HotelData[]> {
  try {
    const response = await fetch('/data/hotels.csv');
    const csvText = await response.text();
    return parseCSV<HotelData>(csvText);
  } catch (error) {
    console.error('Error loading hotels CSV:', error);
    return [];
  }
}

export async function loadShows(): Promise<ShowData[]> {
  try {
    const response = await fetch('/data/shows.csv');
    const csvText = await response.text();
    return parseCSV<ShowData>(csvText);
  } catch (error) {
    console.error('Error loading shows CSV:', error);
    return [];
  }
}

export async function loadFlights(): Promise<FlightData[]> {
  try {
    const response = await fetch('/data/flights.csv');
    const csvText = await response.text();
    return parseCSV<FlightData>(csvText);
  } catch (error) {
    console.error('Error loading flights CSV:', error);
    return [];
  }
}

/**
 * Get a random item from an array
 */
export function getRandomItem<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}
