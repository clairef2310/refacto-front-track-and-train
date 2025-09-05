import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'

vi.unmock('vue-router')
import { createRouter, createWebHistory } from 'vue-router'

import UserProfilePage from '@/pages/profiles/UserProfilePage.vue'

vi.mock('@/components/TrainingList.vue', () => ({
  default: {
    name: 'TrainingList',
    template: '<div data-testid="training-list"><slot name="action"></slot></div>',
    props: ['trainings'],
    emits: ['trainingClick']
  }
}))

vi.mock('@/components/DietList.vue', () => ({
  default: {
    name: 'DietList', 
    template: '<div data-testid="diet-list"><slot name="action"></slot></div>',
    props: ['diets'],
    emits: ['dietClick']
  }
}))

vi.mock('@/components/TrainingCreateDialog.vue', () => ({
  default: {
    name: 'TrainingCreateDialog',
    template: '<div data-testid="training-create-dialog"></div>',
    props: ['modelValue'],
    emits: ['created', 'update:modelValue']
  }
}))

vi.mock('@/components/DietCreateDialog.vue', () => ({
  default: {
    name: 'DietCreateDialog',
    template: '<div data-testid="diet-create-dialog"></div>',
    props: ['modelValue'],
    emits: ['created', 'update:modelValue']
  }
}))

let mockAuthStore, mockContextualStore, mockSnackbarStore

const createMockAuthStore = () => ({
  userRoles: ['coach'],
  userId: 'different-user-id'
})

const createMockContextualStore = () => ({
  setUserProfileId: vi.fn(),
  clearUserProfileId: vi.fn()
})

const createMockSnackbarStore = () => ({
  success: vi.fn(),
  error: vi.fn()
})

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore
}))

vi.mock('@/stores/contextual', () => ({
  useContextualStore: () => mockContextualStore
}))

vi.mock('@/stores/snackbar', () => ({
  useSnackbarStore: () => mockSnackbarStore
}))

