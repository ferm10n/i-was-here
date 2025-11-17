<template>
  <GoogleMap ref="googleMap" map-id="DEMO_MAP_ID" :center="center" :zoom="6" :fullscreen-control="false"
    :clickable-icons="false" gesture-handling="greedy" class="map" @click="onMapClick" @center_changed="onCenterChanged"
    @dragend="onMapDragEnd">

    <AdvancedMarker :options="{ position: markerPosition, zIndex: 10 }" />

    <AdvancedMarker v-for="l in locations" :key="l.id" :options="{ position: l }" :pin-options="l.isCluster ? {
      background: '#FF9800',
      borderColor: '#F57C00',
      glyphColor: 'white',
      glyph: l.count?.toString() || '',
      scale: 1.3
    } : {
      background: '#2196F3',
      borderColor: '#1976D2',
      glyphColor: 'white'
    }" />

    <Circle v-for="l in locations.filter(l => l.isCluster && l.bounds)" :key="`bounds-${l.id}`" :options="{
      center: l,
      fillColor: '#FF9800',
      strokeColor: '#F57C00',
      strokeWeight: 1,
      radius: calculateClusterRadius(l.bounds),
      fillOpacity: .15,
    }" />

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
import { onMounted, onUnmounted, ref } from 'vue'
import {
  GoogleMap,
  Circle,
  CustomMarker,
  AdvancedMarker,
} from 'vue3-google-map'
import { watchDebounced } from '@vueuse/core'
import type { GpsUpdate } from './GpsBtn.vue'
import { useLocationStreaming } from '@/composition/use-location-streaming'

interface Props {
  center?: { lat: number; lng: number }
  geolocation?: GpsUpdate | null
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

/**
 * reflects the map's current center position
 */
const currentMapCenter = ref(props.center);
const markerPosition = ref(props.markerPosition)

/**
 * pans the map to the clicked position and updates the location marker
 */
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

/**
 * debounce updates from the map's center to the marker position
 */
watchDebounced(currentMapCenter, (currentMapCenterValue) => {
  markerPosition.value = currentMapCenterValue;
  emit('update:markerPosition', currentMapCenterValue)
}, { debounce: 100, maxWait: 1000 })

const onCenterChanged = () => {
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

/**
 * Calculate map bounds for efficient location queries
 */
const mapBounds = ref<{
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  zoom: number;
} | null>(null);

const updateBounds = () => {
  const bounds = googleMap.value?.map.getBounds();
  const zoom = googleMap.value?.map.getZoom();
  if (bounds && zoom !== undefined) {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    mapBounds.value = {
      minLat: sw.lat(),
      maxLat: ne.lat(),
      minLng: sw.lng(),
      maxLng: ne.lng(),
      zoom,
    };
  }
};

// Update bounds on map interactions
watchDebounced(currentMapCenter, updateBounds, { debounce: 500, maxWait: 2000 });

onMounted(() => {
  // Initial bounds calculation after map loads
  setTimeout(updateBounds, 1000);
});

/**
 * Calculate the radius in meters for a cluster bounds circle
 * Uses Haversine formula for great-circle distance
 */
const calculateClusterRadius = (bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
  if (!bounds) return 0;

  // Calculate the distance from center to corner using Haversine formula
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;

  // Use the northeast corner for radius calculation
  const lat1 = centerLat * Math.PI / 180;
  const lat2 = bounds.maxLat * Math.PI / 180;
  const dLat = (bounds.maxLat - centerLat) * Math.PI / 180;
  const dLng = (bounds.maxLng - centerLng) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const earthRadius = 6371000; // Earth's radius in meters

  return earthRadius * c;
};

const { locations } = useLocationStreaming(mapBounds);
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
