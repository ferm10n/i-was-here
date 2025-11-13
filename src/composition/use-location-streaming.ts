import { onMounted } from 'vue';
import { apiRequest } from '../util.ts';
import { reactive } from 'vue';
import { onUnmounted } from 'vue';

export function useLocationStreaming() {
  let source: EventSource | null;
  const locations = reactive<{ lat: number; lng: number; }[]>([]);

  onMounted(() => {
    apiRequest('/api/get-locations', {}).then(({ locations: existingLocations }) => {
      console.log({ existingLocations });
      locations.push(...existingLocations);
    });

    source = new EventSource('/api/watch-locations');
    source.onmessage = e => {
      const newLocation = JSON.parse(e.data);
      console.log({ newLocation });
      locations.push(newLocation);
    };
  });

  onUnmounted(() => {
    if (source) {
      source.close();
    }
  });

  return { locations };
}