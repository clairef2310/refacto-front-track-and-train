import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useContextualStore } from '@/stores/contextual'

describe('Contextual Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useContextualStore()
  })

  it('initializes with null userProfileId', () => {
    expect(store.userProfileId).toBe(null)
  })

  it('setUserProfileId updates the profile ID', () => {
    store.setUserProfileId('123')
    expect(store.userProfileId).toBe('123')
  })

  it('clearUserProfileId resets the profile ID to null', () => {
    store.setUserProfileId('123')
    store.clearUserProfileId()
    expect(store.userProfileId).toBe(null)
  })
})