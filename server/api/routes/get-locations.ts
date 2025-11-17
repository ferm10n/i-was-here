import * as z from 'zod/v4';
import { defineEndpoint } from '../util.ts';
import { locations } from '../../db/schema.ts';
import { db } from '../../db/index.ts';
import { sql } from 'drizzle-orm';

export const getLocationsEndpoint = defineEndpoint({
  inputSchema: z.object({
    bounds: z.object({
      minLat: z.number(),
      maxLat: z.number(),
      minLng: z.number(),
      maxLng: z.number(),
    }).optional(),
    zoom: z.number().optional().default(15),
  }),
  protected: true,
  handler: async (input) => {
    const { bounds, zoom } = input;

    // Use geohash clustering for zoom levels < 10 (transition to individual markers sooner)
    // Precision: zoom 0-4 = 2 chars, 5-7 = 3 chars, 8-9 = 4 chars, 10+ = full precision
    const useGeohash = zoom < 10;
    const geohashPrecision = zoom < 5 ? 2 : zoom < 8 ? 3 : 4;

    if (useGeohash) {
      // Cluster by geohash - return one representative point per cluster
      const whereClause = bounds
        ? sql`WHERE geom && ST_MakeEnvelope(${bounds.minLng}, ${bounds.minLat}, ${bounds.maxLng}, ${bounds.maxLat}, 4326)`
        : sql``;

      const result = await db.execute(sql`
        SELECT 
          LEFT(ST_GeoHash(geom), ${geohashPrecision}) as geohash,
          AVG(lat) as lat,
          AVG(lng) as lng,
          COUNT(*)::int as count,
          MIN(lat) as min_lat,
          MAX(lat) as max_lat,
          MIN(lng) as min_lng,
          MAX(lng) as max_lng
        FROM ${locations}
        ${whereClause}
        GROUP BY geohash
      `);

      return {
        locations: result.rows.map((row) => {
          const r = row as Record<string, unknown>;
          return {
            id: `cluster-${r.geohash}`,
            lat: parseFloat(r.lat as string),
            lng: parseFloat(r.lng as string),
            count: r.count as number,
            bounds: {
              minLat: parseFloat(r.min_lat as string),
              maxLat: parseFloat(r.max_lat as string),
              minLng: parseFloat(r.min_lng as string),
              maxLng: parseFloat(r.max_lng as string),
            },
            isCluster: true,
          };
        }),
      };
    } else {
      // Return individual markers for high zoom levels
      if (bounds) {
        const result = await db
          .select({
            id: locations.id,
            lat: locations.lat,
            lng: locations.lng,
          })
          .from(locations)
          .where(
            sql`geom && ST_MakeEnvelope(${bounds.minLng}, ${bounds.minLat}, ${bounds.maxLng}, ${bounds.maxLat}, 4326)`
          );

        return {
          locations: result.map(loc => ({
            ...loc,
            isCluster: false,
          })),
        };
      } else {
        const result = await db
          .select({
            id: locations.id,
            lat: locations.lat,
            lng: locations.lng,
          })
          .from(locations);

        return {
          locations: result.map(loc => ({
            ...loc,
            isCluster: false,
          })),
        };
      }
    }
  },
});
