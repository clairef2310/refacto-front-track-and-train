import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Training from '@/pages/Training.vue'
import { RouterView } from 'vue-router'

// Mock pour RouterView
vi.mock('vue-router', () => ({
  RouterView: vi.fn(() => null)
}))

describe('Training Page', () => {
  it('renders correctly', () => {
    const wrapper = mount(Training)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders RouterView component', () => {
    mount(Training)
    expect(RouterView).toHaveBeenCalled()
  })

  it('has the correct name option', () => {
    const wrapper = mount(Training)
    expect(wrapper.vm.$options.name).toBe('TrainingPage')
  })
})