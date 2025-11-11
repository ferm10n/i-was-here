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
    <v-checkbox hide-details label="Revisit" />
    <v-text-field hide-details label="Note" clearable />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';


const expanded = ref(false);

function saveLocation() {

}
</script>