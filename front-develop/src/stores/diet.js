import { defineStore } from 'pinia'
import api from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'

export const useDietStore = defineStore('diet', {
  state: () => ({
    currentDiet: null,
    macroPlans: [],
    mealPlans: [],
    loading: {
      diet: false,
      macroPlans: false,
      mealPlans: false,
    },
    error: null,
  }),

  getters: {
    totalMacroPlans: (state) => state.macroPlans.length,
    totalMealPlans: (state) => state.mealPlans.length,

    highestCaloriePlan: (state) => {
      if (!state.macroPlans.length) return null
      return state.macroPlans.reduce((max, plan) =>
        (plan.kilocalorie ?? 0) > (max.kilocalorie ?? 0) ? plan : max,
      )
    },

    lowestCaloriePlan: (state) => {
      if (!state.macroPlans.length) return null
      return state.macroPlans.reduce((min, plan) => {
        const minKcal = typeof min.kilocalorie === 'number' ? min.kilocalorie : Infinity
        const planKcal = typeof plan.kilocalorie === 'number' ? plan.kilocalorie : Infinity
        return planKcal < minKcal ? plan : min
      })
    },

    totalMealsCount: (state) => {
      return state.mealPlans.reduce((total, plan) => total + (plan.meals?.length || 0), 0)
    },

    averageMealsPerPlan: (state, getters) => {
      if (!state.mealPlans.length) return 0
      return Math.round(getters.totalMealsCount / state.mealPlans.length)
    },
  },

  actions: {
    async fetchDiet(dietId) {
      this.loading.diet = true
      this.error = null
      try {
        const response = await api.get(`/diets/${dietId}`)
        this.currentDiet = response.data
        return response.data
      } catch (error) {
        this.error = 'Erreur lors du chargement de la diet'
        console.error('Error fetching diet:', error)
        throw error
      } finally {
        this.loading.diet = false
      }
    },

    async fetchMacroPlans(dietId) {
      this.loading.macroPlans = true
      this.error = null

      const authStore = useAuthStore()
      const userId = authStore.userId

      if (!userId) {
        this.error = 'Utilisateur non connecté'
        this.loading.macroPlans = false
        throw new Error('Utilisateur non connecté')
      }

      try {
        const response = await api.get(`/diets/${dietId}/user/${userId}/macro_plans`)
        this.macroPlans = response.data || []
        return response.data
      } catch (error) {
        this.error = 'Erreur lors du chargement des macro plans'
        console.error('Error fetching macro plans:', error)
        this.macroPlans = []
        throw error
      } finally {
        this.loading.macroPlans = false
      }
    },

    async fetchMealPlans(dietId) {
      this.loading.mealPlans = true
      this.error = null

      const authStore = useAuthStore()
      const userId = authStore.userId

      if (!userId) {
        this.error = 'Utilisateur non connecté'
        this.loading.mealPlans = false
        throw new Error('Utilisateur non connecté')
      }

      try {
        const response = await api.get(`/diets/${dietId}/user/${userId}/meal_plans`)
        this.mealPlans = response.data || []
        return response.data
      } catch (error) {
        this.error = 'Erreur lors du chargement des meal plans'
        console.error('Error fetching meal plans:', error)
        this.mealPlans = []
        throw error
      } finally {
        this.loading.mealPlans = false
      }
    },

    resetStore() {
      this.currentDiet = null
      this.macroPlans = []
      this.mealPlans = []
      this.error = null
    },
  },
})
