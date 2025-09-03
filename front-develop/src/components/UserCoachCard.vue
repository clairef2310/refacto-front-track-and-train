<template>
  <v-card class="user-coach-card mb-4 fill-height" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="#eab308">mdi-account-tie</v-icon>
      <span class="text-h6">Mon Coach</span>
    </v-card-title>

    <v-card-text>
      <div v-if="!coach" class="text-center py-4">
        <v-icon size="48" color="grey lighten-2">mdi-account-question</v-icon>
        <p class="text-body-1 mt-2 text-grey">Aucun coach assigné</p>
        <p class="text-body-2 text-grey">Trouvez un coach pour commencer votre parcours</p>
        <PrimaryButton class="mt-2" @click="goToCoaches"> Trouver un coach </PrimaryButton>
      </div>

      <div v-else class="d-flex align-center">
        <v-avatar size="64" class="mr-4">
          <v-img v-if="coach.avatar" :src="coach.avatar" :alt="coach.name" />
          <v-icon v-else size="32" color="primary">mdi-account</v-icon>
        </v-avatar>

        <div class="flex-grow-1">
          <h3 class="text-h6 mb-1">{{ coach.name }}</h3>
          <p class="text-body-2 text-grey mb-2">{{ coach.speciality || 'Coach personnel' }}</p>
          <p class="text-body-2 mb-0">{{ coach.description }}</p>
        </div>

        <div class="coach-actions">
          <SecondaryButton prepend-icon="mdi-message" @click="contactCoach" class="mb-2">
            Contacter
          </SecondaryButton>
          <br />
          <PrimaryButton prepend-icon="mdi-account-details" @click="viewCoachProfile" class="mb-2">
            Profil
          </PrimaryButton>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  coach: {
    type: Object,
    default: null,
  },
})

const router = useRouter()

const goToCoaches = () => {
  router.push('/coaches')
}

const contactCoach = () => {
  if (props.coach?.id) {
    router.push(`/messages/coach/${props.coach.id}`)
  }
}

const viewCoachProfile = () => {
  if (props.coach?.id) {
    router.push(`/coach/${props.coach.id}`)
  }
}
</script>

<style lang="scss" scoped>
.user-coach-card {
  min-height: 140px;
}

.coach-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

@media (max-width: 600px) {
  .coach-actions {
    margin-top: 16px;
    align-items: flex-start;
  }
}
</style>
