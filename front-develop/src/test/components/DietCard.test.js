import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DietCard from '@/components/DietCard.vue'

describe('DietCard.vue', () => {
  const dietMock = {
    name: 'Régime Test',
    description: 'Description du régime',
    created_at: '2025-09-06T10:30:00Z',
  }

  it('affiche le nom et la description du régime', () => {
    const wrapper = mount(DietCard, {
      props: { diet: dietMock },
    })

    expect(wrapper.text()).toContain('Régime Test')
    expect(wrapper.text()).toContain('Description du régime')
  })

  it('affiche la date formatée correctement', () => {
    const wrapper = mount(DietCard, {
      props: { diet: dietMock },
    })

    const date = new Date(dietMock.created_at)
    const formattedDate = date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    expect(wrapper.text()).toContain(`Créé le ${formattedDate}`)
  })

  it('émet "click" quand la carte est cliquée', async () => {
  const wrapper = mount(DietCard, {
    props: { diet: dietMock },
    global: {
      stubs: ['v-card', 'v-card-title', 'v-card-text', 'v-card-actions', 'SecondaryButton'],
    },
  })

  await wrapper.trigger('click')

  const clickEvents = (wrapper.emitted('click') || []).filter(e => e.length > 0 || e === undefined)
  expect(wrapper.emitted()).toHaveProperty('click')
  expect(clickEvents.length).toBeGreaterThanOrEqual(1)
})

})