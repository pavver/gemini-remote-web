<template>
  <div v-if="gemini.currentThought" class="current-thought-container q-pa-md transition-fade">
    <div class="column q-gutter-y-sm">
      <div class="row items-center q-gutter-x-sm text-indigo-7">
        <q-icon name="psychology" size="20px" />
        <div class="text-overline text-weight-bold">{{ gemini.currentThought.subject }}</div>
      </div>
      <q-card flat bordered class="thought-bubble bg-indigo-1 border-indigo-2">
        <q-card-section class="q-pa-sm text-caption text-indigo-10">
          {{ gemini.currentThought.summary }}
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGeminiStore } from '../../stores/gemini';

const gemini = useGeminiStore();
</script>

<style scoped>
.thought-bubble {
  border-radius: 12px;
  border: 1px solid #c5cae9;
}
.transition-fade {
  animation: fadeIn 0.3s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
