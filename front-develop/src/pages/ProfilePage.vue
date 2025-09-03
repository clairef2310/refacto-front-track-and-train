<template>
  <div class="profile-page">
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="profile-header">
          <v-card-text class="text-center py-4">
            <v-row>
              <v-col cols="12" class="d-flex">
                <div class="d-flex flex-column align-center">
                  <v-avatar
                    size="120"
                    class="profile-avatar mb-4"
                    :class="{ 'avatar-loading': fieldLoading.photo }"
                  >
                      <v-img
                        :src="userProfile.photo || defaultAvatar"
                        :alt="`Photo de ${userProfile.name}`"
                        cover
                    />
                    <v-overlay
                      v-if="fieldLoading.photo"
                      contained
                      class="d-flex align-center justify-center"
                    >
                      <v-progress-circular indeterminate color="white" />
                    </v-overlay>
                  </v-avatar>
                    <SecondaryButton
                      prepend-icon="mdi-camera"
                      @click="openPhotoDialog"
                      :loading="fieldLoading.photo"
                    >
                      Changer la photo
                    </SecondaryButton>
                </div>
                <v-spacer />
                <div class="roles-section mt-3">
                  <v-chip
                    v-for="role in userProfile.roles"
                    :key="role"
                    :color="getRoleColor(role)"
                    class="mx-1"
                  >
                    <v-icon start>{{ getRoleIcon(role) }}</v-icon>
                    {{ role }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12" class="d-flex flex-column align-start">
                <h1 class="text-h4">{{ userProfile.name || 'Utilisateur' }}</h1>
                <p class="text-h6 text-white">{{ userProfile.email }}</p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-account-edit</v-icon>
            Informations personnelles
          </v-card-title>

          <v-card-text>
            <v-form>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="field-container">
                    <v-text-field
                      v-model="userProfile.email"
                      label="Email"
                      :loading="fieldLoading.email"
                      :class="{ 'field-saving': fieldLoading.email }"
                      @blur="onFieldBlur('email')"
                      @keyup.enter="$event.target.blur()"
                      prepend-inner-icon="mdi-email"
                    />
                    <div class="field-status">
                      <v-fade-transition>
                        <v-icon v-if="fieldLoading.email" color="primary" class="loading-icon">
                          mdi-loading
                        </v-icon>
                      </v-fade-transition>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="field-container">
                    <v-text-field
                      v-model="userProfile.name"
                      label="Nom"
                      :loading="fieldLoading.name"
                      :class="{ 'field-saving': fieldLoading.name }"
                      @blur="onFieldBlur('name')"
                      @keyup.enter="$event.target.blur()"
                      prepend-inner-icon="mdi-account"
                    />
                    <div class="field-status">
                      <v-fade-transition>
                        <v-icon v-if="fieldLoading.name" color="primary" class="loading-icon">
                          mdi-loading
                        </v-icon>
                      </v-fade-transition>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="field-container">
                    <v-select
                      v-model="userProfile.sex"
                      :items="['Homme', 'Femme', 'Autre']"
                      label="Sexe"
                      :loading="fieldLoading.sex"
                      :class="{ 'field-saving': fieldLoading.sex }"
                      @blur="onFieldBlur('sex')"
                      @update:model-value="onSelectChange('sex')"
                      prepend-inner-icon="mdi-human"
                      clearable
                    />
                    <div class="field-status">
                      <v-fade-transition>
                        <v-icon v-if="fieldLoading.sex" color="primary" class="loading-icon">
                          mdi-loading
                        </v-icon>
                      </v-fade-transition>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="field-container">
                    <v-text-field
                      v-model.number="userProfile.age"
                      label="Âge"
                      type="number"
                      :loading="fieldLoading.age"
                      :class="{ 'field-saving': fieldLoading.age }"
                      @blur="onFieldBlur('age')"
                      @keyup.enter="$event.target.blur()"
                      prepend-inner-icon="mdi-cake"
                    />
                    <div class="field-status">
                      <v-fade-transition>
                        <v-icon v-if="fieldLoading.age" color="primary" class="loading-icon">
                          mdi-loading
                        </v-icon>
                      </v-fade-transition>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12">
                  <div class="field-container">
                    <v-text-field
                      v-model="userProfile.contact"
                      label="Contact"
                      :loading="fieldLoading.contact"
                      :class="{ 'field-saving': fieldLoading.contact }"
                      @blur="onFieldBlur('contact')"
                      @keyup.enter="$event.target.blur()"
                      prepend-inner-icon="mdi-phone"
                    />
                    <div class="field-status">
                      <v-fade-transition>
                        <v-icon v-if="fieldLoading.contact" color="primary" class="loading-icon">
                          mdi-loading
                        </v-icon>
                      </v-fade-transition>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="userProfile.roles?.includes('coach')" class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-briefcase</v-icon>
            Informations professionnelles
          </v-card-title>

          <v-card-text>
            <v-form>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="field-container">
                    <v-text-field
                      v-model.number="userProfile.pricing"
                      label="Tarif (€)"
                      type="number"
                      step="0.01"
                      :loading="fieldLoading.pricing"
                      :class="{ 'field-saving': fieldLoading.pricing }"
                      @blur="onFieldBlur('pricing')"
                      @keyup.enter="$event.target.blur()"
                      prepend-inner-icon="mdi-currency-eur"
                    />
                    <div class="field-status">
                      <v-fade-transition>
                        <v-icon v-if="fieldLoading.pricing" color="primary" class="loading-icon">
                          mdi-loading
                        </v-icon>
                      </v-fade-transition>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12">
                  <div class="field-container">
                    <v-textarea
                      v-model="userProfile.description"
                      label="Description"
                      rows="4"
                      :loading="fieldLoading.description"
                      :class="{ 'field-saving': fieldLoading.description }"
                      @blur="onFieldBlur('description')"
                      prepend-inner-icon="mdi-text"
                    />
                    <div class="field-status">
                      <v-fade-transition>
                        <v-icon
                          v-if="fieldLoading.description"
                          color="primary"
                          class="loading-icon"
                        >
                          mdi-loading
                        </v-icon>
                      </v-fade-transition>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12">
                  <div class="field-container">
                    <v-textarea
                      v-model="userProfile.legacy"
                      label="Expérience / Legacy"
                      rows="4"
                      :loading="fieldLoading.legacy"
                      :class="{ 'field-saving': fieldLoading.legacy }"
                      @blur="onFieldBlur('legacy')"
                      prepend-inner-icon="mdi-star"
                    />
                    <div class="field-status">
                      <v-fade-transition>
                        <v-icon v-if="fieldLoading.legacy" color="primary" class="loading-icon">
                          mdi-loading
                        </v-icon>
                      </v-fade-transition>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-shield-account</v-icon>
            Sécurité
          </v-card-title>

          <v-card-text>
            <v-form>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="field-container">
                    <v-text-field
                      v-model="newPassword"
                      label="Nouveau mot de passe"
                      type="password"
                      :loading="fieldLoading.password"
                      :class="{ 'field-saving': fieldLoading.password }"
                      placeholder="Entrer un nouveau mot de passe"
                      @blur="onPasswordBlur"
                      @keyup.enter="$event.target.blur()"
                      prepend-inner-icon="mdi-lock"
                    />
                    <div class="field-status">
                      <v-fade-transition>
                        <v-icon v-if="fieldLoading.password" color="primary" class="loading-icon">
                          mdi-loading
                        </v-icon>
                      </v-fade-transition>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-information</v-icon>
            Informations du compte
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="userProfile.id"
                  label="ID du compte"
                  readonly
                  prepend-inner-icon="mdi-identifier"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDate(userProfile.created_at)"
                  label="Membre depuis"
                  readonly
                  prepend-inner-icon="mdi-calendar"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="photoDialog" max-width="500px">
      <v-card class="photo-card">
        <v-card-title class="text-white">Changer la photo de profil</v-card-title>
        <v-card-text>
          <v-file-input
            v-model="selectedPhoto"
            label="Sélectionner une photo"
            accept="image/*"
            prepend-inner-icon="mdi-camera"
            variant="outlined"
            bg-color="white"
            @change="previewPhoto"
          />

          <div v-if="photoPreview" class="text-center mt-4">
            <v-avatar size="100">
              <v-img :src="photoPreview" cover />
            </v-avatar>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <TertiaryButton @click="photoDialog = false"> Annuler </TertiaryButton>
          <PrimaryButton
            @click="uploadPhoto"
            :loading="fieldLoading.photo"
            :disabled="!selectedPhoto?.length"
          >
          >
            Sauvegarder
          </PrimaryButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSnackbarStore } from '@/stores/snackbar'
