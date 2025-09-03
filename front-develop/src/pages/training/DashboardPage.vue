<template>
  <v-container>
    <h1>Bienvenue {{ authStore.user?.name || 'Utilisateur' }}</h1>
    <DeleteButton  @click="authStore.logout()">Déconnexion</DeleteButton>
  </v-container>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
</script>
