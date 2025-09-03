<template>
  <v-row class="w-100 h-100">
    <v-col cols="12" class="d-flex justify-center align-center">
      <v-card width="400" class="card-glass pa-3">
        <v-cardTitle>Se connecter</v-cardTitle>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                class="mb-3"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="password"
                label="Mot de passe"
                type="password"
              />
              <p v-if="authStore.error" class="text-red-600 mt-2">{{ authStore.error }}</p>
            </v-col>
            <v-col cols="12">
              <span class="register-class mt-3"
                >Pas encore inscrit ? <RouterLink to="/register">Créer un compte</RouterLink></span
              >
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <VSpacer />
          <PrimaryButton @click="handleLogin" :loading="authStore.loading">
            Se connecter
          </PrimaryButton>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  await authStore.login(email.value, password.value)
  if (authStore.token) router.push('/')
}
</script>

<style lang="scss" scoped>
.card-glass {
  background-color: #0d3b35;
  border-radius: 1.5rem;
  padding: 1.5rem;
  .v-card-title {
    color: #ffffff;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 100%;
    letter-spacing: 0;
  }
}

.register-class {
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  letter-spacing: 0.01em;

  a {
    color: #ffffff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
