<template>
  <v-dialog v-model="show" max-width="400px" persistent>
    <v-card>
      <v-card-title>
        <v-icon class="mr-2" color="white">mdi-account-group</v-icon>
        Créer un groupe
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="name" label="Nom du groupe" bg-color="white" required autofocus />
        <v-textarea class="mt-3" v-model="description" label="Description" rows="3" bg-color="white" />
      </v-card-text>
      <v-card-actions>
        <TertiaryButton @click="close">Annuler</TertiaryButton>
        <v-spacer />
        <PrimaryButton  :loading="loading" @click="submit" :disabled="!name"> Créer </PrimaryButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  loading: Boolean,
})
const emit = defineEmits(['update:modelValue', 'submit'])

const show = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (show.value = v),
)
watch(show, (v) => emit('update:modelValue', v))

const name = ref('')
const description = ref('')

function reset() {
  name.value = ''
  description.value = ''
}

function close() {
  reset()
  show.value = false
}

function submit() {
  emit('submit', { name: name.value, description: description.value })
  reset()
}
</script>
