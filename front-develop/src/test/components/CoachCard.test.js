import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CoachCard from '@/components/CoachCard.vue'

const globalStubs = {
  PrimaryButton: {
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  },
  'v-card': { template: '<div><slot /></div>' },
  'v-card-title': { template: '<div><slot /></div>' },
  'v-card-text': { template: '<div><slot /></div>' },
  'v-card-actions': { template: '<div><slot /></div>' },
}

const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

describe('CoachCard.vue', () => {

  beforeEach(() => {
    pushMock.mockClear()
  })

  it('affiche le nom et la description du coach', () => {
    const wrapper = mount(CoachCard, {
      props: {
        name: 'John Doe',
        description: 'Coach expert en musculation',
      },
      global: { stubs: globalStubs },
    })

    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('Coach expert en musculation')
  })

  it('appelle router.push avec l\'id du coach quand le bouton est cliqué', async () => {
    const wrapper = mount(CoachCard, {
      props: {
        name: 'John Doe',
        description: 'Coach expert en musculation',
        id: '123',
      },
      global: { stubs: globalStubs },
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(pushMock).toHaveBeenCalledWith('/coach/123')
  })

  it('ne fait rien si l\'id est null quand le bouton est cliqué', async () => {
    const wrapper = mount(CoachCard, {
      props: {
        name: 'Jane Doe',
        description: 'Coach débutant',
        id: null,
      },
      global: { stubs: globalStubs },
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(pushMock).not.toHaveBeenCalled()
  })
})