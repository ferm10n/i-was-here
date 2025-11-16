<template>
  <v-app>
    <AppBar />
    <v-main>
      <v-container class="fill-height px-8" max-width="400">
        <v-row dense>
          <v-col cols="12">
            <div style="display: flex; flex-direction: row;">
              <GoogleAddressAutocomplete style="flex: 1" :apiKey="googleMapsApiKey" v-model="placeInput"
                @callback="onPlaceSelect" class="address-lookup" placeholder="Address lookup" />
              <GpsBtn @gpsUpdate="onGpsUpdate" @update:is-active="onGpsButtonToggle" />
            </div>
          </v-col>
          <v-col cols="12">
            <MapView style="width: 100%; height: 500px" ref="mapView" :center="center" :geolocation="geolocation"
              v-model:marker-position="markerPosition" @map-interaction="onMapInteraction" />
          </v-col>
          <v-col cols="12">
            <SaveLocationBtn :address="placeInput" :marker-position="markerPosition"
              :gps-accuracy-meters="geolocation?.accuracy ?? null" :last-interaction="lastInteraction" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
// @ts-expect-error no types, too lazy to shim
import GoogleAddressAutocomplete from 'vue3-google-address-autocomplete'
import { metersToZoom, type LastInteraction } from './util'
import GpsBtn, { type GpsUpdate } from './components/GpsBtn.vue'
import MapView from './components/MapView.vue'
import SaveLocationBtn from './components/SaveLocationBtn.vue'
import AppBar from './components/AppBar.vue'

const mapView = ref<InstanceType<typeof MapView> | null>(null);

const placeInput = ref('');

const center = { lat: 43.98335154739757, lng: -84.80892366670454 }

const markerPosition = ref(center)

// we've already loaded the library in main.ts, but the apiKey is a required prop
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const onPlaceSelect = (event: { geometry?: { location?: google.maps.LatLng; formatted_address: string } }) => {
  if (mapView.value && event.geometry?.location) {
    mapView.value.panTo(event.geometry.location);
    mapView.value.setZoom(metersToZoom(20))
    lastInteraction.value = 'address';
    panOnGpsUpdate.value = false;
    placeInput.value = '';
  }
}

const geolocation = ref<GpsUpdate | null>(null);
/**
 * determines whether the marker should move to the GPS location when it is updated.
 * 
 * when GPS tracking is enabled, we should set this to true, and false when the user interacts with the map (manually or by entering an address)
 */
const panOnGpsUpdate = ref(true);

const onGpsUpdate = (gpsUpdate: GpsUpdate) => {
  geolocation.value = gpsUpdate;

  if (mapView.value && panOnGpsUpdate.value) {
    mapView.value.panTo({ lat: gpsUpdate.lat, lng: gpsUpdate.lng })
    mapView.value.setZoom(metersToZoom(gpsUpdate.accuracy))
    lastInteraction.value = 'gps';
  }
}

const lastInteraction = ref<LastInteraction>('pending');

const onMapInteraction = () => {
  lastInteraction.value = 'manual';
  panOnGpsUpdate.value = false; // prevent auto moving
}

// when the gps button is enabled, the next gps update should move the map
const onGpsButtonToggle = (isActive: boolean) => {
  panOnGpsUpdate.value = isActive;
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
</style>
