<template>
  <v-card class="user-meals-card mb-4" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="success">mdi-food-apple</v-icon>
      <span class="text-h6">Mes Repas</span>
      <v-spacer />
      <v-chip :color="meals?.length > 0 ? 'success' : 'warning'" small>
        {{ meals?.length || 0 }} repas
      </v-chip>
    </v-card-title>

    <v-card-text>
      <div v-if="!meals || meals.length === 0" class="text-center py-4">
        <v-icon size="48" color="grey lighten-2">mdi-food-apple</v-icon>
        <p class="text-body-1 mt-2 text-grey">Aucun repas planifié</p>
      </div>

      <div v-else>
        <div class="today-meals mb-4">
          <h4 class="text-subtitle-1 mb-2">Aujourd'hui</h4>
          <v-row>
            <v-col v-for="meal in todayMeals" :key="meal.id" cols="12" sm="6" md="3">
              <v-card class="meal-mini-card" outlined hover>
                <v-card-body class="pa-3 text-center">
                  <v-icon :color="getMealTypeColor(meal.type)" size="24" class="mb-2">
                    {{ getMealTypeIcon(meal.type) }}
                  </v-icon>
                  <h5 class="text-subtitle-2 text-white">{{ meal.type }}</h5>
                  <p class="text-body-2 text-grey mb-0">{{ meal.calories || 0 }} kcal</p>
                </v-card-body>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <div class="text-center">
          <SecondaryButton outlined @click="goToAllMeals" class="mr-2">
            Voir tous mes repas
          </SecondaryButton>
          <PrimaryButton @click="goToMealPlanning"> Planifier </PrimaryButton>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  meals: {
    type: Array,
    default: () => [],
  },
})

const router = useRouter()

const todayMeals = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return props.meals?.filter((meal) => meal.date?.startsWith(today)) || []
})

const goToMealPlanning = () => {
  router.push('/meals/planning')
}

const goToAllMeals = () => {
  router.push('/meals')
}

const getMealTypeIcon = (type) => {
  const icons = {
    'petit-dejeuner': 'mdi-coffee',
    dejeuner: 'mdi-food',
    diner: 'mdi-food-variant',
    collation: 'mdi-food-apple',
  }
  return icons[type] || 'mdi-food'
}

const getMealTypeColor = (type) => {
  const colors = {
    'petit-dejeuner': 'orange',
    dejeuner: 'blue',
    diner: 'purple',
    collation: 'green',
  }
  return colors[type] || 'grey'
}
</script>

<style lang="scss" scoped>
.user-meals-card {
  min-height: 200px;
}

.meal-mini-card {
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 100px;
}

.meal-mini-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.today-meals {
  border-left: 3px solid #4caf50;
  padding-left: 12px;
}
</style>
