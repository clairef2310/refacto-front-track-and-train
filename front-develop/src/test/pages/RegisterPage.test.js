import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import RegisterPage from '@/pages/RegisterPage.vue'
import api from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'
import { useSnackbarStore } from '@/stores/snackbar'
import { useRouter } from 'vue-router'

vi.mock('@/stores/auth', () => ({ 
  useAuthStore: vi.fn() 
}))

vi.mock('@/stores/snackbar', () => ({ 
  useSnackbarStore: vi.fn() 
}))

vi.mock('@/plugins/axios', () => ({ 
  default: { 
    post: vi.fn() 
  } 
}))

vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
  RouterLink: {
    template: '<a><slot /></a>',
    props: ['to']
  }
}))

describe('RegisterPage.vue', () => {
  let wrapper
  let authStoreMock
  let snackbarMock
  let routerMock

  beforeEach(() => {
    vi.clearAllMocks()

    authStoreMock = { 
      loading: false 
    }
    useAuthStore.mockReturnValue(authStoreMock)

    snackbarMock = { 
      success: vi.fn(), 
      error: vi.fn() 
    }
    useSnackbarStore.mockReturnValue(snackbarMock)

    routerMock = { 
      push: vi.fn() 
    }
    useRouter.mockReturnValue(routerMock)

    wrapper = mount(RegisterPage, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a data-test="router-link"><slot /></a>',
            props: ['to']
          }
        }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('Rendu du composant', () => {
    it('rend correctement le formulaire d\'inscription', () => {
      expect(wrapper.text()).toContain('Créer un compte')
      expect(wrapper.text()).toContain('Déjà inscrit ?')
      expect(wrapper.text()).toContain('Se connecter')
      expect(wrapper.text()).toContain('Se créer un compte')
    })

    it('affiche tous les champs requis', () => {
      const emailField = wrapper.find('input[type="email"]')
      const passwordFields = wrapper.findAll('input[type="password"]')
      const submitButton = wrapper.find('[data-test-id="primary-btn"]')

      expect(emailField.exists()).toBe(true)
      expect(passwordFields).toHaveLength(2)
      expect(submitButton.exists()).toBe(true)
    })

    it('a les labels corrects pour les champs', () => {
      expect(wrapper.text()).toContain('Email')
      expect(wrapper.text()).toContain('Mot de passe')
      expect(wrapper.text()).toContain('Confirmer le mot de passe')
    })

    it('affiche le lien vers la page de connexion', () => {
      const link = wrapper.find('[data-test="router-link"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toContain('Se connecter')
    })
  })

  describe('Interactions avec les champs', () => {
    it('met à jour la valeur email quand l\'utilisateur tape', async () => {
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('test@example.com')
      
      expect(wrapper.vm.email).toBe('test@example.com')
    })

    it('met à jour la valeur password quand l\'utilisateur tape', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('password123')
      
      expect(wrapper.vm.password).toBe('password123')
    })

    it('met à jour la valeur confirmPassword quand l\'utilisateur tape', async () => {
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[1].setValue('password123')
      
      expect(wrapper.vm.confirmPassword).toBe('password123')
    })
  })

  describe('État de chargement', () => {

    it('ne passe pas l\'état loading au bouton quand authStore.loading est false', async () => {
      authStoreMock.loading = false
      await wrapper.vm.$nextTick()
      
      const button = wrapper.findComponent({ name: 'PrimaryButton' })
      expect(button.exists()).toBe(true)
      expect(button.props('loading')).toBe(false)
    })
  })

  describe('Soumission du formulaire', () => {
    beforeEach(async () => {
      await wrapper.find('input[type="email"]').setValue('test@example.com')
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('password123')
      await passwordInputs[1].setValue('password123')
    })

    it('soumet le formulaire avec les bonnes données', async () => {
      api.post.mockResolvedValue({})
      
      const button = wrapper.find('[data-test-id="primary-btn"]')
      await button.trigger('click')
      
      expect(api.post).toHaveBeenCalledWith('/profiles', {
        email: 'test@example.com',
        password: 'password123',
        confirm_password: 'password123',
      })
    })

    it('affiche un message de succès et redirige vers login en cas de succès', async () => {
      api.post.mockResolvedValue({})
      
      const button = wrapper.find('[data-test-id="primary-btn"]')
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(snackbarMock.success).toHaveBeenCalledWith(
        'Compte créé avec succès ! Vous pouvez maintenant vous connecter.'
      )
      expect(routerMock.push).toHaveBeenCalledWith('/login')
    })
  })

  describe('Gestion des erreurs', () => {
    beforeEach(async () => {
      await wrapper.find('input[type="email"]').setValue('test@example.com')
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('password123')
      await passwordInputs[1].setValue('password123')
    })

    it('affiche une erreur pour email invalide (400)', async () => {
      api.post.mockRejectedValue({
        response: { 
          status: 400, 
          data: { detail: 'Email format is invalid' } 
        }
      })
      
      const button = wrapper.find('[data-test-id="primary-btn"]')
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(snackbarMock.error).toHaveBeenCalledWith(
        "Le format de l'email est invalide."
      )
    })

    it('affiche une erreur pour mots de passe non correspondants (400)', async () => {
      api.post.mockRejectedValue({
        response: { 
          status: 400, 
          data: { detail: 'Password mismatch' } 
        }
      })
      
      const button = wrapper.find('[data-test-id="primary-btn"]')
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(snackbarMock.error).toHaveBeenCalledWith(
        'Mot de passe et confirmation ne correspondent pas.'
      )
    })

    it('affiche une erreur pour compte existant (409)', async () => {
      api.post.mockRejectedValue({
        response: { status: 409 }
      })
      
      const button = wrapper.find('[data-test-id="primary-btn"]')
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(snackbarMock.error).toHaveBeenCalledWith(
        'Un compte avec cet email existe déjà.'
      )
    })

    it('affiche une erreur générique pour autres erreurs serveur (500)', async () => {
      api.post.mockRejectedValue({
        response: { status: 500 }
      })
      
      const button = wrapper.find('[data-test-id="primary-btn"]')
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(snackbarMock.error).toHaveBeenCalledWith(
        'Erreur lors de la création du compte. Veuillez réessayer.'
      )
    })

    it('affiche une erreur générique pour erreur sans response', async () => {
      api.post.mockRejectedValue(new Error('Network error'))
      
      const button = wrapper.find('[data-test-id="primary-btn"]')
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(snackbarMock.error).toHaveBeenCalledWith(
        'Erreur lors de la création du compte. Veuillez réessayer.'
      )
    })

    it('log l\'erreur dans la console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Test error')
      api.post.mockRejectedValue(error)
      
      const button = wrapper.find('[data-test-id="primary-btn"]')
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(consoleSpy).toHaveBeenCalledWith('Error creating account:', error)
      
      consoleSpy.mockRestore()
    })
  })

  describe('Détection du type d\'erreur email', () => {
    beforeEach(async () => {
      await wrapper.find('input[type="email"]').setValue('test@example.com')
      const passwordInputs = wrapper.findAll('input[type="password"]')
      await passwordInputs[0].setValue('password123')
      await passwordInputs[1].setValue('password123')
    })

    it('détecte une erreur email avec "email" en minuscules', async () => {
      api.post.mockRejectedValue({
        response: { 
          status: 400, 
          data: { detail: 'Invalid email format' } 
        }
      })
      
      const button = wrapper.find('[data-test-id="primary-btn"]')
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(snackbarMock.error).toHaveBeenCalledWith(
        "Le format de l'email est invalide."
      )
    })

    it('détecte une erreur email avec "Email" en majuscules', async () => {
      api.post.mockRejectedValue({
        response: { 
          status: 400, 
          data: { detail: 'Invalid Email address' } 
        }
      })
      
      const button = wrapper.find('[data-test-id="primary-btn"]')
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(snackbarMock.error).toHaveBeenCalledWith(
        "Le format de l'email est invalide."
      )
    })
  })

  describe('Scénarios de formulaire vide', () => {
    it('soumet le formulaire même avec des champs vides', async () => {
      api.post.mockResolvedValue({})
      
      const button = wrapper.find('[data-test-id="primary-btn"]')
      await button.trigger('click')
      
      expect(api.post).toHaveBeenCalledWith('/profiles', {
        email: '',
        password: '',
        confirm_password: '',
      })
    })
  })

  describe('Intégration avec les stores', () => {
    it('utilise correctement le store auth', () => {
      expect(useAuthStore).toHaveBeenCalled()
      expect(wrapper.vm.authStore).toBe(authStoreMock)
    })

    it('utilise correctement le store snackbar', () => {
      expect(useSnackbarStore).toHaveBeenCalled()
      expect(wrapper.vm.snackbarStore).toBe(snackbarMock)
    })

    it('utilise correctement le router', () => {
      expect(useRouter).toHaveBeenCalled()
      expect(wrapper.vm.router).toBe(routerMock)
    })
  })
})