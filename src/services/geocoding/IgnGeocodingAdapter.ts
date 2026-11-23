import type { Address } from '@/models/Address';
import type { GeocodingService } from './GeocodingService';

interface GeoJsonFeature {
  geometry: { coordinates: [number, number] };
  properties: { label: string; name: string; postcode: string; city: string };
}

/**
 * Patron Adapter : convertit la réponse GeoJSON de l'API Géoplateforme (IGN, ex-API Adresse BAN)
 * vers le modèle Address de l'application.
 */
export class IgnGeocodingAdapter implements GeocodingService {
  constructor(private readonly baseUrl = 'https://data.geopf.fr/geocodage/search') {}

  async search(query: string, limit = 5): Promise<Address[]> {
    const q = query.trim();
    if (q.length < 3) return [];
    const url = `${this.baseUrl}?q=${encodeURIComponent(q.slice(0, 200))}&limit=${limit}&index=address`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Géocodage indisponible (${res.status})`);
    const data: { features: GeoJsonFeature[] } = await res.json();
    return data.features.map(IgnGeocodingAdapter.toAddress);
  }

  private static toAddress(f: GeoJsonFeature): Address {
    const [lng, lat] = f.geometry.coordinates;
    const { label, name, postcode, city } = f.properties;
    return { label, street: name, postcode, city, lat, lng };
  }
}
