// Distance helpers (Haversine)
export type LatLng = { lat: number; lng: number };

const toRad = (v: number) => (v * Math.PI) / 180;
const R = 6371000; // meters

export function distanceInMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1));
}

export function withinRadius(current: LatLng, target: LatLng, radiusMeters = 30) {
  return distanceInMeters(current, target) <= radiusMeters;
}
