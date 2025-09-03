<template>
  <v-container class="groups-coach-page">
    <div class="title-container d-flex align-center">
      <h1 class="my-4">Mes groupes existants</h1>
      <PrimaryButton class="ml-2" :disabled="!canCreateGroup" @click="openDialog">
        <v-icon >mdi-plus</v-icon>
      </PrimaryButton>
    </div>

    <div v-if="groupsStore.loading" class="text-center py-8">
      <v-progress-circular size="48" indeterminate color="primary" />
    </div>

    <v-alert v-if="groupsStore.fetchError" type="error" class="mb-4">
      {{ groupsStore.fetchError }}
    </v-alert>

    <!-- Empty State -->
    <div v-else-if="!groupsStore.hasGroups" class="empty-state text-center py-10">
      <v-icon size="60" color="grey lighten-1">mdi-account-group</v-icon>
      <h3 class="text-h6 mt-3">Vous n'avez pas encore de groupes coachés</h3>
      <p class="text-body-2 mb-4">Créez votre premier groupe pour commencer à coacher !</p>
      <v-tooltip v-if="!canCreateGroup">
        <template #activator="{ on, attrs }">
          <span>
            <PrimaryButton
              @click="openDialog"
              :disabled="!canCreateGroup"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon left>mdi-plus</v-icon>
              Créer un groupe
            </PrimaryButton>
          </span>
        </template>
        <span>Seul le propriétaire peut créer un groupe ici</span>
      </v-tooltip>
      <PrimaryButton v-else @click="openDialog">
        <v-icon left>mdi-plus</v-icon>
        Créer un groupe
      </PrimaryButton>
    </div>

    <!-- Grille des groupes -->
    <v-row v-else class="mt-2" dense>
      <v-col v-for="group in groupsStore.groups" :key="group.id" cols="12" sm="6" md="4" lg="3">
        <GroupCard :group="group" />
      </v-col>
    </v-row>

    <!-- Dialog création de groupe -->
    <GroupCreateDialog v-model="dialog" :loading="groupsStore.loading" @submit="createGroup" />
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGroupsStore } from '@/stores/groups'
import GroupCard from '@/components/GroupCard.vue'
import GroupCreateDialog from '@/components/GroupCreateDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useSnackbarStore } from '@/stores/snackbar'

const route = useRoute()
const groupsStore = useGroupsStore()
const authStore = useAuthStore()
const snackbarStore = useSnackbarStore()
const dialog = ref(false)

// ownerId de l'URL ou user connecté
const ownerId = computed(() => route.params.ownerId || authStore.userId)
// Peut-on créer un groupe ? (UUID connecté === UUID de l'URL)
const canCreateGroup = computed(() => authStore.userId === ownerId.value)

function openDialog() {
  dialog.value = true
}
async function createGroup({ name, description }) {
  try {
    await groupsStore.createGroup({ name, description })
    snackbarStore.success('Groupe créé avec succès !')
    dialog.value = false
  } catch (err) {
    snackbarStore.error('Erreur lors de la création du groupe.')
  }
}

onMounted(() => {
  if (ownerId.value) groupsStore.fetchGroups(ownerId.value)
})
onUnmounted(() => {
  groupsStore.reset()
})
</script>
