import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import { nextTick } from 'vue'
import HomePage from '@/pages/HomePage.vue'
import api from '@/plugins/axios'

// Mock des dépendances
vi.mock('@/plugins/axios', () => ({
  default: {
    get: vi.fn()
  }
}))

// Mock des composants avec des templates fonctionnels
vi.mock('@/components/TrainingList.vue', () => ({
  default: {
    name: 'TrainingList',
    props: {
      trainings: Array
    },
    emits: ['trainingClick'],
    template: '<div data-test="training-list"><button @click="$emit(\'trainingClick\', \'123\')" data-test="training-click">Click Training</button></div>'
  }
}))

vi.mock('@/components/DietList.vue', () => ({
  default: {
    name: 'DietList',
    props: {
      diets: Array
    },
    emits: ['dietClick'],
    template: '<div data-test="diet-list"><button @click="$emit(\'dietClick\', \'456\')" data-test="diet-click">Click Diet</button></div>'
  }
}))

vi.mock('@/components/UserCoachCard.vue', () => ({
  default: {
    name: 'UserCoachCard',
    props: {
      coach: Object
    },
    template: '<div data-test="user-coach-card" v-if="coach">Coach: {{ coach.name }}</div>'
  }
}))

vi.mock('@/components/CoachCard.vue', () => ({
  default: {
    name: 'CoachCard',
    props: {
      name: String,
      description: String
    },
    template: '<div data-test="coach-card">{{ name }} - {{ description }}</div>'
  }
}))

