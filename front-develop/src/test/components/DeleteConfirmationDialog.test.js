import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.vue'

describe('DeleteConfirmationDialog.vue', () => {
  const globalStubs = {
    TertiaryButton: {
      template: '<button @click="$emit(\'click\')">Annuler</button>',
    },
    PrimaryButton: {
      template: '<button @click="$emit(\'click\')">Supprimer</button>',
    },
    'v-dialog': { template: '<div><slot /></div>' },
    'v-card': { template: '<div><slot /></div>' },
    'v-card-title': { template: '<div><slot /></div>' },
    'v-card-text': { template: '<div><slot /></div>' },
    'v-card-actions': { template: '<div><slot /></div>' },
    'v-icon': true,
    'v-spacer': true,
  }

  it('émet "cancel" et ferme le dialog quand le bouton Annuler est cliqué', async () => {
    const wrapper = mount(DeleteConfirmationDialog, {
      props: { modelValue: true },
      global: { stubs: globalStubs },
    })

    const cancelBtn = wrapper.find('button')
    expect(cancelBtn.exists()).toBe(true)
    await cancelBtn.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })

  it('émet "confirm" quand le bouton Supprimer est cliqué', async () => {
    const wrapper = mount(DeleteConfirmationDialog, {
      props: { modelValue: true },
      global: { stubs: globalStubs },
    })

    const buttons = wrapper.findAll('button')
    const confirmBtn = buttons.find(b => b.text() === 'Supprimer')
    expect(confirmBtn).toBeTruthy()
    await confirmBtn.trigger('click')

    expect(wrapper.emitted('confirm')).toBeTruthy()
  })
})
