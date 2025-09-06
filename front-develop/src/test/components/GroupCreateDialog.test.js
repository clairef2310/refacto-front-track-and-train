import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GroupCreateDialog from '@/components/GroupCreateDialog.vue'

const TertiaryButtonStub = { template: '<button @click="$emit(\'click\')"><slot /></button>' }

describe('GroupCreateDialog.vue', () => {

  it('ferme le dialog et réinitialise les champs quand on clique sur Annuler', async () => {
    const wrapper = mount(GroupCreateDialog, {
      props: { modelValue: true },
      global: { stubs: { TertiaryButton: TertiaryButtonStub } }
    })

    wrapper.vm.name = 'Test'
    wrapper.vm.description = 'Desc'

    const cancelButton = wrapper.findComponent(TertiaryButtonStub)
    await cancelButton.trigger('click')

    expect(wrapper.vm.name).toBe('')
    expect(wrapper.vm.description).toBe('')
    expect(wrapper.vm.show).toBe(false)
  })

  it('affiche correctement le dialog quand modelValue est true', () => {
    const wrapper = mount(GroupCreateDialog, {
      props: { modelValue: true }
    })

    expect(wrapper.vm.show).toBe(true)
  })
})
