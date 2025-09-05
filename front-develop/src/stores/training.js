import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useTrainingStore = defineStore('training', {
  state: () => ({
    currentTraining: null,
    tasks: [],
    validations: {},
    loading: {
      training: false,
      tasks: false,
      validations: false,
      creating: false,
    },
    error: null,
  }),

  getters: {
    getValidationsForTask: (state) => (taskId) => {
      return state.validations[taskId] || []
    },

    getValidationCountForTask: (state) => (taskId) => {
      return state.validations[taskId]?.length || 0
    },

    hasValidations: (state) => (taskId) => {
      return state.validations[taskId] && state.validations[taskId].length > 0
    },

    getAverageDifficultyForTask: (state) => (taskId) => {
      const validations = state.validations[taskId]
      if (!validations || validations.length === 0) return 0

      const validationsWithDifficulty = validations.filter((v) => v.calculated_difficulty)
      if (validationsWithDifficulty.length === 0) return 0

      const totalDifficulty = validationsWithDifficulty.reduce((sum, validation) => {
        return sum + validation.calculated_difficulty
      }, 0)

      return Math.round((totalDifficulty / validationsWithDifficulty.length) * 10) / 10
    },

    getOverallTrainingDifficulty: (state, getters) => {
      if (!state.tasks.length) return 0

      const taskDifficulties = state.tasks
        .map((task) => getters.getAverageDifficultyForTask(task.id))
        .filter((difficulty) => difficulty > 0)

      if (taskDifficulties.length === 0) return 0

      const totalDifficulty = taskDifficulties.reduce((sum, difficulty) => sum + difficulty, 0)
      return Math.round((totalDifficulty / taskDifficulties.length) * 10) / 10
    },
  },

  actions: {
    calculateDifficulty(validation) {
      if (!validation.repetitions || !validation.set_number || validation.rir === undefined) {
        console.warn('Missing values for difficulty calculation:', {
          repetitions: validation.repetitions,
          set_number: validation.set_number,
          rir: validation.rir,
        })
        return 1
      }

      const MAX_REPS = 30
      const MAX_SETS = 10
      const MAX_RIR = 5

      const repsScore = Math.min(validation.repetitions / MAX_REPS, 1)

      const setsScore = Math.min(validation.set_number / MAX_SETS, 1)

      const rirScore = Math.max(0, (MAX_RIR - Math.min(validation.rir, MAX_RIR)) / MAX_RIR)

      const REPS_WEIGHT = 0.4
      const SETS_WEIGHT = 0.3
      const RIR_WEIGHT = 0.3

      const finalScore = repsScore * REPS_WEIGHT + setsScore * SETS_WEIGHT + rirScore * RIR_WEIGHT

      const difficulty = Math.max(1, Math.min(10, Math.round(finalScore * 9 + 1)))

      return difficulty
    },

    async fetchTraining(trainingId) {
      this.loading.training = true
      this.error = null
      try {
        const response = await api.get(`/trainings/${trainingId}`)
        this.currentTraining = response.data
        return response.data
      } catch (error) {
        this.error = 'Erreur lors du chargement du training'
        console.error('Error fetching training:', error)
        throw error
      } finally {
        this.loading.training = false
      }
    },

    async fetchTasks(trainingId) {
      this.loading.tasks = true
      this.error = null
      try {
        const response = await api.get(`/trainings/${trainingId}/tasks`)
        this.tasks = response.data
        return response.data
      } catch (error) {
        this.error = 'Erreur lors du chargement des tâches'
        console.error('Error fetching tasks:', error)
        throw error
      } finally {
        this.loading.tasks = false
      }
    },

    async fetchAllValidations(trainingId) {
      this.loading.validations = true
      try {
        const response = await api.get(`/trainings/${trainingId}/validations`)
        const allValidations = response.data || []

        this.validations = {}

        if (this.tasks.length === 0) {
          console.warn('Tasks not loaded yet, waiting...')
          await this.fetchTasks(trainingId)
        }

        allValidations.forEach((validation) => {
          const taskId = validation.task_id
          if (!this.validations[taskId]) {
            this.validations[taskId] = []
          }

          const calculatedDifficulty = this.calculateDifficulty(validation)
          validation.calculated_difficulty = calculatedDifficulty

          this.validations[taskId].push(validation)
        })

        Object.keys(this.validations).forEach((taskId) => {
          this.validations[taskId].sort(
            (a, b) => new Date(b.succeeded_at) - new Date(a.succeeded_at),
          )
        })

        return allValidations
      } catch (error) {
        console.error('Error fetching all validations:', error)
        this.validations = {}
        throw error
      } finally {
        this.loading.validations = false
      }
    },

    async createValidation(trainingId, taskId, validationData) {
      this.loading.creating = true
      try {
        const response = await api.post(
          `/trainings/${trainingId}/tasks/${taskId}/validations`,
          validationData,
        )

        const calculatedDifficulty = this.calculateDifficulty(response.data)
        response.data.calculated_difficulty = calculatedDifficulty

        if (!this.validations[taskId]) {
          this.validations[taskId] = []
        }

        this.validations[taskId].unshift(response.data)

        return response.data
      } catch (error) {
        console.error('Error creating validation:', error)
        throw error
      } finally {
        this.loading.creating = false
      }
    },

    async deleteValidation(trainingId, taskId, validationId) {
      this.loading.creating = true
      try {
        await api.delete(`/trainings/${trainingId}/tasks/${taskId}/validations/${validationId}`)

        if (this.validations[taskId]) {
          this.validations[taskId] = this.validations[taskId].filter(
            (validation) => validation.id !== validationId,
          )
        }

        return true
      } catch (error) {
        console.error('Error deleting validation:', error)
        throw error
      } finally {
        this.loading.creating = false
      }
    },

    resetStore() {
      this.currentTraining = null
      this.tasks = []
      this.validations = {}
      this.error = null
    },
  },
})
