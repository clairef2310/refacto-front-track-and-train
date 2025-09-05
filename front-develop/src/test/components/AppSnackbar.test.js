import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import AppSnackbar from '@/components/AppSnackbar.vue'
import { useSnackbarStore } from '@/stores/snackbar'

vi.mock('@/stores/snackbar', () => ({
  useSnackbarStore: vi.fn()
}))

describe('AppSnackbar.vue', () => {
  let wrapper
  let snackbarStoreMock

  beforeEach(() => {
    vi.clearAllMocks()

    snackbarStoreMock = {
      show: false,
      message: '',
      color: 'info',
      timeout: 5000,
      close: vi.fn()
    }

    useSnackbarStore.mockReturnValue(snackbarStoreMock)
  })

  afterEach(() => {
    if (wrapper?.unmount) {
      wrapper.unmount()
    }
    wrapper = null
  })

  describe('Rendu du composant', () => {
    it('rend correctement le v-snackbar', () => {
      wrapper = mount(AppSnackbar)
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.exists()).toBe(true)
    })

    it('passe les bonnes props au v-snackbar', () => {
      snackbarStoreMock.show = true
      snackbarStoreMock.timeout = 3000
      snackbarStoreMock.color = 'success'

      wrapper = mount(AppSnackbar)
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })

      expect(snackbar.props('modelValue')).toBe(true)
      expect(snackbar.props('timeout')).toBe(3000)
      expect(snackbar.props('color')).toBe('success')
      expect(snackbar.props('location')).toBe('top right')
      expect(snackbar.props('multiLine')).toBe(true)
    })
  })

  describe('Store integration', () => {
    it('utilise le store snackbar correctement', () => {
      wrapper = mount(AppSnackbar)
      expect(useSnackbarStore).toHaveBeenCalled()
      expect(wrapper.vm.snackbarStore).toBe(snackbarStoreMock)
    })

    it('lie les propriétés du store aux props', () => {
      wrapper = mount(AppSnackbar)
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      
      expect(snackbar.props('modelValue')).toBe(snackbarStoreMock.show)
      expect(snackbar.props('color')).toBe(snackbarStoreMock.color)
      expect(snackbar.props('timeout')).toBe(snackbarStoreMock.timeout)
    })
  })

  describe('Configuration par défaut', () => {
    it('configure la position top right', () => {
      wrapper = mount(AppSnackbar)
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('location')).toBe('top right')
    })

    it('active le mode multi-line', () => {
      wrapper = mount(AppSnackbar)
      const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
      expect(snackbar.props('multiLine')).toBe(true)
    })
  })

  describe('Bouton de fermeture avec stub', () => {
    it('affiche le bouton close et appelle la fonction', async () => {
      wrapper = mount(AppSnackbar, {
        global: {
          stubs: {
            VSnackbar: {
              template: '<div><slot></slot><slot name="actions"></slot></div>',
              props: ['modelValue', 'timeout', 'color', 'location', 'multiLine']
            }
          }
        }
      })

      const closeButton = wrapper.findComponent({ name: 'VBtn' })
      expect(closeButton.exists()).toBe(true)
      
      await closeButton.trigger('click')
      expect(snackbarStoreMock.close).toHaveBeenCalledTimes(1)
    })
  })

  describe('Différents états', () => {
    const testStates = [
      { show: true, color: 'success', message: 'Succès', timeout: 3000 },
      { show: false, color: 'error', message: 'Erreur', timeout: 7000 },
      { show: true, color: 'warning', message: 'Attention', timeout: 4000 }
    ]

    testStates.forEach(state => {
      it(`gère l'état ${state.color} correctement`, () => {
        Object.assign(snackbarStoreMock, state)
        wrapper = mount(AppSnackbar)
        
        const snackbar = wrapper.findComponent({ name: 'VSnackbar' })
        expect(snackbar.props('modelValue')).toBe(state.show)
        expect(snackbar.props('color')).toBe(state.color)
        expect(snackbar.props('timeout')).toBe(state.timeout)
      })
    })
  })
})