import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import MacroPlanCard from '@/components/MacroPlanCard.vue'

describe('MacroPlanCard.vue', () => {
  const macroPlan = {
    name: 'Plan Test',
    protein: 120.5,
    carbohydrates: 250.7,
    lipids: 80.3,
    fiber: 40.2,
    water: 2,
    kilocalorie: 2000,
  }

  it('affiche correctement le nom du plan', () => {
    const wrapper = mount(MacroPlanCard, {
      props: { macroPlan }
    })

    expect(wrapper.text()).toContain('Plan Test')
  })

  it('affiche correctement les valeurs arrondies des macros', () => {
    const wrapper = mount(MacroPlanCard, { props: { macroPlan } })

    expect(wrapper.find('.macro-item:nth-child(1) .macro-value').text()).toBe('121') // protein
    expect(wrapper.find('.macro-item:nth-child(2) .macro-value').text()).toBe('251') // carbohydrates
    expect(wrapper.find('.macro-item:nth-child(3) .macro-value').text()).toBe('80')  // lipids
    expect(wrapper.find('.macro-item:nth-child(4) .macro-value').text()).toBe('40')  // fiber
    expect(wrapper.find('.macro-item:nth-child(5) .macro-value').text()).toBe('2')   // water
    expect(wrapper.find('.macro-item.total-calories .total-value').text()).toBe('2000') // kcal
  })

  it('affiche la barre de progression des calories si maxCalories est fourni', () => {
    const wrapper = mount(MacroPlanCard, {
      props: { macroPlan, maxCalories: 2500 }
    })


    expect(wrapper.html()).toContain('80%')
    expect(wrapper.findComponent({ name: 'VProgressLinear' }).exists()).toBe(true)
  })

  it('ne doit pas afficher la barre de progression si maxCalories est null', () => {
    const wrapper = mount(MacroPlanCard, {
      props: { macroPlan, maxCalories: null }
    })

    expect(wrapper.find('.calories-progress').exists()).toBe(false)
  })

  it('affiche 0 si certaines valeurs sont null ou undefined', () => {
    const wrapper = mount(MacroPlanCard, {
      props: {
        macroPlan: {
          name: 'Empty Plan',
          protein: null,
          carbohydrates: undefined,
          lipids: null,
          fiber: undefined,
          water: null,
          kilocalorie: undefined,
        },
      }
    })

    const values = wrapper.findAll('.macro-value').map(el => el.text())
    expect(values).toEqual(['0', '0', '0', '0', '0', '0'])
  })
})
