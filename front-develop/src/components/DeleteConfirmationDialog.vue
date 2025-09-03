<template>
  <v-dialog v-model="dialog" max-width="400px" persistent>
    <v-card class="delete-card">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="#920002">mdi-alert-circle</v-icon>
        <span class="text-h6 text-white">Confirmer la suppression</span>
      </v-card-title>
      <v-card-text class="pt-4">
        <div class="text-center">
          <v-icon size="64" color="#920002" class="mb-3">mdi-delete-forever</v-icon>
          <p class="text-body-1 mb-2 text-white">Êtes-vous sûr de vouloir supprimer cette validation ?</p>
          <p class="text-body-2 text-grey">
            Cette action est irréversible et supprimera définitivement les données de cette session.
          </p>
        </div>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer />
        <TertiaryButton @click="cancel" :disabled="loading"> Annuler </TertiaryButton>
        <PrimaryButton prepend-icon="mdi-delete" @click="confirm" :loading="loading">
          Supprimer
        </PrimaryButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
  dialog.value = false
}
</script>

<style lang="scss" scoped>
.delete-card {
  background-color: #00231f !important;
}
</style>
