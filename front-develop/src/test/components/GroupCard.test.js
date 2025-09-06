import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import GroupCard from '@/components/GroupCard.vue'

const mockPush = vi.fn()
const mockDeleteGroup = vi.fn()
const mockSuccess = vi.fn()
const mockError = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush
  }))
}))

vi.mock('@/stores/groups', () => ({
  useGroupsStore: vi.fn(() => ({
    deleteGroup: mockDeleteGroup
  }))
}))

vi.mock('@/stores/snackbar', () => ({
  useSnackbarStore: vi.fn(() => ({
    success: mockSuccess,
    error: mockError
  }))
}))

describe('GroupCard.vue', () => {
  let wrapper

  const mockGroup = {
    id: 1,
    name: 'Groupe Test',
    description: 'Description du groupe de test',
    created_at: '2024-01-15T10:30:00Z'
  }

  const createWrapper = (props = {}) => {
    return mount(GroupCard, {
      props: {
        group: mockGroup,
        loading: false,
        ...props
      },
      global: {
        stubs: {
          VCard: true,
          VCardTitle: true,
          VCardText: true,
          VCardActions: true,
          VIcon: true,
          DeleteButton: true,
          SecondaryButton: true,
          DeleteConfirmationDialog: true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteGroup.mockResolvedValue()
    wrapper = createWrapper()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Rendu du composant', () => {
    it('monte le composant correctement', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm).toBeDefined()
    })

    it('utilise les props group', () => {
      expect(wrapper.props('group')).toEqual(mockGroup)
      expect(wrapper.props('loading')).toBe(false)
    })

    it('initialise deleteDialog à false', () => {
      expect(wrapper.vm.deleteDialog).toBe(false)
    })
  })

  describe('Formatage de date', () => {
    it('formate correctement une date ISO', () => {
      const result = wrapper.vm.formatDate('2024-01-15T10:30:00Z')
      expect(result).toBe('15 janv. 2024')
    })

    it('formate correctement différentes dates', () => {
      const testCases = [
        { input: '2024-12-25T00:00:00Z', expected: '25 déc. 2024' },
        { input: '2024-06-01T12:00:00Z', expected: '1 juin 2024' },
        { input: '2024-03-08T15:30:00Z', expected: '8 mars 2024' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(wrapper.vm.formatDate(input)).toBe(expected)
      })
    })

    it('gère les dates invalides', () => {
      const result = wrapper.vm.formatDate('invalid-date')
      expect(result).toBe('Invalid Date')
    })

  })

  describe('Méthode seeMembers', () => {
    it('navigue vers la page des membres avec l\'ID correct', () => {
      wrapper.vm.seeMembers()
      
      expect(mockPush).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/groups/1/membres')
    })

    it('utilise l\'ID du groupe dans l\'URL', () => {
      const customWrapper = createWrapper({
        group: { ...mockGroup, id: 42 }
      })
      
      customWrapper.vm.seeMembers()
      
      expect(mockPush).toHaveBeenCalledWith('/groups/42/membres')
      
      customWrapper.unmount()
    })

    it('gère les IDs de type string', () => {
      const customWrapper = createWrapper({
        group: { ...mockGroup, id: 'abc123' }
      })
      
      customWrapper.vm.seeMembers()
      
      expect(mockPush).toHaveBeenCalledWith('/groups/abc123/membres')
      
      customWrapper.unmount()
    })
  })

  describe('Méthode confirmDelete', () => {
    it('ouvre le dialog de confirmation', () => {
      expect(wrapper.vm.deleteDialog).toBe(false)
      
      wrapper.vm.confirmDelete()
      
      expect(wrapper.vm.deleteDialog).toBe(true)
    })

    it('peut être appelée plusieurs fois', () => {
      wrapper.vm.confirmDelete()
      expect(wrapper.vm.deleteDialog).toBe(true)
      
      wrapper.vm.confirmDelete()
      expect(wrapper.vm.deleteDialog).toBe(true)
    })
  })

  describe('Méthode deleteGroup', () => {
    it('supprime le groupe avec succès', async () => {
      await wrapper.vm.deleteGroup()
      
      expect(mockDeleteGroup).toHaveBeenCalledTimes(1)
      expect(mockDeleteGroup).toHaveBeenCalledWith(1)
      expect(mockSuccess).toHaveBeenCalledWith('Groupe supprimé avec succès')
      expect(wrapper.emitted('deleted')).toBeTruthy()
      expect(wrapper.emitted('deleted')[0]).toEqual([1])
      expect(wrapper.vm.deleteDialog).toBe(false)
    })

    it('gère les erreurs de suppression', async () => {
      const error = new Error('Erreur réseau')
      mockDeleteGroup.mockRejectedValueOnce(error)
      
      await wrapper.vm.deleteGroup()
      
      expect(mockDeleteGroup).toHaveBeenCalledWith(1)
      expect(mockError).toHaveBeenCalledWith('Erreur lors de la suppression du groupe')
      expect(wrapper.emitted('deleted')).toBeFalsy()
      expect(wrapper.vm.deleteDialog).toBe(false)
    })

    it('ferme toujours le dialog après tentative', async () => {
      await wrapper.vm.deleteGroup()
      expect(wrapper.vm.deleteDialog).toBe(false)

      wrapper.vm.deleteDialog = true
      mockDeleteGroup.mockRejectedValueOnce(new Error('Test error'))

      await wrapper.vm.deleteGroup()
      expect(wrapper.vm.deleteDialog).toBe(false)
    })

    it('utilise l\'ID correct du groupe', async () => {
      const customWrapper = createWrapper({
        group: { ...mockGroup, id: 999 }
      })
      
      await customWrapper.vm.deleteGroup()
      
      expect(mockDeleteGroup).toHaveBeenCalledWith(999)
      expect(customWrapper.emitted('deleted')[0]).toEqual([999])
      
      customWrapper.unmount()
    })

    it('gère différents types d\'erreurs', async () => {
      const errorTypes = [
        new Error('Network error'),
        new Error('Permission denied'),
        new Error('Group not found')
      ]
      
      for (const error of errorTypes) {
        mockDeleteGroup.mockRejectedValueOnce(error)
        
        await wrapper.vm.deleteGroup()
        
        expect(mockError).toHaveBeenCalledWith('Erreur lors de la suppression du groupe')
      }
      
      expect(mockError).toHaveBeenCalledTimes(errorTypes.length)
    })
  })

  describe('Gestion d\'état', () => {
    it('gère l\'état du dialog correctement', async () => {

      expect(wrapper.vm.deleteDialog).toBe(false)

      wrapper.vm.deleteDialog = true
      await nextTick()
      expect(wrapper.vm.deleteDialog).toBe(true)

      wrapper.vm.deleteDialog = false
      await nextTick()
      expect(wrapper.vm.deleteDialog).toBe(false)
    })

    it('maintient l\'état des props', () => {
      expect(wrapper.vm.group).toEqual(mockGroup)
      expect(wrapper.vm.loading).toBe(false)
    })

    it('réagit aux changements de props', async () => {
      await wrapper.setProps({ loading: true })
      expect(wrapper.vm.loading).toBe(true)
      
      const newGroup = { ...mockGroup, name: 'Nouveau nom' }
      await wrapper.setProps({ group: newGroup })
      expect(wrapper.vm.group.name).toBe('Nouveau nom')
    })
  })

  describe('Émissions d\'événements', () => {
    it('émet deleted avec l\'ID correct après suppression réussie', async () => {
      await wrapper.vm.deleteGroup()
      
      const deletedEvents = wrapper.emitted('deleted')
      expect(deletedEvents).toBeTruthy()
      expect(deletedEvents).toHaveLength(1)
      expect(deletedEvents[0]).toEqual([mockGroup.id])
    })

    it('n\'émet pas deleted en cas d\'erreur', async () => {
      mockDeleteGroup.mockRejectedValueOnce(new Error('Test error'))
      
      await wrapper.vm.deleteGroup()
      
      expect(wrapper.emitted('deleted')).toBeFalsy()
    })

    it('émet deleted seulement après confirmation', async () => {

      wrapper.vm.confirmDelete()
      expect(wrapper.emitted('deleted')).toBeFalsy()

      await wrapper.vm.deleteGroup()
      expect(wrapper.emitted('deleted')).toBeTruthy()
    })
  })

  describe('Intégration avec les stores', () => {
    it('utilise le store groups pour la suppression', async () => {
      await wrapper.vm.deleteGroup()
      
      expect(mockDeleteGroup).toHaveBeenCalledWith(wrapper.vm.group.id)
    })

    it('utilise le store snackbar pour les messages', async () => {

      await wrapper.vm.deleteGroup()
      expect(mockSuccess).toHaveBeenCalledWith('Groupe supprimé avec succès')

      mockDeleteGroup.mockRejectedValueOnce(new Error('Test'))
      await wrapper.vm.deleteGroup()
      expect(mockError).toHaveBeenCalledWith('Erreur lors de la suppression du groupe')
    })

    it('utilise le router pour la navigation', () => {
      wrapper.vm.seeMembers()
      
      expect(mockPush).toHaveBeenCalledWith(`/groups/${wrapper.vm.group.id}/membres`)
    })
  })

  describe('Workflows complets', () => {
    it('workflow de suppression complète', async () => {

      wrapper.vm.confirmDelete()
      expect(wrapper.vm.deleteDialog).toBe(true)

      await wrapper.vm.deleteGroup()

      expect(mockDeleteGroup).toHaveBeenCalledWith(1)
      expect(mockSuccess).toHaveBeenCalled()
      expect(wrapper.emitted('deleted')).toBeTruthy()
      expect(wrapper.vm.deleteDialog).toBe(false)
    })

    it('workflow de navigation', () => {
      wrapper.vm.seeMembers()
      
      expect(mockPush).toHaveBeenCalledWith('/groups/1/membres')
    })

    it('workflow avec gestion d\'erreur', async () => {
      mockDeleteGroup.mockRejectedValueOnce(new Error('Server error'))

      await wrapper.vm.deleteGroup()

      expect(mockError).toHaveBeenCalledWith('Erreur lors de la suppression du groupe')
      expect(wrapper.emitted('deleted')).toBeFalsy()
      expect(wrapper.vm.deleteDialog).toBe(false)
    })
  })

  describe('Cas limites', () => {
    it('gère les groupes avec des propriétés manquantes', () => {
      const incompleteGroup = { id: 1 }
      const customWrapper = createWrapper({ group: incompleteGroup })
      
      expect(customWrapper.vm.group).toEqual(incompleteGroup)
      expect(() => customWrapper.vm.seeMembers()).not.toThrow()
      
      customWrapper.unmount()
    })

    it('gère les appels simultanés de deleteGroup', async () => {
      const deletePromise1 = wrapper.vm.deleteGroup()
      const deletePromise2 = wrapper.vm.deleteGroup()
      
      await Promise.all([deletePromise1, deletePromise2])
      
      expect(mockDeleteGroup).toHaveBeenCalled()
    })

    it('gère les changements de props pendant la suppression', async () => {
      const deletePromise = wrapper.vm.deleteGroup()

      await wrapper.setProps({ loading: true })
      
      await deletePromise
      
      expect(wrapper.vm.loading).toBe(true)
      expect(wrapper.emitted('deleted')).toBeTruthy()
    })
  })
})