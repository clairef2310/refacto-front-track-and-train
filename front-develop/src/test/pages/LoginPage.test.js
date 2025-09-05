import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginPage from '@/pages/LoginPage.vue'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

describe('LoginPage.vue', () => {
  let router, store

  beforeEach(() => {
    router = { push: vi.fn() }
    useRouter.mockReturnValue(router)
  })

  const factory = () => {
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            createSpy: vi.fn
          })
        ]
      }
    })
    store = useAuthStore()
    return wrapper
  }

  it('appelle login avec les bons paramètres au clic sur le bouton', async () => {
    const wrapper = factory()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('user@mail.com')
    await inputs[1].setValue('secret')
    await wrapper.find('[data-test="primary-btn"]').trigger('click')
    await wrapper.vm.$nextTick()
    expect(store.login).toHaveBeenCalledWith('user@mail.com', 'secret')
  })

  it('redirige vers "/" si le token est présent après login', async () => {
  const wrapper = factory()

  store.login.mockImplementation(async () => {
    store.token = 'TOKEN'
  })

  const inputs = wrapper.findAll('input')
  await inputs[0].setValue('user@mail.com')
  await inputs[1].setValue('secret')
  await wrapper.find('[data-test="primary-btn"]').trigger('click')
  await wrapper.vm.$nextTick()

  expect(router.push).toHaveBeenCalledWith('/')
})
})