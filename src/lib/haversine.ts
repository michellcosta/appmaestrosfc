/**
 * Calcula a distância em metros entre duas coordenadas geográficas
 * usando a fórmula de Haversine
 */
export function metersBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Raio da Terra em metros
  const toRad = (d: number) => d * Math.PI / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) ** 2 + 
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Verifica se um ponto está dentro de uma geofence circular
 */
export function isWithinGeofence(
  userLat: number,
  userLng: number,
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): boolean {
  const distance = metersBetween(userLat, userLng, centerLat, centerLng);
  return distance <= radiusMeters;
}

/**
 * Valida se a precisão do GPS é aceitável
 */
export function isAccuracyAcceptable(accuracy: number, maxAccuracy: number = 25): boolean {
  return accuracy <= maxAccuracy;
}
