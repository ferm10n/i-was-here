/**
 * Converts a distance in meters to an appropriate Google Maps zoom level.
 * The zoom level determines how close the map is zoomed in.
 * 
 * @param meters - The radius/distance in meters
 * @returns A zoom level between 0 (world view) and 21 (building view)
 * 
 * @example
 * metersToZoom(100) // Returns ~17 (street level)
 * metersToZoom(5000) // Returns ~13 (city level)
 */
export function metersToZoom(meters: number): number {
  // At zoom level 21, one pixel represents approximately 0.3 meters at the equator
  // Each zoom level halves the resolution, so we use logarithmic scaling
  const earthCircumference = 40075017; // meters at equator

  // Calculate zoom to show the area with some padding
  // We want the meters to fit comfortably in view (assuming ~512px screen)
  const scale = meters / 256;
  const zoom = Math.log2(earthCircumference / (scale * 512));

  // Clamp between valid zoom levels (0-21)
  return Math.max(0, Math.min(21, Math.round(zoom)));
}
