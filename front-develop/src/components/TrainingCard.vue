<template>
  <v-card class="ma-2 training-slide-card" width="300" hover elevation="2" @click="$emit('click')">
    <v-card-title class="text-h6">{{ training.name }}</v-card-title>
    <v-card-text>
      <p class="text-body-2">{{ training.description }}</p>
      <p class="text-caption text-grey">Créé le {{ formatDate(training.created_at) }}</p>
    </v-card-text>
    <v-card-actions>
      <PrimaryButton>Voir détails</PrimaryButton>
    </v-card-actions>
  </v-card>
</template>

<script setup>
defineProps({ training: { type: Object, required: true } })
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>
