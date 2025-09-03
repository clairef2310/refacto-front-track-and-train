<template>
  <v-dialog v-model="localShow" max-width="600px">
    <v-card class="user-detail-modal">
      <v-card-title class="d-flex">
        <span class="text-h5 d-flex">Détails de l'utilisateur</span>
        <v-spacer />
        <TertiaryButton @click="localShow = false">
          <v-icon>mdi-close</v-icon>
        </TertiaryButton>
      </v-card-title>

      <v-card-text v-if="user">
        <v-form ref="form">
          <v-row>
            <!-- Email -->
            <v-col cols="12" md="6">
              <div class="field-container">
                <v-text-field
                  v-model="editedUser.email"
                  label="Email"
                  :loading="fieldLoading.email"
                  :class="{ 'field-saving': fieldLoading.email }"
                  @blur="onFieldBlur('email')"
                  @keyup.enter="$event.target.blur()"
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

            <!-- Nom -->
            <v-col cols="12" md="6">
              <div class="field-container">
                <v-text-field
                  v-model="editedUser.name"
                  label="Nom"
                  :loading="fieldLoading.name"
                  :class="{ 'field-saving': fieldLoading.name }"
                  @blur="onFieldBlur('name')"
                  @keyup.enter="$event.target.blur()"
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

            <!-- Sexe -->
            <v-col cols="12" md="6">
              <div class="field-container">
                <v-select
                  v-model="editedUser.sex"
                  :items="['Homme', 'Femme', 'Autre']"
                  label="Sexe"
                  density="compact"
                  :loading="fieldLoading.sex"
                  :class="{ 'field-saving': fieldLoading.sex }"
                  @blur="onFieldBlur('sex')"
                  @update:model-value="onSelectChange('sex')"
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

            <!-- Âge -->
            <v-col cols="12" md="6">
              <div class="field-container h-100">
                <v-text-field
                  v-model.number="editedUser.age"
                  label="Âge"
                  type="number"
                  :loading="fieldLoading.age"
                  :class="{ 'field-saving': fieldLoading.age }"
                  @blur="onFieldBlur('age')"
                  @keyup.enter="$event.target.blur()"
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

            <!-- Contact -->
            <v-col cols="12">
              <div class="field-container">
                <v-text-field
                  v-model="editedUser.contact"
                  label="Contact"
                  :loading="fieldLoading.contact"
                  :class="{ 'field-saving': fieldLoading.contact }"
                  @blur="onFieldBlur('contact')"
                  @keyup.enter="$event.target.blur()"
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

            <!-- Pricing -->
            <v-col cols="12" md="6">
              <div class="field-container">
                <v-text-field
                  v-model.number="editedUser.pricing"
                  label="Tarif (€)"
                  type="number"
                  step="0.01"
                  :loading="fieldLoading.pricing"
                  :class="{ 'field-saving': fieldLoading.pricing }"
                  @blur="onFieldBlur('pricing')"
                  @keyup.enter="$event.target.blur()"
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

            <!-- Rôles -->
            <v-col cols="12" md="6">
              <div class="field-container">
                <v-select
                  v-model="editedUser.roles"
                  :items="availableRoles"
                  label="Rôles"
                  multiple
                  chips
                  :loading="fieldLoading.roles"
                  :class="{ 'field-saving': fieldLoading.roles }"
                  @blur="onFieldBlur('roles')"
                  @update:model-value="onSelectChange('roles')"
                />
                <div class="field-status">
                  <v-fade-transition>
                    <v-icon v-if="fieldLoading.roles" color="primary" class="loading-icon">
                      mdi-loading
                    </v-icon>
                  </v-fade-transition>
                </div>
              </div>
            </v-col>

            <!-- Description -->
            <v-col cols="12">
              <div class="field-container">
                <v-textarea
                  v-model="editedUser.description"
                  label="Description"
                  rows="3"
                  :loading="fieldLoading.description"
                  :class="{ 'field-saving': fieldLoading.description }"
                  @blur="onFieldBlur('description')"
                />
                <div class="field-status">
                  <v-fade-transition>
                    <v-icon v-if="fieldLoading.description" color="primary" class="loading-icon">
                      mdi-loading
                    </v-icon>
                  </v-fade-transition>
                </div>
              </div>
            </v-col>

            <!-- Legacy -->
            <v-col cols="12">
              <div class="field-container">
                <v-textarea
                  v-model="editedUser.legacy"
                  label="Legacy"
                  rows="3"
                  :loading="fieldLoading.legacy"
                  :class="{ 'field-saving': fieldLoading.legacy }"
                  @blur="onFieldBlur('legacy')"
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

            <!-- Section Password -->
            <v-col cols="12">
              <h3 class="text-white">Changer le mot de passe</h3>
            </v-col>

            <v-col cols="12">
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

            <!-- Infos read-only -->
            <v-col cols="12" md="6">
              <v-text-field :model-value="user.id" label="ID" readonly  />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                :model-value="formatDate(user.created_at)"
                label="Date de création"
                readonly

              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <TertiaryButton @click="localShow = false"> Fermer </TertiaryButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '@/plugins/axios'
