<template>
  <v-dialog max-width="4in" v-model="showSignInDialog" persistent>
    <v-card>
      <v-card-title>Sign In</v-card-title>
      <v-card-text>
        Please sign in to continue.
      </v-card-text>
      <v-card-actions>
        <v-btn :href="googleSignInLink" color="white" block variant="tonal">
          <v-icon class="mr-2">mdi-google</v-icon>
          Sign in with Google
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { GOOGLE_OAUTH_REDIRECT_PATH } from '@/consts';
import {
  authFailure,
} from '../util.ts';
import { ref, watch } from 'vue';

const redirectUri = `${import.meta.env.VITE_GOOGLE_OAUTH_REDIRECT_ORIGIN}${GOOGLE_OAUTH_REDIRECT_PATH}`;
const trueRedirectUri = `${window.location.origin}${GOOGLE_OAUTH_REDIRECT_PATH}`;
const oauthState = JSON.stringify({ trueRedirectUri });
const googleSignInLink = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email profile&prompt=select_account&state=${oauthState}`

const showSignInDialog = ref(true);
watch(authFailure, (newValue) => {
  if (newValue) {
    showSignInDialog.value = true;
  }
});

</script>