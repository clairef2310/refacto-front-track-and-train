<template>
  <v-card class="coach-card" hover>
    <v-card-title>
      {{ name }}
    </v-card-title>
    <v-card-text>
      <p class="text-body-2">{{ description }}</p>
    </v-card-text>
    <v-card-actions>
      <PrimaryButton  @click="selectCoach"> Choisir ce coach </PrimaryButton>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    default: null,
  },
})

const router = useRouter()

const selectCoach = () => {
  if (props.id) {
    router.push(`/coach/${props.id}`)
  }
}
</script>

<style lang="scss" scoped>
.coach-card {
  min-width: 300px;
  max-width: 400px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.coach-card:hover {
  transform: translateY(-4px);
}
</style>