import { useSnackbarStore } from '@/stores/snackbar'

const props = defineProps({
  modelValue: Boolean,
  user: Object,
})

const emit = defineEmits(['update:modelValue', 'user-updated'])

const snackbar = useSnackbarStore()

// État local
const localShow = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const editedUser = ref({})
const originalUser = ref({})
const newPassword = ref('')

// Loading pour chaque champ
const fieldLoading = ref({
  email: false,
  name: false,
  sex: false,
  age: false,
  contact: false,
  pricing: false,
  description: false,
  legacy: false,
  roles: false,
  password: false,
})

const availableRoles = ['user', 'coach', 'admin']

// Watchers
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      editedUser.value = { ...newUser }
      originalUser.value = { ...newUser }
      newPassword.value = ''

      // Reset tous les états
      Object.keys(fieldLoading.value).forEach((key) => {
        fieldLoading.value[key] = false
      })
    }
  },
  { immediate: true },
)

// Methods
const onFieldBlur = async (field) => {
  // Vérifier si la valeur a changé
  if (editedUser.value[field] === originalUser.value[field]) {
    return // Pas de changement
  }

  await saveField(field)
}

const onSelectChange = async (field) => {
  if (
    Array.isArray(editedUser.value[field]) &&
    Array.isArray(originalUser.value[field]) &&
    editedUser.value[field].length === originalUser.value[field].length &&
    editedUser.value[field].every((value, index) => value === originalUser.value[field][index])
  ) {
    return
  }
  await saveField(field)
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
    const userId = editedUser.value.id

    // Utiliser la bonne route selon le champ
    switch (field) {
      case 'email':
        response = await api.patch(`/profiles/${userId}/email`, {
          email: editedUser.value.email,
        })
        break

      case 'roles':
        response = await api.patch(`/profiles/${userId}/roles`, {
          roles: editedUser.value.roles,
        })
        break

      case 'password':
        if (newPassword.value.trim()) {
          response = await api.patch(`/profiles/${userId}/password`, {
            password: newPassword.value,
          })
          newPassword.value = '' // Reset après sauvegarde
          snackbar.success('Mot de passe mis à jour avec succès')
        }
        break

      // Pour les autres champs, utiliser la route classique
      default: {
        const updateData = {}
        updateData[field] = editedUser.value[field]

        response = await api.patch(`/profiles/${userId}`, updateData)
        break
      }
    }

    // Mettre à jour les données si on a une réponse
    if (response && response.data) {
      // Mettre à jour l'utilisateur local
      Object.assign(editedUser.value, response.data)
      originalUser.value = { ...editedUser.value }

      // Émettre la mise à jour
      emit('user-updated', editedUser.value)
    } else {
      // Si pas de réponse, juste mettre à jour les données originales
      originalUser.value[field] = editedUser.value[field]
    }
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde du champ ${field}:`, error)

    // Restaurer la valeur originale
    if (field === 'password') {
      newPassword.value = ''
    } else {
      editedUser.value[field] = originalUser.value[field]
    }

    // Afficher l'erreur
    const message =
      error.response?.data?.message || `Erreur lors de la mise à jour du ${getFieldLabel(field)}`
    snackbar.error(message)
  } finally {
    fieldLoading.value[field] = false
  }
}

const getFieldLabel = (field) => {
  const labels = {
    email: 'email',
    name: 'nom',
    sex: 'sexe',
    age: 'âge',
    contact: 'contact',
    pricing: 'tarif',
    description: 'description',
    legacy: 'legacy',
    roles: 'rôles',
    password: 'mot de passe',
  }
  return labels[field] || field
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style lang="scss" scoped>
.field-container {
  position: relative;
  display: flex;
  align-items: flex-start;
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.v-divider {
  margin: 1rem 0;
}

.user-detail-modal {
  background-color: #00231f !important;
}
</style>
