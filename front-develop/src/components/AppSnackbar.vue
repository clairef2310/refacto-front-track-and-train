<template>
  <v-snackbar
    v-model="snackbarStore.show"
    :timeout="snackbarStore.timeout"
    :color="snackbarStore.color"
    location="top right"
    multi-line
  >
    {{ snackbarStore.message }}
    <template #actions>
      <v-btn icon @click="snackbarStore.close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
const snackbarStore = useSnackbarStore()
</script>
