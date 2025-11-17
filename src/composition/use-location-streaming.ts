import { onMounted, type Ref } from 'vue';
import { apiRequest } from '../util.ts';
import { reactive } from 'vue';
import { onUnmounted } from 'vue';
import { watch } from 'vue';

interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  zoom?: number;
}

interface Location {
  id: number | string;
  lat: number;
  lng: number;
  count?: number;
  isCluster?: boolean;
}

export function useLocationStreaming(bounds?: Ref<Bounds | null>) {
  let source: EventSource | null;
  const clusterMarkers = reactive<Location[]>([]);
  const individualMarkers = reactive<Location[]>([]);
  const locations = reactive<Location[]>([]);
  let retryTimeout: number | null = null;
  let isUnmounted = false;

  const fetchLocations = async () => {
    if (!bounds?.value) return;

    const boundsValue = bounds.value;
    const params = {
      bounds: {
        minLat: boundsValue.minLat,
        maxLat: boundsValue.maxLat,
        minLng: boundsValue.minLng,
        maxLng: boundsValue.maxLng,
      },
      zoom: boundsValue.zoom,
    };

    await apiRequest('/api/get-locations', params).then(({ locations: existingLocations }) => {
      // Clear cluster markers on every fetch
      clusterMarkers.splice(0, clusterMarkers.length);

      for (const newLoc of existingLocations) {
        if (newLoc.isCluster) {
          // Add to cluster markers (always fresh)
          clusterMarkers.push(newLoc);
        } else {
          // Add to individual markers, avoiding duplicates
          const exists = individualMarkers.some(loc => loc.id === newLoc.id);
          if (!exists) {
            individualMarkers.push(newLoc);
          }
        }
      }

      // Update the combined locations array - show only one type at a time
      // Show clusters if we have any, otherwise show individual markers
      locations.splice(0, locations.length, ...(clusterMarkers.length > 0 ? clusterMarkers : individualMarkers));
    });
  };

  const connectEventSource = () => {
    if (isUnmounted) return;

    source = new EventSource('/api/watch-locations');

    source.onmessage = e => {
      const newLocation = JSON.parse(e.data);
      // Only add real locations from EventSource, not clusters
      if (!newLocation.isCluster) {
        const exists = individualMarkers.some(loc => loc.id === newLocation.id);
        if (!exists) {
          individualMarkers.push(newLocation);
          locations.push(newLocation);
        }
      }
    };

    source.onerror = () => {
      console.warn('EventSource connection error, retrying in 5 seconds...');
      source?.close();

      // Retry after 5 seconds
      if (!isUnmounted) {
        retryTimeout = setTimeout(() => {
          connectEventSource();
        }, 5000);
      }
    };
  };

  onMounted(async () => {
    await fetchLocations();
    connectEventSource();
  });

  // Refetch locations when bounds change
  if (bounds) {
    watch(bounds, async (newBounds) => {
      if (newBounds) {
        await fetchLocations();
      }
    }, { deep: true });
  }

  onUnmounted(() => {
    isUnmounted = true;
    if (source) {
      source.close();
    }
    if (retryTimeout) {
      clearTimeout(retryTimeout);
    }
  });

  return { locations };
}