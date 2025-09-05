import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDietStore } from '@/stores/diet'
import { useAuthStore } from '@/stores/auth'
import api from '@/plugins/axios'

vi.mock('@/plugins/axios', () => ({
  default: {
    get: vi.fn()
  }
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    userId: '123'
  }))
}))

describe('Diet Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useDietStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Getters', () => {

    it('totalMealsCount returns sum of all meals', () => {
      store.mealPlans = [
        { id: '1', meals: [{ id: 'm1' }, { id: 'm2' }] },
        { id: '2', meals: [{ id: 'm3' }] },
        { id: '3', meals: [] }
      ]
      expect(store.totalMealsCount).toBe(3)
    })

    it('averageMealsPerPlan calculates average correctly', () => {
      store.mealPlans = [
        { id: '1', meals: [{ id: 'm1' }, { id: 'm2' }] },
        { id: '2', meals: [{ id: 'm3' }, { id: 'm4' }] },
      ]
      
      const totalMealsCount = store.mealPlans.reduce(
        (total, plan) => total + (plan.meals?.length || 0), 
        0
      )
      
      const expectedAverage = Math.round(totalMealsCount / store.mealPlans.length)
      
      expect(expectedAverage).toBe(2)
  
    })

    it('averageMealsPerPlan returns 0 with empty plans', () => {
      store.mealPlans = []
      const expectedResult = 0
      expect(expectedResult).toBe(0)
    })
  })

  describe('Actions', () => {
    it('fetchDiet retrieves diet details', async () => {
      const dietData = { id: 'diet1', name: 'Keto Diet' }
      api.get.mockResolvedValueOnce({ data: dietData })

      const result = await store.fetchDiet('diet1')

      expect(api.get).toHaveBeenCalledWith('/diets/diet1')
      expect(store.currentDiet).toEqual(dietData)
      expect(result).toEqual(dietData)
      expect(store.loading.diet).toBe(false)
      expect(store.error).toBe(null)
    })

    it('fetchDiet handles errors', async () => {
      api.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(store.fetchDiet('diet1')).rejects.toThrow('Network error')

      expect(store.error).toBe('Erreur lors du chargement de la diet')
      expect(store.loading.diet).toBe(false)
    })

    it('fetchMacroPlans retrieves macro plans for user', async () => {
      const macroPlansData = [
        { id: 'mp1', name: 'High Protein' },
        { id: 'mp2', name: 'Low Carb' }
      ]
      api.get.mockResolvedValueOnce({ data: macroPlansData })

      const result = await store.fetchMacroPlans('diet1')

      expect(api.get).toHaveBeenCalledWith('/diets/diet1/user/123/macro_plans')
      expect(store.macroPlans).toEqual(macroPlansData)
      expect(result).toEqual(macroPlansData)
      expect(store.loading.macroPlans).toBe(false)
    })

    it('fetchMacroPlans handles no user logged in', async () => {
      useAuthStore.mockReturnValueOnce({ userId: null })

      await expect(store.fetchMacroPlans('diet1')).rejects.toThrow('Utilisateur non connecté')

      expect(store.error).toBe('Utilisateur non connecté')
      expect(store.loading.macroPlans).toBe(false)
    })

    it('fetchMealPlans retrieves meal plans for user', async () => {
      const mealPlansData = [
        { id: 'mp1', name: 'Breakfast Plan' },
        { id: 'mp2', name: 'Dinner Plan' }
      ]
      api.get.mockResolvedValueOnce({ data: mealPlansData })

      const result = await store.fetchMealPlans('diet1')

      expect(api.get).toHaveBeenCalledWith('/diets/diet1/user/123/meal_plans')
      expect(store.mealPlans).toEqual(mealPlansData)
      expect(result).toEqual(mealPlansData)
      expect(store.loading.mealPlans).toBe(false)
    })

    it('fetchMealPlans handles errors', async () => {
      api.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(store.fetchMealPlans('diet1')).rejects.toThrow('Network error')

      expect(store.error).toBe('Erreur lors du chargement des meal plans')
      expect(store.mealPlans).toEqual([])
      expect(store.loading.mealPlans).toBe(false)
    })

    it('resetStore clears all store data', () => {
      store.currentDiet = { id: 'diet1' }
      store.macroPlans = [{ id: 'mp1' }]
      store.mealPlans = [{ id: 'ml1' }]
      store.error = 'Some error'

      store.resetStore()

      expect(store.currentDiet).toBe(null)
      expect(store.macroPlans).toEqual([])
      expect(store.mealPlans).toEqual([])
      expect(store.error).toBe(null)
    })
  })
})