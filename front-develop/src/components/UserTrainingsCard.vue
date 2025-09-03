<template>
  <v-card class="user-trainings-card mb-4" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-dumbbell</v-icon>
      <span class="text-h6">Mes Trainings</span>
      <v-spacer />
      <v-chip :color="trainings?.length > 0 ? 'success' : 'warning'" small>
        {{ trainings?.length || 0 }} training(s)
      </v-chip>
    </v-card-title>

    <v-card-text>
      <div v-if="!trainings || trainings.length === 0" class="text-center py-4">
        <v-icon size="48" color="grey lighten-2">mdi-dumbbell</v-icon>
        <p class="text-body-1 mt-2 text-grey">Aucun training assigné</p>
        <p class="text-body-2 text-grey">Votre coach vous assignera bientôt des trainings</p>
      </div>

      <div v-else>
        <v-row>
          <v-col v-for="training in trainings.slice(0, 3)" :key="training.id" cols="12" sm="4">
            <v-card class="training-mini-card" outlined @click="goToTraining(training.id)" hover>
              <v-card-body class="pa-3">
                <h4 class="text-subtitle-1">{{ training.name }}</h4>
                <p class="text-body-2 text-grey mb-0">
                  {{ truncateText(training.description, 50) }}
                </p>
              </v-card-body>
            </v-card>
          </v-col>
        </v-row>

        <div v-if="trainings.length > 3" class="text-center mt-3">
          <PrimaryButton @click="goToAllTrainings">
            Voir tous les trainings ({{ trainings.length }})
          </PrimaryButton>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  trainings: {
    type: Array,
    default: () => [],
  },
})

const router = useRouter()

const goToTraining = (trainingId) => {
  router.push(`/training/${trainingId}`)
}

const goToAllTrainings = () => {
  router.push('/trainings')
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}
</script>

<style lang="scss" scoped>
.user-trainings-card {
  min-height: 200px;
}

.training-mini-card {
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100px;
}

.training-mini-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}
</style>