import api from '@/plugins/axios'

const authStore = useAuthStore()
const snackbar = useSnackbarStore()

const userProfile = ref({})
const originalProfile = ref({})
const newPassword = ref('')
const photoDialog = ref(false)
const selectedPhoto = ref([])
const photoPreview = ref('')

const defaultAvatar =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'

const fieldLoading = ref({
  email: false,
  name: false,
  sex: false,
  age: false,
  contact: false,
  pricing: false,
  description: false,
  legacy: false,
  password: false,
  photo: false,
})

const currentUser = computed(() => authStore.user)

const fetchUserProfile = async () => {
  try {
    const response = await api.get('/profiles/me')
    userProfile.value = { ...response.data }
    originalProfile.value = { ...response.data }
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error)
    snackbar.error('Erreur lors du chargement du profil')
    if (currentUser.value) {
      userProfile.value = { ...currentUser.value }
      originalProfile.value = { ...currentUser.value }
    }
  }
}

const onFieldBlur = async (field) => {
  if (userProfile.value[field] === originalProfile.value[field]) {
    return
  }

  await saveField(field)
}

const onSelectChange = async (field) => {
  if (JSON.stringify(userProfile.value[field]) !== JSON.stringify(originalProfile.value[field])) {
    await saveField(field)
  }
}

