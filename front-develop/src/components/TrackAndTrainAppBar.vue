<template>
  <v-app-bar
    :elevation="0"
    class="custom-app-bar w-100"
    :height="80"
  >
    <v-toolbar-title class="logo-container d-flex justify-center">
      <div class="logo-wrapper">
        <img
          src="../assets/image/trackAndTrain-logo.png"
          alt="Track&Train Logo"
          class="logo-image"
        />
      </div>
    </v-toolbar-title>
    <div>
      <v-btn
        v-if="authStore.userName"
        icon
        variant="text"
        class="notification-btn mr-2"
        @click="handleNotifications"
      >
        <v-icon color="white" size="24">mdi-bell-outline</v-icon>
        <v-badge
          v-if="notificationCount > 0"
          :content="notificationCount"
          color="error"
          class="notification-badge"
        >
        </v-badge>
      </v-btn>

      <template v-if="authStore.isAuthenticated">
        <v-menu
          v-model="avatarMenu"
          offset-y
          :close-on-content-click="false"
          transition="slide-y-transition"
        >
          <template #activator="{ props }">
            <v-btn
              icon
              variant="text"
              class="avatar-btn"
              v-bind="props"
              @click="toggleAvatarMenu"
            >
              <v-avatar size="40" class="user-avatar">
                <v-img
                  :src="userAvatar"
                  :alt="authStore.userName"
                  cover
                />
              </v-avatar>
            </v-btn>
          </template>

          <!-- Menu dropdown -->
          <v-card class="avatar-menu-card py-0" min-width="200">
            <v-list density="compact" nav>
              <!-- En-tête du menu avec info utilisateur -->
              <v-list-item class="user-info-item">
                <template #prepend>
                  <v-avatar size="32">
                    <v-img :src="userAvatar" :alt="authStore.userName" />
                  </v-avatar>
                </template>
                <v-list-item-title class="user-name">{{ authStore.userName }}</v-list-item-title>
                <v-list-item-subtitle class="user-email">{{ authStore.userEmail }}</v-list-item-subtitle>
              </v-list-item>

              <v-divider></v-divider>

              <!-- Option Profil -->
              <v-list-item
                @click="goToProfile"
                class="menu-item"
              >
                <template #prepend>
                  <v-icon>mdi-account-circle</v-icon>
                </template>
                <v-list-item-title>Profil</v-list-item-title>
              </v-list-item>

              <!-- Option Déconnexion -->
              <v-list-item
                @click="logout"
                class="menu-item logout-item"
              >
                <template #prepend>
                  <v-icon>mdi-logout</v-icon>
                </template>
                <v-list-item-title>Déconnexion</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>

      <!-- Bouton de connexion si non connecté -->
      <template v-else>
        <PrimaryButton
          class="login-btn"
          @click="goToLogin"
        >
          Se connecter
        </PrimaryButton>
      </template>
    </div>
  </v-app-bar>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// États
const avatarMenu = ref(false)
const notificationCount = ref(3)

const userAvatar = computed(() => {
  return authStore.user?.avatar ? authStore.user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.userName || 'User')}&background=22c55e&color=ffffff`
})

// Méthodes
const toggleAvatarMenu = () => {
  avatarMenu.value = true
}

const handleNotifications = () => {
  console.info('Ouvrir les notifications')
}

const goToProfile = () => {
  avatarMenu.value = false
  router.push({ name: 'profile' })
}

const logout = async () => {
  avatarMenu.value = false
  try {
    await authStore.logout()
    router.push({ name: 'login' })
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}

const goToLogin = () => {
  router.push({ name: 'login' })
}
</script>

<style lang="scss" scoped>
.custom-app-bar {
  background: linear-gradient(180deg, rgba(0, 188, 167, 0.15) 0%, rgba(0, 35, 31, 0.3) 100%) !important;
  margin: 0 auto !important;
  padding: 5px 20px !important;
  justify-content: center !important;
}

.logo-container {
  display: flex;
  justify-content: center !important;
}

.logo-wrapper {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  justify-content: center !important;
}


.logo-image {
  width: 20% !important;
  height: 20% !important;
  object-fit: contain !important;
}

.notification-btn {
  position: relative !important;
}

.notification-badge {
  position: absolute !important;
  top: -5px !important;
  right: -5px !important;
}

/* Avatar */
.avatar-btn {
  padding: 0 !important;
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  transition: border-color 0.3s ease !important;
}

.user-avatar:hover {
  border-color: rgba(255, 255, 255, 0.6) !important;
}

/* Menu dropdown */
.avatar-menu-card {
  margin-top: 8px !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.user-info-item {
  padding: 16px !important;
  background: linear-gradient(135deg, #22c55e, #2dd4bf) !important;
  color: white !important;
}

.user-info-item .user-name {
  font-weight: 600 !important;
  font-size: 14px !important;
  color: white !important;
}

.user-info-item .user-email {
  font-size: 12px !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

.menu-item {
  padding: 12px 16px !important;
  transition: background-color 0.2s ease !important;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
}

.logout-item:hover {
  background-color: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
}

.logout-item:hover .v-icon {
  color: #ef4444 !important;
}

/* Bouton de connexion */
.login-btn {
  border-color: rgba(255, 255, 255, 0.5) !important;
  color: #ffffff !important;
  font-weight: 500 !important;
  text-transform: none !important;
  padding: 8px 20px !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.login-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.8) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .custom-app-bar {
    padding: 5px 10px !important;
  }

  .logo-text {
    font-size: 16px !important;
  }
}
</style>
