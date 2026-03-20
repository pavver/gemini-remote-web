<template>
  <div class="welcome-screen column flex-center text-center q-pa-xl">
    <div class="welcome-card row flex-center rounded-borders q-pa-xl shadow-1">
      <q-icon name="auto_awesome" size="100px" color="primary" class="q-mb-lg floating-icon" />
      <div class="text-h3 text-weight-bold q-mb-md font-exo">Gemini CLI</div>
      <div class="text-subtitle1 text-grey-7 q-mb-xl max-width-600">
        Ваш інтелектуальний помічник у терміналі, тепер з веб-панеллю. Керуйте сесіями, використовуйте інструменти та автоматизуйте рутину.
      </div>
      
      <div class="row q-gutter-md flex-center">
        <q-card v-for="tip in tips" :key="tip.title" class="tip-card bg-transparent shadow-0 border-thin col-12 col-sm-5">
          <q-card-section>
            <q-icon :name="tip.icon" size="sm" color="primary" class="q-mb-xs" />
            <div class="text-weight-bold">{{ tip.title }}</div>
            <div class="text-caption text-grey-6">{{ tip.desc }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tips = [
  { icon: 'code', title: 'Робота з кодом', desc: 'Пишіть, виправляйте та аналізуйте код у різних папках.' },
  { icon: 'settings', title: 'Інструменти', desc: 'Дозволяйте агенту доступ до файлів, мережі та MCP.' },
  { icon: 'hub', title: 'Мульти-сесії', desc: 'Перемикайтеся між різними проектами миттєво.' },
  { icon: 'dark_mode', title: 'Темна тема', desc: 'Комфортна робота вдень та вночі.' }
];
</script>

<style scoped>
.welcome-screen {
  min-height: 70vh;
}

.welcome-card {
  max-width: 800px;
  width: 100%;
}

.max-width-600 {
  max-width: 600px;
}

.tip-card {
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}

.body--dark .tip-card {
  border-color: rgba(255,255,255,0.05);
}

.tip-card:hover {
  background: rgba(var(--q-primary), 0.05) !important;
  transform: translateY(-4px);
}

.floating-icon {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.border-thin {
  border: 1px solid rgba(var(--q-primary), 0.1);
}

.font-exo {
  font-family: 'Exo 2', sans-serif;
}
</style>
