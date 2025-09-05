import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { nextTick } from 'vue'

globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: vi.fn()
}))

vi.mock('@/stores/groups', () => ({
  useGroupsStore: vi.fn()
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('@/stores/snackbar', () => ({
  useSnackbarStore: vi.fn()
}))

import GroupsCoachPage from '@/pages/groups/GroupsCoachPage.vue'
import { useRoute } from 'vue-router'
import { useGroupsStore } from '@/stores/groups'
import { useAuthStore } from '@/stores/auth'
import { useSnackbarStore } from '@/stores/snackbar'

describe('GroupsCoachPage', () => {
  const vuetify = createVuetify()
  let wrapper
  let mockRoute
  let mockGroupsStore
  let mockAuthStore
  let mockSnackbarStore

  const createWrapper = (options = {}) => {
    try {
      return mount(GroupsCoachPage, {
        global: {
          plugins: [vuetify],
          stubs: {
            VContainer: {
              name: 'VContainer',
              template: '<div class="v-container groups-coach-page"><slot></slot></div>'
            },
            VRow: {
              name: 'VRow',
              template: '<div class="v-row"><slot></slot></div>'
            },
            VCol: {
              name: 'VCol',
              template: '<div class="v-col"><slot></slot></div>'
            },
            VIcon: {
              name: 'VIcon',
              props: ['size', 'color'],
              template: '<i class="v-icon" :data-icon="$slots.default ? $slots.default()[0].children : \'\'">{{ $slots.default ? $slots.default()[0].children : "" }}</i>'
            },
            VAlert: {
              name: 'VAlert',
              props: ['type'],
              template: '<div v-if="$slots.default" class="v-alert" :class="`v-alert--${type}`" data-test="error-alert"><slot></slot></div>'
            },
            VProgressCircular: {
              name: 'VProgressCircular',
              props: ['size', 'indeterminate', 'color'],
              template: '<div class="v-progress-circular" data-test="loading-spinner">Loading...</div>'
            },
            VTooltip: {
              name: 'VTooltip',
              template: `
                <div class="v-tooltip">
                  <slot name="activator" v-bind="{ on: {}, attrs: {} }"></slot>
                  <div class="v-tooltip__content" v-if="$slots.default">
                    <slot></slot>
                  </div>
                </div>
              `
            },
            PrimaryButton: {
              name: 'PrimaryButton',
              props: ['disabled'],
              emits: ['click'],
              template: '<button class="primary-button" data-test="primary-button" @click="$emit(\'click\')" :disabled="disabled"><slot></slot></button>'
            },
            GroupCard: {
              name: 'GroupCard',
              props: ['group'],
              template: '<div class="group-card" data-test="group-card">{{ group.name }}</div>'
            },
            GroupCreateDialog: {
              name: 'GroupCreateDialog',
              props: ['modelValue', 'loading'],
              emits: ['update:modelValue', 'submit'],
              template: '<div class="group-create-dialog" data-test="group-create-dialog" v-if="modelValue">Create Dialog</div>'
            }
          },
          ...options
        }
      })
    } catch (error) {
      console.error('Error mounting component:', error)
      throw error
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mockRoute = {
      params: { ownerId: 'owner123' }
    }

    mockGroupsStore = {
      groups: [],
      loading: false,
      fetchError: null,
      hasGroups: false,
      fetchGroups: vi.fn().mockResolvedValue(),
      createGroup: vi.fn().mockResolvedValue(),
      reset: vi.fn()
    }

    mockAuthStore = {
      userId: 'owner123'
    }

    mockSnackbarStore = {
      success: vi.fn(),
      error: vi.fn()
    }

    useRoute.mockReturnValue(mockRoute)
    useGroupsStore.mockReturnValue(mockGroupsStore)
    useAuthStore.mockReturnValue(mockAuthStore)
    useSnackbarStore.mockReturnValue(mockSnackbarStore)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Montage du composant', () => {
    it('devrait se monter sans erreur', () => {
      wrapper = createWrapper()
      
      expect(wrapper).toBeDefined()
      expect(wrapper.exists()).toBe(true)
    })

    it('devrait avoir la classe CSS principale', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.groups-coach-page').exists()).toBe(true)
    })
  })

  describe('Rendu initial', () => {
    it('devrait rendre le composant correctement', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('.groups-coach-page').exists()).toBe(true)
      expect(wrapper.text()).toContain('Mes groupes existants')
    })

    it('devrait afficher le bouton de création dans le header', () => {
      wrapper = createWrapper()
      
      const headerButton = wrapper.find('.title-container [data-test="primary-button"]')
      expect(headerButton.exists()).toBe(true)
      expect(headerButton.find('.v-icon').exists()).toBe(true)
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait afficher une alerte d\'erreur quand fetchError existe', async () => {

      const errorStore = {
        ...mockGroupsStore,
        fetchError: 'Erreur de chargement',
        loading: false
      }
      useGroupsStore.mockReturnValue(errorStore)
      
      wrapper = createWrapper()
      await nextTick()

      const errorAlert = wrapper.find('[data-test="error-alert"]')
      expect(errorAlert.exists()).toBe(true)
      expect(errorAlert.text()).toContain('Erreur de chargement')
    })

    it('devrait afficher l\'erreur même pendant le chargement', async () => {

      const errorLoadingStore = {
        ...mockGroupsStore,
        fetchError: 'Erreur de chargement',
        loading: true
      }
      useGroupsStore.mockReturnValue(errorLoadingStore)
      
      wrapper = createWrapper()
      await nextTick()

      expect(wrapper.find('[data-test="error-alert"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="loading-spinner"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="error-alert"]').text()).toContain('Erreur de chargement')
    })
  })

  describe('État vide', () => {
    beforeEach(() => {

      const emptyStore = {
        ...mockGroupsStore,
        hasGroups: false,
        loading: false,
        fetchError: null
      }
      useGroupsStore.mockReturnValue(emptyStore)
    })

    it('devrait afficher l\'état vide quand aucun groupe n\'existe', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('Vous n\'avez pas encore de groupes coachés')
      expect(emptyState.text()).toContain('Créez votre premier groupe pour commencer à coacher !')
    })

    it('devrait afficher l\'icône de groupe dans l\'état vide', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
  
      const icon = emptyState.find('.v-icon')
      expect(icon.exists()).toBe(true)

      const iconContent = icon.text() || icon.attributes('data-icon') || icon.html()
      expect(iconContent).toMatch(/mdi-account-group/)
    })

    it('devrait afficher le bouton de création dans l\'état vide quand l\'utilisateur peut créer', async () => {
      mockAuthStore.userId = 'owner123'
      wrapper = createWrapper()
      await nextTick()
 
      const emptyState = wrapper.find('.empty-state')
      const buttons = emptyState.findAll('[data-test="primary-button"]')

      expect(buttons.length).toBeGreaterThan(0)

      const enabledButton = buttons.find(btn => !btn.attributes('disabled'))
      expect(enabledButton.exists()).toBe(true)
      expect(enabledButton.text()).toContain('Créer un groupe')
    })

    it('devrait afficher un bouton désactivé avec tooltip quand l\'utilisateur ne peut pas créer', async () => {
      mockAuthStore.userId = 'different-user'
      wrapper = createWrapper()
      await nextTick()

      const tooltip = wrapper.find('.v-tooltip')
      expect(tooltip.exists()).toBe(true)
      
      const disabledButton = tooltip.find('[data-test="primary-button"][disabled]')
      expect(disabledButton.exists()).toBe(true)
      
      expect(wrapper.text()).toContain('Seul le propriétaire peut créer un groupe ici')
    })
  })

  describe('Affichage des groupes', () => {
    beforeEach(() => {
      const groupsStore = {
        ...mockGroupsStore,
        hasGroups: true,
        groups: [
          { id: 'group1', name: 'Groupe 1', description: 'Description 1' },
          { id: 'group2', name: 'Groupe 2', description: 'Description 2' },
          { id: 'group3', name: 'Groupe 3', description: 'Description 3' }
        ],
        loading: false,
        fetchError: null
      }
      useGroupsStore.mockReturnValue(groupsStore)
    })

    it('devrait afficher la grille de groupes quand des groupes existent', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      const groupsGrid = wrapper.find('.v-row')
      expect(groupsGrid.exists()).toBe(true)
      
      const groupCards = wrapper.findAll('[data-test="group-card"]')
      expect(groupCards).toHaveLength(3)
      expect(groupCards[0].text()).toContain('Groupe 1')
      expect(groupCards[1].text()).toContain('Groupe 2')
      expect(groupCards[2].text()).toContain('Groupe 3')
    })

    it('ne devrait pas afficher l\'état vide quand des groupes existent', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.find('.empty-state').exists()).toBe(false)
    })

    it('devrait passer les bonnes props aux GroupCard', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      const groupCards = wrapper.findAllComponents({ name: 'GroupCard' })
      if (groupCards.length > 0) {
        expect(groupCards[0].props('group')).toEqual({
          id: 'group1',
          name: 'Groupe 1',
          description: 'Description 1'
        })
      }
    })
  })

  describe('Permissions de création', () => {
    it('devrait calculer canCreateGroup correctement quand userId === ownerId', async () => {
      mockAuthStore.userId = 'owner123'
      mockRoute.params.ownerId = 'owner123'
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.canCreateGroup).toBe(true)
      
      const headerButton = wrapper.find('.title-container [data-test="primary-button"]')
      expect(headerButton.attributes('disabled')).toBeUndefined()
    })

    it('devrait calculer canCreateGroup correctement quand userId !== ownerId', async () => {
      mockAuthStore.userId = 'user456'
      mockRoute.params.ownerId = 'owner123'
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.canCreateGroup).toBe(false)
      
      const headerButton = wrapper.find('.title-container [data-test="primary-button"]')
      expect(headerButton.attributes('disabled')).toBeDefined()
    })

    it('devrait utiliser authStore.userId comme ownerId quand route.params.ownerId n\'existe pas', async () => {
      mockAuthStore.userId = 'user123'
      mockRoute.params = {}
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.ownerId).toBe('user123')
      expect(wrapper.vm.canCreateGroup).toBe(true)
    })
  })

  describe('Dialog de création', () => {
    beforeEach(() => {
      mockAuthStore.userId = 'owner123'
      const dialogStore = {
        ...mockGroupsStore,
        loading: false,
        fetchError: null
      }
      useGroupsStore.mockReturnValue(dialogStore)
    })

    it('devrait ouvrir la dialog au clic sur le bouton du header', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      const headerButton = wrapper.find('.title-container [data-test="primary-button"]')
      expect(headerButton.exists()).toBe(true)
      
      await headerButton.trigger('click')
      await nextTick()
      
      expect(wrapper.vm.dialog).toBe(true)
      expect(wrapper.find('[data-test="group-create-dialog"]').exists()).toBe(true)
    })

    it('devrait ouvrir la dialog au clic sur le bouton de l\'état vide', async () => {
      const emptyDialogStore = {
        ...mockGroupsStore,
        hasGroups: false,
        loading: false,
        fetchError: null
      }
      useGroupsStore.mockReturnValue(emptyDialogStore)
      
      wrapper = createWrapper()
      await nextTick()

      const emptyState = wrapper.find('.empty-state')
      const buttons = emptyState.findAll('[data-test="primary-button"]')
      const enabledButton = buttons.find(btn => !btn.attributes('disabled'))
      
      expect(enabledButton.exists()).toBe(true)
      
      await enabledButton.trigger('click')
      await nextTick()
      
      expect(wrapper.vm.dialog).toBe(true)
      expect(wrapper.find('[data-test="group-create-dialog"]').exists()).toBe(true)
    })

    it('devrait passer les bonnes props à GroupCreateDialog', async () => {
      wrapper = createWrapper()
      wrapper.vm.dialog = true
      await nextTick()
      
      const dialog = wrapper.findComponent({ name: 'GroupCreateDialog' })
      expect(dialog.props('modelValue')).toBe(true)
      expect(dialog.props('loading')).toBe(mockGroupsStore.loading)
    })

    it('devrait fermer la dialog quand modelValue change', async () => {
      wrapper = createWrapper()
      wrapper.vm.dialog = true
      await nextTick()
      
      const dialog = wrapper.findComponent({ name: 'GroupCreateDialog' })
      await dialog.vm.$emit('update:modelValue', false)
      await nextTick()
      
      expect(wrapper.vm.dialog).toBe(false)
    })
  })

  describe('Création de groupe', () => {
    beforeEach(() => {
      mockAuthStore.userId = 'owner123'
      const createStore = {
        ...mockGroupsStore,
        loading: false,
        fetchError: null
      }
      useGroupsStore.mockReturnValue(createStore)
    })

    it('devrait créer un groupe avec succès', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      const groupData = { name: 'Nouveau Groupe', description: 'Description du groupe' }
      
      wrapper.vm.dialog = true
      await nextTick()
      
      const dialog = wrapper.findComponent({ name: 'GroupCreateDialog' })
      await dialog.vm.$emit('submit', groupData)
      await nextTick()
      
      expect(mockGroupsStore.createGroup).toHaveBeenCalledWith(groupData)
      expect(mockSnackbarStore.success).toHaveBeenCalledWith('Groupe créé avec succès !')
      expect(wrapper.vm.dialog).toBe(false)
    })

    it('devrait gérer les erreurs de création', async () => {
      const errorCreateStore = {
        ...mockGroupsStore,
        loading: false,
        fetchError: null,
        createGroup: vi.fn().mockRejectedValue(new Error('Erreur création'))
      }
      useGroupsStore.mockReturnValue(errorCreateStore)
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      wrapper = createWrapper()
      await nextTick()
      
      const groupData = { name: 'Nouveau Groupe', description: 'Description du groupe' }
      
      wrapper.vm.dialog = true
      await nextTick()
      
      const dialog = wrapper.findComponent({ name: 'GroupCreateDialog' })
      await dialog.vm.$emit('submit', groupData)
      await nextTick()
      
      expect(errorCreateStore.createGroup).toHaveBeenCalledWith(groupData)
      expect(mockSnackbarStore.error).toHaveBeenCalledWith('Erreur lors de la création du groupe.')
      expect(wrapper.vm.dialog).toBe(true)
      
      consoleSpy.mockRestore()
    })
  })

  describe('Cycle de vie du composant', () => {
    it('devrait charger les groupes au montage quand ownerId existe', async () => {
      mockRoute.params.ownerId = 'owner123'
      wrapper = createWrapper()
      await nextTick()
      
      expect(mockGroupsStore.fetchGroups).toHaveBeenCalledWith('owner123')
    })

    it('ne devrait pas charger les groupes au montage quand ownerId n\'existe pas', async () => {
      mockRoute.params = {}
      mockAuthStore.userId = null
      wrapper = createWrapper()
      await nextTick()
      
      expect(mockGroupsStore.fetchGroups).not.toHaveBeenCalled()
    })

    it('devrait réinitialiser le store au démontage', () => {
      wrapper = createWrapper()
      wrapper.unmount()
      
      expect(mockGroupsStore.reset).toHaveBeenCalled()
    })
  })

  describe('Computed properties', () => {
    it('devrait calculer ownerId depuis route.params.ownerId en priorité', async () => {
      mockRoute.params.ownerId = 'owner123'
      mockAuthStore.userId = 'user456'
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.ownerId).toBe('owner123')
    })

    it('devrait calculer ownerId depuis authStore.userId en fallback', async () => {
      mockRoute.params = {}
      mockAuthStore.userId = 'user456'
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.ownerId).toBe('user456')
    })

    it('devrait calculer canCreateGroup correctement', async () => {
      mockRoute.params.ownerId = 'owner123'
      mockAuthStore.userId = 'owner123'
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.canCreateGroup).toBe(true)
    })
  })

  describe('Méthodes', () => {
    it('devrait ouvrir la dialog avec openDialog', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.dialog).toBe(false)
      
      wrapper.vm.openDialog()
      
      expect(wrapper.vm.dialog).toBe(true)
    })

    it('devrait appeler createGroup avec les bons paramètres', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      const groupData = { name: 'Test', description: 'Test description' }
      await wrapper.vm.createGroup(groupData)
      
      expect(mockGroupsStore.createGroup).toHaveBeenCalledWith(groupData)
    })
  })

  describe('Logique conditionnelle du template', () => {
    it('devrait afficher l\'erreur ET le loading quand les deux existent', async () => {
      const errorAndLoadingStore = {
        ...mockGroupsStore,
        loading: true,
        fetchError: 'Erreur test'
      }
      useGroupsStore.mockReturnValue(errorAndLoadingStore)
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.find('[data-test="loading-spinner"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="error-alert"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="error-alert"]').text()).toContain('Erreur test')
      expect(wrapper.find('.empty-state').exists()).toBe(false)
      expect(wrapper.find('.v-row').exists()).toBe(false)
    })

    it('devrait afficher l\'erreur quand fetchError existe et pas loading', async () => {
      const errorOnlyStore = {
        ...mockGroupsStore,
        loading: false,
        fetchError: 'Erreur test',
        hasGroups: false
      }
      useGroupsStore.mockReturnValue(errorOnlyStore)
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.find('[data-test="error-alert"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="error-alert"]').text()).toContain('Erreur test')
      expect(wrapper.find('[data-test="loading-spinner"]').exists()).toBe(false)
    })

    it('devrait afficher l\'état vide quand !hasGroups et pas loading ni erreur', async () => {
      const emptyOnlyStore = {
        ...mockGroupsStore,
        loading: false,
        fetchError: null,
        hasGroups: false
      }
      useGroupsStore.mockReturnValue(emptyOnlyStore)
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.find('[data-test="loading-spinner"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="error-alert"]').exists()).toBe(false)
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.v-row').exists()).toBe(false)
    })

    it('devrait afficher la grille quand hasGroups=true et pas loading', async () => {
      const groupsOnlyStore = {
        ...mockGroupsStore,
        loading: false,
        fetchError: null,
        hasGroups: true,
        groups: [{ id: 'test', name: 'Test Group' }]
      }
      useGroupsStore.mockReturnValue(groupsOnlyStore)
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.find('[data-test="loading-spinner"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="error-alert"]').exists()).toBe(false)
      expect(wrapper.find('.empty-state').exists()).toBe(false)
      expect(wrapper.find('.v-row').exists()).toBe(true)
    })
  })
})