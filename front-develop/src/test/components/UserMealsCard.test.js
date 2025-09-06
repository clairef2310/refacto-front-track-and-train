import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import UserMealsCard from '@/components/UserMealsCard.vue'
import { createRouter, createMemoryHistory } from 'vue-router'

// Mock du router
const mockPush = vi.fn()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush
    })
  }
})

// Crée un stub de bouton qui transmet click
const ButtonStub = {
  template: '<button class="button-stub" @click="$emit(\'click\')"><slot /></button>',
  emits: ['click']
}

describe('UserMealsCard.vue', () => {
  let wrapper
  let router

  const meals = [
    { id: 1, type: 'petit-dejeuner', calories: 300, date: new Date().toISOString().split('T')[0] },
    { id: 2, type: 'dejeuner', calories: 600, date: new Date().toISOString().split('T')[0] },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/meals', name: 'meals' },
        { path: '/meals/planning', name: 'meals-planning' }
      ],
    })

    wrapper = mount(UserMealsCard, {
      global: {
        plugins: [router],
        stubs: {
          VChip: {
            template: '<span class="v-chip-stub"><slot /></span>'
          },
          VIcon: {
            template: '<span class="v-icon-stub"><slot /></span>'
          },
          VCard: {
            template: '<div class="v-card-stub"><slot /></div>'
          },
          VCardTitle: {
            template: '<div class="v-card-title-stub"><slot /></div>'
          },
          VCardText: {
            template: '<div class="v-card-text-stub"><slot /></div>'
          },
          VCardBody: {
            template: '<div class="v-card-body-stub"><slot /></div>'
          },
          VRow: {
            template: '<div class="v-row-stub"><slot /></div>'
          },
          VCol: {
            template: '<div class="v-col-stub"><slot /></div>'
          },
          VSpacer: {
            template: '<div class="v-spacer-stub"></div>'
          },
          PrimaryButton: ButtonStub,
          SecondaryButton: ButtonStub,
        },
      },
      props: { meals },
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Rendu du composant', () => {
    it('monte le composant correctement', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm).toBeDefined()
    })

    it('affiche le nombre de repas dans le chip', () => {
      const chip = wrapper.find('.v-chip-stub')
      expect(chip.exists()).toBe(true)
      expect(chip.text()).toContain(`${meals.length} repas`)
    })

    it('affiche les props meals correctement', () => {
      expect(wrapper.props('meals')).toEqual(meals)
      expect(wrapper.vm.meals).toEqual(meals)
    })

    it('affiche les boutons quand il y a des repas', () => {
      const buttons = wrapper.findAll('.button-stub')
      expect(buttons.length).toBe(2)
    })

    it('n\'affiche pas les boutons quand il n\'y a pas de repas', async () => {
      await wrapper.setProps({ meals: [] })
      
      const buttons = wrapper.findAll('.button-stub')
      expect(buttons.length).toBe(0)
    })
  })

  describe('Computed properties', () => {
    it('filtre correctement les repas d\'aujourd\'hui', () => {
      const today = new Date().toISOString().split('T')[0]
      const todayMeals = wrapper.vm.todayMeals
      
      expect(todayMeals).toHaveLength(2)
      todayMeals.forEach(meal => {
        expect(meal.date).toContain(today)
      })
    })

    it('retourne un array vide si pas de repas aujourd\'hui', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayDate = yesterday.toISOString().split('T')[0]
      
      const oldMeals = [
        { id: 1, type: 'dejeuner', calories: 500, date: yesterdayDate }
      ]
      
      await wrapper.setProps({ meals: oldMeals })
      
      expect(wrapper.vm.todayMeals).toHaveLength(0)
    })
  })

  describe('Méthodes de navigation', () => {
    it('goToAllMeals navigue vers /meals', () => {
      wrapper.vm.goToAllMeals()
      expect(mockPush).toHaveBeenCalledWith('/meals')
    })

    it('goToMealPlanning navigue vers /meals/planning', () => {
      wrapper.vm.goToMealPlanning()
      expect(mockPush).toHaveBeenCalledWith('/meals/planning')
    })
  })

  describe('Interactions avec les boutons', () => {
    it('déclenche la navigation quand on clique sur les boutons', async () => {
      const buttons = wrapper.findAll('.button-stub')
      expect(buttons.length).toBe(2)

      // Premier bouton (SecondaryButton - "Voir tous mes repas")
      await buttons[0].trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/meals')

      // Deuxième bouton (PrimaryButton - "Planifier")
      await buttons[1].trigger('click')
      expect(mockPush).toHaveBeenCalledWith('/meals/planning')
    })

  })

  describe('Méthodes utilitaires', () => {
    it('getMealTypeIcon retourne les bonnes icônes', () => {
      expect(wrapper.vm.getMealTypeIcon('petit-dejeuner')).toBe('mdi-coffee')
      expect(wrapper.vm.getMealTypeIcon('dejeuner')).toBe('mdi-food')
      expect(wrapper.vm.getMealTypeIcon('diner')).toBe('mdi-food-variant')
      expect(wrapper.vm.getMealTypeIcon('collation')).toBe('mdi-food-apple')
      expect(wrapper.vm.getMealTypeIcon('unknown')).toBe('mdi-food')
    })

    it('getMealTypeColor retourne les bonnes couleurs', () => {
      expect(wrapper.vm.getMealTypeColor('petit-dejeuner')).toBe('orange')
      expect(wrapper.vm.getMealTypeColor('dejeuner')).toBe('blue')
      expect(wrapper.vm.getMealTypeColor('diner')).toBe('purple')
      expect(wrapper.vm.getMealTypeColor('collation')).toBe('green')
    })
  })

  describe('États conditionnels', () => {
    it('affiche le message vide quand pas de repas', async () => {
      await wrapper.setProps({ meals: [] })
      
      const emptyMessage = wrapper.text()
      expect(emptyMessage).toContain('Aucun repas planifié')
    })

    it('affiche le message vide quand meals est null', async () => {
      await wrapper.setProps({ meals: null })
      
      const emptyMessage = wrapper.text()
      expect(emptyMessage).toContain('Aucun repas planifié')
    })

    it('affiche le contenu des repas quand il y en a', () => {
      const todaySection = wrapper.text()
      expect(todaySection).toContain('Aujourd\'hui')
      expect(todaySection).toContain('Voir tous mes repas')
      expect(todaySection).toContain('Planifier')
    })
  })

  describe('Props', () => {
    it('gère une liste vide de repas', async () => {
      await wrapper.setProps({ meals: [] })
      
      const chip = wrapper.find('.v-chip-stub')
      expect(chip.text()).toContain('0 repas')
    })

    it('gère un grand nombre de repas', async () => {
      const manyMeals = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        type: 'dejeuner',
        calories: 500,
        date: new Date().toISOString().split('T')[0]
      }))

      await wrapper.setProps({ meals: manyMeals })
      
      const chip = wrapper.find('.v-chip-stub')
      expect(chip.text()).toContain('10 repas')
    })
  })

  describe('Cas limites', () => {
    it('gère les repas sans calories', async () => {
      const mealsWithoutCalories = [
        { id: 1, type: 'petit-dejeuner', date: new Date().toISOString().split('T')[0] },
        { id: 2, type: 'dejeuner', date: new Date().toISOString().split('T')[0] }
      ]

      await wrapper.setProps({ meals: mealsWithoutCalories })
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm.todayMeals).toHaveLength(2)
    })

    it('gère les repas avec des dates invalides', async () => {
      const mealsWithInvalidDates = [
        { id: 1, type: 'petit-dejeuner', calories: 300, date: 'invalid-date' },
        { id: 2, type: 'dejeuner', calories: 600, date: null }
      ]

      expect(() => {
        wrapper.setProps({ meals: mealsWithInvalidDates })
      }).not.toThrow()
    })

    it('gère les repas avec des types inconnus', async () => {
      const mealsWithUnknownTypes = [
        { id: 1, type: 'collation', calories: 150, date: new Date().toISOString().split('T')[0] },
        { id: 2, type: 'gouter', calories: 200, date: new Date().toISOString().split('T')[0] }
      ]

      await wrapper.setProps({ meals: mealsWithUnknownTypes })
      
      expect(wrapper.exists()).toBe(true)
    })
  })
})