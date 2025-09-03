<template>
  <v-container class="diet-detail-page">
    <div v-if="dietStore.currentDiet" class="diet-header mb-6">
      <v-card elevation="2">
        <v-card-title class="d-flex align-center">
          <v-btn icon @click="goBack" class="mr-3">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <div>
            <h1 class="text-h4">{{ dietStore.currentDiet.name || 'Diet Plan' }}</h1>
            <p class="text-body-1 text-grey mb-0">
              {{ dietStore.currentDiet.description || 'Plan nutritionnel personnalisé' }}
            </p>
          </div>
          <v-spacer />
          <div class="d-flex gap-2">
            <v-chip color="#22c55e"> {{ dietStore.totalMacroPlans }} macro plan(s) </v-chip>
            <v-chip color="#f97316"> {{ dietStore.totalMealPlans }} meal plan(s) </v-chip>
          </div>
        </v-card-title>
      </v-card>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <v-progress-circular indeterminate color="#22c55e" size="64"></v-progress-circular>
      <p class="mt-4">Chargement des plans...</p>
    </div>

    <v-alert
      v-if="dietStore.error"
      type="error"
      class="mb-4"
      dismissible
      @click:close="dietStore.error = null"
    >
      {{ dietStore.error }}
    </v-alert>

    <div v-if="!isLoading">
      <div class="d-flex">
        <v-tabs v-model="activeTab" class="mb-6" color="#f97316">
          <v-tab value="macro" base-color="white">
            <v-icon class="mr-2">mdi-nutrition</v-icon>
            Plans Macro ({{ dietStore.totalMacroPlans }})
          </v-tab>
          <v-tab value="meals" base-color="white">
            <v-icon class="mr-2">mdi-food</v-icon>
            Plans Repas ({{ dietStore.totalMealPlans }})
          </v-tab>
        </v-tabs>
        <VSpacer />
        <PrimaryButton v-if="canCreatePlan" prepend-icon="mdi-plus" @click="showCreatePlan = true">
          Ajouter
        </PrimaryButton>
      </div>


      <v-window v-model="activeTab">
        <v-window-item value="macro">
          <div v-if="dietStore.macroPlans.length === 0" class="text-center py-8">
            <v-icon size="80" color="grey lighten-2">mdi-nutrition-off</v-icon>

            <h2 class="text-h5 mt-4 text-grey">Aucun plan macro disponible</h2>
            <p class="text-body-1 text-grey">
              Aucun plan nutritionnel macro n'a été configuré pour cette diet.
            </p>
          </div>

          <div v-else>
            <div class="d-flex align-center mb-4">
              <v-icon class="mr-2 text-white" color="#22c55e">mdi-nutrition</v-icon>
              <h2 class="text-h5">
                Plans macro disponibles
              </h2>
              <VSpacer />
              <v-chip color="#22c55e">
                {{ dietStore.macroPlans.length }} plan(s)
              </v-chip>
            </div>

            <v-row>
              <v-col
                v-for="macroPlan in dietStore.macroPlans"
                :key="macroPlan.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <MacroPlanCard
                  :macro-plan="macroPlan"
                  :max-calories="dietStore.highestCaloriePlan?.kilocalorie"
                />
              </v-col>
            </v-row>
          </div>
        </v-window-item>

        <v-window-item value="meals">
          <div v-if="dietStore.mealPlans.length === 0" class="text-center py-8">
            <v-icon size="80" color="grey lighten-2">mdi-food-off</v-icon>
            <h2 class="text-h5 mt-4 text-grey">Aucun plan repas disponible</h2>
            <p class="text-body-1 text-grey">
              Aucun plan de repas n'a été configuré pour cette diet.
            </p>
          </div>

          <div v-else>
            <div class="d-flex align-center justify-space-between mb-4">
              <h2 class="text-h5">
                <v-icon class="mr-2" color="warning">mdi-food</v-icon>
                Plans repas disponibles
              </h2>
              <v-chip color="#f97316">
                {{ dietStore.mealPlans.length }} plan(s) - {{ dietStore.totalMealsCount }} repas
              </v-chip>

            </div>

            <v-row>
              <v-col
                v-for="mealPlan in dietStore.mealPlans"
                :key="mealPlan.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <MealPlanCard :meal-plan="mealPlan" />
              </v-col>
            </v-row>
          </div>
        </v-window-item>
      </v-window>
    </div>

    <DietPlanCreateDialog v-model="showCreatePlan" @created="createPlan" />
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDietStore } from '@/stores/diet'
import { useAuthStore } from '@/stores/auth'
import { useContextualStore } from '@/stores/contextual'
import { useSnackbarStore } from '@/stores/snackbar'
import api from '@/plugins/axios'
import MacroPlanCard from '@/components/MacroPlanCard.vue'
import MealPlanCard from '@/components/MealPlanCard.vue'
import DietPlanCreateDialog from '@/components/DietPlanCreateDialog.vue'

const route = useRoute()
const router = useRouter()
const dietStore = useDietStore()
const authStore = useAuthStore()
const contextual = useContextualStore()
const snackbarStore = useSnackbarStore()

const activeTab = ref('macro')
const showCreatePlan = ref(false)

const dietId = computed(() => route.params.id)
const targetUserId = computed(() => contextual.userProfileId || route.query.userId)

const canCreatePlan = computed(
  () =>
    ['coach', 'admin'].some((role) => authStore.userRoles?.includes(role)) &&
    targetUserId.value &&
    targetUserId.value !== authStore.userId,
)

const isLoading = computed(() => {
  return dietStore.loading.macroPlans || dietStore.loading.mealPlans
})

const goBack = () => {
  router.push('/')
}

const createPlan = async (payload) => {
  try {
    let endpoint
    let data

    if (payload.type === 'macro') {
      endpoint = `/diets/${dietId.value}/user/${targetUserId.value}/macro_plans`
      data = payload.data
    } else {
      endpoint = `/diets/${dietId.value}/user/${targetUserId.value}/meal_plans`
      data = payload.data
    }

    await api.post(endpoint, data)

    if (payload.type === 'macro') {
      await dietStore.fetchMacroPlans(dietId.value)
      snackbarStore.success('Plan macro créé avec succès !')
    } else {
      await dietStore.fetchMealPlans(dietId.value)
      snackbarStore.success('Plan repas créé avec succès !')
    }

    showCreatePlan.value = false
  } catch (error) {
    console.error('Erreur lors de la création du plan:', error)
    snackbarStore.error('Erreur lors de la création du plan.')
  }
}

onMounted(async () => {
  try {
    if (!authStore.isAuthenticated) {
      await authStore.initialize()
    }

    if (!authStore.userId) {
      throw new Error('Utilisateur non connecté')
    }

    await Promise.all([
      dietStore.fetchMacroPlans(dietId.value),
      dietStore.fetchMealPlans(dietId.value),
    ])
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
  }
})

onUnmounted(() => {
  dietStore.resetStore()
})
</script>

<style alng="scss" scoped>
.diet-detail-page {
  max-width: 1400px;
}

.diet-header {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  border-radius: 12px;
  color: white;
}
</style>
