<template>
  <v-card class="mb-4 fill-height">
    <v-card-title class="d-flex align-center section-header">
      <v-icon class="mr-2" color="#22c55e">mdi-food-apple</v-icon>
      <span class="text-h6">Repas</span>
      <v-spacer />
      <v-chip color="#f97316" small text-color="white">{{ diets.length }} repas</v-chip>
      <slot name="action"></slot>
    </v-card-title>
    <v-card-text class="pa-0">
      <div v-if="diets.length === 0" class="empty-state text-center py-8">
        <v-icon size="64" color="grey lighten-2">mdi-food-apple</v-icon>
        <p class="text-h6 mt-4 text-grey">Aucun repas planifié</p>
      </div>
      <v-slide-group v-else show-arrows class="pa-4">
        <v-slide-item v-for="diet in diets" :key="diet.id">
          <DietCard :diet="diet" @click="onDietClick(diet.id)" />
        </v-slide-item>
      </v-slide-group>
    </v-card-text>
  </v-card>
</template>

<script setup>
import DietCard from './DietCard.vue'
defineProps({
  diets: Array,
})
const emit = defineEmits(['dietClick'])
function onDietClick(id) {
  emit('dietClick', id)
}
</script>
