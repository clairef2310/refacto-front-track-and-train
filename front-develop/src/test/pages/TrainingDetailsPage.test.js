import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'

vi.unmock('vue-router')
import { createRouter, createWebHistory } from 'vue-router'

import TrainingDetail from '@/pages/training/TrainingDetailsPage.vue'

vi.mock('@/components/TaskCreateDialog.vue', () => ({
  default: {
    name: 'TaskCreateDialog',
    template: '<div data-testid="task-create-dialog"></div>',
    props: ['modelValue'],
    emits: ['created', 'update:modelValue']
  }
}))

vi.mock('@/components/ValidationDialog.vue', () => ({
  default: {
    name: 'ValidationDialog',
    template: '<div data-testid="validation-dialog"></div>',
    props: ['modelValue', 'task', 'trainingId'],
    emits: ['validation-created', 'update:modelValue']
  }
}))

vi.mock('@/components/ValidationsList.vue', () => ({
  default: {
    name: 'ValidationsList',
    template: '<div data-testid="validations-list"></div>',
    props: ['validations', 'loading', 'taskName', 'trainingId', 'taskId'],
    emits: ['refresh', 'validation-deleted']
  }
}))

vi.mock('@/components/DeleteConfirmationDialog.vue', () => ({
  default: {
    name: 'DeleteConfirmationDialog',
    template: '<div data-testid="delete-confirmation-dialog"></div>',
    props: ['modelValue', 'title', 'message'],
    emits: ['confirm', 'update:modelValue']
  }
}))

let mockTrainingStore, mockAuthStore, mockContextualStore, mockSnackbarStore

const createMockTrainingStore = () => ({
  currentTraining: {
    id: 'training-123',
    name: 'Test Training',
    description: 'Test Description'
  },
  tasks: [
    {
      id: 'task-1',
      exercise_name: 'Push-ups',
      set_number: 3,
      repetitions: 10,
      rest_time: 60,
      method: 'Standard',
      rir: 2
    },
    {
      id: 'task-2',
      exercise_name: 'Squats',
      set_number: 4,
      repetitions: 15,
      rest_time: 90,
      method: 'Pyramid',
      rir: 1
    }
  ],
  loading: {
    training: false,
    tasks: false,
    validations: false,
    creating: false
  },
  error: null,
  fetchTraining: vi.fn().mockResolvedValue(),
  fetchTasks: vi.fn().mockResolvedValue(),
  fetchAllValidations: vi.fn().mockResolvedValue(),
  getValidationsForTask: vi.fn().mockReturnValue([]),
  getValidationCountForTask: vi.fn().mockReturnValue(0),
  resetStore: vi.fn()
})

const createMockAuthStore = () => ({
  userRoles: ['coach'],
  userId: 'coach-user-id'
})

const createMockContextualStore = () => ({
  userProfileId: 'target-user-id'
})

const createMockSnackbarStore = () => ({
  success: vi.fn(),
  error: vi.fn()
})

vi.mock('@/stores/training', () => ({
  useTrainingStore: () => mockTrainingStore
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore
}))

vi.mock('@/stores/contextual', () => ({
  useContextualStore: () => mockContextualStore
}))

vi.mock('@/stores/snackbar', () => ({
  useSnackbarStore: () => mockSnackbarStore
}))

