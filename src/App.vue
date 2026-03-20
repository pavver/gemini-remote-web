<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { watch, onMounted } from 'vue';

const $q = useQuasar();
const THEME_KEY = 'gemini_ui_theme';

onMounted(() => {
  // Завантажуємо збережену тему
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    $q.dark.set(savedTheme === 'dark');
  } else {
    // Якщо немає збереженої, використовуємо системну
    $q.dark.set('auto');
  }
});

// Слідкуємо за змінами теми та зберігаємо їх
watch(() => $q.dark.isActive, (val) => {
  localStorage.setItem(THEME_KEY, val ? 'dark' : 'light');
});
</script>
