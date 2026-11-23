import { describe, expect, it } from 'vitest';
import { distanceMeters, formatDistance } from './geo';

describe('geo', () => {
  it('calcule ~2 km entre Bastille et Nation', () => {
    const d = distanceMeters({ lat: 48.8532, lng: 2.3692 }, { lat: 48.8483, lng: 2.3959 });
    expect(d).toBeGreaterThan(1900);
    expect(d).toBeLessThan(2100);
  });
  it('vaut 0 pour un même point', () => {
    expect(distanceMeters({ lat: 1, lng: 1 }, { lat: 1, lng: 1 })).toBe(0);
  });
  it('formate en m puis km', () => {
    expect(formatDistance(184)).toBe('180 m');
    expect(formatDistance(2350)).toBe('2,4 km');
  });
});
