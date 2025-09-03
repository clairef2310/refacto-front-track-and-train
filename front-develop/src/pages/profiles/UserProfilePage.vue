<template>
  <div class="profile-page">
    <v-container>
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="mb-4 fill-height">
            <v-card-title class="d-flex align-center">
              <v-avatar size="48" class="mr-3">
                <v-icon size="36" color="white">mdi-account</v-icon>
              </v-avatar>
              <h2 class="mb-0 ml-2">{{ user?.name || 'Profil utilisateur' }}</h2>
              <VSpacer b/>
               <div class="mb-2" v-if="user?.roles">
                <v-chip
                  v-for="role in user.roles"
                  :key="role"
                  color="#f97316"
                  class="mr-2"
                  small
                >
                  {{ role }}
                </v-chip>
              </div>
            </v-card-title>
            <v-card-subtitle>
              <div class="text-caption text-grey">
                <span v-if="user?.email">{{ user.email }}</span>
                <span v-if="user?.age"> — {{ user.age }} ans</span>
              </div>
              <div class="text-body-2 text-grey" v-if="user?.description">
                {{ user.description }}
              </div>
            </v-card-subtitle>
            <v-card-text>
              <div>
                <span class="font-weight-bold text-white">Contact: </span>
                <span v-if="user?.contact" class="text-white">{{ user.contact }}</span>
                <span v-else class="text-grey">Non renseigné</span>
              </div>
              <div>
                <span class="font-weight-bold text-white">Sex: </span>
                <span v-if="user?.sex" class="text-white">{{ user.sex }}</span>
                <span v-else class="text-grey">Non renseigné</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <TrainingList :trainings="trainings" @trainingClick="goToTraining">
            <template #action v-if="canCreateForUser">
              <PrimaryButton
                @click="showCreateTraining = true"
                class="ml-2"
                elevation="1"
                prepend-icon="mdi-plus"
              >
                Ajouter
              </PrimaryButton>
            </template>
          </TrainingList>
        </v-col>
        <v-col cols="12" md="6">
          <DietList :diets="diets" @dietClick="goToDiet">
            <template #action v-if="canCreateForUser">
              <PrimaryButton
                @click="showCreateDiet = true"
                prepend-icon="mdi-plus"
                class="ml-2"
              >
                Ajouter
              </PrimaryButton>
            </template>
          </DietList>
        </v-col>
      </v-row>
    </v-container>

    <TrainingCreateDialog v-model="showCreateTraining" @created="createTraining" />
    <DietCreateDialog v-model="showCreateDiet" @created="createDiet" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useContextualStore } from '@/stores/contextual'
import { useSnackbarStore } from '@/stores/snackbar'
import api from '@/plugins/axios'
import TrainingList from '@/components/TrainingList.vue'
import DietList from '@/components/DietList.vue'
import TrainingCreateDialog from '@/components/TrainingCreateDialog.vue'
import DietCreateDialog from '@/components/DietCreateDialog.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const contextual = useContextualStore()
const snackbarStore = useSnackbarStore()

const userId = ref(route.params.uuid)
const user = ref(null)
const trainings = ref([])
const diets = ref([])
const loading = ref(false)

const showCreateTraining = ref(false)
const showCreateDiet = ref(false)

async function fetchUserProfile() {
  loading.value = true
  try {
    const resp = await api.get(`/profiles/${userId.value}`)
    user.value = resp.data
  } catch (e) {
    console.error('Error fetching user profile:', e)
    snackbarStore.error('Erreur lors du chargement du profil utilisateur.')
    user.value = null
  } finally {
    loading.value = false
  }
}

async function fetchUserTrainings() {
  try {
    const resp = await api.get(`/trainings/user/${userId.value}`)
    trainings.value = resp.data || []
  } catch {
    trainings.value = []
  }
}

async function fetchUserDiets() {
  try {
    const resp = await api.get(`/diets/user/${userId.value}`)
    diets.value = resp.data || []
  } catch {
    diets.value = []
  }
}

onMounted(() => {
  if (route.params.uuid) {
    userId.value = route.params.uuid
    contextual.setUserProfileId(userId.value)
    fetchUserProfile()
    fetchUserTrainings()
    fetchUserDiets()
  }
})

onUnmounted(() => {
  contextual.clearUserProfileId()
})

watch(
  () => route.params.uuid,
  (newUuid) => {
    userId.value = newUuid
    contextual.setUserProfileId(userId.value)
    fetchUserProfile()
    fetchUserTrainings()
    fetchUserDiets()
  },
)

const canCreateForUser = computed(
  () => auth.userRoles?.includes('coach') && auth.userId !== userId.value,
)

const goToTraining = (trainingId) => {
  router.push({
    path: `/training/${trainingId}`,
    query: { userId: userId.value },
  })
}
const goToDiet = (dietId) => {
  router.push({
    path: `/diet/${dietId}`,
    query: { userId: userId.value },
  })
}

async function createTraining({ name, description }) {
  try {
    await api.post(`/trainings/${userId.value}`, { name, description })
    await fetchUserTrainings()
    snackbarStore.success('Training créé avec succès !')
  } catch (e) {
    console.error(e)
    snackbarStore.error('Erreur lors de la création du training.')
  }
}

async function createDiet({ name, description }) {
  try {
    await api.post(`/diets/${userId.value}`, { name, description })
    await fetchUserDiets()
    snackbarStore.success('Diet créée avec succès !')
  } catch (e) {
    console.error(e)
    snackbarStore.error('Erreur lors de la création du diet.')
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 2rem;
}
</style>
