// ===============================
// src/services/location.ts
// ===============================
export type LatLng = { lat: number; lng: number };


export function getCurrentPosition(options?: PositionOptions) {
return new Promise<GeolocationPosition>((resolve, reject) => {
if (!navigator.geolocation) return reject(new Error("Geolocalização não suportada"));
navigator.geolocation.getCurrentPosition(resolve, reject, options);
});
}


export function watchPosition(callback: (pos: GeolocationPosition) => void, options?: PositionOptions) {
if (!navigator.geolocation) throw new Error("Geolocalização não suportada");
const id = navigator.geolocation.watchPosition(callback, console.error, options);
return () => navigator.geolocation.clearWatch(id);
}


export function haversine(a: LatLng, b: LatLng) {
const R = 6371e3; // m
const toRad = (x: number) => (x * Math.PI) / 180;
const φ1 = toRad(a.lat);
const φ2 = toRad(b.lat);
const Δφ = toRad(b.lat - a.lat);
const Δλ = toRad(b.lng - a.lng);
const s =
Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
Math.cos(φ1) * Math.cos(φ2) *
Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
return R * c; // meters
}


export function openInMaps({ lat, lng }: LatLng, label = "Destino") {
const url = `https://www.google.com/maps?q=${lat},${lng}(${encodeURIComponent(label)})`;
window.open(url, "_blank");
}