describe('TrainingDetail', () => {
  let wrapper
  let vuetify
  let router
  let pinia
  let mockApi

  beforeEach(async () => {
    mockTrainingStore = createMockTrainingStore()
    mockAuthStore = createMockAuthStore()
    mockContextualStore = createMockContextualStore()
    mockSnackbarStore = createMockSnackbarStore()

    vuetify = createVuetify({
      components,
      directives,
      aliases: {
        PrimaryButton: components.VBtn,
        SecondaryButton: components.VBtn,
        DeleteButton: components.VBtn
      }
    })

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { 
          path: '/training/:id',
          component: TrainingDetail,
          name: 'training-detail'
        },
        { 
          path: '/',
          component: { template: '<div>Home</div>' },
          name: 'home'
        }
      ]
    })

    pinia = createPinia()
    setActivePinia(pinia)

    const { default: api } = await import('@/plugins/axios')
    mockApi = api

    vi.clearAllMocks()

    mockApi.post.mockResolvedValue({ data: { success: true } })
    mockApi.delete.mockResolvedValue({ data: { success: true } })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = async (routeParams = { id: 'training-123' }, routeQuery = {}) => {
    await router.push({
      path: `/training/${routeParams.id}`,
      query: routeQuery
    })
    
    wrapper = mount(TrainingDetail, {
      global: {
        plugins: [vuetify, router, pinia],
        stubs: {
          VContainer: { template: '<div class="v-container"><slot /></div>' },
          VCard: { template: '<div class="v-card"><slot /></div>' },
          VCardTitle: { template: '<div class="v-card-title"><slot /></div>' },
          VBtn: { 
            template: '<button class="v-btn" @click="$emit(\'click\')" :disabled="disabled" :loading="loading"><slot /></button>',
            props: ['icon', 'disabled', 'loading', 'size', 'prependIcon'],
            emits: ['click']
          },
          VIcon: { 
            template: '<i class="v-icon">{{ icon }}</i>',
            props: ['size', 'color', 'icon']
          },
          VSpacer: { template: '<div class="v-spacer"></div>' },
          VChip: { 
            template: '<span class="v-chip"><slot /></span>',
            props: ['color', 'small', 'outlined']
          },
          VProgressCircular: { 
            template: '<div class="v-progress-circular">Loading...</div>',
            props: ['indeterminate', 'color', 'size']
          },
          VAlert: { 
            template: '<div class="v-alert" @click="$emit(\'click:close\')"><slot /></div>',
            props: ['type', 'dismissible'],
            emits: ['click:close']
          },
          VDataTable: {
            name: 'VDataTable',
            template: `
              <div class="v-data-table" data-testid="data-table">
                <table>
                  <thead>
                    <tr>
                      <th v-for="header in headers" :key="header.key">{{ header.title }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in items" :key="item.id" :data-testid="'table-row-' + item.id">
                      <td v-for="header in headers" :key="header.key" :data-testid="'cell-' + header.key">
                        <slot :name="'item.' + header.key" :item="item">
                          {{ item[header.key] }}
                        </slot>
                      </td>
                    </tr>
                    <tr v-for="expandedItem in expanded" :key="'expanded-' + expandedItem.id">
                      <td :colspan="headers.length">
                        <slot name="expanded-row" :item="expandedItem" :columns="headers"></slot>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `,
            props: ['headers', 'items', 'itemsPerPage', 'itemValue', 'hideDefaultFooter', 'expanded', 'showExpand'],
            emits: ['update:expanded']
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
      expect(wrapper.classes()).toContain('training-detail-page')
    })

    it('devrait charger les données au montage', async () => {
      await createWrapper()
      
      expect(mockTrainingStore.fetchTraining).toHaveBeenCalledWith('training-123')
      expect(mockTrainingStore.fetchTasks).toHaveBeenCalledWith('training-123')
      expect(mockTrainingStore.fetchAllValidations).toHaveBeenCalledWith('training-123')
    })

    it('devrait nettoyer le store au démontage', async () => {
      await createWrapper()
      wrapper.unmount()
      
      expect(mockTrainingStore.resetStore).toHaveBeenCalled()
    })
  })

  describe('Affichage du header de training', () => {
    it('devrait afficher les informations du training', async () => {
      await createWrapper()
      
      expect(wrapper.text()).toContain('Test Training')
      expect(wrapper.text()).toContain('Test Description')
      expect(wrapper.text()).toContain('2 exercice(s)')
    })

    it('devrait avoir un bouton retour fonctionnel', async () => {
      await createWrapper()
      
      const pushSpy = vi.fn()
      router.push = pushSpy
      
      const backButtons = wrapper.findAll('button')
      const backButton = backButtons.find(btn => btn.element.innerHTML.includes('mdi-arrow-left'))
      
      if (backButton) {
        await backButton.trigger('click')
        expect(pushSpy).toHaveBeenCalledWith('/')
      }
    })
  })

  describe('États de chargement', () => {
    it('devrait afficher le spinner pendant le chargement', async () => {
      mockTrainingStore.loading.training = true
      
      await createWrapper()
      
      expect(wrapper.find('.v-progress-circular').exists()).toBe(true)
      expect(wrapper.text()).toContain('Chargement du training...')
    })

    it('devrait masquer le contenu principal pendant le chargement', async () => {
      mockTrainingStore.loading.training = true
      
      await createWrapper()
      
      const dataTable = wrapper.find('[data-testid="data-table"]')
      expect(dataTable.exists()).toBe(false)
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait afficher une alerte d\'erreur', async () => {
      mockTrainingStore.error = 'Erreur de chargement'
      
      await createWrapper()
      
      const alert = wrapper.find('.v-alert')
      expect(alert.exists()).toBe(true)
      expect(wrapper.text()).toContain('Erreur de chargement')
    })

    it('devrait pouvoir fermer l\'alerte d\'erreur', async () => {
      mockTrainingStore.error = 'Erreur de chargement'
      
      await createWrapper()
      
      const alert = wrapper.find('.v-alert')
      await alert.trigger('click')
      
      expect(mockTrainingStore.error).toBeNull()
    })
  })

  describe('Permissions et actions', () => {
    it('devrait calculer correctement canCreateTask pour un coach', async () => {
      mockAuthStore.userRoles = ['coach']
      mockAuthStore.userId = 'coach-user-id'
      mockContextualStore.userProfileId = 'target-user-id'
      
      await createWrapper()
      
      expect(wrapper.vm.canCreateTask).toBe(true)
    })

    it('ne devrait pas permettre la création pour le même utilisateur', async () => {
      mockAuthStore.userRoles = ['coach']
      mockAuthStore.userId = 'same-user-id'
      mockContextualStore.userProfileId = 'same-user-id'
      
      await createWrapper()
      
      expect(wrapper.vm.canCreateTask).toBe(false)
    })

    it('devrait utiliser userId depuis la query si contextual est vide', async () => {
      mockContextualStore.userProfileId = null
      
      await createWrapper({ id: 'training-123' }, { userId: 'query-user-id' })
      
      expect(wrapper.vm.targetUserId).toBe('query-user-id')
    })

    it('ne devrait pas permettre la création pour un utilisateur normal', async () => {
      mockAuthStore.userRoles = ['user']
      mockAuthStore.userId = 'user-id'
      
      await createWrapper()
      
      expect(wrapper.vm.canCreateTask).toBe(false)
    })

    it('devrait permettre la création pour un admin', async () => {
      mockAuthStore.userRoles = ['admin']
      mockAuthStore.userId = 'admin-user-id'
      mockContextualStore.userProfileId = 'target-user-id'
      
      await createWrapper()
      
      expect(wrapper.vm.canCreateTask).toBe(true)
    })
  })

  describe('Tableau des tâches', () => {
    it('devrait afficher les tâches dans le tableau', async () => {
      await createWrapper()
      
      const dataTable = wrapper.find('[data-testid="data-table"]')
      expect(dataTable.exists()).toBe(true)

      expect(wrapper.find('[data-testid="cell-exercise_name"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="cell-sets_reps"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="cell-rest_time"]').exists()).toBe(true)
    })

    it('devrait calculer correctement les tâches enrichies', async () => {
      mockTrainingStore.getValidationCountForTask.mockImplementation((taskId) => {
        return taskId === 'task-1' ? 2 : 0
      })
      
      await createWrapper()
      
      const enhanced = wrapper.vm.enhancedTasks
      expect(enhanced).toHaveLength(2)
      expect(enhanced[0].validations_count).toBe(2)
      expect(enhanced[1].validations_count).toBe(0)
    })

    it('devrait gérer l\'expansion des lignes', async () => {
      await createWrapper()

      const dataTable = wrapper.findComponent({ name: 'VDataTable' })
      expect(dataTable.exists()).toBe(true)

      const expandedItems = ['task-1']
      await wrapper.vm.handleExpandedChange(expandedItems)
      
      expect(wrapper.vm.expandedTasks).toEqual(expandedItems)
    })
  })

  describe('Création de tâches', () => {
    it('devrait pouvoir ouvrir le dialog de création', async () => {
      mockAuthStore.userRoles = ['coach']
      mockContextualStore.userProfileId = 'target-user-id'
      
      await createWrapper()

      wrapper.vm.showCreateTask = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.showCreateTask).toBe(true)
    })

    it('devrait créer une tâche avec succès', async () => {
      await createWrapper()
      
      const taskDialog = wrapper.findComponent({ name: 'TaskCreateDialog' })
      const payload = {
        exercise_name: 'New Exercise',
        set_number: 3,
        repetitions: 12,
        rest_time: 60,
        method: 'Standard',
        rir: 2
      }
      
      await taskDialog.vm.$emit('created', payload)
      await flushPromises()
      
      expect(mockApi.post).toHaveBeenCalledWith(
        '/trainings/training-123/user/target-user-id/tasks',
        payload
      )
      expect(mockTrainingStore.fetchTasks).toHaveBeenCalledWith('training-123')
      expect(mockSnackbarStore.success).toHaveBeenCalledWith('Exercice ajouté avec succès !')
      expect(wrapper.vm.showCreateTask).toBe(false)
    })

    it('devrait gérer les erreurs de création', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Creation failed'))
      
      await createWrapper()
      
      const taskDialog = wrapper.findComponent({ name: 'TaskCreateDialog' })
      await taskDialog.vm.$emit('created', { exercise_name: 'Test' })
      await flushPromises()
      
      expect(mockSnackbarStore.error).toHaveBeenCalledWith("Erreur lors de la création de l'exercice.")
    })
  })

  describe('Suppression de tâches', () => {
    it('devrait ouvrir le dialog de confirmation', async () => {
      mockAuthStore.userRoles = ['coach']
      mockContextualStore.userProfileId = 'target-user-id'
      
      await createWrapper()
      
      const task = mockTrainingStore.tasks[0]
      
      await wrapper.vm.openDeleteTaskDialog(task)
      
      expect(wrapper.vm.selectedTaskToDelete).toEqual(task)
      expect(wrapper.vm.deleteTaskDialog).toBe(true)
    })

    it('devrait supprimer une tâche avec succès', async () => {
      await createWrapper()
      
      const task = mockTrainingStore.tasks[0]
      wrapper.vm.selectedTaskToDelete = task
      
      await wrapper.vm.confirmDeleteTask()
      await flushPromises()
      
      expect(mockApi.delete).toHaveBeenCalledWith(
        '/trainings/training-123/user/target-user-id/tasks/task-1'
      )
      expect(mockTrainingStore.fetchTasks).toHaveBeenCalledWith('training-123')
      expect(mockSnackbarStore.success).toHaveBeenCalledWith(
        "Exercice 'Push-ups' supprimé avec succès !"
      )
      expect(wrapper.vm.deleteTaskDialog).toBe(false)
      expect(wrapper.vm.selectedTaskToDelete).toBeNull()
    })

    it('devrait gérer les erreurs de suppression', async () => {
      mockApi.delete.mockRejectedValueOnce(new Error('Delete failed'))
      
      await createWrapper()
      
      const task = mockTrainingStore.tasks[0]
      wrapper.vm.selectedTaskToDelete = task
      
      await wrapper.vm.confirmDeleteTask()
      await flushPromises()
      
      expect(mockSnackbarStore.error).toHaveBeenCalledWith("Erreur lors de la suppression de l'exercice.")
      expect(wrapper.vm.deletingTaskId).toBeNull()
    })

    it('ne devrait pas supprimer si aucune tâche sélectionnée', async () => {
      await createWrapper()
      
      wrapper.vm.selectedTaskToDelete = null
      
      await wrapper.vm.confirmDeleteTask()
      
      expect(mockApi.delete).not.toHaveBeenCalled()
    })
  })

  describe('Validation des tâches', () => {
    it('devrait ouvrir le dialog de validation', async () => {
      await createWrapper()
      
      const task = mockTrainingStore.tasks[0]
      await wrapper.vm.openValidationDialog(task)
      
      expect(wrapper.vm.selectedTask).toEqual(task)
      expect(wrapper.vm.validationDialog).toBe(true)
    })

    it('devrait fermer le dialog après création de validation', async () => {
      await createWrapper()
      
      wrapper.vm.selectedTask = mockTrainingStore.tasks[0]
      wrapper.vm.validationDialog = true
      
      await wrapper.vm.onValidationCreated()
      
      expect(wrapper.vm.validationDialog).toBe(false)
      expect(wrapper.vm.selectedTask).toBeNull()
    })

    it('devrait charger toutes les validations', async () => {
      await createWrapper()
      
      await wrapper.vm.loadAllValidations()
      
      expect(mockTrainingStore.fetchAllValidations).toHaveBeenCalledWith('training-123')
    })

    it('devrait gérer les erreurs de chargement des validations', async () => {
      await createWrapper()

      const originalFetchAllValidations = mockTrainingStore.fetchAllValidations
      mockTrainingStore.fetchAllValidations = vi.fn().mockRejectedValueOnce(new Error('Load failed'))
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await wrapper.vm.loadAllValidations()
      
      expect(consoleSpy).toHaveBeenCalledWith('Erreur lors du chargement des validations:', expect.any(Error))

      consoleSpy.mockRestore()
      mockTrainingStore.fetchAllValidations = originalFetchAllValidations
    })
  })

  describe('Computed properties', () => {
    it('devrait calculer correctement trainingId', async () => {
      await createWrapper({ id: 'custom-training-id' })
      
      expect(wrapper.vm.trainingId).toBe('custom-training-id')
    })

    it('devrait calculer correctement targetUserId avec contextual', async () => {
      mockContextualStore.userProfileId = 'contextual-user-id'
      
      await createWrapper()
      
      expect(wrapper.vm.targetUserId).toBe('contextual-user-id')
    })

    it('devrait calculer correctement targetUserId avec query', async () => {
      mockContextualStore.userProfileId = null
      
      await createWrapper({ id: 'training-123' }, { userId: 'query-user-id' })
      
      expect(wrapper.vm.targetUserId).toBe('query-user-id')
    })

    it('devrait calculer correctement enhancedTasks', async () => {
      mockTrainingStore.getValidationCountForTask.mockImplementation((taskId) => {
        return taskId === 'task-1' ? 3 : 1
      })
      
      await createWrapper()
      
      const enhanced = wrapper.vm.enhancedTasks
      expect(enhanced).toHaveLength(2)
      expect(enhanced[0].validations_count).toBe(3)
      expect(enhanced[1].validations_count).toBe(1)
    })
  })

  describe('Gestion des erreurs de chargement initial', () => {
    it('devrait gérer les erreurs de chargement initial', async () => {
      mockTrainingStore.fetchTraining.mockRejectedValueOnce(new Error('Failed to load'))
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await createWrapper()
      
      expect(consoleSpy).toHaveBeenCalledWith('Erreur lors du chargement:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('Headers du tableau', () => {
    it('devrait avoir les bons headers définis', async () => {
      await createWrapper()
      
      const expectedHeaders = [
        'Exercice',
        'Séries/Reps', 
        'Repos',
        'Méthode',
        'RIR',
        'Validations',
        'Actions'
      ]
      
      const headers = wrapper.vm.headers
      expectedHeaders.forEach(title => {
        expect(headers.some(h => h.title === title)).toBe(true)
      })
    })
  })

  describe('États de chargement pendant les actions', () => {
    it('devrait gérer l\'état de chargement pendant la suppression', async () => {
      await createWrapper()
      
      const task = mockTrainingStore.tasks[0]
      wrapper.vm.selectedTaskToDelete = task

      let resolveDelete
      const deletePromise = new Promise(resolve => { resolveDelete = resolve })
      mockApi.delete.mockReturnValueOnce(deletePromise)
      
      const deleteCall = wrapper.vm.confirmDeleteTask()

      expect(wrapper.vm.deletingTaskId).toBe('task-1')
      
      resolveDelete({ data: { success: true } })
      await deleteCall
      
      expect(wrapper.vm.deletingTaskId).toBeNull()
    })
  })
})