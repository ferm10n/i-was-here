<template>
  <v-app>
    <v-main>
      <SignInDialog />
      <v-container class="fill-height px-8" max-width="400">
        <v-row dense>
          <v-col cols="12">
            <div style="display: flex; flex-direction: row;">
              <GoogleAddressAutocomplete style="flex: 1" :apiKey="googleMapsApiKey" v-model="placeInput"
                @callback="onPlaceSelect" class="address-lookup" placeholder="Address lookup" />
              <LocationBtn @location-update="onLocationUpdate" @update:is-active="onLocationTrackingActiveChanged" />
            </div>
          </v-col>
          <v-col cols="12">
            <MapView style="width: 100%; height: 500px" ref="mapView" :center="center" :geolocation="geolocation"
              v-model:marker-position="markerPosition" @map-interaction="onMapInteraction" />
          </v-col>
          <v-col cols="12">
            <SaveLocationBtn :marker-position="markerPosition" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GoogleAddressAutocomplete from 'vue3-google-address-autocomplete'
import { metersToZoom } from './util'
import LocationBtn, { type LocationUpdate } from './components/LocationBtn.vue'
import MapView from './components/MapView.vue'
import SaveLocationBtn from './components/SaveLocationBtn.vue'

const mapView = ref<InstanceType<typeof MapView> | null>(null);

const placeInput = ref('');

const center = { lat: 43.98335154739757, lng: -84.80892366670454 }
// const initialZoom - 1;
const markerPosition = ref(center)

// we've already loaded the library in main.ts, but the apiKey is a required prop
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const onPlaceSelect = (event: { geometry?: { location?: google.maps.LatLng } }) => {
  if (mapView.value && event.geometry?.location) {
    mapView.value.panTo(event.geometry.location);
    mapView.value.setZoom(metersToZoom(20))
  }
}

const geolocation = ref<LocationUpdate | null>(null);
const autoView = ref(true);

const onLocationUpdate = (locationUpdate: LocationUpdate) => {
  geolocation.value = locationUpdate;

  if (mapView.value && autoView.value) {
    mapView.value.panTo({ lat: locationUpdate.lat, lng: locationUpdate.lng })
    mapView.value.setZoom(metersToZoom(locationUpdate.accuracy))
  }
}

const onMapInteraction = () => {
  console.log('map interaction');
  autoView.value = false;
}

const onLocationTrackingActiveChanged = () => {
  console.log('autoView enabled')
  autoView.value = true;
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
