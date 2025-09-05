import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import ValidationDialog from '@/components/ValidationDialog.vue'
import { useTrainingStore } from '@/stores/training'
import { useSnackbarStore } from '@/stores/snackbar'

vi.mock('@/stores/training', () => ({ 
  useTrainingStore: vi.fn() 
}))

vi.mock('@/stores/snackbar', () => ({ 
  useSnackbarStore: vi.fn() 
}))

describe('ValidationDialog.vue', () => {
  let wrapper
  let trainingStoreMock
  let snackbarMock

  const mockTask = {
    id: 'task-123',
    exercise_name: 'Pompes',
    set_number: 3,
    repetitions: 12,
    rest_time: 2,
    rir: 3
  }

  const defaultProps = {
    modelValue: true,
    task: mockTask,
    trainingId: 'training-456'
  }

  beforeEach(() => {
    vi.clearAllMocks()

    trainingStoreMock = {
      loading: { creating: false },
      createValidation: vi.fn()
    }
    useTrainingStore.mockReturnValue(trainingStoreMock)
    snackbarMock = {
      success: vi.fn(),
      error: vi.fn()
    }
    useSnackbarStore.mockReturnValue(snackbarMock)

    wrapper = mount(ValidationDialog, {
      props: defaultProps,
      global: {
        stubs: {
          VDialog: {
            template: '<div class="v-dialog"><slot /></div>',
            props: ['modelValue', 'maxWidth', 'persistent']
          }
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper && typeof wrapper.unmount === 'function') {
      wrapper.unmount()
    }
    wrapper = null
  })

  describe('Rendu du composant', () => {
    it('rend correctement le dialog quand modelValue est true', () => {
      expect(wrapper.find('.validation-card').exists()).toBe(true)
      expect(wrapper.text()).toContain('Valider l\'exercice')
    })

    it('affiche les informations de l\'exercice', () => {
      expect(wrapper.text()).toContain('Pompes')
      expect(wrapper.text()).toContain('3 séries')
      expect(wrapper.text()).toContain('12 répétitions')
      expect(wrapper.text()).toContain('2min repos')
      expect(wrapper.text()).toContain('RIR 3')
    })

    it('affiche tous les champs du formulaire', () => {
      const textFields = wrapper.findAll('input[type="number"]')
      const textarea = wrapper.find('textarea')
      const slider = wrapper.findComponent({ name: 'VSlider' })

      expect(textFields.length).toBeGreaterThanOrEqual(4)
      expect(textarea.exists()).toBe(true)
      expect(slider.exists()).toBe(true)
    })

    it('affiche les hints avec les valeurs recommandées', () => {
      const html = wrapper.html()
      expect(html).toContain('Recommandé: 3')
      expect(html).toContain('Recommandé: 12')
      expect(html).toContain('Recommandé: 2min')
    })
  })

  describe('Props et computed', () => {
    it('computed dialog reflète la prop modelValue', () => {
      expect(wrapper.vm.dialog).toBe(true)
    })

    it('initialise les valeurs par défaut basées sur la task', () => {
      expect(wrapper.vm.validation.set_number).toBe(3)
      expect(wrapper.vm.validation.repetitions).toBe(12)
      expect(wrapper.vm.validation.rest_time).toBe(2)
      expect(wrapper.vm.validation.rir).toBe(3)
      expect(wrapper.vm.validation.difficulty).toBe(5)
      expect(wrapper.vm.validation.notes).toBe('')
    })

    it('met à jour les valeurs quand la task change', async () => {
      const newTask = {
        id: 'task-456',
        exercise_name: 'Squats',
        set_number: 4,
        repetitions: 15,
        rest_time: 3,
        rir: 2
      }

      await wrapper.setProps({ task: newTask })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.validation.set_number).toBe(4)
      expect(wrapper.vm.validation.repetitions).toBe(15)
      expect(wrapper.vm.validation.rest_time).toBe(3)
      expect(wrapper.vm.validation.rir).toBe(2)
    })
  })

  describe('Validation des champs', () => {
    describe('Règles de séries', () => {
      it('valide un nombre de séries correct', () => {
        const rules = wrapper.vm.setRules
        expect(rules[0](5)).toBe(true) // required
        expect(rules[1](5)).toBe(true) // > 0
        expect(rules[2](5)).toBe(true) // <= 20
      })

      it('invalide un nombre de séries incorrect', () => {
        const rules = wrapper.vm.setRules
        expect(rules[0](null)).toBe('Le nombre de séries est requis')
        expect(rules[1](0)).toBe('Le nombre de séries doit être supérieur à 0')
        expect(rules[2](25)).toBe('Le nombre de séries doit être inférieur à 20')
      })
    })

    describe('Règles de répétitions', () => {
      it('valide un nombre de répétitions correct', () => {
        const rules = wrapper.vm.repsRules
        expect(rules[0](10)).toBe(true)
        expect(rules[1](10)).toBe(true)
        expect(rules[2](10)).toBe(true)
      })

      it('invalide un nombre de répétitions incorrect', () => {
        const rules = wrapper.vm.repsRules
        expect(rules[0](null)).toBe('Le nombre de répétitions est requis')
        expect(rules[1](0)).toBe('Le nombre de répétitions doit être supérieur à 0')
        expect(rules[2](150)).toBe('Le nombre de répétitions doit être inférieur à 100')
      })
    })

    describe('Règles de temps de repos', () => {
      it('valide un temps de repos correct', () => {
        const rules = wrapper.vm.restRules
        expect(rules[0](5)).toBe(true)
        expect(rules[1](5)).toBe(true)
        expect(rules[2](5)).toBe(true)
      })

      it('invalide un temps de repos incorrect', () => {
        const rules = wrapper.vm.restRules
        expect(rules[0](null)).toBe('Le temps de repos est requis')
        expect(rules[1](-1)).toBe('Le temps de repos ne peut pas être négatif')
        expect(rules[2](35)).toBe('Le temps de repos doit être inférieur à 30 minutes')
      })
    })

    describe('Règles de RIR', () => {
      it('valide un RIR correct', () => {
        const rules = wrapper.vm.rirRules
        expect(rules[0](5)).toBe(true)
        expect(rules[1](5)).toBe(true)
        expect(rules[2](5)).toBe(true)
      })

      it('invalide un RIR incorrect', () => {
        const rules = wrapper.vm.rirRules
        expect(rules[0](null)).toBe('Le RIR est requis')
        expect(rules[1](-1)).toBe('Le RIR ne peut pas être négatif')
        expect(rules[2](15)).toBe('Le RIR doit être inférieur ou égal à 10')
      })
    })
  })

  describe('Méthodes du composant', () => {
    it('closeDialog émet update:modelValue et reset le formulaire', async () => {
      // Modifier quelques valeurs
      wrapper.vm.validation.notes = 'Test notes'
      wrapper.vm.validation.difficulty = 8

      await wrapper.vm.closeDialog()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
      
      // Vérifier que les valeurs sont reset
      expect(wrapper.vm.validation.set_number).toBe(0)
      expect(wrapper.vm.validation.notes).toBe('')
      expect(wrapper.vm.validation.difficulty).toBe(5)
    })

    it('resetForm remet les valeurs à zéro', async () => {
      // Modifier les valeurs
      wrapper.vm.validation.set_number = 10
      wrapper.vm.validation.notes = 'Test notes'
      wrapper.vm.validation.difficulty = 8

      await wrapper.vm.resetForm()

      expect(wrapper.vm.validation.set_number).toBe(0)
      expect(wrapper.vm.validation.repetitions).toBe(0)
      expect(wrapper.vm.validation.rest_time).toBe(0)
      expect(wrapper.vm.validation.rir).toBe(0)
      expect(wrapper.vm.validation.notes).toBe('')
      expect(wrapper.vm.validation.difficulty).toBe(5)
    })
  })

  describe('Soumission du formulaire', () => {
    beforeEach(() => {
      wrapper.vm.formValid = true
    })

    it('soumet la validation avec succès', async () => {
      const mockValidation = { id: 'validation-123' }
      trainingStoreMock.createValidation.mockResolvedValue(mockValidation)

      await wrapper.vm.submitValidation()

      expect(trainingStoreMock.createValidation).toHaveBeenCalledWith(
        'training-456',
        'task-123',
        expect.objectContaining({
          set_number: 3,
          repetitions: 12,
          rest_time: 2,
          rir: 3,
          notes: '',
          difficulty: 5,
          succeeded_at: expect.any(String)
        })
      )

      expect(wrapper.emitted('validation-created')).toBeTruthy()
      expect(wrapper.emitted('validation-created')[0]).toEqual([mockValidation])
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(snackbarMock.success).toHaveBeenCalledWith('Validation créée avec succès !')
    })

    it('gère les erreurs lors de la soumission', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Erreur serveur')
      trainingStoreMock.createValidation.mockRejectedValue(error)

      await wrapper.vm.submitValidation()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Erreur lors de la création de la validation:',
        error
      )
      expect(snackbarMock.error).toHaveBeenCalledWith(
        "Erreur lors de la validation de l'exercice. Veuillez réessayer."
      )

      consoleSpy.mockRestore()
    })

    it('ne soumet pas si le formulaire n\'est pas valide', async () => {
      wrapper.vm.formValid = false

      await wrapper.vm.submitValidation()

      expect(trainingStoreMock.createValidation).not.toHaveBeenCalled()
    })

    it('ne soumet pas si aucune task n\'est fournie', async () => {
      await wrapper.setProps({ task: null })

      await wrapper.vm.submitValidation()

      expect(trainingStoreMock.createValidation).not.toHaveBeenCalled()
    })
  })

  describe('Watch de la task', () => {
    it('met à jour les valeurs immédiatement quand une nouvelle task est fournie', async () => {
      const newTask = {
        id: 'new-task',
        exercise_name: 'Squats',
        set_number: 5,
        repetitions: 20,
        rest_time: 4,
        rir: 1
      }

      await wrapper.setProps({ task: newTask })

      expect(wrapper.vm.validation.set_number).toBe(5)
      expect(wrapper.vm.validation.repetitions).toBe(20)
      expect(wrapper.vm.validation.rest_time).toBe(4)
      expect(wrapper.vm.validation.rir).toBe(1)
    })

    it('gère les tasks avec des valeurs manquantes', async () => {
      const incompleteTask = {
        id: 'incomplete',
        exercise_name: 'Test'
      }

      await wrapper.setProps({ task: incompleteTask })

      expect(wrapper.vm.validation.set_number).toBe(0)
      expect(wrapper.vm.validation.repetitions).toBe(0)
      expect(wrapper.vm.validation.rest_time).toBe(0)
      expect(wrapper.vm.validation.rir).toBe(0)
    })

    it('gère le cas où task devient null', async () => {
      await wrapper.setProps({ task: null })

      expect(wrapper.vm.validation.set_number).toBe(3)
    })
  })

  describe('Intégration avec les stores', () => {
    it('utilise correctement le store training', () => {
      expect(useTrainingStore).toHaveBeenCalled()
    })

    it('utilise correctement le store snackbar', () => {
      expect(useSnackbarStore).toHaveBeenCalled()
    })
  })

  describe('Gestion des événements émis', () => {
    it('émet update:modelValue quand dialog change', async () => {
      wrapper.vm.dialog = false
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })
  })
})