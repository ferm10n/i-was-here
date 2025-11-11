<template>
  <GoogleMap ref="googleMap" map-id="DEMO_MAP_ID" :center="center" :zoom="15" :fullscreen-control="false"
    :clickable-icons="false" gesture-handling="greedy" class="map" @click="onMapClick"
    @center_changed="updateMarkerByMapCenter" @dragend="onMapDragEnd">

    <AdvancedMarker :options="{ position: markerPosition }" />

    <CustomMarker v-if="geolocation" :options="{
      position: geolocation
    }">
      <div class="geolocation" />
    </CustomMarker>

    <Circle v-if="geolocation" :options="{
      center: geolocation,
      fillColor: '#03A9F4',
      strokeColor: '#03A9F4',
      strokeWeight: 1,
      radius: geolocation.accuracy,
      fillOpacity: .2,
    }" />
  </GoogleMap>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  GoogleMap,
  Circle,
  CustomMarker,
  AdvancedMarker,
} from 'vue3-google-map'
import { watchDebounced } from '@vueuse/core'
import type { LocationUpdate } from './LocationBtn.vue'

interface Props {
  center?: { lat: number; lng: number }
  geolocation?: LocationUpdate | null
  markerPosition?: { lat: number; lng: number }
}

const props = withDefaults(defineProps<Props>(), {
  center: () => ({ lat: 40.689247, lng: -74.044502 }),
  geolocation: null,
  markerPosition: () => ({ lat: 40.689247, lng: -74.044502 })
})

const emit = defineEmits<{
  'update:markerPosition': [position: { lat: number; lng: number }]
  'mapInteraction': []
}>()

const googleMap = ref<{
  map: google.maps.Map;
} | null>(null);

const currentMapCenter = ref(props.center);
const markerPosition = ref(props.markerPosition)

const onMapClick = (event: google.maps.MapMouseEvent) => {
  emit('mapInteraction')

  if (event.latLng) {
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    }
    markerPosition.value = newPosition
    emit('update:markerPosition', newPosition)

    if (googleMap.value) {
      googleMap.value.map.panTo(event.latLng);
    }
  }
}

watchDebounced(currentMapCenter, (currentMapCenterValue) => {
  markerPosition.value = currentMapCenterValue;
  emit('update:markerPosition', currentMapCenterValue)
}, { debounce: 100, maxWait: 1000 })

const updateMarkerByMapCenter = () => {
  const newCenter = googleMap.value?.map.getCenter();
  if (newCenter) {
    currentMapCenter.value = {
      lat: newCenter.lat(),
      lng: newCenter.lng(),
    };
  }
}

const onMapDragEnd = () => {
  emit('mapInteraction')
}

const panTo = (location: google.maps.LatLng | google.maps.LatLngLiteral) => {
  googleMap.value?.map.panTo(location);
}

const setZoom = (zoom: number) => {
  googleMap.value?.map.setZoom(zoom);
}

defineExpose({
  panTo,
  setZoom,
  map: googleMap
})
</script>

<style lang="css" scoped>
.map {
  border-radius: 5px;
  overflow: hidden;
}

.geolocation {
  background-color: #03A9F4;
  width: .2in;
  height: .2in;
  border: #FFF .02in solid;
  border-radius: 100%;
}
</style>
