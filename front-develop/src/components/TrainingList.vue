<template>
  <v-card class="mb-4 section-card fill-height">
    <v-card-title class="d-flex align-center section-header">
      <v-icon class="mr-2" color="color-mix(in srgb, #00231F,white 60%)">mdi-dumbbell</v-icon>
      <span class="text-h6">Trainings</span>
      <v-spacer />
      <v-chip color="#f97316" small text-color="white">{{ trainings.length }} training(s)</v-chip>
      <slot name="action"></slot>
    </v-card-title>
    <v-card-text class="pa-0">
      <div v-if="trainings.length === 0" class="empty-state text-center py-8">
        <v-icon size="64" color="grey lighten-2">mdi-dumbbell</v-icon>
        <p class="text-h6 mt-4 text-grey">Aucun training assigné</p>
      </div>
      <v-slide-group v-else show-arrows class="pa-4">
        <v-slide-item v-for="training in trainings" :key="training.id">
          <TrainingCard :training="training" @click="onTrainingClick(training.id)" />
        </v-slide-item>
      </v-slide-group>
    </v-card-text>
  </v-card>
</template>

<script setup>
import TrainingCard from './TrainingCard.vue'
defineProps({
  trainings: Array,
})
const emit = defineEmits(['trainingClick'])
function onTrainingClick(id) {
  emit('trainingClick', id)
}
</script>
