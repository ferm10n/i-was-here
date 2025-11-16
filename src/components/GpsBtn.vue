<template>
  <v-btn class="ml-2" icon style="border-radius: 5px" color="blue" :disabled="!geolocationSupported"
    @click="onGpsBtnPress">
    <v-progress-circular v-if="isActive" indeterminate :size="30">
      <v-icon size="x-small">mdi-close</v-icon>
    </v-progress-circular>
    <v-icon v-else>mdi-crosshairs-gps</v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import {
  watch,
} from 'vue';
import {
  useInterval,
} from '@vueuse/core';

export type GpsUpdate = {
  lat: number;
  lng: number;
  accuracy: number;
};

const emit = defineEmits<{
  (e: 'gps-update', gpsUpdate: GpsUpdate): void;
  (e: 'update:is-active', isActive: boolean): void;
}>();

const {
  isActive,
  resume,
  pause,
} = useInterval(10 * 1000, {
  callback: () => getCurrentPosition(),
  controls: true,
  immediate: false,
})

const geolocationSupported = 'geolocation' in navigator;

let getCurrentPositionFailed = false;
function getCurrentPosition() {
  navigator.geolocation.getCurrentPosition(
    pos => {
      emit('gps-update', {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
    },
    err => {
      console.error(err);
      if (!getCurrentPositionFailed) {
        alert('Unable to determine your location! ' + err.message);
        getCurrentPositionFailed = true;
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

const onGpsBtnPress = () => {
  if (isActive.value) {
    pause();
  } else {
    getCurrentPosition();
    resume();
  }
}

watch(isActive, isActiveVal => {
  emit('update:is-active', isActiveVal);
})
</script>