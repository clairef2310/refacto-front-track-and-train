import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

vi.mock('*.css', () => ({}))
vi.mock('*.scss', () => ({}))
vi.mock('*.sass', () => ({}))
vi.mock('*.less', () => ({}))
vi.mock('*.styl', () => ({}))
vi.mock('*.stylus', () => ({}))

vi.mock('vuetify/lib/components/VCode/VCode.css', () => ({}))
vi.mock('vuetify/styles', () => ({}))
vi.mock('vuetify/lib/**/*.css', () => ({}))
vi.mock('vuetify/_styles.sass', () => ({}))

vi.mock('*.png', () => 'test-file-stub')
vi.mock('*.jpg', () => 'test-file-stub')
vi.mock('*.jpeg', () => 'test-file-stub')
vi.mock('*.gif', () => 'test-file-stub')
vi.mock('*.svg', () => 'test-file-stub')
vi.mock('*.webp', () => 'test-file-stub')

const vuetify = createVuetify({
  components,
  directives,
  aliases: {
    PrimaryButton: components.VBtn,
    SecondaryButton: components.VBtn,
    DeleteButton: components.VBtn,
    TertiaryButton: components.VBtn,
  },
})

config.global.plugins = [vuetify]

vi.mock('@/plugins/axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({ data: {} })),
      post: vi.fn(() => Promise.resolve({ data: {} })),
      put: vi.fn(() => Promise.resolve({ data: {} })),
      delete: vi.fn(() => Promise.resolve({ data: {} }))
    }))
  }
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      back: vi.fn(),
      replace: vi.fn(),
      currentRoute: { value: { path: '/' } }
    }),
    RouterView: { template: '<div><slot /></div>' }
  }
})

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
})

config.global.mocks = {
  $route: {
    params: {},
    query: {}
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn()
  }
}

config.global.components = {
  VBtn: {
    render() {
      return null
    },
    props: {
      color: String,
      loading: Boolean,
      disabled: Boolean,
      size: String,
      'prepend-icon': String
    }
  },
  PrimaryButton: {
    name: 'PrimaryButton',
    props: ['loading', 'disabled'],
    emits: ['click'],
    template: `<button data-test="primary-btn" data-test-id="primary-btn" :disabled="disabled" @click="$emit('click')"><slot /></button>`
  },
  SecondaryButton: {
    name: 'SecondaryButton',
    props: ['loading', 'disabled'],
    template: `<button data-test="secondary-btn" data-test-id="secondary-btn" :disabled="disabled"><slot /></button>`
  },
  DeleteButton: {
    name: 'DeleteButton',
    props: ['loading', 'disabled'],
    template: `<button data-test="delete-btn" data-test-id="delete-btn" :disabled="disabled"><slot /></button>`
  },
  TertiaryButton: {
    name: 'TertiaryButton',
    props: ['loading', 'disabled'],
    template: `<button data-test="tertiary-btn" data-test-id="tertiary-btn" :disabled="disabled"><slot /></button>`
  }
}

Object.defineProperty(window, 'visualViewport', {
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    width: 1024,
    height: 768,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
    scale: 1
  },
  writable: true,
  configurable: true
})

window.visualViewport = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  width: 1024,
  height: 768,
  offsetLeft: 0,
  offsetTop: 0,
  pageLeft: 0,
  pageTop: 0,
  scale: 1,
  onresize: null,
  onscroll: null
}