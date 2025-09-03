<template>
  <v-dialog v-model="show" max-width="800" persistent>
    <v-card class="diet-plan-dialog">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="#22c55e">mdi-nutrition</v-icon>
        <span class="text-h6">Créer un nouveau plan</span>
      </v-card-title>

      <v-card-text>
        <v-select
          v-model="planType"
          label="Sélectionner votre type de plan"
          :items="planTypes"
          item-title="text"
          item-value="value"

          class="mb-4"
        >
          <template #prepend-inner>
            <v-icon>mdi-chevron-down</v-icon>
          </template>
        </v-select>

        <v-text-field
          v-model="planName"
          label="Nom du plan"
          required
          class="mb-4"
        />

        <v-card v-if="planType === PLAN_TYPE_MACRO" class="pa-4">
          <v-card-title class="pa-0 mb-3">
            <span class="text-subtitle-1">Exemple pour macroplan</span>
          </v-card-title>

          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.number="macroForm.protein"
                label="Protéine"
                type="number"
                suffix="g"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="macroForm.lipids"
                label="Lipide"
                type="number"
                suffix="g"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="macroForm.carbohydrates"
                label="Glucide"
                type="number"
                suffix="g"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="macroForm.fiber"
                label="Fibre"
                type="number"
                suffix="g"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="macroForm.water"
                label="Eau"
                type="number"
                suffix="L"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="macroForm.kilocalorie"
                label="Total kcal"
                type="number"
                suffix="kcal"
              />
            </v-col>
          </v-row>
        </v-card>

        <v-card
          v-if="planType === PLAN_TYPE_MEAL"

          class="pa-4"
          style="position: relative"
        >
          <v-card-title class="pa-0 mb-3">
            <span class="text-subtitle-1">Exemple pour mealplan</span>
          </v-card-title>

          <div style="max-height: 400px; overflow-y: auto; padding-right: 8px">
            <div
              v-for="(meal, index) in mealForm.meals"
              :key="index"
              class="meal-item mb-4 pa-3"
              style="border: 1px solid #e0e0e0; border-radius: 8px; position: relative"
            >
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-subtitle-2">Repas {{ index + 1 }}</span>
                <DeleteButton
                  v-if="mealForm.meals.length > 1"
                  prepend-icon="mdi-close"
                  size="small"
                  @click="removeMeal(index)"
                >
                  Supprimer
                </DeleteButton>
              </div>

              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="meal.timing"
                    label="Heure"

                    placeholder="12:30"
                    @click="openTimePicker(index)"
                    readonly
                  >
                    <template #append-inner>
                      <v-icon @click="openTimePicker(index)">mdi-clock-outline</v-icon>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="meal.food"
                    label="Repas"
                    rows="2"
                    placeholder="200g skyr 100g fruits rouges 2 oeufs"
                    auto-grow
                  />
                </v-col>
              </v-row>
            </div>
          </div>
          <VSpacer />
          <PrimaryButton
            prepend-icon="mdi-plus"
            size="small"
            class="mt-2"
            @click="addMeal"
          >
            Ajout
          </PrimaryButton>
        </v-card>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <TertiaryButton @click="close">Annuler</TertiaryButton>
        <PrimaryButton :loading="loading" @click="submit" :disabled="!canSubmit">
          Créer
        </PrimaryButton>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="timePickerDialog" max-width="500px">
      <v-card class="diet-plan-dialog">
        <v-card-title>Sélectionner l'heure</v-card-title>
        <v-card-text>
          <v-time-picker v-model="selectedTime" title="Sélectionner une heure" format="24hr" scrollable />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <TertiaryButton @click="timePickerDialog = false">Annuler</TertiaryButton>
          <PrimaryButton @click="confirmTime">Confirmer</PrimaryButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const PLAN_TYPE_MACRO = 'macro'
const PLAN_TYPE_MEAL = 'meal'

const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue', 'created'])

const show = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (show.value = v),
)
watch(show, (v) => emit('update:modelValue', v))

const loading = ref(false)
const planType = ref(PLAN_TYPE_MACRO)
const planName = ref('')

const timePickerDialog = ref(false)
const selectedTime = ref(null)
const currentMealIndex = ref(0)

const planTypes = [
  { text: 'Plan Macro', value: PLAN_TYPE_MACRO },
  { text: 'Plan Repas', value: PLAN_TYPE_MEAL },
]

const macroForm = ref({
  protein: 150,
  lipids: 80,
  carbohydrates: 220,
  fiber: 40,
  water: 3,
  kilocalorie: 2000,
})

const mealForm = ref({
  meals: [
    {
      timing: '',
      food: '',
    },
  ],
})

const canSubmit = computed(() => {
  if (!planName.value) return false

  if (planType.value === PLAN_TYPE_MACRO) {
    return Object.values(macroForm.value).every((val) => val !== null && val !== '')
  } else {
    return mealForm.value.meals.every((meal) => meal.timing && meal.food)
  }
})

const openTimePicker = (index) => {
  currentMealIndex.value = index
  const currentTiming = mealForm.value.meals[index].timing
  if (currentTiming) {
    selectedTime.value = currentTiming
  }
  timePickerDialog.value = true
}

const confirmTime = () => {
  if (selectedTime.value) {
    mealForm.value.meals[currentMealIndex.value].timing = selectedTime.value
  }
  timePickerDialog.value = false
}

const addMeal = () => {
  mealForm.value.meals.push({
    timing: '',
    food: '',
  })
}

const removeMeal = (index) => {
  if (mealForm.value.meals.length > 1) {
    mealForm.value.meals.splice(index, 1)
  }
}

const resetForm = () => {
  planName.value = ''
  planType.value = PLAN_TYPE_MACRO

  macroForm.value = {
    protein: 150,
    lipids: 80,
    carbohydrates: 220,
    fiber: 40,
    water: 3,
    kilocalorie: 2000,
  }

  mealForm.value = {
    meals: [
      {
        timing: '',
        food: '',
      },
    ],
  }
}

const close = () => {
  show.value = false
  resetForm()
}

const submit = async () => {
  if (!canSubmit.value) return

  loading.value = true

  let payload
  if (planType.value === PLAN_TYPE_MACRO) {
    payload = {
      type: PLAN_TYPE_MACRO,
      data: {
        name: planName.value,
        ...macroForm.value,
      },
    }
  } else {
    payload = {
      type: PLAN_TYPE_MEAL,
      data: {
        name: planName.value,
        meals: mealForm.value.meals,
      },
    }
  }

  emit('created', payload)

  loading.value = false
  close()
}
</script>

<style lang="scss" scoped>
.meal-item {
  background-color: #fafafa;
}

:deep(.v-time-picker) {
  width: 100%;
}

.diet-plan-dialog {
  background-color: #00231f !important;
}
</style>
