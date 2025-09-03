<template>
  <v-container fluid class="training-detail-page">
    <div v-if="trainingStore.currentTraining" class="training-header mb-6">
      <v-card elevation="2">
        <v-card-title class="d-flex align-center">
          <v-btn icon @click="goBack" class="mr-3">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <div>
            <h1 class="text-h4">{{ trainingStore.currentTraining.name }}</h1>
            <p class="text-body-1 text-black mb-0">
              {{ trainingStore.currentTraining.description }}
            </p>
          </div>
          <v-spacer />
          <v-chip color="black"> {{ trainingStore.tasks.length }} exercice(s) </v-chip>
        </v-card-title>
      </v-card>
    </div>

    <div
      v-if="trainingStore.loading.training || trainingStore.loading.tasks"
      class="text-center py-8"
    >
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">Chargement du training...</p>
    </div>

    <v-alert
      v-if="trainingStore.error"
      type="error"
      class="mb-4"
      dismissible
      @click:close="trainingStore.error = null"
    >
      {{ trainingStore.error }}
    </v-alert>

    <div v-if="!trainingStore.loading.training && !trainingStore.loading.tasks" elevation="2">
      <h6 class="d-flex align-center mb-4">
        <v-icon class="mr-2" size="25" color="white">mdi-format-list-checks</v-icon>
        <span class="text-h6 text-white">Exercices du training</span>
        <v-spacer />
        <PrimaryButton v-if="canCreateTask" prepend-icon="mdi-plus" @click="showCreateTask = true">
          Ajouter
        </PrimaryButton>
      </h6>

      <v-data-table
        :headers="headers"
        :items="enhancedTasks"
        :items-per-page="-1"
        item-value="id"
        hide-default-footer
        class="tasks-table"
        :expanded="expandedTasks"
        show-expand
        @update:expanded="handleExpandedChange"
      >
        <template #[`item.exercise_name`]="{ item }">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="white">mdi-dumbbell</v-icon>
            <strong>{{ item.exercise_name }}</strong>
          </div>
        </template>

        <template #[`item.sets_reps`]="{ item }">
          <v-chip color="info" small> {{ item.set_number }} x {{ item.repetitions }} </v-chip>
        </template>

        <template #[`item.rest_time`]="{ item }"> {{ item.rest_time }}min </template>

        <template #[`item.method`]="{ item }">
          <v-chip color="#22c55e" small outlined>
            {{ item.method }}
          </v-chip>
        </template>

        <template #[`item.rir`]="{ item }">
          <v-chip color="#f97316" small> RIR {{ item.rir }} </v-chip>
        </template>

        <template #[`item.validations_count`]="{ item }">
          <v-chip :color="item.validations_count > 0 ? '#22c55e' : 'grey'" small>
            {{ item.validations_count }} validation(s)
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <SecondaryButton
            v-if="!canCreateTask"
            size="small"
            @click="openValidationDialog(item)"
            :loading="trainingStore.loading.creating"
          >
            <v-icon small class="mr-1">mdi-plus</v-icon>
            Valider
          </SecondaryButton>

          <DeleteButton
            v-if="canCreateTask"
            size="small"
            prepend-icon="mdi-delete"
            @click="openDeleteTaskDialog(item)"
            :loading="deletingTaskId === item.id"
          >
            Supprimer
          </DeleteButton>
        </template>

        <template #expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length" class="pa-4">
              <ValidationsList
                :validations="trainingStore.getValidationsForTask(item.id)"
                :loading="trainingStore.loading.validations"
                :task-name="item.exercise_name"
                :training-id="trainingId"
                :task-id="item.id"
                @refresh="loadAllValidations"
                @validation-deleted="loadAllValidations"
              />
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>

    <ValidationDialog
      v-model="validationDialog"
      :task="selectedTask"
      :training-id="trainingId"
      @validation-created="onValidationCreated"
    />

    <TaskCreateDialog v-model="showCreateTask" @created="createTask" />

    <DeleteConfirmationDialog
      v-model="deleteTaskDialog"
      :title="`Supprimer l'exercice`"
      :message="`Êtes-vous sûr de vouloir supprimer l'exercice '${selectedTaskToDelete?.exercise_name}' ? Cette action est irréversible.`"
      @confirm="confirmDeleteTask"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrainingStore } from '@/stores/training'