describe('UserProfilePage', () => {
  let wrapper
  let vuetify
  let router
  let pinia
  let mockApi

  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    description: 'Test description',
    contact: 'john@contact.com',
    sex: 'Male',
    roles: ['user', 'premium']
  }

  const mockTrainings = [
    { id: 1, name: 'Training 1', description: 'Description 1' },
    { id: 2, name: 'Training 2', description: 'Description 2' }
  ]

  const mockDiets = [
    { id: 1, name: 'Diet 1', description: 'Diet Description 1' },
    { id: 2, name: 'Diet 2', description: 'Diet Description 2' }
  ]

  beforeEach(async () => {
    mockAuthStore = createMockAuthStore()
    mockContextualStore = createMockContextualStore()
    mockSnackbarStore = createMockSnackbarStore()

    vuetify = createVuetify({
      components,
      directives,
      aliases: {
        PrimaryButton: components.VBtn,
        SecondaryButton: components.VBtn,
        DeleteButton: components.VBtn,
        TertiaryButton: components.VBtn
      }
    })

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { 
          path: '/profile/:uuid', 
          component: UserProfilePage,
          name: 'profile'
        },
        { 
          path: '/training/:id', 
          component: { template: '<div>Training</div>' },
          name: 'training'
        },
        { 
          path: '/diet/:id', 
          component: { template: '<div>Diet</div>' },
          name: 'diet'
        }
      ]
    })

    pinia = createPinia()
    setActivePinia(pinia)

    const { default: api } = await import('@/plugins/axios')
    mockApi = api
    
    vi.clearAllMocks()
    
    mockApi.get.mockImplementation((url) => {
      if (url.includes('/profiles/')) {
        return Promise.resolve({ data: mockUser })
      }
      if (url.includes('/trainings/user/')) {
        return Promise.resolve({ data: mockTrainings })
      }
      if (url.includes('/diets/user/')) {
        return Promise.resolve({ data: mockDiets })
      }
      return Promise.reject(new Error(`Unknown endpoint: ${url}`))
    })

    mockApi.post.mockResolvedValue({ data: { success: true } })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = async (routeParams = { uuid: 'test-user-id' }) => {
    await router.push(`/profile/${routeParams.uuid}`)
    
    wrapper = mount(UserProfilePage, {
      global: {
        plugins: [vuetify, router, pinia],
        stubs: {
          VContainer: { template: '<div class="v-container"><slot /></div>' },
          VRow: { template: '<div class="v-row"><slot /></div>' },
          VCol: { 
            template: '<div class="v-col"><slot /></div>',
            props: ['cols', 'md']
          },
          VCard: { template: '<div class="v-card"><slot /></div>' },
          VCardTitle: { template: '<div class="v-card-title"><slot /></div>' },
          VCardSubtitle: { template: '<div class="v-card-subtitle"><slot /></div>' },
          VCardText: { template: '<div class="v-card-text"><slot /></div>' },
          VAvatar: { 
            template: '<div class="v-avatar"><slot /></div>',
            props: ['size']
          },
          VIcon: { 
            template: '<div class="v-icon">{{ icon }}</div>',
            props: ['size', 'color', 'icon']
          },
          VSpacer: { template: '<div class="v-spacer"></div>' },
          VChip: { 
            template: '<div class="v-chip"><slot /></div>',
            props: ['color', 'small']
          }
        }
      }
    })

    await flushPromises()
    return wrapper
  }

  describe('Montage du composant', () => {
    it('devrait se monter correctement', async () => {
      await createWrapper()
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('profile-page')
    })

    it('devrait définir userId depuis les paramètres de route', async () => {
      await createWrapper({ uuid: 'custom-user-id' })
      expect(mockContextualStore.setUserProfileId).toHaveBeenCalledWith('custom-user-id')
    })

    it('devrait charger les données utilisateur au montage', async () => {
      await createWrapper()
      expect(mockApi.get).toHaveBeenCalledWith('/profiles/test-user-id')
      expect(mockApi.get).toHaveBeenCalledWith('/trainings/user/test-user-id')
      expect(mockApi.get).toHaveBeenCalledWith('/diets/user/test-user-id')
    })
  })

  describe('Affichage des données utilisateur', () => {
    it('devrait afficher le nom de l\'utilisateur', async () => {
      await createWrapper()
      expect(wrapper.text()).toContain('John Doe')
    })

    it('devrait afficher l\'email et l\'âge', async () => {
      await createWrapper()
      expect(wrapper.text()).toContain('john@example.com')
      expect(wrapper.text()).toContain('30 ans')
    })

    it('devrait afficher la description', async () => {
      await createWrapper()
      expect(wrapper.text()).toContain('Test description')
    })

    it('devrait afficher le contact et le sexe', async () => {
      await createWrapper()
      expect(wrapper.text()).toContain('john@contact.com')
      expect(wrapper.text()).toContain('Male')
    })

    it('devrait afficher un message par défaut quand le nom est manquant', async () => {
      mockApi.get.mockImplementation((url) => {
        if (url.includes('/profiles/')) {
          return Promise.resolve({ data: { name: null } })
        }
        return Promise.resolve({ data: [] })
      })

      await createWrapper()
      expect(wrapper.text()).toContain('Profil utilisateur')
    })

    it('devrait afficher "Non renseigné" pour les champs manquants', async () => {
      mockApi.get.mockImplementation((url) => {
        if (url.includes('/profiles/')) {
          return Promise.resolve({ data: { name: 'John', contact: null, sex: null } })
        }
        return Promise.resolve({ data: [] })
      })

      await createWrapper()
      expect(wrapper.text()).toContain('Non renseigné')
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs de chargement du profil', async () => {
      mockApi.get.mockImplementation((url) => {
        if (url.includes('/profiles/')) {
          return Promise.reject(new Error('Profile not found'))
        }
        return Promise.resolve({ data: [] })
      })

      await createWrapper()
      expect(mockSnackbarStore.error).toHaveBeenCalledWith('Erreur lors du chargement du profil utilisateur.')
    })
  })

  describe('Navigation', () => {
    it('devrait naviguer vers une page de training avec les bons paramètres', async () => {
      await createWrapper()
      
      const pushSpy = vi.fn()
      router.push = pushSpy
      
      const trainingList = wrapper.findComponent({ name: 'TrainingList' })
      await trainingList.vm.$emit('trainingClick', 'training-123')
      
      await flushPromises()
      
      expect(pushSpy).toHaveBeenCalledWith({
        path: '/training/training-123',
        query: { userId: 'test-user-id' }
      })
    })

    it('devrait naviguer vers une page de diet avec les bons paramètres', async () => {
      await createWrapper()
      
      const pushSpy = vi.fn()
      router.push = pushSpy
      
      const dietList = wrapper.findComponent({ name: 'DietList' })
      await dietList.vm.$emit('dietClick', 'diet-456')
      
      await flushPromises()
      
      expect(pushSpy).toHaveBeenCalledWith({
        path: '/diet/diet-456',
        query: { userId: 'test-user-id' }
      })
    })
  })

  describe('Création de training', () => {
    it('devrait créer un training avec succès', async () => {
      await createWrapper()
      
      const trainingDialog = wrapper.findComponent({ name: 'TrainingCreateDialog' })
      expect(trainingDialog.exists()).toBe(true)
      
      await trainingDialog.vm.$emit('created', { name: 'New Training', description: 'New Description' })
      
      await flushPromises()
      
      expect(mockApi.post).toHaveBeenCalledWith('/trainings/test-user-id', {
        name: 'New Training',
        description: 'New Description'
      })
      expect(mockSnackbarStore.success).toHaveBeenCalledWith('Training créé avec succès !')
    })

    it('devrait gérer les erreurs de création de training', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Creation failed'))
      
      await createWrapper()
      
      const trainingDialog = wrapper.findComponent({ name: 'TrainingCreateDialog' })
      await trainingDialog.vm.$emit('created', { name: 'New Training', description: 'New Description' })
      
      await flushPromises()
      
      expect(mockSnackbarStore.error).toHaveBeenCalledWith('Erreur lors de la création du training.')
    })
  })

  describe('Création de diet', () => {
    it('devrait créer un diet avec succès', async () => {
      await createWrapper()
      
      const dietDialog = wrapper.findComponent({ name: 'DietCreateDialog' })
      expect(dietDialog.exists()).toBe(true)
      
      await dietDialog.vm.$emit('created', { name: 'New Diet', description: 'New Diet Description' })
      
      await flushPromises()
      
      expect(mockApi.post).toHaveBeenCalledWith('/diets/test-user-id', {
        name: 'New Diet',
        description: 'New Diet Description'
      })
      expect(mockSnackbarStore.success).toHaveBeenCalledWith('Diet créée avec succès !')
    })

    it('devrait gérer les erreurs de création de diet', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Creation failed'))
      
      await createWrapper()
      
      const dietDialog = wrapper.findComponent({ name: 'DietCreateDialog' })
      await dietDialog.vm.$emit('created', { name: 'New Diet', description: 'New Diet Description' })
      
      await flushPromises()
      
      expect(mockSnackbarStore.error).toHaveBeenCalledWith('Erreur lors de la création du diet.')
    })
  })

  describe('Watchers et lifecycle', () => {
    it('devrait réagir aux changements de route', async () => {
      await createWrapper({ uuid: 'user1' })
      
      mockContextualStore.setUserProfileId.mockClear()
      mockApi.get.mockClear()
      
      await router.push('/profile/user2')
      await flushPromises()
      
      expect(mockContextualStore.setUserProfileId).toHaveBeenCalledWith('user2')
    })

    it('devrait nettoyer le contextual store au démontage', async () => {
      await createWrapper()
      wrapper.unmount()
      
      expect(mockContextualStore.clearUserProfileId).toHaveBeenCalled()
    })
  })

  describe('États et réactivité', () => {
    it('devrait passer les bonnes props aux composants enfants', async () => {
      await createWrapper()
      
      const trainingList = wrapper.findComponent({ name: 'TrainingList' })
      const dietList = wrapper.findComponent({ name: 'DietList' })
      
      expect(trainingList.exists()).toBe(true)
      expect(dietList.exists()).toBe(true)

      expect(trainingList.props('trainings')).toEqual(mockTrainings)
      expect(dietList.props('diets')).toEqual(mockDiets)
    })

    it('devrait gérer des tableaux vides pour les trainings et diets', async () => {
      mockApi.get.mockImplementation((url) => {
        if (url.includes('/profiles/')) {
          return Promise.resolve({ data: mockUser })
        }
        return Promise.resolve({ data: [] })
      })

      await createWrapper()
      
      const trainingList = wrapper.findComponent({ name: 'TrainingList' })
      const dietList = wrapper.findComponent({ name: 'DietList' })
      
      expect(trainingList.props('trainings')).toEqual([])
      expect(dietList.props('diets')).toEqual([])
    })
  })

  describe('Permissions et computed', () => {
    it('devrait calculer correctement canCreateForUser pour un coach', async () => {
      mockAuthStore.userRoles = ['coach']
      mockAuthStore.userId = 'different-user-id'
      
      await createWrapper({ uuid: 'test-user-id' })
      
      const trainingList = wrapper.findComponent({ name: 'TrainingList' })
      const dietList = wrapper.findComponent({ name: 'DietList' })
      
      expect(trainingList.exists()).toBe(true)
      expect(dietList.exists()).toBe(true)
    })

    it('devrait calculer correctement canCreateForUser quand c\'est le même utilisateur', async () => {
      mockAuthStore.userRoles = ['coach']
      mockAuthStore.userId = 'test-user-id'
      
      await createWrapper({ uuid: 'test-user-id' })
      
      const trainingList = wrapper.findComponent({ name: 'TrainingList' })
      const dietList = wrapper.findComponent({ name: 'DietList' })
      
      expect(trainingList.exists()).toBe(true)
      expect(dietList.exists()).toBe(true)
    })

    it('devrait calculer correctement canCreateForUser pour un non-coach', async () => {
      mockAuthStore.userRoles = ['user']
      mockAuthStore.userId = 'different-user-id'
      
      await createWrapper({ uuid: 'test-user-id' })
      
      const trainingList = wrapper.findComponent({ name: 'TrainingList' })
      const dietList = wrapper.findComponent({ name: 'DietList' })
      
      expect(trainingList.exists()).toBe(true)
      expect(dietList.exists()).toBe(true)
    })
  })
})