const onPasswordBlur = async () => {
  if (newPassword.value.trim()) {
    await saveField('password')
  }
}

const saveField = async (field) => {
  fieldLoading.value[field] = true

  try {
    let response
    const userId = userProfile.value.id

    switch (field) {
      case 'email':
        response = await api.patch(`/profiles/${userId}/email`, {
          email: userProfile.value.email,
        })
        break

      case 'password':
        if (newPassword.value.trim()) {
          response = await api.patch(`/profiles/${userId}/password`, {
            password: newPassword.value,
          })
          newPassword.value = ''
          snackbar.success('Mot de passe mis à jour avec succès')
        }
        break

      default: {
        const updateData = {}
        updateData[field] = userProfile.value[field]

        response = await api.patch(`/profiles/${userId}`, updateData)
        break
      }
    }

    if (response && response.data) {
      Object.assign(userProfile.value, response.data)
      originalProfile.value = { ...userProfile.value }

      authStore.user = { ...userProfile.value }
    } else {
      originalProfile.value[field] = userProfile.value[field]
    }

    if (field !== 'password') {
      snackbar.success(`${getFieldDisplayName(field)} mis à jour avec succès`)
    }
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde du champ ${field}:`, error)

    if (field === 'password') {
      newPassword.value = ''
    } else {
      userProfile.value[field] = originalProfile.value[field]
    }

    const message =
      error.response?.data?.message ||
      `Erreur lors de la mise à jour du ${getFieldDisplayName(field)}`
    snackbar.error(message)
  } finally {
    fieldLoading.value[field] = false
  }
}

const openPhotoDialog = () => {
  photoDialog.value = true
  selectedPhoto.value = []
  photoPreview.value = ''
}

const previewPhoto = (files) => {
  if (files && files.length > 0) {
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const uploadPhoto = async () => {
  if (!selectedPhoto.value?.length) return

  fieldLoading.value.photo = true

  try {
    const formData = new FormData()
    formData.append('photo', selectedPhoto.value[0])

    const response = await api.post(`/profiles/${userProfile.value.id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    userProfile.value.photo = response.data.photo_url
    originalProfile.value.photo = response.data.photo_url

    photoDialog.value = false

    snackbar.success('Photo de profil mise à jour avec succès')
  } catch (error) {
    console.error("Erreur lors de l'upload de la photo:", error)

    const message = error.response?.data?.message || 'Erreur lors de la mise à jour de la photo'
    snackbar.error(message)
  } finally {
    fieldLoading.value.photo = false
  }
}

const getRoleColor = (role) => {
  const colors = {
    admin: 'red',
    coach: 'blue',
    user: 'green',
  }
  return colors[role] || 'grey'
}

const getRoleIcon = (role) => {
  const icons = {
    admin: 'mdi-crown',
    coach: 'mdi-account-tie',
    user: 'mdi-account',
  }
  return icons[role] || 'mdi-account'
}

const getFieldDisplayName = (field) => {
  const displayNames = {
    email: 'Email',
    name: 'Nom',
    sex: 'Sexe',
    age: 'Âge',
    contact: 'Contact',
    pricing: 'Tarif',
    description: 'Description',
    legacy: 'Expérience',
    password: 'Mot de passe',
  }
  return displayNames[field] || field
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  background: linear-gradient(180deg, rgba(0, 188, 167, 0.15) 0%, rgba(0, 35, 31, 0.3) 100%);
  color: white;
}

.profile-avatar {
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.avatar-loading {
  opacity: 0.7;
}

.field-container {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.field-container :deep(.v-input) {
  flex: 1;
}

.field-status {
  display: flex;
  align-items: center;
  padding-top: 8px;
  width: 24px;
  height: 24px;
  justify-content: center;
}

.field-saving :deep(.v-field) {
  border: 2px solid #1976d2 !important;
  background-color: rgba(25, 118, 210, 0.05);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

.roles-section {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }
}

.photo-card {
  background-color: #00231f !important;
}
</style>
