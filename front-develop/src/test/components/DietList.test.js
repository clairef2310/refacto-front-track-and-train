import { describe, it, expect, } from 'vitest'
import { mount } from '@vue/test-utils'
import DietList from '@/components/DietList.vue'

const DietCardStub = {
  template: '<div class="diet-card" @click="$emit(\'click\')"><slot /></div>',
  name: 'DietCard',
  props: ['diet']
}

describe('DietList.vue', () => {
  it('affiche le nombre de repas', () => {
    const diets = [{ id: 1 }, { id: 2 }]
    const wrapper = mount(DietList, {
      props: { diets },
      global: { stubs: { DietCard: DietCardStub } }
    })

    expect(wrapper.text()).toContain('2 repas')
  })

  it('affiche l’état vide quand aucun repas n’est planifié', () => {
    const wrapper = mount(DietList, {
      props: { diets: [] },
      global: { stubs: { DietCard: DietCardStub } }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('Aucun repas planifié')
  })

  it('affiche les DietCard quand il y a des repas', () => {
    const diets = [
      { id: 1, name: 'Petit-déjeuner', description: 'Oeufs et bacon' },
      { id: 2, name: 'Déjeuner', description: 'Salade' }
    ]

    const wrapper = mount(DietList, {
      props: { diets },
      global: { stubs: { DietCard: DietCardStub } }
    })

    const cards = wrapper.findAllComponents(DietCardStub)
    expect(cards).toHaveLength(2)
    expect(cards[0].props('diet').name).toBe('Petit-déjeuner')
    expect(cards[1].props('diet').name).toBe('Déjeuner')
  })

  it('émet "dietClick" quand une DietCard est cliquée', async () => {
    const diets = [{ id: 1, name: 'Petit-déjeuner' }]
    const wrapper = mount(DietList, {
      props: { diets },
      global: { stubs: { DietCard: DietCardStub } }
    })

    const card = wrapper.findComponent(DietCardStub)
    await card.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('dietClick')
    expect(wrapper.emitted('dietClick')[0]).toEqual([1])
  })
})
