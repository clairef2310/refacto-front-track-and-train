<template>
  <v-dialog v-model="show" max-width="500">
    <v-card class="task-dialog">
      <v-card-title>
        <span class="text-h6">Créer un nouvel exercice</span>
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="exercise_name" label="Nom de l'exercice" required />
        <v-text-field
          v-model.number="rest_time"
          label="Temps de repos (min)"
          type="number"
          required
        />
        <v-text-field v-model.number="repetitions" label="Répétitions" type="number" required />
        <v-text-field v-model.number="set_number" label="Nombre de séries" type="number" required />
        <v-select v-model="method" label="Méthode" :items="methodOptions" required />
        <v-text-field v-model.number="rir" label="RIR" type="number" required />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <TertiaryButton @click="close">Annuler</TertiaryButton>
        <PrimaryButton :loading="loading" @click="submit">Créer</PrimaryButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue', 'created'])

const show = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (show.value = v),
)
watch(show, (v) => emit('update:modelValue', v))

const methodOptions = ['Standard', 'Superset', 'Drop set', 'Rest-pause', 'Pyramide']

const exercise_name = ref('')
const rest_time = ref(2)
const repetitions = ref(10)
const set_number = ref(4)
const method = ref('Standard')
const rir = ref(3)
const loading = ref(false)

function close() {
  show.value = false
  exercise_name.value = ''
  rest_time.value = 2
  repetitions.value = 10
  set_number.value = 4
  method.value = 'Standard'
  rir.value = 3
}

async function submit() {
  if (!exercise_name.value || !method.value) {
    return
  }

  loading.value = true

  const payload = {
    exercise_name: exercise_name.value,
    rest_time: rest_time.value,
    repetitions: repetitions.value,
    set_number: set_number.value,
    method: method.value,
    rir: rir.value,
  }

  emit('created', payload)

  await nextTick()
  loading.value = false
  close()
}
</script>

<style lang="scss" scoped>
.task-dialog {
  background-color: #00231f;
  color: white;
}
</style>
