import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach} from 'vitest'
import UserCard from '@/components/UserCard.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

describe('UserCard.vue', () => {
  const vuetify = createVuetify({ components, directives })

  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['admin', 'user'],
    created_at: '2023-01-01T00:00:00Z',
    sex: 'Homme',
    age: 30,
  }

  let wrapper

  beforeEach(() => {
    wrapper = mount(UserCard, {
      props: { user },
      global: {
        plugins: [vuetify]
      }
    })
  })

  it('affiche le nom et l’email de l’utilisateur', () => {
    expect(wrapper.find('h3').text()).toBe(user.name)
    expect(wrapper.find('.user-email').text()).toBe(user.email)
  })

  it('affiche tous les rôles avec les bonnes couleurs', () => {
    const chips = wrapper.findAllComponents({ name: 'VChip' })
    expect(chips.length).toBe(user.roles.length)
    
    const roleColors = {
      admin: '#920002',
      coach: '#2dd4bf',
      user: '#22c55e'
    }

    user.roles.forEach((role, i) => {
      expect(chips[i].text()).toBe(role)
      expect(chips[i].attributes('style')).toContain(roleColors[role])
    })
  })

  it('affiche la date formatée correctement', () => {
    const dateText = wrapper.findAll('.meta-item span')[0].text()
    const expected = new Date(user.created_at).toLocaleDateString('fr-FR')
    expect(dateText).toBe(expected)
  })

  it('affiche le sexe et l’âge si présents', () => {
    const metaItems = wrapper.findAll('.meta-item span')
    expect(metaItems[1].text()).toBe(user.sex)
    expect(metaItems[2].text()).toBe(`${user.age} ans`)
  })

  it('n’affiche pas le sexe ni l’âge si absents', () => {
    const wrapperNoSexAge = mount(UserCard, {
      props: { user: { ...user, sex: undefined, age: undefined } },
      global: { plugins: [vuetify] }
    })
    const metaSpans = wrapperNoSexAge.findAll('.meta-item span')
    expect(metaSpans.length).toBe(1)
  })

  it('émet un événement "click" lorsque la carte est cliquée', async () => {
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted('click').length).toBe(1)
  })
})
