<template>
  <div class="validations-list">
    <div class="d-flex align-center mb-3">
      <v-icon class="mr-2" color="#22c55e">mdi-check-circle-outline</v-icon>
      <h4 class="text-h6">Historique des validations - {{ taskName }}</h4>
      <v-spacer />
      <SecondaryButton
        size="small"
        prepend-icon="mdi-refresh"
        @click="refreshValidations"
        :loading="loading"
      >
        Actualiser
      </SecondaryButton>
    </div>

    <div v-if="loading" class="text-center py-4">
      <v-progress-circular indeterminate color="#22c55e" size="32"></v-progress-circular>
      <p class="mt-2 text-body-2">Chargement des validations...</p>
    </div>

    <div v-else-if="!validations || validations.length === 0" class="text-center py-6">
      <v-icon size="64" color="grey lighten-2">mdi-clipboard-check-outline</v-icon>
      <p class="text-h6 mt-4 text-grey">Aucune validation pour cet exercice</p>
      <p class="text-body-2 text-grey">
        Vous n'avez pas encore rempli de validation pour cette tâche
      </p>
      <p class="text-body-2 text-grey">
        Cliquez sur "Valider" pour enregistrer votre première performance !
      </p>
    </div>

    <div v-else>
      <v-card class="mb-4 stats-card" elevation="1">
        <v-card-text class="pa-3">
          <div class="d-flex align-center mb-2">
            <v-icon class="mr-2" color="#22c55e">mdi-chart-line</v-icon>
            <h5 class="text-subtitle-1 mb-0 text-white">Statistiques pour {{ taskName }}</h5>
          </div>

          <div class="stats-row d-flex align-center justify-space-between">
            <div class="stat-item-horizontal">
              <h3 class="text-h5 font-weight-bold text-white">
                {{ filteredValidations.length }}
              </h3>
              <p class="text-caption text-grey mb-0">
                Sessions{{ dateRangeText ? ' filtrées' : '' }}
              </p>
            </div>

            <div class="stat-item-horizontal">
              <h3 class="text-h5 font-weight-bold text-white">{{ averageReps }}</h3>
              <p class="text-caption text-grey mb-0">Reps moy.</p>
            </div>

            <div class="stat-item-horizontal">
              <h3 class="text-h5 font-weight-bold text-white">{{ averageRir }}</h3>
              <p class="text-caption text-grey mb-0">RIR moy.</p>
            </div>

            <div class="stat-item-horizontal">
              <h3 class="text-h5 font-weight-bold text-white">{{ averageDifficulty }}/10</h3>
              <p class="text-caption text-grey mb-0">Difficulté</p>
            </div>

            <div class="stat-item-horizontal">
              <h3 class="text-h6 font-weight-bold d-flex align-center" :class="getTrendClass()">
                <v-icon small class="mr-1">{{ getTrendIcon() }}</v-icon>
                {{ getTrendText() }}
              </h3>
              <p class="text-caption text-grey mb-0">Tendance</p>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="mb-4" elevation="1">
        <v-card-title class="d-flex align-center py-3">
          <v-icon class="mr-2" color="#22c55e">mdi-filter</v-icon>
          <span class="text-subtitle-1">Filtrer par période</span>
          <v-spacer />
          <TertiaryButton
            v-if="dateRange.length > 0"
            prepend-icon="mdi-close"
            @click="clearDateFilter"
          >
            Effacer
          </TertiaryButton>
        </v-card-title>

        <v-card-text class="pt-0">
          <v-row>
            <v-col cols="12">
              <SecondaryButton
                size="small"
                class="mr-2"
                @click="setDateRange('today')"
                :color="isActiveShortcut('today') ? 'primary' : 'default'"
              >
                Aujourd'hui
              </SecondaryButton>
              <SecondaryButton
                size="small"
                class="mr-2"
                @click="setDateRange('week')"
                :color="isActiveShortcut('week') ? 'primary' : 'default'"
              >
                7 derniers jours
              </SecondaryButton>
              <SecondaryButton
                size="small"
                class="mr-2"
                @click="setDateRange('month')"
                :color="isActiveShortcut('month') ? 'primary' : 'default'"
              >
                30 derniers jours
              </SecondaryButton>
            </v-col>
            <v-col cols="12">
              <VTextField
                :model-value="dateRangeText"
                label="Sélectionner une période"
                prepend-inner-icon="mdi-calendar"
                readonly
                density="compact"
                style="min-width: 280px"
                @click="openDatePicker"
                placeholder="Cliquez pour sélectionner une période"
              />
            </v-col>
          </v-row>
          <div v-if="dateRangeText" class="mt-2">
            <v-chip color="#2dd4bf" size="small">
              <v-icon small class="mr-1">mdi-calendar-check</v-icon>
              {{ dateRangeText }}
            </v-chip>
            <span class="text-body-2 text-grey ml-2">
              {{ filteredValidations.length }} session(s) trouvée(s)
            </span>
          </div>
        </v-card-text>
      </v-card>

      <v-dialog v-model="datePickerDialog" max-width="420px">
        <v-card class="date-picker-dialog">
          <v-card-title>
            <span class="text-h6">Sélectionner une période</span>
          </v-card-title>
          <v-card-text class="d-flex flex-column align-center pb-2">
            <p class="text-body-2 text-grey mb-3">
              Cliquez sur une date de début, puis sur une date de fin pour sélectionner une période.
            </p>

            <div v-if="tempDateRange.length > 0" class="mb-3">
              <v-chip color="#2dd4bf" size="small" class="mr-2">
                <v-icon size="12" class="mr-1">mdi-calendar-start</v-icon>
                Début: {{ formatDateShort(tempDateRange[0]) }}
              </v-chip>
              <v-chip v-if="tempDateRange.length > 1" color="#2dd4bf" size="small">
                <v-icon size="12" class="mr-1">mdi-calendar-end</v-icon>
                Fin: {{ formatDateShort(tempDateRange[tempDateRange.length - 1]) }}
              </v-chip>
            </div>

            <v-date-picker
              v-model="tempDateRange"
              multiple
              :max="maxDate"
              show-adjacent-months
              color="primary"
              @update:model-value="onDatePickerChange"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <TertiaryButton @click="cancelDatePicker"> Annuler </TertiaryButton>
            <PrimaryButton @click="applyDateFilter" :disabled="tempDateRange.length === 0">
              Appliquer
              <span v-if="tempDateRange.length > 0" class="ml-1">
                ({{ tempDateRange.length === 1 ? '1 jour' : getDaysBetween() + ' jours' }})
              </span>
            </PrimaryButton>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <div class="validations-container">
        <div class="d-flex align-center justify-space-between mb-3">
          <h5 class="text-subtitle-1 mb-0">
            <v-icon class="mr-1" color="success">mdi-history</v-icon>
            Détail des sessions
            <span v-if="dateRangeText" class="text-body-2 text-grey">
              ({{ filteredValidations.length }} sur {{ validations.length }})
            </span>
          </h5>

          <div
            v-if="filteredValidations.length > slidesPerView"
            class="slide-controls d-flex align-center gap-2"
          >
            <v-btn icon size="small" :disabled="currentSlide === 0" @click="prevSlide">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>

            <span class="text-body-2 mx-2">
              {{ currentSlide + 1 }}-{{
                Math.min(currentSlide + slidesPerView, filteredValidations.length)
              }}
              / {{ filteredValidations.length }}
            </span>

            <v-btn
              icon
              size="small"
              :disabled="currentSlide + slidesPerView >= filteredValidations.length"
              @click="nextSlide"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>

        <div class="validation-slides-wrapper">
          <div class="validation-slides" :style="slideStyle">
            <div
              v-for="validation in visibleValidations"
              :key="validation.id"
              class="validation-slide"
            >
              <v-card class="validation-card" elevation="2">
                <v-card-title class="d-flex align-center pb-2">
                  <v-avatar
                    size="24"
                    :color="getDifficultyColor(validation.calculated_difficulty || 0)"
                    class="mr-2"
                  >
                    <span class="text-caption white--text font-weight-bold">
                      {{ getOriginalIndex(validation) + 1 }}
                    </span>
                  </v-avatar>
                  <span class="text-subtitle-1"
                    >Session {{ getOriginalIndex(validation) + 1 }}</span
                  >
                  <v-spacer />

                  <v-chip
                    :color="getDifficultyColor(validation.calculated_difficulty || 0)"
                    size="small"
                    class="mr-2"
                  >
                    {{ validation.calculated_difficulty || 'N/A' }}/10
                  </v-chip>

                  <DeleteButton
                    icon
                    size="small"
                    @click="openDeleteDialog(validation)"
                    :loading="
                      trainingStore.loading.creating && selectedValidationId === validation.id
                    "
                  >
                    <v-icon size="16">mdi-delete</v-icon>
                  </DeleteButton>
                </v-card-title>

                <v-card-text class="pt-2">
                  <div class="metrics-grid mb-3">
                    <div class="metric-item">
                      <v-icon size="16" color="#2dd4bf" class="mr-1">mdi-numeric</v-icon>
                      <span class="text-body-2 text-white">{{ validation.set_number }} séries</span>
                    </div>
                    <div class="metric-item">
                      <v-icon size="16" color="#2dd4bf" class="mr-1">mdi-repeat</v-icon>
                      <span class="text-body-2 text-white">{{ validation.repetitions }} reps</span>
                    </div>
                    <div class="metric-item">
                      <v-icon size="16" color="#f97316" class="mr-1">mdi-timer</v-icon>
                      <span class="text-body-2 text-white">{{ validation.rest_time }}min</span>
                    </div>
                    <div class="metric-item">
                      <v-icon size="16" color="#22c55e" class="mr-1">mdi-gauge</v-icon>
                      <span class="text-body-2 text-white">RIR {{ validation.rir }}</span>
                    </div>
                  </div>

                  <div v-if="validation.notes" class="notes-section mb-2">
                    <v-divider class="mb-2" />
                    <p class="text-body-2 text-grey-darken-1">
                      <v-icon size="14" class="mr-1">mdi-note-text</v-icon>
                      {{ validation.notes }}
                    </p>
                  </div>

                  <div class="date-section">
                    <v-divider class="mb-2" />
                    <p class="text-caption text-grey">
                      <v-icon size="14" class="mr-1">mdi-calendar-clock</v-icon>
                      {{ formatDate(validation.succeeded_at) }}
                    </p>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>

        <div v-if="filteredValidations.length === 0 && dateRangeText" class="text-center py-6">
          <v-icon size="48" color="grey">mdi-calendar-remove</v-icon>
          <p class="text-h6 mt-2 text-grey">Aucune session dans cette période</p>
          <p class="text-body-2 text-grey">Essayez de modifier la période sélectionnée</p>
        </div>
      </div>
    </div>

    <DeleteConfirmationDialog
      v-model="deleteDialog"
      :loading="trainingStore.loading.creating"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTrainingStore } from '@/stores/training'
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.vue'
import { useSnackbarStore } from '@/stores/snackbar'

