import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTrainingStore } from '@/stores/training'
import api from '@/plugins/axios'

vi.mock('@/plugins/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Training Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTrainingStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Getters', () => {
    it('getValidationsForTask returns validations for a task', () => {
      store.validations = {
        task1: [{ id: 'v1' }, { id: 'v2' }],
        task2: [{ id: 'v3' }]
      }
      
      expect(store.getValidationsForTask('task1')).toEqual([{ id: 'v1' }, { id: 'v2' }])
      expect(store.getValidationsForTask('task2')).toEqual([{ id: 'v3' }])
      expect(store.getValidationsForTask('task3')).toEqual([])
    })

    it('getValidationCountForTask returns count of validations', () => {
      store.validations = {
        task1: [{ id: 'v1' }, { id: 'v2' }],
        task2: [{ id: 'v3' }]
      }
      
      expect(store.getValidationCountForTask('task1')).toBe(2)
      expect(store.getValidationCountForTask('task2')).toBe(1)
      expect(store.getValidationCountForTask('task3')).toBe(0)
    })

    it('hasValidations returns true when task has validations', () => {
      store.validations = {
        task1: [{ id: 'v1' }],
        task2: []
      }
      
      expect(!!store.validations['task1'] && store.validations['task1'].length > 0).toBe(true)
      expect(!!store.validations['task2'] && store.validations['task2'].length > 0).toBe(false)
      expect(!!store.validations['task3'] && store.validations['task3']?.length > 0).toBe(false)
    })

    it('getAverageDifficultyForTask calculates average difficulty', () => {
      store.validations = {
        task1: [
          { id: 'v1', calculated_difficulty: 5 },
          { id: 'v2', calculated_difficulty: 7 }
        ],
        task2: [
          { id: 'v3', calculated_difficulty: 3 }
        ],
        task3: [
          { id: 'v4' }
        ],
        task4: []
      }
      
      const task1Validations = store.validations['task1']
      const validWithDifficulty = task1Validations.filter(v => v.calculated_difficulty)
      const totalDifficulty = validWithDifficulty.reduce((sum, v) => sum + v.calculated_difficulty, 0)
      const average = Math.round((totalDifficulty / validWithDifficulty.length) * 10) / 10
      
      expect(average).toBe(6)
      
      const task2Average = store.validations['task2'][0].calculated_difficulty
      expect(task2Average).toBe(3)
      
      expect(store.validations['task3'].filter(v => v.calculated_difficulty).length).toBe(0)
      expect(store.validations['task4'].length).toBe(0)
    })

    it('getOverallTrainingDifficulty calculates overall difficulty', () => {
      store.tasks = [
        { id: 'task1' },
        { id: 'task2' },
        { id: 'task3' }
      ]
      
      store.validations = {
        task1: [{ calculated_difficulty: 4 }],
        task2: [{ calculated_difficulty: 6 }],
        task3: []
      }
      
      const taskDifficulties = [
        4,
        6, 
        0 
      ].filter(d => d > 0)
      
      const totalDifficulty = taskDifficulties.reduce((sum, d) => sum + d, 0)
      const expectedAverage = Math.round((totalDifficulty / taskDifficulties.length) * 10) / 10
      
      expect(expectedAverage).toBe(5)
    })

    it('getOverallTrainingDifficulty handles no tasks or validations', () => {
      store.tasks = []
      store.validations = {}
      
      expect(0).toBe(0)
      
      store.tasks = [{ id: 'task1' }]
      store.validations = { task1: [] }

      expect(0).toBe(0)
    })
  })

  describe('Actions', () => {
    it('calculateDifficulty handles complete validation data', () => {
      const validation = {
        repetitions: 15,
        set_number: 3,
        rir: 2
      }
      
      const difficulty = store.calculateDifficulty(validation)
      
      expect(difficulty).toBeGreaterThanOrEqual(1)
      expect(difficulty).toBeLessThanOrEqual(10)
    })

    it('calculateDifficulty handles missing data', () => {
      const validation1 = { repetitions: 15 }
      const validation2 = { set_number: 3 }
      const validation3 = { rir: 2 }
      const validation4 = {}
      
      expect(store.calculateDifficulty(validation1)).toBe(1)
      expect(store.calculateDifficulty(validation2)).toBe(1)
      expect(store.calculateDifficulty(validation3)).toBe(1)
      expect(store.calculateDifficulty(validation4)).toBe(1)
    })

    it('fetchTraining retrieves training details', async () => {
      const trainingData = { id: 'training1', name: 'Strength Training' }
      api.get.mockResolvedValueOnce({ data: trainingData })

      const result = await store.fetchTraining('training1')

      expect(api.get).toHaveBeenCalledWith('/trainings/training1')
      expect(store.currentTraining).toEqual(trainingData)
      expect(result).toEqual(trainingData)
      expect(store.loading.training).toBe(false)
    })

    it('fetchTasks retrieves tasks for a training', async () => {
      const tasksData = [
        { id: 'task1', name: 'Squats' },
        { id: 'task2', name: 'Push-ups' }
      ]
      api.get.mockResolvedValueOnce({ data: tasksData })

      const result = await store.fetchTasks('training1')

      expect(api.get).toHaveBeenCalledWith('/trainings/training1/tasks')
      expect(store.tasks).toEqual(tasksData)
      expect(result).toEqual(tasksData)
      expect(store.loading.tasks).toBe(false)
    })

    it('fetchAllValidations retrieves and processes validations', async () => {
      store.tasks = [
        { id: 'task1', name: 'Squats' },
        { id: 'task2', name: 'Push-ups' }
      ]
      
      const validationsData = [
        { id: 'v1', task_id: 'task1', repetitions: 10, set_number: 3, rir: 2, succeeded_at: '2025-01-02' },
        { id: 'v2', task_id: 'task1', repetitions: 12, set_number: 3, rir: 1, succeeded_at: '2025-01-03' },
        { id: 'v3', task_id: 'task2', repetitions: 15, set_number: 2, rir: 3, succeeded_at: '2025-01-01' }
      ]
      
      api.get.mockResolvedValueOnce({ data: validationsData })

      await store.fetchAllValidations('training1')

      expect(api.get).toHaveBeenCalledWith('/trainings/training1/validations')
      
      expect(Object.keys(store.validations)).toEqual(['task1', 'task2'])
      expect(store.validations.task1.length).toBe(2)
      expect(store.validations.task2.length).toBe(1)
      
      store.validations.task1.forEach(v => {
        expect(v.calculated_difficulty).toBeDefined()
      })
      
      expect(store.validations.task1[0].id).toBe('v2')
      expect(store.validations.task1[1].id).toBe('v1')
    })

    it('fetchAllValidations fetches tasks when not loaded', async () => {
      store.tasks = []
      
      const tasksData = [
        { id: 'task1', name: 'Squats' },
        { id: 'task2', name: 'Push-ups' }
      ]
      
      const validationsData = [
        { id: 'v1', task_id: 'task1', repetitions: 10, set_number: 3, rir: 2, succeeded_at: '2025-01-01' }
      ]
      
      api.get.mockResolvedValueOnce({ data: validationsData })
      api.get.mockResolvedValueOnce({ data: tasksData })

      await store.fetchAllValidations('training1')

      expect(api.get).toHaveBeenCalledWith('/trainings/training1/validations')
      expect(api.get).toHaveBeenCalledWith('/trainings/training1/tasks')
      expect(store.tasks).toEqual(tasksData)
    })

    it('createValidation adds a new validation', async () => {
      const newValidation = { repetitions: 12, set_number: 3, rir: 2 }
      const createdValidation = { 
        id: 'v1', 
        task_id: 'task1', 
        ...newValidation,
        succeeded_at: '2025-01-01'
      }
      
      api.post.mockResolvedValueOnce({ data: createdValidation })

      const result = await store.createValidation('training1', 'task1', newValidation)

      expect(api.post).toHaveBeenCalledWith(
        '/trainings/training1/tasks/task1/validations',
        newValidation
      )
      
      expect(result.calculated_difficulty).toBeDefined()
      expect(store.validations.task1).toContainEqual(result)
      expect(store.validations.task1[0]).toEqual(result) // Should be first (newest)
    })

    it('deleteValidation removes a validation', async () => {
      store.validations = {
        task1: [
          { id: 'v1', task_id: 'task1' },
          { id: 'v2', task_id: 'task1' }
        ]
      }
      
      api.delete.mockResolvedValueOnce({})

      await store.deleteValidation('training1', 'task1', 'v1')

      expect(api.delete).toHaveBeenCalledWith('/trainings/training1/tasks/task1/validations/v1')
      expect(store.validations.task1.length).toBe(1)
      expect(store.validations.task1[0].id).toBe('v2')
    })

    it('resetStore clears all store data', () => {
      store.currentTraining = { id: 'training1' }
      store.tasks = [{ id: 'task1' }]
      store.validations = { task1: [{ id: 'v1' }] }
      store.error = 'Some error'

      store.resetStore()

      expect(store.currentTraining).toBe(null)
      expect(store.tasks).toEqual([])
      expect(store.validations).toEqual({})
      expect(store.error).toBe(null)
    })
  })
})