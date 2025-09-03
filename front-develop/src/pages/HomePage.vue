<template>
  <div class="home-page">
    <template v-if="auth.user">
      <h1 class="my-4">Bienvenue {{ auth.user.name }}</h1>
      <v-row>
        <v-col cols="12" md="5">
           <TrainingList :trainings="trainings" @trainingClick="goToTraining"> </TrainingList>
        </v-col>
        <v-col cols="12" md="7">
          <UserCoachCard :coach="auth.user.coach" />
        </v-col>
        <v-col cols="12">
          <DietList :diets="diets" @dietClick="goToDiet"> </DietList>
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <h1>Coach Profiles</h1>
      <p>
        Bienvenue sur TrackTrain! Trouvez votre coach et suivez vos progrès. Inscrivez-vous pour une
        expérience personnalisée.
      </p>
      <div class="coach-list">
        <CoachCard
          v-for="coach in coaches"
          :key="coach.id"
          :name="coach.name"
          :description="coach.description"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import api from '@/plugins/axios'

import CoachCard from '@/components/CoachCard.vue'
import UserCoachCard from '@/components/UserCoachCard.vue'
import TrainingList from '@/components/TrainingList.vue'
import DietList from '@/components/DietList.vue'

const auth = useAuthStore()
const router = useRouter()

const trainings = ref([])
const diets = ref([])
const loading = ref(false)
const coaches = ref([])

onMounted(async () => {
  if (auth.user) {
    await fetchUserData()
  } else {
    await fetchCoaches()
  }
})

const fetchUserData = async () => {
  loading.value = true
  try {
    const trainingsResponse = await api.get('/trainings/mine')
    trainings.value = trainingsResponse.data || []

    const dietsResponse = await api.get('/diets/mine')
    diets.value = dietsResponse.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des données utilisateur:', error)
  } finally {
    loading.value = false
  }
}

const fetchCoaches = async () => {
  try {
    const response = await api.get('/profiles/coachs')
    coaches.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des coachs:', error)
  }
}

const goToTraining = (trainingId) => {
  router.push(`/training/${trainingId}`)
}

const goToDiet = (dietId) => {
  router.push(`/diet/${dietId}`)
}

const openCreateTraining = () => {
  // logiques d'ouverture de dialog ou navigation pour créer un training
}

const openCreateDiet = () => {
  // logiques d'ouverture de dialog ou navigation pour créer un diet
}
</script>

<style lang="scss" scoped>
.home-page {
  padding: 2rem;
}
.coach-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