// Mock de vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('HomePage', () => {
  const vuetify = createVuetify()
  let wrapper
  let consoleErrorSpy

  beforeEach(() => {
    // Configuration des faux timers
    vi.useFakeTimers()
    
    // Mock console.error pour les tests d'erreur
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Reset mocks
    vi.clearAllMocks()
    mockPush.mockClear()
    
    // Setup API responses
    api.get.mockImplementation((url) => {
      if (url === '/trainings/mine') {
        return Promise.resolve({ data: [{ id: '1', title: 'Training 1' }] })
      } else if (url === '/diets/mine') {
        return Promise.resolve({ data: [{ id: '1', name: 'Diet 1' }] })
      } else if (url === '/profiles/coachs') {
        return Promise.resolve({ data: [{ id: '1', name: 'Coach 1', description: 'Description 1' }] })
      }
      return Promise.reject(new Error('Not found'))
    })
  })

  afterEach(() => {
    // Nettoyage après chaque test
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
    consoleErrorSpy.mockRestore()
  })

  it('displays user specific content when authenticated', async () => {
    // Mount with authenticated user
    wrapper = mount(HomePage, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: { id: '1', name: 'Test User', coach: { name: 'My Coach' } }
              }
            }
          })
        ],
        stubs: {
          RouterLink: true
        }
      }
    })
    
    // Wait for async operations to complete
    await nextTick()
    await vi.runAllTimersAsync()
    await nextTick()
    
    // Verify content for authenticated users
    expect(wrapper.text()).toContain('Bienvenue Test User')
    expect(wrapper.find('[data-test="training-list"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="diet-list"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="user-coach-card"]').exists()).toBe(true)
    
    // Verify API calls
    expect(api.get).toHaveBeenCalledWith('/trainings/mine')
    expect(api.get).toHaveBeenCalledWith('/diets/mine')
  })

  it('displays public content when not authenticated', async () => {
    // Mount with no authenticated user
    wrapper = mount(HomePage, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: null
              }
            }
          })
        ],
        stubs: {
          RouterLink: true
        }
      }
    })
    
    // Wait for async operations to complete
    await nextTick()
    await vi.runAllTimersAsync()
    await nextTick()
    
    // Verify content for non-authenticated users
    expect(wrapper.text()).toContain('Coach Profiles')
    expect(wrapper.text()).toContain('Bienvenue sur TrackTrain')
    expect(wrapper.find('[data-test="coach-card"]').exists()).toBe(true)
    
    // Verify API calls
    expect(api.get).toHaveBeenCalledWith('/profiles/coachs')
  })

  it('navigates to training detail when training is clicked', async () => {
    // Mount with authenticated user
    wrapper = mount(HomePage, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: { id: '1', name: 'Test User', coach: { name: 'My Coach' } }
              }
            }
          })
        ],
        stubs: {
          RouterLink: true
        }
      }
    })
    
    // Wait for async operations to complete
    await nextTick()
    await vi.runAllTimersAsync()
    await nextTick()
    
    // Simulate training click
    const trainingButton = wrapper.find('[data-test="training-click"]')
    await trainingButton.trigger('click')
    await nextTick()
    
    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/training/123')
  })

  it('navigates to diet detail when diet is clicked', async () => {
    // Mount with authenticated user
    wrapper = mount(HomePage, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: { id: '1', name: 'Test User', coach: { name: 'My Coach' } }
              }
            }
          })
        ],
        stubs: {
          RouterLink: true
        }
      }
    })
    
    // Wait for async operations to complete
    await nextTick()
    await vi.runAllTimersAsync()
    await nextTick()
    
    // Simulate diet click
    const dietButton = wrapper.find('[data-test="diet-click"]')
    await dietButton.trigger('click')
    await nextTick()
    
    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/diet/456')
  })

  it('handles API errors gracefully', async () => {
    // Force API to return an error
    api.get.mockRejectedValue(new Error('API Error'))
    
    // Mount with authenticated user
    wrapper = mount(HomePage, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: { id: '1', name: 'Test User', coach: { name: 'My Coach' } }
              }
            }
          })
        ],
        stubs: {
          RouterLink: true
        }
      }
    })
    
    // Wait for async operations to complete
    await nextTick()
    await vi.runAllTimersAsync()
    await nextTick()
    
    // Console.error should have been called
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  // Test supplémentaire pour vérifier que les données sont correctement passées aux composants
  it('passes correct data to components when authenticated', async () => {
    const mockTrainings = [{ id: '1', title: 'Training 1' }, { id: '2', title: 'Training 2' }]
    const mockDiets = [{ id: '1', name: 'Diet 1' }, { id: '2', name: 'Diet 2' }]
    
    api.get.mockImplementation((url) => {
      if (url === '/trainings/mine') {
        return Promise.resolve({ data: mockTrainings })
      } else if (url === '/diets/mine') {
        return Promise.resolve({ data: mockDiets })
      }
      return Promise.reject(new Error('Not found'))
    })
    
    wrapper = mount(HomePage, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: { id: '1', name: 'Test User', coach: { name: 'My Coach' } }
              }
            }
          })
        ],
        stubs: {
          RouterLink: true
        }
      }
    })
    
    await nextTick()
    await vi.runAllTimersAsync()
    await nextTick()
    
    // Verify that components receive correct props
    const trainingList = wrapper.findComponent({ name: 'TrainingList' })
    const dietList = wrapper.findComponent({ name: 'DietList' })
    const userCoachCard = wrapper.findComponent({ name: 'UserCoachCard' })
    
    expect(trainingList.props('trainings')).toEqual(mockTrainings)
    expect(dietList.props('diets')).toEqual(mockDiets)
    expect(userCoachCard.props('coach')).toEqual({ name: 'My Coach' })
  })

  // Test pour vérifier l'affichage des coaches pour les utilisateurs non authentifiés
  it('passes correct data to coach cards when not authenticated', async () => {
    const mockCoaches = [
      { id: '1', name: 'Coach 1', description: 'Description 1' },
      { id: '2', name: 'Coach 2', description: 'Description 2' }
    ]
    
    api.get.mockImplementation((url) => {
      if (url === '/profiles/coachs') {
        return Promise.resolve({ data: mockCoaches })
      }
      return Promise.reject(new Error('Not found'))
    })
    
    wrapper = mount(HomePage, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: null
              }
            }
          })
        ],
        stubs: {
          RouterLink: true
        }
      }
    })
    
    await nextTick()
    await vi.runAllTimersAsync()
    await nextTick()
    
    // Verify that coach cards receive correct props
    const coachCards = wrapper.findAllComponents({ name: 'CoachCard' })
    expect(coachCards).toHaveLength(mockCoaches.length)
    
    coachCards.forEach((card, index) => {
      expect(card.props('name')).toBe(mockCoaches[index].name)
      expect(card.props('description')).toBe(mockCoaches[index].description)
    })
  })

  // Test pour vérifier le comportement quand l'utilisateur n'a pas de coach
  it('handles user without coach correctly', async () => {
    wrapper = mount(HomePage, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: { id: '1', name: 'Test User', coach: null }
              }
            }
          })
        ],
        stubs: {
          RouterLink: true
        }
      }
    })
    
    await nextTick()
    await vi.runAllTimersAsync()
    await nextTick()
    
    // Verify that UserCoachCard is not displayed when user has no coach
    // Le composant existe mais ne devrait pas être affiché (v-if="coach")
    expect(wrapper.find('[data-test="user-coach-card"]').exists()).toBe(false)
  })

  // Test supplémentaire pour vérifier la navigation directe via les événements des composants
  it('handles training click event from TrainingList component', async () => {
    wrapper = mount(HomePage, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: { id: '1', name: 'Test User', coach: { name: 'My Coach' } }
              }
            }
          })
        ],
        stubs: {
          RouterLink: true
        }
      }
    })
    
    await nextTick()
    await vi.runAllTimersAsync()
    await nextTick()
    
    // Emit event directly from component
    const trainingList = wrapper.findComponent({ name: 'TrainingList' })
    await trainingList.vm.$emit('trainingClick', '999')
    await nextTick()
    
    expect(mockPush).toHaveBeenCalledWith('/training/999')
  })

  it('handles diet click event from DietList component', async () => {
    wrapper = mount(HomePage, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: { id: '1', name: 'Test User', coach: { name: 'My Coach' } }
              }
            }
          })
        ],
        stubs: {
          RouterLink: true
        }
      }
    })
    
    await nextTick()
    await vi.runAllTimersAsync()
    await nextTick()
    
    // Emit event directly from component
    const dietList = wrapper.findComponent({ name: 'DietList' })
    await dietList.vm.$emit('dietClick', '888')
    await nextTick()
    
    expect(mockPush).toHaveBeenCalledWith('/diet/888')
  })
})