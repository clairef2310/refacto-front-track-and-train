import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import DietPlanCreateDialog from '@/components/DietPlanCreateDialog.vue'

describe('DietPlanCreateDialog.vue', () => {
  let wrapper

  const createWrapper = (props = {}, options = {}) => {
    const defaultProps = { modelValue: false, ...props }
    
    return mount(DietPlanCreateDialog, {
      props: defaultProps,
      global: {
        stubs: {
          VDialog: {
            template: '<div class="v-dialog-stub" v-if="modelValue"><slot></slot></div>',
            props: ['modelValue', 'maxWidth', 'persistent']
          },
          VCard: {
            template: '<div class="v-card-stub"><slot></slot></div>'
          },
          VCardTitle: {
            template: '<div class="v-card-title-stub"><slot></slot></div>'
          },
          VCardText: {
            template: '<div class="v-card-text-stub"><slot></slot></div>'
          },
          VCardActions: {
            template: '<div class="v-card-actions-stub"><slot></slot></div>'
          },
          VIcon: {
            template: '<span class="v-icon-stub"></span>',
            props: ['color']
          },
          VSelect: {
            template: '<div class="v-select-stub"></div>',
            props: ['modelValue', 'label', 'items', 'itemTitle', 'itemValue']
          },
          VTextField: {
            template: '<div class="v-text-field-stub"></div>',
            props: ['modelValue', 'label', 'required', 'type', 'suffix', 'placeholder', 'readonly']
          },
          VTextarea: {
            template: '<div class="v-textarea-stub"></div>',
            props: ['modelValue', 'label', 'rows', 'placeholder', 'autoGrow']
          },
          VRow: {
            template: '<div class="v-row-stub"><slot></slot></div>'
          },
          VCol: {
            template: '<div class="v-col-stub"><slot></slot></div>',
            props: ['cols']
          },
          VSpacer: {
            template: '<div class="v-spacer-stub"></div>'
          },
          VTimePicker: {
            template: '<div class="v-time-picker-stub"></div>',
            props: ['modelValue', 'title', 'format', 'scrollable']
          },
          TertiaryButton: {
            template: '<div class="tertiary-btn-stub"><slot></slot></div>'
          },
          PrimaryButton: {
            template: '<div class="primary-btn-stub"><slot></slot></div>',
            props: ['loading', 'disabled', 'prependIcon', 'size']
          },
          DeleteButton: {
            template: '<div class="delete-btn-stub"><slot></slot></div>',
            props: ['prependIcon', 'size']
          }
        },
        ...options
      }
    })
  }

  beforeEach(() => {
    wrapper = createWrapper()
  })

  afterEach(() => {
    if (wrapper?.unmount) {
      wrapper.unmount()
    }
    wrapper = null
  })

  describe('Rendu du composant', () => {
    it('rend correctement le dialog principal', () => {
      wrapper = createWrapper({ modelValue: true })
      
      expect(wrapper.find('.v-dialog-stub').exists()).toBe(true)
      expect(wrapper.text()).toContain('Créer un nouveau plan')
    })

    it('affiche les éléments de base du formulaire', () => {
      wrapper = createWrapper({ modelValue: true })

      expect(wrapper.find('.v-select-stub').exists()).toBe(true)
      expect(wrapper.findAll('.v-text-field-stub').length).toBeGreaterThan(0)
      expect(wrapper.find('.tertiary-btn-stub').exists()).toBe(true)
      expect(wrapper.find('.primary-btn-stub').exists()).toBe(true)
    })

    it('affiche le formulaire macro par défaut', () => {
      wrapper = createWrapper({ modelValue: true })
      
      expect(wrapper.vm.planType).toBe('macro')
      expect(wrapper.text()).toContain('Exemple pour macroplan')
    })

    it('affiche le formulaire meal quand sélectionné', async () => {
      wrapper = createWrapper({ modelValue: true })
      
      wrapper.vm.planType = 'meal'
      await nextTick()
      
      expect(wrapper.text()).toContain('Exemple pour mealplan')
    })
  })

  describe('État initial et réactivité', () => {
    it('initialise show avec modelValue', () => {
      expect(wrapper.vm.show).toBe(false)
      
      wrapper = createWrapper({ modelValue: true })
      expect(wrapper.vm.show).toBe(true)
    })

    it('émet update:modelValue quand show change', async () => {
      wrapper.vm.show = true
      await nextTick()
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([true])
    })

    it('initialise les valeurs par défaut correctement', () => {
      expect(wrapper.vm.planType).toBe('macro')
      expect(wrapper.vm.planName).toBe('')
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.macroForm.protein).toBe(150)
      expect(wrapper.vm.mealForm.meals).toHaveLength(1)
    })

    it('initialise les constantes correctement', () => {
      expect(wrapper.vm.planTypes).toEqual([
        { text: 'Plan Macro', value: 'macro' },
        { text: 'Plan Repas', value: 'meal' }
      ])
    })
  })

  describe('Computed canSubmit', () => {
    it('retourne false si planName est vide', () => {
      wrapper.vm.planName = ''
      expect(wrapper.vm.canSubmit).toBe(false)
    })

    it('retourne true pour plan macro avec toutes les valeurs', () => {
      wrapper.vm.planName = 'Mon plan'
      wrapper.vm.planType = 'macro'
      expect(wrapper.vm.canSubmit).toBe(true)
    })

    it('retourne false pour plan macro avec valeurs manquantes', () => {
      wrapper.vm.planName = 'Mon plan'
      wrapper.vm.planType = 'macro'
      wrapper.vm.macroForm.protein = null
      expect(wrapper.vm.canSubmit).toBe(false)
    })

    it('retourne true pour plan meal avec toutes les valeurs', () => {
      wrapper.vm.planName = 'Mon plan'
      wrapper.vm.planType = 'meal'
      wrapper.vm.mealForm.meals = [
        { timing: '08:00', food: 'Petit déjeuner' }
      ]
      expect(wrapper.vm.canSubmit).toBe(true)
    })

    it('retourne false pour plan meal avec valeurs manquantes', () => {
      wrapper.vm.planName = 'Mon plan'
      wrapper.vm.planType = 'meal'
      wrapper.vm.mealForm.meals = [
        { timing: '', food: 'Petit déjeuner' }
      ]
      expect(wrapper.vm.canSubmit).toBe(false)
    })
  })

  describe('Gestion des repas (meal plan)', () => {
    beforeEach(() => {
      wrapper.vm.planType = 'meal'
    })

    it('ajoute un nouveau repas', () => {
      const initialLength = wrapper.vm.mealForm.meals.length
      
      wrapper.vm.addMeal()
      
      expect(wrapper.vm.mealForm.meals.length).toBe(initialLength + 1)
      expect(wrapper.vm.mealForm.meals[wrapper.vm.mealForm.meals.length - 1]).toEqual({
        timing: '',
        food: ''
      })
    })

    it('supprime un repas si plus d\'un repas existe', () => {
      wrapper.vm.mealForm.meals = [
        { timing: '08:00', food: 'Petit déjeuner' },
        { timing: '12:00', food: 'Déjeuner' }
      ]
      
      wrapper.vm.removeMeal(0)
      
      expect(wrapper.vm.mealForm.meals.length).toBe(1)
      expect(wrapper.vm.mealForm.meals[0].timing).toBe('12:00')
    })

    it('ne supprime pas le dernier repas', () => {
      wrapper.vm.mealForm.meals = [
        { timing: '08:00', food: 'Petit déjeuner' }
      ]
      
      wrapper.vm.removeMeal(0)
      
      expect(wrapper.vm.mealForm.meals.length).toBe(1)
    })

    it('ouvre le sélecteur d\'heure', () => {
      wrapper.vm.openTimePicker(0)
      
      expect(wrapper.vm.timePickerDialog).toBe(true)
      expect(wrapper.vm.currentMealIndex).toBe(0)
    })

    it('confirme l\'heure sélectionnée', () => {
      wrapper.vm.currentMealIndex = 0
      wrapper.vm.selectedTime = '14:30'
      
      wrapper.vm.confirmTime()
      
      expect(wrapper.vm.mealForm.meals[0].timing).toBe('14:30')
      expect(wrapper.vm.timePickerDialog).toBe(false)
    })

    it('ouvre le time picker avec heure existante', () => {
      wrapper.vm.mealForm.meals[0].timing = '10:30'
      
      wrapper.vm.openTimePicker(0)
      
      expect(wrapper.vm.selectedTime).toBe('10:30')
      expect(wrapper.vm.currentMealIndex).toBe(0)
      expect(wrapper.vm.timePickerDialog).toBe(true)
    })
  })

  describe('Méthodes du composant', () => {
    it('resetForm() remet tout à zéro', () => {
      wrapper.vm.planName = 'Test'
      wrapper.vm.planType = 'meal'
      wrapper.vm.macroForm.protein = 200
      wrapper.vm.mealForm.meals.push({ timing: '12:00', food: 'Lunch' })
      
      wrapper.vm.resetForm()
      
      expect(wrapper.vm.planName).toBe('')
      expect(wrapper.vm.planType).toBe('macro')
      expect(wrapper.vm.macroForm.protein).toBe(150)
      expect(wrapper.vm.mealForm.meals).toHaveLength(1)
      expect(wrapper.vm.mealForm.meals[0]).toEqual({ timing: '', food: '' })
    })

    it('close() ferme le dialog et reset le formulaire', async () => {
      wrapper.vm.show = true
      wrapper.vm.planName = 'Test'
      
      wrapper.vm.close()
      await nextTick()
      
      expect(wrapper.vm.show).toBe(false)
      expect(wrapper.vm.planName).toBe('')
    })

    it('submit() ne fait rien si canSubmit est false', async () => {
      wrapper.vm.planName = ''
      
      await wrapper.vm.submit()
      
      expect(wrapper.emitted('created')).toBeFalsy()
      expect(wrapper.vm.loading).toBe(false)
    })

    it('submit() émet les données pour plan macro', async () => {
      wrapper.vm.planName = 'Mon plan macro'
      wrapper.vm.planType = 'macro'
      
      await wrapper.vm.submit()
      
      expect(wrapper.emitted('created')).toBeTruthy()
      expect(wrapper.emitted('created')[0]).toEqual([{
        type: 'macro',
        data: {
          name: 'Mon plan macro',
          protein: 150,
          lipids: 80,
          carbohydrates: 220,
          fiber: 40,
          water: 3,
          kilocalorie: 2000
        }
      }])
    })

    it('submit() émet les données pour plan meal', async () => {
      wrapper.vm.planName = 'Mon plan repas'
      wrapper.vm.planType = 'meal'
      wrapper.vm.mealForm.meals = [
        { timing: '08:00', food: 'Petit déjeuner' },
        { timing: '12:00', food: 'Déjeuner' }
      ]
      
      await wrapper.vm.submit()
      
      expect(wrapper.emitted('created')).toBeTruthy()
      expect(wrapper.emitted('created')[0]).toEqual([{
        type: 'meal',
        data: {
          name: 'Mon plan repas',
          meals: [
            { timing: '08:00', food: 'Petit déjeuner' },
            { timing: '12:00', food: 'Déjeuner' }
          ]
        }
      }])
    })

    it('submit() ferme le dialog après soumission', async () => {
      wrapper.vm.planName = 'Test'
      wrapper.vm.show = true
      
      await wrapper.vm.submit()
      
      expect(wrapper.vm.show).toBe(false)
    })
  })

  describe('Tests unitaires des méthodes spécifiques', () => {
    it('openTimePicker configure les variables correctement', () => {
      wrapper.vm.mealForm.meals[0].timing = '15:45'
      
      wrapper.vm.openTimePicker(0)
      
      expect(wrapper.vm.currentMealIndex).toBe(0)
      expect(wrapper.vm.selectedTime).toBe('15:45')
      expect(wrapper.vm.timePickerDialog).toBe(true)
    })

    it('openTimePicker avec timing vide', () => {
      wrapper.vm.mealForm.meals[0].timing = ''
      const originalSelectedTime = wrapper.vm.selectedTime
      
      wrapper.vm.openTimePicker(0)
      
      expect(wrapper.vm.currentMealIndex).toBe(0)
      expect(wrapper.vm.selectedTime).toBe(originalSelectedTime)
      expect(wrapper.vm.timePickerDialog).toBe(true)
    })

    it('confirmTime applique l\'heure sélectionnée', () => {
      wrapper.vm.currentMealIndex = 0
      wrapper.vm.selectedTime = '16:20'
      
      wrapper.vm.confirmTime()
      
      expect(wrapper.vm.mealForm.meals[0].timing).toBe('16:20')
      expect(wrapper.vm.timePickerDialog).toBe(false)
    })

    it('confirmTime sans heure sélectionnée', () => {
      wrapper.vm.currentMealIndex = 0
      wrapper.vm.selectedTime = null
      const originalTiming = wrapper.vm.mealForm.meals[0].timing
      
      wrapper.vm.confirmTime()
      
      expect(wrapper.vm.mealForm.meals[0].timing).toBe(originalTiming)
      expect(wrapper.vm.timePickerDialog).toBe(false)
    })

    it('addMeal ajoute un repas vide', () => {
      const initialLength = wrapper.vm.mealForm.meals.length
      
      wrapper.vm.addMeal()
      
      expect(wrapper.vm.mealForm.meals.length).toBe(initialLength + 1)
      const newMeal = wrapper.vm.mealForm.meals[wrapper.vm.mealForm.meals.length - 1]
      expect(newMeal).toEqual({ timing: '', food: '' })
    })

    it('removeMeal avec plusieurs repas', () => {
      wrapper.vm.mealForm.meals = [
        { timing: '08:00', food: 'Breakfast' },
        { timing: '12:00', food: 'Lunch' },
        { timing: '19:00', food: 'Dinner' }
      ]
      
      wrapper.vm.removeMeal(1)
      
      expect(wrapper.vm.mealForm.meals.length).toBe(2)
      expect(wrapper.vm.mealForm.meals[0].food).toBe('Breakfast')
      expect(wrapper.vm.mealForm.meals[1].food).toBe('Dinner')
    })

    it('removeMeal avec un seul repas ne fait rien', () => {
      wrapper.vm.mealForm.meals = [{ timing: '08:00', food: 'Breakfast' }]
      
      wrapper.vm.removeMeal(0)
      
      expect(wrapper.vm.mealForm.meals.length).toBe(1)
      expect(wrapper.vm.mealForm.meals[0].food).toBe('Breakfast')
    })
  })

  describe('Workflows complets', () => {
    it('workflow complet de création d\'un plan macro', async () => {
      wrapper = createWrapper({ modelValue: true })

      wrapper.vm.planName = 'Mon plan macro'
      wrapper.vm.planType = 'macro'
      wrapper.vm.macroForm.protein = 180

      await wrapper.vm.submit()

      expect(wrapper.emitted('created')).toBeTruthy()
      const payload = wrapper.emitted('created')[0][0]
      expect(payload.type).toBe('macro')
      expect(payload.data.name).toBe('Mon plan macro')
      expect(payload.data.protein).toBe(180)
      expect(wrapper.vm.show).toBe(false)
    })

    it('workflow complet de création d\'un plan repas', async () => {
      wrapper = createWrapper({ modelValue: true })

      wrapper.vm.planName = 'Mon plan repas'
      wrapper.vm.planType = 'meal'
      wrapper.vm.mealForm.meals = [
        { timing: '08:00', food: 'Petit déjeuner complet' },
        { timing: '12:30', food: 'Déjeuner équilibré' }
      ]

      await wrapper.vm.submit()

      expect(wrapper.emitted('created')).toBeTruthy()
      const payload = wrapper.emitted('created')[0][0]
      expect(payload.type).toBe('meal')
      expect(payload.data.meals).toHaveLength(2)
      expect(wrapper.vm.show).toBe(false)
    })

    it('workflow d\'annulation', async () => {
      wrapper = createWrapper({ modelValue: true })

      wrapper.vm.planName = 'Plan à annuler'

      wrapper.vm.close()
      await nextTick()

      expect(wrapper.vm.show).toBe(false)
      expect(wrapper.vm.planName).toBe('')
      expect(wrapper.emitted('created')).toBeFalsy()
    })

    it('workflow de gestion des repas', () => {
      wrapper.vm.planType = 'meal'

      wrapper.vm.addMeal()
      wrapper.vm.addMeal()
      expect(wrapper.vm.mealForm.meals.length).toBe(3)
    
      wrapper.vm.mealForm.meals[0].timing = '08:00'
      wrapper.vm.mealForm.meals[0].food = 'Petit déjeuner'
      wrapper.vm.mealForm.meals[1].timing = '12:00'
      wrapper.vm.mealForm.meals[1].food = 'Déjeuner'
      wrapper.vm.mealForm.meals[2].timing = '19:00'
      wrapper.vm.mealForm.meals[2].food = 'Dîner'

      wrapper.vm.removeMeal(1)
      expect(wrapper.vm.mealForm.meals.length).toBe(2)
      expect(wrapper.vm.mealForm.meals[1].food).toBe('Dîner')
    })
  })

  describe('Validation et cas limites', () => {
    it('canSubmit - cas macro avec valeurs nulles', () => {
      wrapper.vm.planName = 'Test'
      wrapper.vm.planType = 'macro'

      expect(wrapper.vm.canSubmit).toBe(true)
      
      wrapper.vm.macroForm.protein = null
      expect(wrapper.vm.canSubmit).toBe(false)

      wrapper.vm.macroForm.lipids = ''
      expect(wrapper.vm.canSubmit).toBe(false)
    })

    it('canSubmit - cas meal avec repas incomplets', () => {
      wrapper.vm.planName = 'Test'
      wrapper.vm.planType = 'meal'

      wrapper.vm.mealForm.meals = [{ timing: '08:00', food: 'Breakfast' }]
      expect(wrapper.vm.canSubmit).toBe(true)

      wrapper.vm.mealForm.meals = [{ timing: '', food: 'Breakfast' }]
      expect(wrapper.vm.canSubmit).toBe(false)

      wrapper.vm.mealForm.meals = [{ timing: '08:00', food: '' }]
      expect(wrapper.vm.canSubmit).toBe(false)

      wrapper.vm.mealForm.meals = [
        { timing: '08:00', food: 'Breakfast' },
        { timing: '', food: 'Lunch' }
      ]
      expect(wrapper.vm.canSubmit).toBe(false)
    })

    it('planName requis pour tous les types', () => {

      wrapper.vm.planName = ''
      wrapper.vm.planType = 'macro'
      expect(wrapper.vm.canSubmit).toBe(false)
  
      wrapper.vm.planType = 'meal'
      wrapper.vm.mealForm.meals = [{ timing: '08:00', food: 'Breakfast' }]
      expect(wrapper.vm.canSubmit).toBe(false)

      wrapper.vm.planName = 'Mon plan'
      expect(wrapper.vm.canSubmit).toBe(true)
    })
  })

  describe('Tests des constantes et valeurs par défaut', () => {
    it('vérifie les constantes PLAN_TYPE', () => {

      expect(wrapper.vm.$options.__scopeId || true).toBeTruthy()
      
      expect(wrapper.vm.planType).toBe('macro')
      expect(wrapper.vm.planTypes[0].value).toBe('macro')
      expect(wrapper.vm.planTypes[1].value).toBe('meal')
    })

    it('vérifie les valeurs par défaut des macros', () => {
      const expectedMacros = {
        protein: 150,
        lipids: 80,
        carbohydrates: 220,
        fiber: 40,
        water: 3,
        kilocalorie: 2000
      }
      
      expect(wrapper.vm.macroForm).toEqual(expectedMacros)
    })

    it('vérifie les valeurs par défaut des repas', () => {
      expect(wrapper.vm.mealForm.meals).toHaveLength(1)
      expect(wrapper.vm.mealForm.meals[0]).toEqual({
        timing: '',
        food: ''
      })
    })
  })
})