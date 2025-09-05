import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { nextTick, reactive } from 'vue'

globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn()
}));

vi.mock('@/stores/diet', () => ({
  useDietStore: vi.fn()
}));
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn()
}));
vi.mock('@/stores/contextual', () => ({
  useContextualStore: vi.fn()
}));
vi.mock('@/stores/snackbar', () => ({
  useSnackbarStore: vi.fn()
}));
vi.mock('@/plugins/axios', () => ({
  default: {
    post: vi.fn()
  }
}));

vi.mock('@/components/MacroPlanCard.vue', () => ({
  default: {
    name: 'MacroPlanCard',
    props: ['macroPlan', 'maxCalories'],
    template: '<div data-test="macro-plan-card">{{ macroPlan.name }}</div>'
  }
}));
vi.mock('@/components/MealPlanCard.vue', () => ({
  default: {
    name: 'MealPlanCard',
    props: ['mealPlan'],
    template: '<div data-test="meal-plan-card">{{ mealPlan.name }}</div>'
  }
}));
vi.mock('@/components/DietPlanCreateDialog.vue', () => ({
  default: {
    name: 'DietPlanCreateDialog',
    props: ['modelValue'],
    emits: ['created', 'update:modelValue'],
    template: '<div data-test="diet-plan-create-dialog" v-if="modelValue">Dialog</div>'
  }
}));

import DietDetailPage from '@/pages/diet/DietDetailsPage.vue'
import { useRoute, useRouter } from 'vue-router'
import { useDietStore } from '@/stores/diet'
import { useAuthStore } from '@/stores/auth'
import { useContextualStore } from '@/stores/contextual'
import { useSnackbarStore } from '@/stores/snackbar'
import api from '@/plugins/axios'

