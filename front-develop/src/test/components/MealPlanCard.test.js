import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import MealPlanCard from '@/components/MealPlanCard.vue'

const mealPlan = {
  name: 'Plan Test',
  meals: [
    { timing: '8h', food: 'Petit-déjeuner' },
    { timing: '12:30', food: 'Déjeuner' },
    { timing: '20:00', food: 'Dîner' },
    { timing: '16:00', food: 'Snack' }
  ]
}

describe('MealPlanCard.vue', () => {
  it('calcule correctement quels repas sont principaux', () => {
  const wrapper = mount(MealPlanCard, { props: { mealPlan } })
  const foodCards = wrapper.findAll('.food-card')

  const highlighted = foodCards.map(card => card.classes().includes('highlighted'))
  expect(highlighted).toEqual([true, true, false, true])
})

  it('tri correctement les repas par horaire', () => {
    const wrapper = mount(MealPlanCard, { props: { mealPlan } })
    const sortedTimings = wrapper.vm.sortedMeals.map(m => m.timing)
    expect(sortedTimings).toEqual(['8h', '12:30', '16:00', '20:00'])
  })

  it('affiche les repas et le contenu correctement', () => {
    const wrapper = mount(MealPlanCard, { props: { mealPlan } })
    const texts = wrapper.text()
    expect(texts).toContain('Petit-déjeuner')
    expect(texts).toContain('Déjeuner')
    expect(texts).toContain('Dîner')
    expect(texts).toContain('Snack')
  })
})
