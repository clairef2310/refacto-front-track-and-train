<template>
  <v-card class="macro-plan-card pt-0" elevation="3">
    <v-card-title class="plan-header">
      <div class="d-flex align-center justify-center w-100">
        <v-icon class="mr-2" color="white">mdi-nutrition</v-icon>
        <span class="text-h6 font-weight-bold">{{ macroPlan.name }}</span>
      </div>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-4">
      <div class="macros-grid">
        <v-card class="macro-item">
          <v-chip color="#eab308"  size="small" class="macro-label">
            Protéines (g)
          </v-chip>
          <div class="macro-value">{{ Math.round(macroPlan.protein || 0) }}</div>
        </v-card>

        <v-card class="macro-item">
          <v-chip color="#f97316"  size="small" class="macro-label">
            Glucides (g)
          </v-chip>
          <div class="macro-value">{{ Math.round(macroPlan.carbohydrates || 0) }}</div>
        </v-card>

        <v-card class="macro-item">
          <v-chip color="#2dd4bf"  size="small" class="macro-label">
            Lipides (g)
          </v-chip>
          <div class="macro-value">{{ Math.round(macroPlan.lipids || 0) }}</div>
        </v-card>

        <v-card class="macro-item">
          <v-chip color="#22c55e"  size="small" class="macro-label">
            Fibre (g)
          </v-chip>
          <div class="macro-value">{{ Math.round(macroPlan.fiber || 0) }}</div>
        </v-card>

        <v-card class="macro-item">
          <v-chip color="#2dd4bf"  size="small" class="macro-label"> Eau L </v-chip>
          <div class="macro-value">{{ macroPlan.water || 0 }}</div>
        </v-card>

        <v-card class="macro-item total-calories">
          <v-chip color="black" size="small" class="macro-label">
            Total Kcal
          </v-chip>
          <div class="macro-value total-value">{{ Math.round(macroPlan.kilocalorie || 0) }}</div>
        </v-card>
      </div>
    </v-card-text>

    <v-card-text class="pt-0" v-if="maxCalories">
      <div class="calories-progress">
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-caption text-grey">Calories</span>
          <span class="text-caption text-grey"
            >{{ Math.round((macroPlan.kilocalorie / maxCalories) * 100) }}%</span
          >
        </div>
        <v-progress-linear
          :model-value="(macroPlan.kilocalorie / maxCalories) * 100"
          color="#22c55e"
          height="6"
          rounded
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  macroPlan: {
    type: Object,
    required: true,
  },
  maxCalories: {
    type: Number,
    default: null,
  },
})
</script>

<style lang="scss" scoped>
.macro-plan-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
}

.macro-plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.plan-header {
  background: linear-gradient(135deg, #22c55e 0%, #2dd4bf 100%);
  color: white;
  padding: 16px;
}

.macros-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.macro-item {
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: background-color 0.3s ease;
}

.macro-item:hover {
  background-color: #e9ecef;
}

.macro-label {
  margin-bottom: 8px;
  font-weight: 500;
}

.macro-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  margin-top: 4px;
}

.total-calories {
  background: linear-gradient(135deg, #22c55e 0%, #2dd4bf 100%);
  border: 2px solid #22c55e;
}

.total-value {
  color: white;
  font-size: 1.75rem;
}

.calories-progress {
  margin-top: 8px;
}

@media (max-width: 600px) {
  .macros-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .macro-value {
    font-size: 1.25rem;
  }

  .total-value {
    font-size: 1.5rem;
  }
}
</style>
