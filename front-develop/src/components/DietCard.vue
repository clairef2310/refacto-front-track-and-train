<template>
  <v-card class="ma-2 diet-slide-card" width="300" hover elevation="2" @click="$emit('click')">
    <v-card-title class="text-h6">{{ diet.name }}</v-card-title>
    <v-card-text>
      <p class="text-body-2 text-white">{{ diet.description }}</p>
      <p class="text-caption text-grey">Créé le {{ formatDate(diet.created_at) }}</p>
    </v-card-text>
    <v-card-actions>
      <SecondaryButton >Voir détails</SecondaryButton>
    </v-card-actions>
  </v-card>
</template>

<script setup>
defineProps({ diet: { type: Object, required: true } })
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>