const snackbarStore = useSnackbarStore()

const props = defineProps({
  validations: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  taskName: {
    type: String,
    default: 'Exercice',
  },
  trainingId: {
    type: String,
    required: true,
  },
  taskId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['refresh', 'validation-deleted'])

const trainingStore = useTrainingStore()

const deleteDialog = ref(false)
const selectedValidation = ref(null)
const selectedValidationId = ref(null)

const datePickerDialog = ref(false)
const dateRange = ref([])
const tempDateRange = ref([])

const currentSlide = ref(0)
const slidesPerView = ref(3)

const maxDate = new Date().toISOString().split('T')[0]

const sortedValidations = computed(() => {
  return [...props.validations].sort((a, b) => new Date(b.succeeded_at) - new Date(a.succeeded_at))
})

const filteredValidations = computed(() => {
  if (dateRange.value.length === 0) {
    return sortedValidations.value
  }

  let startDate, endDate

  if (dateRange.value.length === 1) {
    startDate = new Date(dateRange.value[0])
    endDate = new Date(dateRange.value[0])
  } else {
    const dates = [...dateRange.value].sort((a, b) => new Date(a) - new Date(b))
    startDate = new Date(dates[0])
    endDate = new Date(dates[dates.length - 1])
  }

  endDate.setHours(23, 59, 59, 999)

  const filtered = sortedValidations.value.filter((validation) => {
    const validationDate = new Date(validation.succeeded_at)
    const isInRange = validationDate >= startDate && validationDate <= endDate

    return isInRange
  })

  return filtered
})

const visibleValidations = computed(() => {
  const start = currentSlide.value
  const end = start + slidesPerView.value
  return filteredValidations.value.slice(start, end)
})

const dateRangeText = computed(() => {
  if (dateRange.value.length === 0) return ''
  if (dateRange.value.length === 1) return formatDateShort(dateRange.value[0])

  const dates = [...dateRange.value].sort((a, b) => new Date(a) - new Date(b))
  if (dates.length === 2 && dates[0] === dates[1]) {
    return formatDateShort(dates[0])
  }
  return `${formatDateShort(dates[0])} - ${formatDateShort(dates[dates.length - 1])}`
})

const slideStyle = computed(() => {
  return {
    transform: 'translateX(0px)',
    transition: 'opacity 0.3s ease',
  }
})

const averageReps = computed(() => {
  if (!filteredValidations.value.length) return 0
  const total = filteredValidations.value.reduce((sum, v) => sum + (v.repetitions || 0), 0)
  return Math.round(total / filteredValidations.value.length)
})

const averageRir = computed(() => {
  if (!filteredValidations.value.length) return 0
  const total = filteredValidations.value.reduce((sum, v) => sum + (v.rir || 0), 0)
  return Math.round(total / filteredValidations.value.length)
})

const averageDifficulty = computed(() => {
  if (!filteredValidations.value.length) return 0
  const validationsWithDifficulty = filteredValidations.value.filter((v) => v.calculated_difficulty)
  if (!validationsWithDifficulty.length) return 0
  const total = validationsWithDifficulty.reduce((sum, v) => sum + v.calculated_difficulty, 0)
  return Math.round((total / validationsWithDifficulty.length) * 10) / 10
})

watch(filteredValidations, () => {
  currentSlide.value = 0
})

onMounted(() => {
  adjustSlidesPerView()
  window.addEventListener('resize', adjustSlidesPerView)
})

onUnmounted(() => {
  window.removeEventListener('resize', adjustSlidesPerView)
})

const adjustSlidesPerView = () => {
  const width = window.innerWidth
  if (width < 768) {
    slidesPerView.value = 1
  } else if (width < 1200) {
    slidesPerView.value = 2
  } else {
    slidesPerView.value = 3
  }
}

const refreshValidations = () => {
  emit('refresh')
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateShort = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const getDifficultyColor = (difficulty) => {
  if (difficulty <= 3) return '#22c55e'
  if (difficulty <= 6) return '#f97316'
  if (difficulty <= 8) return '#920002'
  return 'error'
}

const getTrendClass = () => {
  if (filteredValidations.value.length < 2) return 'text-grey'

  const recent = filteredValidations.value.slice(0, Math.min(3, filteredValidations.value.length))
  const older = filteredValidations.value.slice(Math.min(3, filteredValidations.value.length))

  if (recent.length === 0 || older.length === 0) return 'text-grey'

  const recentAvg =
    recent.reduce((sum, v) => sum + (v.calculated_difficulty || 0), 0) / recent.length
  const olderAvg = older.reduce((sum, v) => sum + (v.calculated_difficulty || 0), 0) / older.length

  if (recentAvg > olderAvg + 0.5) return 'text-error'
  if (recentAvg < olderAvg - 0.5) return 'text-success'
  return 'text-warning'
}

const getTrendIcon = () => {
  const className = getTrendClass()
  if (className === 'text-error') return 'mdi-trending-up'
  if (className === 'text-success') return 'mdi-trending-down'
  return 'mdi-trending-neutral'
}

const getTrendText = () => {
  const className = getTrendClass()
  if (className === 'text-error') return 'Plus dur'
  if (className === 'text-success') return 'Plus facile'
  return 'Stable'
}

const openDatePicker = () => {
  tempDateRange.value = [...dateRange.value]
  datePickerDialog.value = true
}

const onDatePickerChange = (selectedDates) => {
  if (!selectedDates || selectedDates.length === 0) {
    tempDateRange.value = []
    return
  }

  if (selectedDates.length > 2) {
    const sortedDates = [...selectedDates].sort((a, b) => new Date(a) - new Date(b))
    tempDateRange.value = [sortedDates[0], sortedDates[sortedDates.length - 1]]
  } else {
    tempDateRange.value = [...selectedDates].sort((a, b) => new Date(a) - new Date(b))
  }
}

const applyDateFilter = () => {
  if (tempDateRange.value.length === 0) {
    dateRange.value = []
  } else if (tempDateRange.value.length === 1) {
    dateRange.value = [tempDateRange.value[0]]
  } else {
    const startDate = new Date(tempDateRange.value[0])
    const endDate = new Date(tempDateRange.value[tempDateRange.value.length - 1])

    const dates = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    dateRange.value = dates
  }

  datePickerDialog.value = false
  currentSlide.value = 0
}

const cancelDatePicker = () => {
  tempDateRange.value = [...dateRange.value]
  datePickerDialog.value = false
}

const clearDateFilter = () => {
  dateRange.value = []
  tempDateRange.value = []
  currentSlide.value = 0
}

const getDaysBetween = () => {
  if (tempDateRange.value.length < 2) return 0
  const start = new Date(tempDateRange.value[0])
  const end = new Date(tempDateRange.value[tempDateRange.value.length - 1])
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

const setDateRange = (period) => {
  const today = new Date()
  const start = new Date()

  switch (period) {
    case 'today': {
      dateRange.value = [today.toISOString().split('T')[0]]
      break
    }
    case 'week': {
      start.setDate(today.getDate() - 7)
      const weekDates = []
      const currentDate = new Date(start)
      while (currentDate <= today) {
        weekDates.push(currentDate.toISOString().split('T')[0])
        currentDate.setDate(currentDate.getDate() + 1)
      }
      dateRange.value = weekDates
      break
    }
    case 'month': {
      start.setDate(today.getDate() - 30)
      const monthDates = []
      const currentMonthDate = new Date(start)
      while (currentMonthDate <= today) {
        monthDates.push(currentMonthDate.toISOString().split('T')[0])
        currentMonthDate.setDate(currentMonthDate.getDate() + 1)
      }
      dateRange.value = monthDates
      break
    }
  }
  currentSlide.value = 0
}

const isActiveShortcut = (period) => {
  if (dateRange.value.length === 0) return false

  const today = new Date().toISOString().split('T')[0]

  switch (period) {
    case 'today':
      return dateRange.value.length === 1 && dateRange.value[0] === today
    case 'week': {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 7)
      return (
        dateRange.value.includes(weekStart.toISOString().split('T')[0]) &&
        dateRange.value.includes(today)
      )
    }
    case 'month': {
      const monthStart = new Date()
      monthStart.setDate(monthStart.getDate() - 30)
      return (
        dateRange.value.includes(monthStart.toISOString().split('T')[0]) &&
        dateRange.value.includes(today)
      )
    }
    default:
      return false
  }
}

const nextSlide = () => {
  if (currentSlide.value + slidesPerView.value < filteredValidations.value.length) {
    currentSlide.value += slidesPerView.value
  }
}

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value = Math.max(0, currentSlide.value - slidesPerView.value)
  }
}

