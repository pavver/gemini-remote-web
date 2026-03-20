<template>
  <q-dialog v-model="isOpen" persistent maximized transition-show="fade" transition-hide="fade">
    <q-card :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-grey-1 text-black'" class="column no-wrap">
      
      <!-- Header with Tabs -->
      <q-header elevated :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-white text-primary'">
        <q-toolbar>
          <q-btn flat round dense icon="settings" />
          <q-toolbar-title class="font-exo text-weight-bold">
            Налаштування Gemini CLI
          </q-toolbar-title>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup>
            <q-tooltip>Закрити</q-tooltip>
          </q-btn>
        </q-toolbar>

        <!-- Global Tabs (Scrollable) -->
        <q-tabs
          v-model="activeTab"
          dense
          no-caps
          outside-arrows
          mobile-arrows
          class="text-primary border-top"
          active-color="primary"
          indicator-color="primary"
          align="left"
        >
          <q-tab v-for="cat in categories" :key="cat" :name="cat" :label="cat" class="q-px-md" />
        </q-tabs>
      </q-header>

      <div class="col column overflow-hidden content-container">
        <!-- Settings Content -->
        <q-scroll-area class="col">
          <div class="settings-content-wrapper mx-auto">
            
            <div v-if="loading && !categories.length" class="flex flex-center q-pa-xl" style="height: 50vh">
              <q-spinner-cube color="primary" size="60px" />
            </div>

            <div v-else-if="!categories.length" class="text-center q-pa-xl text-grey-6" style="height: 50vh">
              <q-icon name="search_off" size="64px" class="q-mb-md" />
              <div class="text-h6">Налаштування не завантажені</div>
              <q-btn unelevated color="primary" label="Оновити" icon="refresh" class="q-mt-md" @click="loadSettings" />
            </div>

            <div v-else class="q-py-md">
              <div class="header-section q-mb-lg row items-end no-wrap">
                <div class="column">
                  <div class="text-h4 text-weight-bold mobile-title">{{ activeTab }}</div>
                  <div class="text-caption text-grey-6">Параметри розділу {{ activeTab }}</div>
                </div>
                <q-space />
                <q-badge v-if="settingsHash" outline color="grey-7" class="q-pa-xs gt-xs">
                  v.{{ settingsHash.slice(0, 8) }}
                </q-badge>
              </div>

              <q-list class="settings-list q-gutter-y-md">
                <setting-item-card 
                  v-for="setting in currentSettings" 
                  :key="setting.id" 
                  :setting="setting"
                  @change="onSettingChange"
                />
              </q-list>
            </div>
          </div>
        </q-scroll-area>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
import { useGeminiStore } from '../../stores/gemini';
import { storeToRefs } from 'pinia';
import SettingItemCard from './SettingItemCard.vue';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const store = useGeminiStore();
const { settings, settingsHash } = storeToRefs(store);

const loading = ref(false);
const activeTab = ref('Загальні');
const lastSentHash = ref<string | null>(null);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const categories = computed(() => {
  const cats = new Set<string>();
  if (settings.value.length === 0) return [];
  settings.value.forEach(s => cats.add(s.category || 'Загальні'));
  return Array.from(cats).sort();
});

const currentSettings = computed(() => {
  return settings.value.filter(s => (s.category || 'Загальні') === activeTab.value);
});

function loadSettings() {
  loading.value = true;
  store.loadSettings();
  setTimeout(() => { loading.value = false; }, 1200);
}

function onSettingChange(id: string, value: unknown) {
  const newHash = crypto.randomUUID();
  lastSentHash.value = newHash;
  store.updateSetting(id, value, newHash);
}

watch(categories, (newCats) => {
  if (newCats.length > 0 && (!activeTab.value || !newCats.includes(activeTab.value))) {
    const first = newCats[0];
    if (first) activeTab.value = first;
  }
});

watch(isOpen, (val) => {
  if (val) {
    store.subscribe(['state:session:settings:hash']);
    loadSettings();
  } else {
    store.unsubscribe(['state:session:settings:hash']);
    store.clearSettings();
    lastSentHash.value = null;
  }
}, { immediate: true });

watch(settingsHash, (newHash) => {
  if (newHash && newHash !== lastSentHash.value && isOpen.value) {
    loadSettings();
  }
});

onUnmounted(() => {
  if (isOpen.value) {
    store.unsubscribe(['state:session:settings:hash']);
    store.clearSettings();
  }
});
</script>

<style scoped>
.content-container {
  margin-top: 86px; /* Висота Toolbar (50px) + Tabs (36px) */
}

.border-top {
  border-top: 1px solid rgba(0,0,0,0.05);
}

.body--dark .border-top {
  border-color: rgba(255,255,255,0.05);
}

.settings-content-wrapper {
  padding: 32px;
  max-width: 900px;
  width: 100%;
}

@media (max-width: 599px) {
  .settings-content-wrapper {
    padding: 16px;
  }
  
  .mobile-title {
    font-size: 24px;
  }
}

.font-exo {
  font-family: 'Exo 2', sans-serif;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.header-section {
  width: 100%;
}

:deep(.q-tab__indicator) {
  height: 3px;
  border-radius: 3px 3px 0 0;
}
</style>
