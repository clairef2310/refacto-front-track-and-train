import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSnackbarStore } from '@/stores/snackbar'

describe('Snackbar Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useSnackbarStore()
  })

  it('initializes with default values', () => {
    expect(store.show).toBe(false)
    expect(store.message).toBe('')
    expect(store.color).toBe('info')
    expect(store.timeout).toBe(4000)
  })

  it('notify sets snackbar properties and shows it', () => {
    store.notify({ 
      message: 'Test message', 
      color: 'success', 
      timeout: 3000 
    })
    
    expect(store.message).toBe('Test message')
    expect(store.color).toBe('success')
    expect(store.timeout).toBe(3000)
    expect(store.show).toBe(true)
  })

  it('success shows success message', () => {
    store.success('Success message')
    
    expect(store.message).toBe('Success message')
    expect(store.color).toBe('success')
    expect(store.timeout).toBe(4000)
    expect(store.show).toBe(true)
  })

  it('error shows error message with longer timeout', () => {
    store.error('Error message')
    
    expect(store.message).toBe('Error message')
    expect(store.color).toBe('error')
    expect(store.timeout).toBe(5000)
    expect(store.show).toBe(true)
  })

  it('info shows info message', () => {
    store.info('Info message')
    
    expect(store.message).toBe('Info message')
    expect(store.color).toBe('info')
    expect(store.timeout).toBe(4000)
    expect(store.show).toBe(true)
  })

  it('warning shows warning message', () => {
    store.warning('Warning message')
    
    expect(store.message).toBe('Warning message')
    expect(store.color).toBe('warning')
    expect(store.timeout).toBe(4000)
    expect(store.show).toBe(true)
  })

  it('close hides the snackbar', () => {
    store.show = true
    
    store.close()
    
    expect(store.show).toBe(false)
  })

  it('supports custom timeout for all notification types', () => {
    store.success('Success', 2000)
    expect(store.timeout).toBe(2000)
    
    store.error('Error', 6000)
    expect(store.timeout).toBe(6000)
    
    store.info('Info', 1500)
    expect(store.timeout).toBe(1500)
    
    store.warning('Warning', 3000)
    expect(store.timeout).toBe(3000)
  })
})