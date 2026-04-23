export function calculateDistanceKm(from, to) {
  if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) return null;

  const earthRadiusKm = 6371;
  const dLat = toRadians(Number(to.lat) - Number(from.lat));
  const dLng = toRadians(Number(to.lng) - Number(from.lng));
  const lat1 = toRadians(Number(from.lat));
  const lat2 = toRadians(Number(to.lat));

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function formatDistanceKm(distanceKm) {
  if (distanceKm == null || Number.isNaN(distanceKm)) return "";
  if (distanceKm < 1) {
    return `A ${Math.round(distanceKm * 1000)} m de ti`;
  }
  return `A ${distanceKm.toFixed(1)} km de ti`;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}
