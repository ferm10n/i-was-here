<template>
  <v-dialog max-width="4in" v-model="showSignInDialog">
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
        <!-- <div id="g_id_onload"
            data-client_id="YOUR_GOOGLE_CLIENT_ID"
            data-login_uri="https://your.domain/your_login_endpoint"
            data-auto_prompt="false">
        </div>
        <div class="g_id_signin"
          data-type="standard"
          data-size="large"
          data-theme="outline"
          data-text="sign_in_with"
          data-shape="rectangular"
          data-logo_alignment="left">
        </div> -->
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {
  useLocalStorage,
} from '@vueuse/core';
import {
  authFailure,
} from '../util.ts';
import { ref, watch } from 'vue';

const googleSignInLink = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_GOOGLE_OAUTH_REDIRECT_URI}&response_type=code&scope=email profile`

const showSignInDialog = ref(true);
watch(authFailure, (newValue) => {
  if (newValue) {
    showSignInDialog.value = true;
  }
});

</script>