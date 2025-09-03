<template>
  <v-app>
    <TrackAndTrainAppBar />
    <v-container fluid class="container pa-14">
      <TrainingNavbar v-if="authStore.isAuthenticated" />
      <RouterView />
      <AppSnackbar />
    </v-container>
  </v-app>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppSnackbar from './components/AppSnackbar.vue'
import TrainingNavbar from './components/TrainingNavbar.vue'
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'
import TrackAndTrainAppBar from './components/TrackAndTrainAppBar.vue'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initialize()
})
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  background-color: #00231f;
}
</style>
