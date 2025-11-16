
import { ref } from 'vue';
import type { ApiRouter } from '../server/api/router.ts';
import type { JwtPayload } from '../server/api/auth.ts';
import { useLocalStorage } from '@vueuse/core';

/**
 * Converts a distance in meters to an appropriate Google Maps zoom level.
 * The zoom level determines how close the map is zoomed in.
 * 
 * @param meters - The radius/distance in meters
 * @returns A zoom level between 0 (world view) and 21 (building view)
 * 
 * @example
 * metersToZoom(100) // Returns ~17 (street level)
 * metersToZoom(5000) // Returns ~13 (city level)
 */
export function metersToZoom(meters: number): number {
  // At zoom level 21, one pixel represents approximately 0.3 meters at the equator
  // Each zoom level halves the resolution, so we use logarithmic scaling
  const earthCircumference = 40075017; // meters at equator

  // Calculate zoom to show the area with some padding
  // We want the meters to fit comfortably in view (assuming ~512px screen)
  const scale = meters / 256;
  const zoom = Math.log2(earthCircumference / (scale * 512));

  // Clamp between valid zoom levels (0-21)
  return Math.max(0, Math.min(21, Math.round(zoom)));
}

export const authFailure = ref(false);

// Global user state
export const currentUser = ref<JwtPayload | null>(null);
export const userLoading = ref(true);

// Promise that resolves when user authentication is checked
let userLoadedPromise: Promise<void> | null = null;

export function initUser(): Promise<void> {
  if (userLoadedPromise) {
    return userLoadedPromise;
  }

  userLoadedPromise = fetch('/api/introspection')
    .then((res) => res.json())
    .then((data) => {
      if (data && data.email) {
        currentUser.value = data;
      }
    })
    .catch((err) => {
      console.error('Failed to fetch user info', err);
      authFailure.value = true;
    })
    .finally(() => {
      userLoading.value = false;
    });

  return userLoadedPromise;
}

export function apiRequest<
  ENDPOINT extends keyof ApiRouter,
  INPUT = ApiRouter[ENDPOINT]['input'],
  OUTPUT = ApiRouter[ENDPOINT]['output'],
>(endpoint: ENDPOINT, input: INPUT): Promise<OUTPUT> {
  // Wait for user to be loaded before making API requests
  return initUser().then(() => {
    if (!currentUser.value) {
      authFailure.value = true;
      // Don't reject the promise - just never resolve it.
      // Since the SignInDialog is persistent and blocks the UI,
      // any pending API requests should just wait indefinitely
      // until the user signs in and the page reloads.
      return new Promise<OUTPUT>(() => { });
    }

    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    }).then((response) => {
      if (!response.ok) {
        if (response.status === 401) {
          authFailure.value = true;
        }
        throw new Error(`API request failed with status ${response.status}`);
      }
      return response.json() as Promise<OUTPUT>;
    });
  });
}

export type LastInteraction = 'pending' | 'address' | 'manual' | 'gps';

export const skipConfirm = useLocalStorage('skip-location-confirm', false);
