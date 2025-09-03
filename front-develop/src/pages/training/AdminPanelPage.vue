<template>
  <div class="admin-panel">
    <h1>Panel Administrateur</h1>

    <div class="stats-cards">
      <v-card class="stat-card">
        <v-card-text>
          <div class="stat-number">{{ users.length }}</div>
          <div class="stat-label">Utilisateurs total</div>
        </v-card-text>
      </v-card>

      <v-card class="stat-card">
        <v-card-text>
          <div class="stat-number">{{ coaches.length }}</div>
          <div class="stat-label">Coachs</div>
        </v-card-text>
      </v-card>
    </div>

    <div class="users-section">
      <h2 class="text-white">Gestion des utilisateurs</h2>

      <v-text-field
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        label="Rechercher un utilisateur..."
        clearable
        class="mb-4"
      />

      <div class="users-grid">
        <UserCard
          v-for="user in filteredUsers"
          :key="user.id"
          :user="user"
          @click="openUserModal(user)"
        />
      </div>
    </div>

    <UserDetailModal v-model="showModal" :user="selectedUser" @user-updated="handleUserUpdate" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/plugins/axios'
import { useSnackbarStore } from '@/stores/snackbar'
import UserCard from '@/components/UserCard.vue'
import UserDetailModal from '@/components/UserDetailModal.vue'

const snackbar = useSnackbarStore()

const users = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showModal = ref(false)
const selectedUser = ref(null)

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(
    (user) => user.email.toLowerCase().includes(query) || user.name?.toLowerCase().includes(query),
  )
})

const coaches = computed(() => users.value.filter((user) => user.roles?.includes('coach')))

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/profiles/users')
    users.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
    snackbar.error('Erreur lors du chargement des utilisateurs')
  } finally {
    loading.value = false
  }
}

const openUserModal = (user) => {
  selectedUser.value = user
  showModal.value = true
}

const handleUserUpdate = (updatedUser) => {
  const index = users.value.findIndex((u) => u.id === updatedUser.id)
  if (index !== -1) {
    users.value[index] = updatedUser
  }
  snackbar.success('Utilisateur mis à jour avec succès')
}

onMounted(() => {
  fetchUsers()
})
</script>

<style lang="scss" scoped>
.admin-panel {
  padding: 2rem;
}

.stats-cards {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  flex: 1;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
}

.stat-label {
  color: #666;
  margin-top: 0.5rem;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
</style>
