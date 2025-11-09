<template>
  <v-app>
    <v-main>
      <v-container class="fill-height px-8" max-width="400">
        <v-row dense>
          <v-col cols="12">
            <div style="display: flex; flex-direction: row;">
              <GoogleAddressAutocomplete style="flex: 1" :apiKey="googleMapsApiKey" v-model="placeInput"
                @callback="onPlaceSelect" class="address-lookup" placeholder="Address lookup" />
              <v-btn class="ml-2" icon="mdi-crosshairs-gps" style="border-radius: 5px" color="blue"
                :disabled="!geolocationSupported" @click="onLocationClick" />
            </div>
          </v-col>
          <v-col cols="12">
            <GoogleMap ref="googleMap" :api-key="googleMapsApiKey" map-id="DEMO_MAP_ID"
              style="width: 100%; height: 500px" :center="center" :zoom="15" :fullscreen-control="false"
              :clickable-icons="false" :disable-default-ui="true" gesture-handling="greedy" class="map"
              @click="onMapClick" @center_changed="updateMarkerByMapCenter">

              <!-- <AdvancedMarker :options="{ position: markerPosition }" /> -->

              <CustomMarker v-if="geolocation" :options="{
                position: { lat: geolocation.coords.latitude, lng: geolocation.coords.longitude }
              }">
                <div class="geolocation" />
              </CustomMarker>

              <Circle v-if="geolocation" :options="{
                center: { lat: geolocation.coords.latitude, lng: geolocation.coords.longitude },
                fillColor: '#03A9F4',
                strokeColor: '#03A9F4',
                strokeWeight: 1,
                radius: geolocation.coords.accuracy,
                fillOpacity: .2,
              }" />
            </GoogleMap>
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
  Circle,
  CustomMarker,
} from 'vue3-google-map'
import GoogleAddressAutocomplete from 'vue3-google-address-autocomplete'
import { watchDebounced } from '@vueuse/core'
import glyphSrc from './assets/favicon.ico'

const googleMap = ref<{
  map: google.maps.Map;
} | null>(null);

const placeInput = ref('');

const center = { lat: 40.689247, lng: -74.044502 }
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const currentMapCenter = ref(center);
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

watchDebounced(currentMapCenter, (currentMapCenterValue) => {
  markerPosition.value = currentMapCenterValue;
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

const onPlaceSelect = (event: { geometry?: { location?: google.maps.LatLng } }) => {
  if (googleMap.value && event.geometry?.location) {
    googleMap.value?.map.panTo(event.geometry?.location);
  }
}

const geolocationSupported = 'geolocation' in navigator;

const geolocation = ref<GeolocationPosition | null>(null);

const onLocationClick = () => {
  navigator.geolocation.getCurrentPosition(
    pos => {
      geolocation.value = pos;
      if (googleMap.value) {
        googleMap.value.map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        // googleMap.value.map.setZoom
      }
    },
    err => {
      console.error(err);
      alert('Unable to determine your location! ' + err.message);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}
</script>

<style lang="css" scoped>
.address-lookup {
  width: 100%;
  padding: 10px 10px;
  background-color: white;
  color: black;
  border-radius: 5px;
}

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
