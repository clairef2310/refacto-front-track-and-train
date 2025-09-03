import '@/assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  ssr: true,
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  aliases: {
    PrimaryButton: components.VBtn,
    SecondaryButton: components.VBtn,
    DeleteButton: components.VBtn,
    TertiaryButton: components.VBtn,
  },
  defaults: {
    VCard: {
      class: 'card-class',
    },
    PrimaryButton: {
      class: 'primary-button',
      elevation: '2',
    },
    SecondaryButton: {
      class: 'secondary-button',
      elevation: '0',
    },
    DeleteButton: {
      class: 'delete-button',
      elevation: '0',
    },
    TertiaryButton: {
      class: 'tertiary-button',
    },
    VTextField: {
      variant: 'solo-filled',
      hideDetails: 'auto',
      density: 'compact',
      bgColor: 'white',

    },
    VChip: {
      variant: 'tonal',
    },
    VSelect: {
      variant: 'solo-filled',
      hideDetails: 'auto',
      density: 'compact',
      bgColor: 'white',
    },
    VTextarea: {
      variant: 'solo-filled',
      density: 'compact',
      bgColor: 'white',
      hideDetails: 'auto',
    },
  },
})

const pinia = createPinia()

createApp(App).use(vuetify).use(pinia).use(router).mount('#app')