const getOriginalIndex = (validation) => {
  return sortedValidations.value.findIndex((v) => v.id === validation.id)
}

const openDeleteDialog = (validation) => {
  selectedValidation.value = validation
  selectedValidationId.value = validation.id
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedValidation.value) return

  try {
    await trainingStore.deleteValidation(
      props.trainingId,
      props.taskId,
      selectedValidation.value.id,
    )

    deleteDialog.value = false
    selectedValidation.value = null
    selectedValidationId.value = null

    if (currentSlide.value > 0 && visibleValidations.value.length === 0) {
      currentSlide.value = Math.max(0, currentSlide.value - slidesPerView.value)
    }

    emit('validation-deleted')
    snackbarStore.success('Validation supprimée avec succès')
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    snackbarStore.error('Erreur lors de la suppression de la validation')
  }
}

const cancelDelete = () => {
  selectedValidation.value = null
  selectedValidationId.value = null
  deleteDialog.value = false
}
</script>

<style lang="scss" scoped>
.validations-list {
  background-color: rgba(140, 245, 235, 0.15);
  border-radius: 8px;
  padding: 16px;
}

.stats-card {
  border-radius: 8px;
  border-left: 4px solid #22c55e;
}

.stats-row {
  padding: 8px 0;
}

.stat-item-horizontal {
  text-align: center;
  padding: 0 16px;
}

