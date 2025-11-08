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
                :api-key="googleMapsApiKey"
                style="width: 100%; height: 500px"
                :center="center"
                :zoom="15"
              >
                <Marker :options="{ position: center }" />
              </GoogleMap>
            </v-card>
          </v-col>
          <v-col v-cols="12">
            <div>Enter address here</div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { GoogleMap, Marker } from 'vue3-google-map'

const center = { lat: 40.689247, lng: -74.044502 }
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
</script>
