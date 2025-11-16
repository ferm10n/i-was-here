<template>
  <div>
    <SignInDialog v-if="!user" />
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>I Was Here</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item v-if="user" :title="user.name" :subtitle="user.email">
          <template v-slot:prepend>
            <v-avatar color="primary">
              <v-img v-if="user.picture" :src="user.picture" referrerpolicy="no-referrer"></v-img>
              <span v-else class="text-h6">{{ user.name?.charAt(0) }}</span>
            </v-avatar>
          </template>
        </v-list-item>
        <v-divider v-if="user"></v-divider>
        <v-list-item @click="signOut" title="Sign Out" prepend-icon="mdi-logout"></v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SignInDialog from './SignInDialog.vue';
import { currentUser } from '../util.ts';

const drawer = ref(false);
const user = currentUser;

async function signOut() {
  try {
    await fetch('/api/signout', {
      method: 'POST',
    });
    // Reload the page to clear state and redirect to login if needed
    window.location.reload();
  } catch (err) {
    console.error('Failed to sign out', err);
  }
}
</script>