.stat-item-horizontal:not(:last-child) {
  border-right: 1px solid #e0e0e0;
}


.date-shortcuts {
  flex-wrap: wrap;
}

.validation-slides-wrapper {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.validation-slides {
  display: flex;
  gap: 16px;
  width: 100%;
}

.validation-slide {
  flex: 1;
  min-width: 0;
  max-width: calc((100% - 32px) / 3);
}

.validation-card {
  position: relative;
  transition: all 0.3s ease;
  border-radius: 8px;
  height: 100%;
  background-color: #00231f !important;
}

.validation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.recent-indicator {
  position: absolute;
  bottom: 8px;
  left: 8px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.metric-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.notes-section {
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #2196f3;
}

.date-section {
  margin-top: 8px;
}

.validations-container {
  margin-top: 16px;
}

.slide-controls {
  background:  #00231f;
  border-radius: 20px;
  padding: 8px 12px;
}

@media (max-width: 1200px) {
  .validation-slide {
    max-width: calc((100% - 16px) / 2);
  }
}

@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
    gap: 16px;
  }

  .stat-item-horizontal {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    padding: 8px 0;
  }

  .stat-item-horizontal:last-child {
    border-bottom: none;
  }

  .validation-slide {
    max-width: 100%;
  }

  .date-shortcuts {
    width: 100%;
    justify-content: stretch;
  }

  .date-shortcuts .v-btn {
    flex: 1;
  }
}

.date-picker-dialog {
  background-color: #00231f !important;
}
</style>
