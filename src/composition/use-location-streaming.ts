import { onMounted } from 'vue';
import { apiRequest } from '../util.ts';
import { reactive } from 'vue';
import { onUnmounted } from 'vue';

export function useLocationStreaming() {
  let source: EventSource | null;
  const locations = reactive<{ lat: number; lng: number; }[]>([]);
  let retryTimeout: number | null = null;
  let isUnmounted = false;

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
    await apiRequest('/api/get-locations', {}).then(({ locations: existingLocations }) => {
      locations.push(...existingLocations);
    });

    connectEventSource();
  });

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