describe('DietDetailPage.vue', () => {
  const vuetify = createVuetify()
  let wrapper
  let mockRoute, mockRouter, mockDietStore, mockAuthStore, mockContextual, mockSnackbar

  const createWrapper = () => mount(DietDetailPage, {
  global: {
    plugins: [vuetify],
    stubs: {
      VContainer: { template: '<div class="v-container"><slot /></div>' },
      VCard: { template: '<div class="v-card"><slot /></div>' },
      VCardTitle: { template: '<div class="v-card-title"><slot /></div>' },
      VBtn: { template: '<button class="v-btn"><slot /></button>' },
      VIcon: { template: '<i class="v-icon"><slot /></i>' },
      VSpacer: { template: '<span class="v-spacer"></span>' },
      VChip: { template: '<span class="v-chip"><slot /></span>' },
      VTabs: { template: '<div class="v-tabs"><slot /></div>' },
      VTab: { template: '<div class="v-tab"><slot /></div>' },
      VWindow: { template: '<div class="v-window"><slot /></div>' },
      VWindowItem: { template: '<div class="v-window-item"><slot /></div>' },
      VRow: { template: '<div class="v-row"><slot /></div>' },
      VCol: { template: '<div class="v-col"><slot /></div>' },
      VProgressCircular: {
        name: 'VProgressCircular',
        template: '<div data-test="progress-circular">Loading...</div>'
      },
      VAlert: {
        name: 'VAlert',
        props: ['type', 'dismissible'],
        emits: ['click:close'],
        template: '<div data-test="v-alert"><slot /></div>'
      },
      PrimaryButton: {
        name: 'PrimaryButton',
        emits: ['click'],
        props: ['prependIcon'],
        template: '<button data-test="primary-button" @click="$emit(\'click\')"><slot /></button>'
      }
    }
  }
})

  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute = { params: { id: 'diet42' }, query: { userId: 'u123' } }
    mockRouter = { push: vi.fn() }
    mockDietStore = reactive({
      currentDiet: { id: 42, name: "My Diet", description: "Desc" },
      macroPlans: [],
      mealPlans: [],
      loading: { macroPlans: false, mealPlans: false },
      error: null,
      totalMacroPlans: 0,
      totalMealPlans: 0,
      totalMealsCount: 0,
      highestCaloriePlan: null,
      fetchMacroPlans: vi.fn().mockResolvedValue(),
      fetchMealPlans: vi.fn().mockResolvedValue(),
      resetStore: vi.fn()
    })
    mockAuthStore = reactive({
      userId: 'me',
      userRoles: ['coach'],
      isAuthenticated: true,
      initialize: vi.fn()
    })
    mockContextual = reactive({ userProfileId: 'u123' })
    mockSnackbar = { success: vi.fn(), error: vi.fn() }

    useRoute.mockReturnValue(mockRoute)
    useRouter.mockReturnValue(mockRouter)
    useDietStore.mockReturnValue(mockDietStore)
    useAuthStore.mockReturnValue(mockAuthStore)
    useContextualStore.mockReturnValue(mockContextual)
    useSnackbarStore.mockReturnValue(mockSnackbar)
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
  })

  it('affiche le header avec nom et description du plan', async () => {
    wrapper = createWrapper()
    await nextTick()
    expect(wrapper.html()).toContain("My Diet")
    expect(wrapper.html()).toContain("Desc")
  })

  it('affiche le loader quand loading est vrai', async () => {
    mockDietStore.loading.macroPlans = true
    wrapper = createWrapper()
    await nextTick()
    expect(wrapper.find('[data-test="progress-circular"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Chargement des plans')
  })

  it('affiche l\'alerte en cas d\'erreur', async () => {
    mockDietStore.error = "Erreur inattendue"
    wrapper = createWrapper()
    await nextTick()
    expect(wrapper.find('[data-test="v-alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain("Erreur inattendue")
  })

  it('affiche les tabs macro et meals', async () => {
    wrapper = createWrapper()
    await nextTick()
    expect(wrapper.text()).toContain('Plans Macro')
    expect(wrapper.text()).toContain('Plans Repas')
  })

  it('affiche le bouton Ajouter si canCreatePlan est vrai', async () => {
    wrapper = createWrapper()
    await nextTick()
    expect(wrapper.find('[data-test="primary-button"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Ajouter')
  })

  it('n\'affiche pas le bouton Ajouter si canCreatePlan est faux', async () => {
    mockAuthStore.userRoles = ['user']
    wrapper = createWrapper()
    await nextTick()
    expect(wrapper.find('[data-test="primary-button"]').exists()).toBe(false)
  })

  it('affiche "aucun plan macro" si macroPlans est vide', async () => {
    wrapper = createWrapper()
    await nextTick()
    expect(wrapper.text()).toContain('Aucun plan macro disponible')
  })

  it('affiche les MacroPlanCard si macroPlans existe', async () => {
    mockDietStore.macroPlans = [{ id: 1, name: "Macro 1" }, { id: 2, name: "Macro 2" }]
    mockDietStore.totalMacroPlans = 2
    wrapper = createWrapper()
    await nextTick()
    expect(wrapper.findAll('[data-test="macro-plan-card"]').length).toBe(2)
    expect(wrapper.text()).toContain('Macro 1')
    expect(wrapper.text()).toContain('Macro 2')
  })

  it('affiche "aucun plan repas" si mealPlans est vide', async () => {
    wrapper = createWrapper()
    await nextTick()

    wrapper.vm.activeTab = 'meals'
    await nextTick()
    expect(wrapper.text()).toContain('Aucun plan repas disponible')
  })

  it('affiche les MealPlanCard si mealPlans existe', async () => {
    mockDietStore.mealPlans = [{ id: 1, name: "Meal 1" }, { id: 2, name: "Meal 2" }]
    mockDietStore.totalMealPlans = 2
    mockDietStore.totalMealsCount = 5
    wrapper = createWrapper()
    await nextTick()
    wrapper.vm.activeTab = 'meals'
    await nextTick()
    expect(wrapper.findAll('[data-test="meal-plan-card"]').length).toBe(2)
    expect(wrapper.text()).toContain('Meal 1')
    expect(wrapper.text()).toContain('Meal 2')
    expect(wrapper.text()).toContain('5 repas')
  })

  it('ouvre la dialog de création au clic sur Ajouter', async () => {
    wrapper = createWrapper()
    await nextTick()
    const btn = wrapper.find('[data-test="primary-button"]')
    await btn.trigger('click')
    await nextTick()
    expect(wrapper.vm.showCreatePlan).toBe(true)
    expect(wrapper.find('[data-test="diet-plan-create-dialog"]').exists()).toBe(true)
  })

  it('crée un plan macro via createPlan', async () => {
    api.post.mockResolvedValue({})
    wrapper = createWrapper()
    await nextTick()
    wrapper.vm.showCreatePlan = true
    await nextTick()
    const dialog = wrapper.findComponent({ name: 'DietPlanCreateDialog' })
    await dialog.vm.$emit('created', { type: 'macro', data: { name: 'mac' } })
    await nextTick()
    expect(api.post).toHaveBeenCalledWith('/diets/diet42/user/u123/macro_plans', { name: 'mac' })
    expect(mockDietStore.fetchMacroPlans).toHaveBeenCalled()
    expect(mockSnackbar.success).toHaveBeenCalledWith('Plan macro créé avec succès !')
    expect(wrapper.vm.showCreatePlan).toBe(false)
  })

  it('crée un plan repas via createPlan', async () => {
    api.post.mockResolvedValue({})
    wrapper = createWrapper()
    await nextTick()
    wrapper.vm.showCreatePlan = true
    await nextTick()
    const dialog = wrapper.findComponent({ name: 'DietPlanCreateDialog' })
    await dialog.vm.$emit('created', { type: 'meals', data: { name: 'repas' } })
    await nextTick()
    expect(api.post).toHaveBeenCalledWith('/diets/diet42/user/u123/meal_plans', { name: 'repas' })
    expect(mockDietStore.fetchMealPlans).toHaveBeenCalled()
    expect(mockSnackbar.success).toHaveBeenCalledWith('Plan repas créé avec succès !')
    expect(wrapper.vm.showCreatePlan).toBe(false)
  })

  it('gère les erreurs lors de la création du plan', async () => {
    api.post.mockRejectedValue(new Error('fail'))
    wrapper = createWrapper()
    await nextTick()
    wrapper.vm.showCreatePlan = true
    await nextTick()
    const dialog = wrapper.findComponent({ name: 'DietPlanCreateDialog' })
    await dialog.vm.$emit('created', { type: 'macro', data: { name: 'mac' } })
    await nextTick()
    expect(mockSnackbar.error).toHaveBeenCalledWith('Erreur lors de la création du plan.')
    expect(wrapper.vm.showCreatePlan).toBe(true)
  })

  it('appelle goBack et router.push', async () => {
    wrapper = createWrapper()
    await nextTick()
    wrapper.vm.goBack()
    expect(mockRouter.push).toHaveBeenCalledWith('/')
  })

  it('reset le store au démontage', async () => {
    wrapper = createWrapper()
    await nextTick()
    wrapper.unmount()
    expect(mockDietStore.resetStore).toHaveBeenCalled()
  })
})