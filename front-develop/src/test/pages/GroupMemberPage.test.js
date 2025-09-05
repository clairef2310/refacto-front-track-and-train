import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import GroupMembers from '@/pages/groups/GroupMemberPage.vue'
import api from '@/plugins/axios'
import { useRouter } from 'vue-router'

vi.mock('@/plugins/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('@/stores/snackbar', () => ({
  useSnackbarStore: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn()
  }))
}))

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: { groupId: 'group123' }
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn()
  }))
}))

describe('GroupMembers', () => {
  const vuetify = createVuetify()
  let wrapper

  let mockRouter

  beforeEach(async () => {

    vi.clearAllMocks()
 
    mockRouter = {
      push: vi.fn(),
      back: vi.fn()
    }

    useRouter.mockReturnValue(mockRouter)

    api.get.mockImplementation((url) => {
      if (url === '/groups/group123/members') {
        return Promise.resolve({
          data: [
            { id: 'user1', name: 'User One' },
            { id: 'user2', name: 'User Two' }
          ]
        })
      } else if (url === '/profiles/users') {
        return Promise.resolve({
          data: [
            { id: 'user3', name: 'User Three', email: 'user3@example.com' },
            { id: 'user4', name: 'User Four', email: 'user4@example.com' }
          ]
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })

    wrapper = mount(GroupMembers, {
      global: {
        plugins: [vuetify],
        stubs: {
          VTabs: true,
          VTab: true,
          VWindow: true,
          VWindowItem: true,
          VTextField: true,
          VList: true,
          VListItem: true,
          VBtn: true
        }
      }
    })

    await flushPromises()
  })

  it('correctly determines if a user is already in the group', () => {

    expect(wrapper.vm.isUserInGroup('user1')).toBe(true)
    expect(wrapper.vm.isUserInGroup('user3')).toBe(false)
  })

  it('navigates to user profile when view profile is clicked', async () => {

    await wrapper.vm.viewProfile('user123')

    expect(mockRouter.push).toHaveBeenCalledWith('/profiles/user123')
  })
})