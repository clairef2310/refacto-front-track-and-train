<template>
  <v-row class="w-100 h-100">
    <v-col cols="12" class="d-flex justify-center align-center">
      <v-card width="400" class="card-glass pa-3">
        <v-card-title>Créer un compte</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="email" label="Email" type="email" rounded="0.5rem" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="password" label="Mot de passe" type="password" />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="confirmPassword"
                label="Confirmer le mot de passe"
                type="password"
              />
            </v-col>
            <v-col cols="12">
              <span class="register-class mt-3"
                >Déjà inscrit ? <RouterLink to="/">Se connecter</RouterLink></span
              >
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <PrimaryButton @click="handleLogin" :loading="authStore.loading" data-test-id="primary-btn">
            Se créer un compte
          </PrimaryButton>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSnackbarStore } from '@/stores/snackbar'
import { useRouter } from 'vue-router'
import api from '@/plugins/axios'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const authStore = useAuthStore()
const snackbarStore = useSnackbarStore()
const router = useRouter()

const handleLogin = async () => {
  await api
    .post('/profiles', {
      email: email.value,
      password: password.value,
      confirm_password: confirmPassword.value,
    })
    .then(() => {
      snackbarStore.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
      router.push('/login')
    })
    .catch((error) => {
      let errorMessage = ''
      console.error('Error creating account:', error)
      if (error.response?.status === 400) {
        if (
          error.response.data?.detail.includes('email') ||
          error.response.data?.detail.includes('Email')
        ) {
          errorMessage = "Le format de l'email est invalide."
        } else {
          errorMessage = 'Mot de passe et confirmation ne correspondent pas.'
        }
      } else if (error.response?.status === 409) {
        errorMessage = 'Un compte avec cet email existe déjà.'
      } else {
        errorMessage = 'Erreur lors de la création du compte. Veuillez réessayer.'
      }
      snackbarStore.error(errorMessage)
    })
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
