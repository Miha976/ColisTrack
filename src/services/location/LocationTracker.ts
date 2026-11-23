import type { GeoPoint } from '@/models/Address';

export interface LocationTracker {
  start(onPosition: (p: GeoPoint) => void, onError: (e: Error) => void): Promise<void>;
  stop(): Promise<void>;
}