import { useAuthStore } from '@/stores/auth'
import { useContextualStore } from '@/stores/contextual'
import { useSnackbarStore } from '@/stores/snackbar'
import api from '@/plugins/axios'
import TaskCreateDialog from '@/components/TaskCreateDialog.vue'
import ValidationDialog from '@/components/ValidationDialog.vue'
import ValidationsList from '@/components/ValidationsList.vue'
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.vue'

const route = useRoute()
const router = useRouter()
const trainingStore = useTrainingStore()
const authStore = useAuthStore()
const contextual = useContextualStore()
const snackbarStore = useSnackbarStore()

const validationDialog = ref(false)
const selectedTask = ref(null)
const expandedTasks = ref([])
const showCreateTask = ref(false)

const deleteTaskDialog = ref(false)
const selectedTaskToDelete = ref(null)
const deletingTaskId = ref(null)

const trainingId = computed(() => route.params.id)
const targetUserId = computed(() => contextual.userProfileId || route.query.userId)

const canCreateTask = computed(
  () =>
    ['coach', 'admin'].some((role) => authStore.userRoles?.includes(role)) &&
    targetUserId.value &&
    targetUserId.value !== authStore.userId,
)

const headers = [
  { title: 'Exercice', key: 'exercise_name', sortable: true },
  { title: 'Séries/Reps', key: 'sets_reps', sortable: false },
  { title: 'Repos', key: 'rest_time', sortable: true },
  { title: 'Méthode', key: 'method', sortable: true },
  { title: 'RIR', key: 'rir', sortable: true },
  { title: 'Validations', key: 'validations_count', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
]

const enhancedTasks = computed(() => {
  return trainingStore.tasks.map((task) => ({
    ...task,
    validations_count: trainingStore.getValidationCountForTask(task.id),
  }))
})

const goBack = () => {
  router.push('/')
}

const openValidationDialog = (task) => {
  selectedTask.value = task
  validationDialog.value = true
}

const openDeleteTaskDialog = (task) => {
  selectedTaskToDelete.value = task
  deleteTaskDialog.value = true
}

const confirmDeleteTask = async () => {
  if (!selectedTaskToDelete.value) return

  deletingTaskId.value = selectedTaskToDelete.value.id

  try {
    await api.delete(
      `/trainings/${trainingId.value}/user/${targetUserId.value}/tasks/${selectedTaskToDelete.value.id}`,
    )

    await trainingStore.fetchTasks(trainingId.value)

    snackbarStore.success(
      `Exercice '${selectedTaskToDelete.value.exercise_name}' supprimé avec succès !`,
    )

    deleteTaskDialog.value = false
    selectedTaskToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error)
    snackbarStore.error("Erreur lors de la suppression de l'exercice.")
  } finally {
    deletingTaskId.value = null
  }
}

const handleExpandedChange = (expandedItems) => {
  expandedTasks.value = expandedItems
}

const loadAllValidations = async () => {
  try {
    await trainingStore.fetchAllValidations(trainingId.value)
  } catch (error) {
    console.error('Erreur lors du chargement des validations:', error)
  }
}

const onValidationCreated = () => {
  validationDialog.value = false
  selectedTask.value = null
}

async function createTask(payload) {
  try {
    await api.post(`/trainings/${trainingId.value}/user/${targetUserId.value}/tasks`, payload)

    await trainingStore.fetchTasks(trainingId.value)
    snackbarStore.success('Exercice ajouté avec succès !')
    showCreateTask.value = false
  } catch (e) {
    console.error('Error creating task:', e)
    snackbarStore.error("Erreur lors de la création de l'exercice.")
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      trainingStore.fetchTraining(trainingId.value),
      trainingStore.fetchTasks(trainingId.value),
      trainingStore.fetchAllValidations(trainingId.value),
    ])
  } catch (error) {
    console.error('Erreur lors du chargement:', error)
  }
})

onUnmounted(() => {
  trainingStore.resetStore()
})
</script>

<style lang="scss" scoped>
.training-detail-page {
  max-width: 1200px;
}

.training-header {
  background: linear-gradient(135deg, #22c55e 0%, #2dd4bf 100%);
  border-radius: 12px;
  color: white;
}

.tasks-table {
  border-radius: 8px;
  background-color: color-mix(in srgb, #00231F, white 10%);
  border: 1px solid color-mix(in srgb, #00231F, white 20%);
  color: white;
  :deep(.v-table__wrapper){
    thead {
      padding: 0.75rem 1rem;
    }
  }
}

:deep(.v-data-table-row:hover) {
  background-color: #f5f5f5;
}
</style>
