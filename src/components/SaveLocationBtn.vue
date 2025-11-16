<template>
  <div class="d-flex elevation-2" v-ripple @click="saveLocation" :style="{ opacity: disabled ? 0.5 : 1 }">
    <v-sheet color="green" outlined style="flex: 1; font-size: larger !important"
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
  <v-dialog max-width="4in" v-model="confirmDialogActive" persistent>
    <v-card>
      <v-card-text>
        Please ensure the <span class="text-red">red</span> marker is your current location
      </v-card-text>
      <v-card-text>
        <v-checkbox v-model="skipConfirm" label="Skip this next time" />
      </v-card-text>
      <v-card-actions>
        <v-btn color="success" @click="confirmDialog">
          Ok
        </v-btn>
        <v-spacer />
        <v-btn color="error" @click="cancelDialog">
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { apiRequest, skipConfirm, type LastInteraction } from '../util';
import { useConfirmDialog } from '@vueuse/core';

interface Props {
  markerPosition: { lat: number; lng: number };
  gpsAccuracyMeters: number | null;
  lastInteraction: LastInteraction;
  address: string;
}

const props = withDefaults(defineProps<Props>(), {
  lastInteraction: 'pending',
});
const expanded = ref(false);
const note = ref('');
const revisit = ref(false);

const disabled = computed<string | false>(() => {
  // the button might be disabled depending on how the user last interacted with the map.
  if (props.lastInteraction === 'pending') {
    // the user has not interacted at all with the map
    return 'Position the map marker to your location';
  } else if (props.lastInteraction === 'gps' && props.gpsAccuracyMeters && props.gpsAccuracyMeters > 10) {
    return 'GPS location is an approximation. Please position the marker manually';
  }
  return false;
});

const {
  reveal: revealConfirmDialog,
  isRevealed: confirmDialogActive,
  cancel: cancelDialog,
  confirm: confirmDialog,
} = useConfirmDialog();

async function saveLocation() {
  if (disabled.value) {
    alert(disabled.value);
    return;
  }

  if (!skipConfirm.value) {
    // depending on the last interaction, we should confirm 
    const { isCanceled } = await revealConfirmDialog();
    if (isCanceled) {
      return;
    }
  }

  try {
    await apiRequest('/api/save-location', {
      lat: props.markerPosition.lat,
      lng: props.markerPosition.lng,
      note: note.value || undefined,
      revisit: revisit.value || undefined,
      accuracy: props.lastInteraction === 'gps' ? props.gpsAccuracyMeters : null,
      address: props.lastInteraction === 'address' ? props.address : null,
    });

    alert('Location saved successfully!');

    // Reset form
    note.value = '';
    revisit.value = false;
  } catch (error) {
    console.error('Failed to save location:', error);
    alert(`Failed to save location. Please try again. \n(Error: ${(error as Error).message})`);
  }
}
</script>