<template>
  <v-app>
    <v-main>
      <v-container class="fill-height px-8" max-width="400">
        <v-row>
          <v-col cols="12">
            <div class="text-center">
              <div class="text-body-2 font-weight-light mb-n1">Long press on the map or type in an address</div>
            </div>
          </v-col>
          <v-col cols="12">
            <v-card
              class="py-4"
              color="surface-variant"
              rounded="lg"
              variant="tonal"
            >
              <GoogleMap
                ref="googleMap"
                :api-key="googleMapsApiKey"
                map-id="DEMO_MAP_ID"
                style="width: 100%; height: 500px"
                :center="center"
                :zoom="15"
                :fullscreen-control="false"
                :clickable-icons="false"
                :disable-default-ui="true"
                gesture-handling="greedy"
                @click="onMapClick"
                @dragend="updateMarkerByMapCenter"
              >
                <AdvancedMarker :options="{ position: markerPosition }" />
              </GoogleMap>
            </v-card>
          </v-col>
          <v-col cols="12">
            <div>Enter address here</div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  GoogleMap,
  AdvancedMarker,

} from 'vue3-google-map'

const googleMap = ref<{
  map: google.maps.Map;
} | null>(null);

const center = { lat: 40.689247, lng: -74.044502 }
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const markerPosition = ref(center)

const onMapClick = (event: google.maps.MapMouseEvent) => {
  if (event.latLng) {
    markerPosition.value = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    }

    if (googleMap.value) {
      googleMap.value.map.panTo(event.latLng);
    }
  }
}

const updateMarkerByMapCenter = () => {
  const newCenter = googleMap.value?.map.getCenter();
  if (newCenter) {
    markerPosition.value = {
      lat: newCenter.lat(),
      lng: newCenter.lng(),
    };
  }
}
</script>
