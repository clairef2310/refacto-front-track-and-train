<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card class="validation-card">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="success">mdi-check-circle</v-icon>
        <span class="text-h6">Valider l'exercice</span>
        <v-spacer />
        <TertiaryButton @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </TertiaryButton>
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <div
          v-if="task"
          class="exercise-info mb-4 pa-3"
          style="background-color: #f5f5f5; border-radius: 8px"
        >
          <h4 class="text-h6 mb-2">{{ task.exercise_name }}</h4>
          <div class="d-flex flex-wrap gap-2">
            <v-chip color="info" small>{{ task.set_number }} séries</v-chip>
            <v-chip color="info" small>{{ task.repetitions }} répétitions</v-chip>
            <v-chip color="warning" small>{{ task.rest_time }}min repos</v-chip>
            <v-chip color="success" small>RIR {{ task.rir }}</v-chip>
          </div>
        </div>

        <v-form ref="validationForm" v-model="formValid">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="validation.set_number"
                label="Séries effectuées"
                type="number"
                :rules="setRules"
                required
                prepend-icon="mdi-numeric"
                :hint="`Recommandé: ${task?.set_number || 0}`"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="validation.repetitions"
                label="Répétitions effectuées"
                type="number"
                :rules="repsRules"
                required
                prepend-icon="mdi-repeat"
                :hint="`Recommandé: ${task?.repetitions || 0}`"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="validation.rest_time"
                label="Temps de repos (min)"
                type="number"
                :rules="restRules"
                required
                prepend-icon="mdi-timer"
                :hint="`Recommandé: ${task?.rest_time || 0}min`"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="validation.rir"
                label="RIR effectif"
                type="number"
                :rules="rirRules"
                required
                prepend-icon="mdi-gauge"
                :hint="`Recommandé: ${task?.rir || 0}`"
                persistent-hint
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="validation.notes"
                label="Notes (optionnel)"
                rows="3"
                prepend-icon="mdi-note-text"
                hint="Commentaires sur la performance, sensations, etc."
                persistent-hint
              />
            </v-col>

            <v-col cols="12">
              <v-slider
                v-model="validation.difficulty"
                label="Difficulté ressentie"
                :min="1"
                :max="10"
                :step="1"
                thumb-label="always"
                prepend-icon="mdi-speedometer"
                color="primary"
              >
                <template v-slot:thumb-label="{ modelValue }"> {{ modelValue }}/10 </template>
              </v-slider>
              <div class="d-flex justify-space-between text-caption text-grey">
                <span>Très facile</span>
                <span>Très difficile</span>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <TertiaryButton @click="closeDialog"> Annuler </TertiaryButton>
        <PrimaryButton prepend-icon="mdi-check" :loading="loading" :disabled="!formValid" @click="submitValidation">
          Valider l'exercice
        </PrimaryButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTrainingStore } from '@/stores/training'
import { useSnackbarStore } from '@/stores/snackbar'

const snackbarStore = useSnackbarStore()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  task: {
    type: Object,
    default: null,
  },
  trainingId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'validation-created'])

const trainingStore = useTrainingStore()
const validationForm = ref(null)
const formValid = ref(false)

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const loading = computed(() => trainingStore.loading.creating)

const validation = ref({
  set_number: 0,
  repetitions: 0,
  rest_time: 0,
  rir: 0,
  notes: '',
  difficulty: 5,
})

const setRules = [
  (v) => !!v || 'Le nombre de séries est requis',
  (v) => v > 0 || 'Le nombre de séries doit être supérieur à 0',
  (v) => v <= 20 || 'Le nombre de séries doit être inférieur à 20',
]

const repsRules = [
  (v) => !!v || 'Le nombre de répétitions est requis',
  (v) => v > 0 || 'Le nombre de répétitions doit être supérieur à 0',
  (v) => v <= 100 || 'Le nombre de répétitions doit être inférieur à 100',
]

const restRules = [
  (v) => (v !== null && v !== undefined) || 'Le temps de repos est requis',
  (v) => v >= 0 || 'Le temps de repos ne peut pas être négatif',
  (v) => v <= 30 || 'Le temps de repos doit être inférieur à 30 minutes',
]

const rirRules = [
  (v) => (v !== null && v !== undefined) || 'Le RIR est requis',
  (v) => v >= 0 || 'Le RIR ne peut pas être négatif',
  (v) => v <= 10 || 'Le RIR doit être inférieur ou égal à 10',
]

watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      validation.value = {
        set_number: newTask.set_number || 0,
        repetitions: newTask.repetitions || 0,
        rest_time: newTask.rest_time || 0,
        rir: newTask.rir || 0,
        notes: '',
        difficulty: 5,
      }
    }
  },
  { immediate: true },
)

const closeDialog = () => {
  dialog.value = false
  resetForm()
}

const resetForm = () => {
  validation.value = {
    set_number: 0,
    repetitions: 0,
    rest_time: 0,
    rir: 0,
    notes: '',
    difficulty: 5,
  }
  if (validationForm.value) {
    validationForm.value.resetValidation()
  }
}

const submitValidation = async () => {
  if (!formValid.value || !props.task) return

  try {
    const validationData = {
      ...validation.value,
      succeeded_at: new Date().toISOString(),
    }

    const createdValidation = await trainingStore.createValidation(
      props.trainingId,
      props.task.id,
      validationData,
    )

    emit('validation-created', createdValidation)
    closeDialog()

    snackbarStore.success('Validation créée avec succès !')
  } catch (error) {
    console.error('Erreur lors de la création de la validation:', error)
    snackbarStore.error("Erreur lors de la validation de l'exercice. Veuillez réessayer.")
  }
}
</script>

<style lang="scss" scoped>
.exercise-info {
  border-left: 4px solid #2196f3;
}

.gap-2 {
  gap: 8px;
}

:deep(.v-slider-thumb__label) {
  font-weight: bold;
}

.validation-card {
  background-color: #00231f !important;;
}
</style>
