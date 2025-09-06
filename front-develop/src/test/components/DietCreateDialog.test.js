import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import DietCreateDialog from '@/components/DietCreateDialog.vue'

global.CSS = {
  supports: vi.fn().mockReturnValue(false)
}

describe('DietCreateDialog.vue', () => {
  let wrapper

  const createWrapper = (props = {}, options = {}) => {
    const defaultProps = { modelValue: false, ...props }
    
    return mount(DietCreateDialog, {
      props: defaultProps,
      attachTo: document.body,
      global: {
        stubs: {
          VDialog: {
            template: '<div class="v-dialog-stub" v-if="modelValue"><slot></slot></div>',
            props: ['modelValue', 'maxWidth', 'persistent']
          },
          VCard: {
            template: '<div class="v-card-stub diet-card"><slot></slot></div>'
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
          VSpacer: {
            template: '<div class="v-spacer-stub"></div>'
          },
          VTextField: {
            template: '<input class="v-text-field-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'label', 'required']
          },
          VTextarea: {
            template: '<textarea class="v-textarea-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
            props: ['modelValue', 'label', 'bgColor', 'rows', 'required']
          },
          TertiaryButton: {
            template: '<button class="tertiary-btn" @click="$emit(\'click\')"><slot></slot></button>'
          },
          PrimaryButton: {
            template: '<button class="primary-btn" :disabled="loading" @click="$emit(\'click\')"><slot></slot></button>',
            props: ['loading']
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
    it('rend correctement les composants de base', () => {
      wrapper = createWrapper({ modelValue: false })

      expect(wrapper.find('.v-dialog-stub').exists()).toBe(false)
    })

    it('affiche le contenu quand modelValue est true', () => {
      wrapper = createWrapper({ modelValue: true })

      expect(wrapper.find('.v-dialog-stub').exists()).toBe(true)
      expect(wrapper.text()).toContain('Créer un nouveau diet')
    })

    it('affiche tous les champs de formulaire', () => {
      wrapper = createWrapper({ modelValue: true })

      const nameField = wrapper.find('.v-text-field-stub')
      const descField = wrapper.find('.v-textarea-stub')
      const cancelBtn = wrapper.find('.tertiary-btn')
      const submitBtn = wrapper.find('.primary-btn')
      
      expect(nameField.exists()).toBe(true)
      expect(descField.exists()).toBe(true)
      expect(cancelBtn.exists()).toBe(true)
      expect(submitBtn.exists()).toBe(true)
    })
  })

  describe('État et réactivité', () => {
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

    it('met à jour show quand modelValue change', async () => {
      await wrapper.setProps({ modelValue: true })
      expect(wrapper.vm.show).toBe(true)
    })

    it('initialise les refs correctement', () => {
      expect(wrapper.vm.name).toBe('')
      expect(wrapper.vm.description).toBe('')
      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('Interactions avec les champs', () => {
    beforeEach(() => {
      wrapper = createWrapper({ modelValue: true })
    })

    it('met à jour name quand on tape dans le champ', async () => {
      const nameField = wrapper.find('.v-text-field-stub')
      
      await nameField.setValue('Mon diet test')
      await nextTick()
      
      expect(wrapper.vm.name).toBe('Mon diet test')
    })

    it('met à jour description quand on tape dans le champ', async () => {
      const descField = wrapper.find('.v-textarea-stub')
      
      await descField.setValue('Description de test')
      await nextTick()
      
      expect(wrapper.vm.description).toBe('Description de test')
    })
  })

  describe('Méthodes du composant', () => {
    it('close() ferme et reset les champs', async () => {
      wrapper.vm.name = 'Test'
      wrapper.vm.description = 'Test desc'
      wrapper.vm.show = true
      
      wrapper.vm.close()
      await nextTick()
      
      expect(wrapper.vm.show).toBe(false)
      expect(wrapper.vm.name).toBe('')
      expect(wrapper.vm.description).toBe('')
    })

    it('submit() valide et émet les données', async () => {
      wrapper.vm.name = 'Diet test'
      wrapper.vm.description = 'Description test'
      
      await wrapper.vm.submit()
      
      expect(wrapper.emitted('created')).toBeTruthy()
      expect(wrapper.emitted('created')[0]).toEqual([{
        name: 'Diet test',
        description: 'Description test'
      }])
    })

    it('submit() ne fait rien si name est vide', async () => {
      wrapper.vm.name = ''
      wrapper.vm.description = 'Description'
      
      await wrapper.vm.submit()
      
      expect(wrapper.emitted('created')).toBeFalsy()
    })
  })

  describe('Interactions avec les boutons', () => {
    beforeEach(() => {
      wrapper = createWrapper({ modelValue: true })
    })

    it('bouton Annuler déclenche close', async () => {
      wrapper.vm.name = 'Test'
      wrapper.vm.show = true
      
      const cancelBtn = wrapper.find('.tertiary-btn')
      await cancelBtn.trigger('click')
      await nextTick()
      
      expect(wrapper.vm.show).toBe(false)
      expect(wrapper.vm.name).toBe('')
    })

    it('bouton Créer déclenche submit', async () => {
      wrapper.vm.name = 'Test Diet'
      wrapper.vm.description = 'Test Description'
      
      const submitBtn = wrapper.find('.primary-btn')
      await submitBtn.trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('created')).toBeTruthy()
    })

    it('bouton Créer affiche l\'état loading', async () => {
      wrapper.vm.loading = true
      await nextTick()
      
      const submitBtn = wrapper.find('.primary-btn')
      expect(submitBtn.element.disabled).toBe(true)
    })
  })

  describe('Validation', () => {
    const testCases = [
      { name: '', shouldEmit: false, description: 'nom vide' },
      { name: null, shouldEmit: false, description: 'nom null' },
      { name: undefined, shouldEmit: false, description: 'nom undefined' },
      { name: 'Valid name', shouldEmit: true, description: 'nom valide' },
      { name: '   ', shouldEmit: true, description: 'nom avec espaces' }
    ]

    testCases.forEach(testCase => {
      it(`${testCase.description}: ${testCase.shouldEmit ? 'émet' : 'n\'émet pas'} created`, async () => {
        wrapper = createWrapper({ modelValue: true })
        
        wrapper.vm.name = testCase.name
        wrapper.vm.description = 'Test description'
        
        await wrapper.vm.submit()
        
        if (testCase.shouldEmit) {
          expect(wrapper.emitted('created')).toBeTruthy()
        } else {
          expect(wrapper.emitted('created')).toBeFalsy()
        }
      })
    })
  })

  describe('Workflows complets', () => {
    it('workflow de création complet', async () => {
      wrapper = createWrapper({ modelValue: true })

      const nameField = wrapper.find('.v-text-field-stub')
      const descField = wrapper.find('.v-textarea-stub')
      
      await nameField.setValue('Mon nouveau diet')
      await descField.setValue('Description complète')
      await nextTick()

      const submitBtn = wrapper.find('.primary-btn')
      await submitBtn.trigger('click')
      await nextTick()

      expect(wrapper.emitted('created')).toBeTruthy()
      expect(wrapper.emitted('created')[0]).toEqual([{
        name: 'Mon nouveau diet',
        description: 'Description complète'
      }])
      expect(wrapper.vm.show).toBe(false)
    })

    it('workflow d\'annulation', async () => {
      wrapper = createWrapper({ modelValue: true })

      await wrapper.find('.v-text-field-stub').setValue('Test à annuler')
      await nextTick()

      const cancelBtn = wrapper.find('.tertiary-btn')
      await cancelBtn.trigger('click')
      await nextTick()

      expect(wrapper.vm.show).toBe(false)
      expect(wrapper.vm.name).toBe('')
      expect(wrapper.emitted('created')).toBeFalsy()
    })
  })
})