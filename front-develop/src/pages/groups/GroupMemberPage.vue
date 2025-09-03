<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <v-btn icon @click="router.back()"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <h1 class="text-h5 ml-2">Membres du groupe</h1>
    </div>
    <v-tabs v-model="activeTab" color="#f97316" class="mb-4">
      <v-tab value="members" base-color="white">
        <v-icon left>mdi-account-multiple</v-icon>
        Suivis ({{ groupMembers.length }})
      </v-tab>
      <v-tab value="users" base-color="white">
        <v-icon left>mdi-account-plus</v-icon>
        Utilisateurs ({{ filteredAllUsers.length }})
      </v-tab>
    </v-tabs>
    <v-window v-model="activeTab">
      <v-window-item value="members">
        <v-text-field
          v-model="filter"
          label="Filtrer les membres"
          prepend-inner-icon="mdi-magnify"
          class="mb-4"
          clearable
        />
        <v-alert v-if="errorMembers" type="error" class="mb-4">{{ errorMembers }}</v-alert>
        <v-list
          v-infinite-scroll="loadMoreMembers"
          :infinite-scroll-disabled="allLoadedMembers"
          class="member-list"
        >
          <v-list-item v-for="user in filteredGroupMembers" :key="user.id" class="member-list-item">
            <v-list-item-content>
              <v-list-item-title>{{ user.name }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action class="d-flex gap-2">
              <PrimaryButton
                prepend-icon="mdi-account-arrow-right"
                size="small"
                @click="viewProfile(user.id)"
              >
                Voir profil
                <v-icon right size="small"></v-icon>
              </PrimaryButton>
              <DeleteButton
                color="error"
                size="small"
                :loading="loadingRemoveUser[user.id]"
                @click="openRemoveUserDialog(user)"
              >
                <v-icon left size="small">mdi-minus</v-icon>
                Retirer
              </DeleteButton>
            </v-list-item-action>
          </v-list-item>
          <v-list-item v-if="loadingMembers">
            <v-progress-circular indeterminate color="primary" size="24" />
          </v-list-item>
          <v-list-item v-if="!loadingMembers && filteredGroupMembers.length === 0">
            <span class="text-grey">Aucun membre trouvé.</span>
          </v-list-item>
        </v-list>
      </v-window-item>

      <v-window-item value="users">
        <v-text-field
          v-model="filterUsers"
          label="Filtrer les utilisateurs"
          prepend-icon="mdi-magnify"
          class="mb-4"
          clearable
        />
        <v-alert v-if="errorUsers" type="error" class="mb-4">{{ errorUsers }}</v-alert>
        <v-list
          v-infinite-scroll="loadMoreUsers"
          :infinite-scroll-disabled="allLoadedUsers"
          class="member-list"
        >
          <v-list-item v-for="user in filteredAllUsers" :key="user.id" class="member-list-item">
            <v-list-item-content>
              <v-list-item-title> {{ user.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <PrimaryButton
                size="small"
                prepend-icon="mdi-plus"
                :disabled="isUserInGroup(user.id) || loadingAddUser[user.id]"
                :loading="loadingAddUser[user.id]"
                @click="addUserToGroup(user.id)"
              >
                Ajouter
              </PrimaryButton>
            </v-list-item-action>
          </v-list-item>
          <v-list-item v-if="loadingUsers">
            <v-progress-circular indeterminate color="primary" size="24" />
          </v-list-item>
          <v-list-item v-if="!loadingUsers && filteredAllUsers.length === 0">
            <span class="text-grey">Aucun utilisateur trouvé.</span>
          </v-list-item>
        </v-list>
      </v-window-item>
    </v-window>

    <!-- Modal de confirmation pour retirer un utilisateur -->
    <v-dialog v-model="removeUserDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="error">mdi-account-minus</v-icon>
          Retirer du groupe
        </v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir retirer <strong>{{ selectedUserToRemove?.name }}</strong> du
          groupe ? <br /><br />
          Cette action est irréversible.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <TertiaryButton @click="removeUserDialog = false">Annuler</TertiaryButton>
          <DeleteButton
            color="error"
            :loading="loadingRemoveUser[selectedUserToRemove?.id]"
            @click="confirmRemoveUser"
          >
            Retirer
          </DeleteButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/plugins/axios'
import { useSnackbarStore } from '@/stores/snackbar'

const route = useRoute()
const router = useRouter()
const snackbarStore = useSnackbarStore()
const groupId = route.params.groupId

const groupMembers = ref([])
const filter = ref('')
const errorMembers = ref(null)
const loadingMembers = ref(false)
const pageMembers = ref(1)
const perPage = 20
const allLoadedMembers = ref(false)

const allUsers = ref([])
const filterUsers = ref('')
const errorUsers = ref(null)
const loadingUsers = ref(false)
const pageUsers = ref(1)
const allLoadedUsers = ref(false)
const loadingAddUser = ref({})

// Variables pour la suppression
const loadingRemoveUser = ref({})
const removeUserDialog = ref(false)
const selectedUserToRemove = ref(null)

const activeTab = ref('members')

async function fetchMembers(pageNum) {
  loadingMembers.value = true
  errorMembers.value = null
  try {
    const resp = await api.get(`/groups/${groupId}/members`, {
      params: { page: pageNum, perPage },
    })
    if (Array.isArray(resp.data) && resp.data.length) {
      groupMembers.value.push(...resp.data)
      if (resp.data.length < perPage) allLoadedMembers.value = true
    } else {
      allLoadedMembers.value = true
    }
  } catch (e__) {
    errorMembers.value = 'Erreur lors du chargement des membres.'
  } finally {
    loadingMembers.value = false
  }
}

function loadMoreMembers() {
  if (!allLoadedMembers.value && !loadingMembers.value) {
    pageMembers.value++
    fetchMembers(pageMembers.value)
  }
}

const filteredGroupMembers = computed(() => {
  const f = filter.value.trim().toLowerCase()
  if (!f) return groupMembers.value
  return groupMembers.value.filter((u) => u.name?.toLowerCase().includes(f))
})

async function fetchAllUsers(pageNum) {
  loadingUsers.value = true
  errorUsers.value = null
  try {
    const resp = await api.get(`/profiles/users`, {
      params: { page: pageNum, perPage },
    })
    if (Array.isArray(resp.data) && resp.data.length) {
      allUsers.value.push(...resp.data)
      if (resp.data.length < perPage) allLoadedUsers.value = true
    } else {
      allLoadedUsers.value = true
    }
  } catch (e) {
    errorUsers.value = 'Erreur lors du chargement des utilisateurs.'
  } finally {
    loadingUsers.value = false
  }
}

function loadMoreUsers() {
  if (!allLoadedUsers.value && !loadingUsers.value) {
    pageUsers.value++
    fetchAllUsers(pageUsers.value)
  }
}

const filteredAllUsers = computed(() => {
  const f = filterUsers.value.trim().toLowerCase()
  if (!f) return allUsers.value
  return allUsers.value.filter(
    (u) => u.name?.toLowerCase().includes(f) || u.email?.toLowerCase().includes(f),
  )
})

function isUserInGroup(id) {
  return groupMembers.value.some((u) => u.id === id)
}

const allUsersById = computed(() => {
  const map = new Map()
  allUsers.value.forEach((u) => map.set(u.id, u))
  return map
})

async function addUserToGroup(userId) {
  loadingAddUser.value[userId] = true
  try {
    await api.post(`/groups/${groupId}/members/${userId}`)
    const user = allUsersById.value.get(userId)
    if (user && !isUserInGroup(userId)) {
      groupMembers.value.push(user)
    }
    snackbarStore.success('Utilisateur ajouté au groupe !')
  } catch (e) {
    console.error("Erreur lors de l'ajout:", e)
    snackbarStore.error("Erreur lors de l'ajout de l'utilisateur.")
  } finally {
    loadingAddUser.value[userId] = false
  }
}

function openRemoveUserDialog(user) {
  selectedUserToRemove.value = user
  removeUserDialog.value = true
}

async function confirmRemoveUser() {
  if (!selectedUserToRemove.value) return

  const userId = selectedUserToRemove.value.id
  loadingRemoveUser.value[userId] = true

  try {
    await api.delete(`/groups/${groupId}/members/${userId}`)

    // Retirer l'utilisateur de la liste des membres
    groupMembers.value = groupMembers.value.filter((member) => member.id !== userId)

    snackbarStore.success(`${selectedUserToRemove.value.name} a été retiré du groupe !`)

    // Fermer la modal et réinitialiser
    removeUserDialog.value = false
    selectedUserToRemove.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    snackbarStore.error("Erreur lors de la suppression de l'utilisateur du groupe.")
  } finally {
    loadingRemoveUser.value[userId] = false
  }
}

function viewProfile(userId) {
  router.push(`/profiles/${userId}`)
}

onMounted(() => {
  groupMembers.value = []
  allUsers.value = []
  pageMembers.value = 1
  pageUsers.value = 1
  allLoadedMembers.value = false
  allLoadedUsers.value = false
  fetchMembers(1)
  fetchAllUsers(1)
})
</script>

<style lang="scss" scoped>
.member-list-item {
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.member-list {
  max-height: 600px;
  overflow-y: auto;
  background-color: #ffffff1a;
  border-radius: 7px;
  padding-inline: 8px;
}

.d-flex.gap-2 {
  gap: 8px;
}

.v-list-item-title {
  color: #fff;
}
</style>
