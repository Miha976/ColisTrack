import type { Address } from '@/models/Address';

export interface GeocodingService {
  search(query: string, limit?: number): Promise<Address[]>;
}
