import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGroupsStore } from '@/stores/groups'
import api from '@/plugins/axios'

vi.mock('@/plugins/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Groups Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGroupsStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Getters', () => {
    it('hasGroups returns true when groups exist', () => {
      store.groups = [{ id: '1' }, { id: '2' }]
      expect(store.hasGroups).toBe(true)
    })

    it('hasGroups returns false when groups are empty', () => {
      store.groups = []
      expect(store.hasGroups).toBe(false)
    })
  })

  describe('Actions', () => {
    it('fetchGroups retrieves groups for an owner', async () => {
      const groupsData = [
        { id: '1', name: 'Group 1' },
        { id: '2', name: 'Group 2' }
      ]
      api.get.mockResolvedValueOnce({ data: groupsData })

      await store.fetchGroups('owner123')

      expect(api.get).toHaveBeenCalledWith('/groups/owner/owner123')
      expect(store.groups).toEqual(groupsData)
      expect(store.loading).toBe(false)
      expect(store.fetchError).toBe(null)
    })

    it('fetchGroups handles 404 error (no groups found)', async () => {
      api.get.mockRejectedValueOnce({ response: { status: 404 } })

      await store.fetchGroups('owner123')

      expect(store.groups).toEqual([])
      expect(store.fetchError).toBe(null)
      expect(store.loading).toBe(false)
    })

    it('fetchGroups handles other errors', async () => {
      api.get.mockRejectedValueOnce({ response: { status: 500 } })

      await store.fetchGroups('owner123')

      expect(store.groups).toEqual([])
      expect(store.fetchError).toBe('Erreur lors du chargement des groupes.')
      expect(store.loading).toBe(false)
    })

    it('createGroup adds a new group', async () => {
      const newGroup = { name: 'New Group', ownerId: 'owner123' }
      const createdGroup = { id: '3', ...newGroup }
      api.post.mockResolvedValueOnce({ data: createdGroup })

      const result = await store.createGroup(newGroup)

      expect(api.post).toHaveBeenCalledWith('/groups', newGroup)
      expect(store.groups).toContainEqual(createdGroup)
      expect(result).toEqual(createdGroup)
      expect(store.loading).toBe(false)
      expect(store.fetchError).toBe(null)
    })

    it('createGroup handles 400 error', async () => {
      api.post.mockRejectedValueOnce({ response: { status: 400 } })

      await store.createGroup({ name: 'Invalid Group' })

      expect(store.fetchError).toBe('Données invalides pour la création du groupe.')
      expect(store.loading).toBe(false)
    })

    it('createGroup handles 403 error', async () => {
      api.post.mockRejectedValueOnce({ response: { status: 403 } })

      await store.createGroup({ name: 'Forbidden Group' })

      expect(store.fetchError).toBe("Vous n'avez pas la permission de créer un groupe.")
      expect(store.loading).toBe(false)
    })

    it('deleteGroup removes a group', async () => {
      store.groups = [
        { id: '1', name: 'Group 1' },
        { id: '2', name: 'Group 2' }
      ]
      api.delete.mockResolvedValueOnce({})

      await store.deleteGroup('1')

      expect(api.delete).toHaveBeenCalledWith('/groups/1')
      expect(store.groups).toEqual([{ id: '2', name: 'Group 2' }])
      expect(store.loading).toBe(false)
      expect(store.fetchError).toBe(null)
    })

    it('deleteGroup handles 404 error', async () => {
      api.delete.mockRejectedValueOnce({ response: { status: 404 } })

      await store.deleteGroup('nonexistent')

      expect(store.fetchError).toBe('Groupe non trouvé.')
      expect(store.loading).toBe(false)
    })

    it('reset clears store data', () => {
      store.groups = [{ id: '1' }, { id: '2' }]
      store.fetchError = 'Some error'

      store.reset()

      expect(store.groups).toEqual([])
      expect(store.fetchError).toBe(null)
    })
  })
})