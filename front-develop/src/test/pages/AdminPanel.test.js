import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia, setActivePinia } from 'pinia'
import AdminPanel from '@/pages/training/AdminPanelPage.vue'

// Mock des composants enfants
vi.mock('@/components/UserCard.vue', () => ({
  default: {
    name: 'UserCard',
    template: '<div class="user-card" data-testid="user-card" @click="$emit(\'click\')"><slot /></div>',
    props: ['user'],
    emits: ['click']
  }
}))

vi.mock('@/components/UserDetailModal.vue', () => ({
  default: {
    name: 'UserDetailModal',
    template: '<div data-testid="user-detail-modal" v-if="modelValue"></div>',
    props: ['modelValue', 'user'],
    emits: ['user-updated', 'update:modelValue']
  }
}))

// Mock du store snackbar
let mockSnackbarStore

const createMockSnackbarStore = () => ({
  success: vi.fn(),
  error: vi.fn()
})

vi.mock('@/stores/snackbar', () => ({
  useSnackbarStore: () => mockSnackbarStore
}))

describe('AdminPanel', () => {
  let wrapper
  let vuetify
  let pinia
  let mockApi

  // Fonction pour créer des données fraîches à chaque test
  const createMockUsers = () => [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      roles: ['user']
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      roles: ['coach']
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      roles: ['user', 'premium']
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      roles: ['coach', 'admin']
    },
    {
      id: '5',
      name: null, // Test avec nom null
      email: 'noname@example.com',
      roles: ['user']
    }
  ]

  beforeEach(async () => {
    // Réinitialiser le mock du store
    mockSnackbarStore = createMockSnackbarStore()

    vuetify = createVuetify({
      components,
      directives
    })

    pinia = createPinia()
    setActivePinia(pinia)

    // Utiliser l'API mockée depuis le setup global
    const { default: api } = await import('@/plugins/axios')
    mockApi = api
    
    // Reset des mocks
    vi.clearAllMocks()
    
    // Configuration de la réponse API par défaut avec des données fraîches
    mockApi.get.mockResolvedValue({ data: createMockUsers() })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = async (customUsers = null) => {
    // Si des utilisateurs personnalisés sont fournis, les utiliser
    if (customUsers) {
      mockApi.get.mockResolvedValueOnce({ data: customUsers })
    }

    wrapper = mount(AdminPanel, {
      global: {
        plugins: [vuetify, pinia],
        stubs: {
          VCard: { template: '<div class="v-card"><slot /></div>' },
          VCardText: { template: '<div class="v-card-text"><slot /></div>' },
          VTextField: { 
            template: `<input 
              type="text" 
              class="v-text-field" 
              :value="modelValue" 
              @input="$emit('update:modelValue', $event.target.value)"
              :placeholder="label"
            />`,
            props: ['modelValue', 'label', 'prependInnerIcon', 'clearable'],
            emits: ['update:modelValue']
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
      expect(wrapper.classes()).toContain('admin-panel')
    })

    it('devrait afficher le titre', async () => {
      await createWrapper()
      
      expect(wrapper.find('h1').text()).toBe('Panel Administrateur')
    })

    it('devrait charger les utilisateurs au montage', async () => {
      const mockUsers = createMockUsers()
      await createWrapper()
      
      expect(mockApi.get).toHaveBeenCalledWith('/profiles/users')
      expect(wrapper.vm.users).toEqual(mockUsers)
    })
  })

  describe('Affichage des statistiques', () => {
    it('devrait afficher le nombre total d\'utilisateurs', async () => {
      await createWrapper()
      
      const statCards = wrapper.findAll('.stat-card')
      expect(statCards.length).toBeGreaterThanOrEqual(2)
      
      // Vérifier que le nombre total d'utilisateurs est affiché
      expect(wrapper.text()).toContain('5') // createMockUsers().length
      expect(wrapper.text()).toContain('Utilisateurs total')
    })

    it('devrait afficher le nombre de coachs', async () => {
      await createWrapper()
      
      expect(wrapper.text()).toContain('2') // Jane Smith et Alice Brown sont coachs
      expect(wrapper.text()).toContain('Coachs')
    })

    it('devrait recalculer les statistiques quand les utilisateurs changent', async () => {
      await createWrapper()
      
      // Remplacer complètement le tableau pour éviter les mutations
      const newUsers = [
        ...createMockUsers(),
        {
          id: '6',
          name: 'New Coach',
          email: 'newcoach@example.com',
          roles: ['coach']
        }
      ]
      
      wrapper.vm.users = newUsers
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.coaches).toHaveLength(3)
      expect(wrapper.vm.users).toHaveLength(6)
    })
  })

  describe('Fonctionnalité de recherche', () => {
    it('devrait afficher tous les utilisateurs par défaut', async () => {
      const mockUsers = createMockUsers()
      await createWrapper()
      
      expect(wrapper.vm.filteredUsers).toEqual(mockUsers)
      expect(wrapper.findAllComponents({ name: 'UserCard' })).toHaveLength(5)
    })

    it('devrait filtrer par email', async () => {
      await createWrapper()
      
      const searchField = wrapper.find('input[type="text"]')
      await searchField.setValue('jane.smith')
      
      expect(wrapper.vm.filteredUsers).toHaveLength(1)
      expect(wrapper.vm.filteredUsers[0].email).toBe('jane.smith@example.com')
    })

    it('devrait filtrer par nom', async () => {
      await createWrapper()
      
      const searchField = wrapper.find('input[type="text"]')
      await searchField.setValue('john')
      
      expect(wrapper.vm.filteredUsers).toHaveLength(2) // John Doe et Bob Johnson
      expect(wrapper.vm.filteredUsers.map(u => u.name)).toContain('John Doe')
      expect(wrapper.vm.filteredUsers.map(u => u.name)).toContain('Bob Johnson')
    })

    it('devrait être insensible à la casse', async () => {
      await createWrapper()
      
      const searchField = wrapper.find('input[type="text"]')
      await searchField.setValue('JANE')
      
      expect(wrapper.vm.filteredUsers).toHaveLength(1)
      expect(wrapper.vm.filteredUsers[0].name).toBe('Jane Smith')
    })

    it('devrait gérer les noms null', async () => {
      await createWrapper()
      
      const searchField = wrapper.find('input[type="text"]')
      await searchField.setValue('noname')
      
      expect(wrapper.vm.filteredUsers).toHaveLength(1)
      expect(wrapper.vm.filteredUsers[0].email).toBe('noname@example.com')
    })

    it('devrait retourner un tableau vide si aucun résultat', async () => {
      await createWrapper()
      
      const searchField = wrapper.find('input[type="text"]')
      await searchField.setValue('inexistant')
      
      expect(wrapper.vm.filteredUsers).toHaveLength(0)
      expect(wrapper.findAllComponents({ name: 'UserCard' })).toHaveLength(0)
    })

    it('devrait vider la recherche et afficher tous les utilisateurs', async () => {
      const mockUsers = createMockUsers()
      await createWrapper()
      
      const searchField = wrapper.find('input[type="text"]')
      await searchField.setValue('jane')
      expect(wrapper.vm.filteredUsers).toHaveLength(1)
      
      await searchField.setValue('')
      expect(wrapper.vm.filteredUsers).toEqual(mockUsers)
    })
  })

  describe('Computed properties', () => {
    it('devrait calculer correctement les coachs', async () => {
      await createWrapper()
      
      const coaches = wrapper.vm.coaches
      expect(coaches).toHaveLength(2)
      expect(coaches.every(coach => coach.roles?.includes('coach'))).toBe(true)
    })

    it('devrait gérer les utilisateurs sans rôles', async () => {
      const usersWithoutRoles = [
        { id: '1', name: 'User 1', email: 'user1@test.com' },
        { id: '2', name: 'User 2', email: 'user2@test.com', roles: null }
      ]
      
      await createWrapper(usersWithoutRoles)
      
      expect(wrapper.vm.coaches).toHaveLength(0)
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs de chargement', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockApi.get.mockRejectedValueOnce(new Error('Network error'))
      
      await createWrapper()
      
      expect(consoleSpy).toHaveBeenCalledWith('Erreur lors du chargement des utilisateurs:', expect.any(Error))
      expect(mockSnackbarStore.error).toHaveBeenCalledWith('Erreur lors du chargement des utilisateurs')
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.users).toEqual([])
      
      consoleSpy.mockRestore()
    })

    it('devrait gérer l\'état de chargement', async () => {
      let resolvePromise
      const loadingPromise = new Promise(resolve => {
        resolvePromise = resolve
      })
      
      mockApi.get.mockReturnValueOnce(loadingPromise)
      
      const wrapperPromise = createWrapper()
      
      // Pendant le chargement
      // Note: L'état de chargement est géré dans fetchUsers
      
      resolvePromise({ data: createMockUsers() })
      await wrapperPromise
      
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('Ouverture du modal utilisateur', () => {
    it('devrait ouvrir le modal quand on clique sur une carte utilisateur', async () => {
      const mockUsers = createMockUsers()
      await createWrapper()
      
      const userCards = wrapper.findAllComponents({ name: 'UserCard' })
      expect(userCards.length).toBe(5)
      
      await userCards[0].vm.$emit('click')
      
      expect(wrapper.vm.showModal).toBe(true)
      expect(wrapper.vm.selectedUser).toEqual(mockUsers[0])
    })

    it('devrait tester la méthode openUserModal directement', async () => {
      const mockUsers = createMockUsers()
      await createWrapper()
      
      const testUser = mockUsers[1]
      await wrapper.vm.openUserModal(testUser)
      
      expect(wrapper.vm.selectedUser).toEqual(testUser)
      expect(wrapper.vm.showModal).toBe(true)
    })

    it('devrait afficher le modal quand showModal est true', async () => {
      const mockUsers = createMockUsers()
      await createWrapper()
      
      wrapper.vm.showModal = true
      wrapper.vm.selectedUser = mockUsers[0]
      await wrapper.vm.$nextTick()
      
      const modal = wrapper.findComponent({ name: 'UserDetailModal' })
      expect(modal.exists()).toBe(true)
      expect(modal.props('user')).toEqual(mockUsers[0])
      expect(modal.props('modelValue')).toBe(true)
    })
  })

  describe('Mise à jour des utilisateurs', () => {
    it('devrait mettre à jour un utilisateur existant', async () => {
      const mockUsers = createMockUsers()
      await createWrapper()
      
      const updatedUser = {
        ...mockUsers[0],
        name: 'John Updated',
        email: 'john.updated@example.com'
      }
      
      await wrapper.vm.handleUserUpdate(updatedUser)
      
      expect(wrapper.vm.users[0]).toEqual(updatedUser)
      expect(mockSnackbarStore.success).toHaveBeenCalledWith('Utilisateur mis à jour avec succès')
    })

    it('ne devrait pas modifier les utilisateurs si l\'ID n\'existe pas', async () => {
      await createWrapper()
      
      const originalUsers = [...wrapper.vm.users]
      const nonExistentUser = {
        id: '999',
        name: 'Non Existent',
        email: 'nonexistent@example.com'
      }
      
      await wrapper.vm.handleUserUpdate(nonExistentUser)
      
      expect(wrapper.vm.users).toEqual(originalUsers)
      expect(mockSnackbarStore.success).toHaveBeenCalledWith('Utilisateur mis à jour avec succès')
    })

    it('devrait émettre l\'événement depuis le modal', async () => {
      const mockUsers = createMockUsers()
      await createWrapper()
      
      wrapper.vm.showModal = true
      wrapper.vm.selectedUser = mockUsers[0]
      await wrapper.vm.$nextTick()
      
      const modal = wrapper.findComponent({ name: 'UserDetailModal' })
      const updatedUser = { ...mockUsers[0], name: 'Updated Name' }
      
      await modal.vm.$emit('user-updated', updatedUser)
      
      expect(wrapper.vm.users[0].name).toBe('Updated Name')
    })
  })

  describe('Affichage de la grille d\'utilisateurs', () => {
    it('devrait afficher le bon nombre de UserCard', async () => {
      const mockUsers = createMockUsers()
      await createWrapper()
      
      const userCards = wrapper.findAllComponents({ name: 'UserCard' })
      expect(userCards).toHaveLength(mockUsers.length)
    })

    it('devrait passer les bonnes props aux UserCard', async () => {
      const mockUsers = createMockUsers()
      await createWrapper()
      
      const userCards = wrapper.findAllComponents({ name: 'UserCard' })
      
      userCards.forEach((card, index) => {
        expect(card.props('user')).toEqual(mockUsers[index])
      })
    })

    it('devrait afficher la section de gestion des utilisateurs', async () => {
      await createWrapper()
      
      expect(wrapper.find('h2').text()).toBe('Gestion des utilisateurs')
      expect(wrapper.find('.users-section').exists()).toBe(true)
      expect(wrapper.find('.users-grid').exists()).toBe(true)
    })
  })

  describe('Interface utilisateur', () => {
    it('devrait avoir le champ de recherche avec les bonnes props', async () => {
      await createWrapper()
      
      const searchField = wrapper.find('input[type="text"]')
      expect(searchField.exists()).toBe(true)
      expect(searchField.attributes('placeholder')).toBe('Rechercher un utilisateur...')
    })

    it('devrait afficher les cartes de statistiques', async () => {
      await createWrapper()
      
      const statCards = wrapper.findAll('.stat-card')
      expect(statCards.length).toBeGreaterThanOrEqual(2)
      
      expect(wrapper.find('.stats-cards').exists()).toBe(true)
    })
  })

  describe('Réactivité des données', () => {
    it('devrait réagir aux changements de searchQuery', async () => {
      await createWrapper()
      
      expect(wrapper.vm.filteredUsers).toHaveLength(5)
      
      wrapper.vm.searchQuery = 'jane'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.filteredUsers).toHaveLength(1)
      
      wrapper.vm.searchQuery = ''
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.filteredUsers).toHaveLength(5)
    })

    it('devrait mettre à jour filteredUsers quand users change', async () => {
      await createWrapper()
      
      wrapper.vm.searchQuery = 'test'
      expect(wrapper.vm.filteredUsers).toHaveLength(0)
      
      // Remplacer le tableau entier plutôt que de le muter
      wrapper.vm.users = [
        ...wrapper.vm.users,
        {
          id: '6',
          name: 'Test User',
          email: 'test@example.com',
          roles: ['user']
        }
      ]
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.filteredUsers).toHaveLength(1)
      expect(wrapper.vm.filteredUsers[0].name).toBe('Test User')
    })
  })
})