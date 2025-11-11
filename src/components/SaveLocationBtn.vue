<template>
  <div class="d-flex elevation-2" v-ripple @click="saveLocation">
    <v-sheet color="green" style="flex: 1; font-size: larger !important"
      class="text-center text-button rounded rounded-be-0 rounded-te-0">
      I WAS HERE
    </v-sheet>
    <v-divider vertical />
    <v-sheet v-ripple @click.stop="expanded = !expanded" color="green"
      class="d-flex flex-column justify-center px-2 rounded-be rounded-te">
      <v-icon>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </v-sheet>
  </div>
  <div v-if="expanded">
    <v-checkbox v-model="revisit" hide-details label="Revisit" />
    <v-text-field v-model="note" hide-details label="Note" clearable />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { apiRequest } from '../util';

interface Props {
  markerPosition: { lat: number; lng: number };
}

const props = defineProps<Props>();
const expanded = ref(false);
const note = ref('');
const revisit = ref(false);

async function saveLocation() {
  try {
    const result = await apiRequest('/api/save-location', {
      lat: props.markerPosition.lat,
      lng: props.markerPosition.lng,
      note: note.value || undefined,
      revisit: revisit.value || undefined,
    });

    console.log('Location saved:', result);
    // TODO: Show success message to user

    // Reset form
    note.value = '';
    revisit.value = false;
  } catch (error) {
    console.error('Failed to save location:', error);
    // TODO: Show error message to user
  }
}
</script>