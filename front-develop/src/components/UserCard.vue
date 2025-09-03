<template>
  <v-card class="user-card" hover @click="$emit('click')">
    <v-card-text>
      <div class="user-header">
        <div class="user-info">
          <h3 class="text-white">{{ user.name }}</h3>
          <p class="user-email">{{ user.email }}</p>
        </div>

        <!-- Badges des rôles -->
        <div class="user-roles">
          <v-chip
            v-for="role in user.roles"
            :key="role"
            :color="getRoleColor(role)"
            size="small"
          >
            {{ role }}
          </v-chip>
        </div>
      </div>

      <div class="user-meta">
        <div class="meta-item">
          <v-icon size="small" color="white">mdi-calendar</v-icon>
          <span class="text-white">{{ formatDate(user.created_at) }}</span>
        </div>

        <div class="meta-item" v-if="user.sex">
          <v-icon size="small" color="white">mdi-human</v-icon>
          <span class="text-white">{{ user.sex }}</span>
        </div>

        <div class="meta-item" v-if="user.age">
          <v-icon size="small" color="white">mdi-cake</v-icon>
          <span class="text-white">{{ user.age }} ans</span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true,
  },
})

defineEmits(['click'])

const getRoleColor = (role) => {
  const colors = {
    admin: '#920002',
    coach: '#2dd4bf',
    user: '#22c55e',
  }
  return colors[role] || 'grey'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}
</script>

<style lang="scss" scoped>
.user-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.user-card:hover {
  transform: translateY(-2px);
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.user-info h3 {
  margin: 0;
  font-size: 1.1rem;
}

.user-email {
  color: color-mix(in srgb, #00231F,white 60%);
  font-size: 0.9rem;
  margin: 0.25rem 0 0 0;
}

.user-roles {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}
</style>
