import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TrainingCard from '@/components/TrainingCard.vue'

// Stub simple pour le bouton primaire
const PrimaryButtonStub = {
  template: '<button><slot /></button>',
}

describe('TrainingCard.vue', () => {
  const training = {
    name: 'Séance Full Body',
    description: 'Une séance complète pour tout le corps',
    created_at: '2025-01-01T12:00:00.000Z',
  }

  const factory = (props = {}) => {
  return mount(TrainingCard, {
    props: { training, ...props },
    global: {
      stubs: {
        // stub qui transmet les events
        VCard: {
          template: '<div @click="$emit(\'click\')"><slot /></div>',
        },
        VCardTitle: { template: '<div class="text-h6"><slot /></div>' },
        VCardText: { template: '<div><slot /></div>' },
        VCardActions: { template: '<div><slot /></div>' },
        PrimaryButton: PrimaryButtonStub,
      },
    },
  })
}

  it('affiche le nom de la séance', () => {
    const wrapper = factory()
    expect(wrapper.find('.text-h6').text()).toBe(training.name)
  })

  it('affiche la description de la séance', () => {
    const wrapper = factory()
    expect(wrapper.find('.text-body-2').text()).toBe(training.description)
  })

  it('affiche la date formatée correctement', () => {
    const wrapper = factory()
    const formatted = new Date(training.created_at).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    expect(wrapper.find('.text-caption').text()).toContain(formatted)
  })

  it('le bouton "Voir détails" existe', () => {
    const wrapper = factory()
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Voir détails')
  })
})
