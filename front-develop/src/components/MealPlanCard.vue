<template>
  <v-card class="meal-plan-card" elevation="3">
    <v-card-title class="plan-header">
      <div class="d-flex align-center justify-center w-100">
        <v-icon class="mr-2" color="white">mdi-food</v-icon>
        <span class="text-h6 font-weight-bold">{{ mealPlan.name }}</span>
      </div>
    </v-card-title>

    <v-divider />

    <v-card-subtitle class="text-center py-2">
      <v-chip color="primary" size="small" variant="elevated">
        <v-icon small class="mr-1">mdi-clock-outline</v-icon>
        {{ mealPlan.meals?.length || 0 }} repas
      </v-chip>
    </v-card-subtitle>

    <v-card-text class="pa-3">
      <div v-if="!mealPlan.meals || mealPlan.meals.length === 0" class="text-center py-4">
        <v-icon color="grey" size="48">mdi-food-off</v-icon>
        <p class="text-body-2 text-grey mt-2">Aucun repas configuré</p>
      </div>

      <div v-else class="meals-container">
        <div
          v-for="(meal, index) in sortedMeals"
          :key="index"
          class="meal-item"
          :class="{ 'last-meal': index === sortedMeals.length - 1 }"
        >
          <div class="meal-timing">
            <v-chip color="success" size="small"  class="timing-chip">
              <v-icon small class="mr-1">mdi-clock</v-icon>
              {{ formatTiming(meal.timing) }}
            </v-chip>
          </div>

          <div class="meal-content">
            <v-card
              class="food-card"
              :class="{ highlighted: isMainMeal(meal.timing) }"
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-start">
                  <v-icon :color="getMealIcon(meal.timing).color" size="20" class="mr-2 mt-1">
                    {{ getMealIcon(meal.timing).icon }}
                  </v-icon>
                  <div class="food-text">
                    {{ meal.food }}
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <div v-if="index < sortedMeals.length - 1" class="meal-connector">
            <v-icon color="grey lighten-1" size="16">mdi-chevron-down</v-icon>
          </div>
        </div>
      </div>
    </v-card-text>

    <v-divider />
    <v-card-actions class="justify-center py-2">
      <div class="text-center">
        <p class="text-caption text-grey mb-0">
          Plan nutritionnel pour {{ mealPlan.name.toLowerCase() }}
        </p>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mealPlan: {
    type: Object,
    required: true,
  },
})

const sortedMeals = computed(() => {
  if (!props.mealPlan.meals) return []

  return [...props.mealPlan.meals].sort((a, b) => {
    const timeA = parseTime(a.timing)
    const timeB = parseTime(b.timing)
    return timeA - timeB
  })
})

const parseTime = (timing) => {
  const cleanTiming = timing.toString().toLowerCase().replace('h', ':00')

  if (cleanTiming.includes(':')) {
    const [hours, minutes] = cleanTiming.split(':').map(Number)
    return (hours || 0) * 60 + (minutes || 0)
  } else {
    const hours = parseInt(cleanTiming) || 0
    return hours * 60
  }
}

const formatTiming = (timing) => {
  const cleanTiming = timing.toString()

  if (cleanTiming.includes('h') || cleanTiming.includes(':')) {
    return cleanTiming.replace('h', 'h00').replace(':', 'h')
  }

  return `${cleanTiming}h`
}

const isMainMeal = (timing) => {
  const hour = parseTime(timing) / 60
  return (hour >= 6 && hour <= 10) || (hour >= 11 && hour <= 15) || (hour >= 18 && hour <= 22)
}

const getMealIcon = (timing) => {
  const hour = parseTime(timing) / 60

  if (hour >= 6 && hour <= 10) {
    return { icon: 'mdi-coffee', color: 'orange' }
  } else if (hour >= 11 && hour <= 15) {
    return { icon: 'mdi-food', color: 'primary' }
  } else if (hour >= 18 && hour <= 22) {
    return { icon: 'mdi-food-variant', color: 'purple' }
  } else {
    return { icon: 'mdi-food-apple', color: 'success' }
  }
}
</script>

<style lang="scss" scoped>
.meal-plan-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.meal-plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.plan-header {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  padding: 16px;
}

.meals-container {
  flex: 1;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.meal-item {
  position: relative;
  margin-bottom: 16px;
}

.meal-item.last-meal {
  margin-bottom: 0;
}

.meal-timing {
  text-align: center;
  margin-bottom: 8px;
}

.timing-chip {
  font-weight: 600;
}

.meal-content {
  position: relative;
}

.food-card {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.food-card:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.food-card.highlighted {
  border-left: 4px solid #ff9800;
  background-color: #fff8e1;
}

.food-text {
  font-size: 0.9rem;
  line-height: 1.4;
  word-break: break-word;
  flex: 1;
}

.meal-connector {
  display: flex;
  justify-content: center;
  margin: 8px 0;
  opacity: 0.6;
}

.meals-container::-webkit-scrollbar {
  width: 4px;
}

.meals-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.meals-container::-webkit-scrollbar-thumb {
  background: #ff9800;
  border-radius: 2px;
}

.meals-container::-webkit-scrollbar-thumb:hover {
  background: #f57c00;
}

@media (max-width: 600px) {
  .food-text {
    font-size: 0.85rem;
  }

  .meals-container {
    max-height: 300px;
  }
}

.meal-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
