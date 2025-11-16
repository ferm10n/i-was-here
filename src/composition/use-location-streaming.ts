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
}

export function useLocationStreaming(bounds?: Ref<Bounds | null>) {
  let source: EventSource | null;
  const locations = reactive<{ id: number; lat: number; lng: number; }[]>([]);
  let retryTimeout: number | null = null;
  let isUnmounted = false;

  const fetchLocations = async () => {
    const boundsValue = bounds?.value;
    const params = boundsValue ? {
      minLat: boundsValue.minLat,
      maxLat: boundsValue.maxLat,
      minLng: boundsValue.minLng,
      maxLng: boundsValue.maxLng,
    } : {};

    await apiRequest('/api/get-locations', params).then(({ locations: existingLocations }) => {
      // Add new locations, avoiding duplicates based on id
      for (const newLoc of existingLocations) {
        const exists = locations.some(loc => loc.id === newLoc.id);
        if (!exists) {
          locations.push(newLoc);
        }
      }
    });
  };

  const connectEventSource = () => {
    if (isUnmounted) return;

    source = new EventSource('/api/watch-locations');

    source.onmessage = e => {
      const newLocation = JSON.parse(e.data);
      locations.push(newLocation);
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