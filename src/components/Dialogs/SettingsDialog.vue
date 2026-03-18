<template>
  <q-dialog v-model="isOpen" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="bg-grey-10 text-white">
      <q-bar class="bg-primary">
        <q-icon name="settings" />
        <div>Налаштування Gemini CLI</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Закрити</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section class="q-pa-none" style="height: calc(100vh - 32px)">
        <q-scroll-area class="fit">
          <div class="q-pa-md">
            <div v-if="loading && !categories.length" class="flex flex-center q-pa-xl">
              <q-spinner-dots color="primary" size="40px" />
            </div>

            <div v-else-if="!categories.length" class="text-center q-pa-xl text-grey-8">
              <q-icon name="warning" size="48px" />
              <div class="text-h6">Налаштування не знайдені</div>
              <q-btn flat color="primary" label="Спробувати ще раз" @click="loadSettings" />
            </div>

            <div v-else>
              <div v-for="category in categories" :key="category" class="q-mb-lg">
                <div class="text-h6 q-mb-md text-primary">{{ category }}</div>
                <q-list bordered separator class="bg-white text-black rounded-borders">
                  <q-item v-for="setting in getSettingsByCategory(category)" :key="setting.id" class="q-py-md">
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{ setting.label }}</q-item-label>
                      <q-item-label caption v-if="setting.description">{{ setting.description }}</q-item-label>
                      <q-item-label caption v-if="setting.requiresRestart" color="orange" class="text-orange-9">
                        <q-icon name="restart_alt" size="xs" /> Потрібен перезапуск
                      </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <!-- Boolean -->
                      <q-toggle
                        v-if="setting.type === 'boolean'"
                        :model-value="setting.value"
                        @update:model-value="val => onSettingChange(setting.id, val)"
                        color="primary"
                      />

                      <!-- Enum / Options -->
                      <q-select
                        v-else-if="setting.type === 'enum' && setting.options"
                        :model-value="setting.value"
                        @update:model-value="val => onSettingChange(setting.id, val.value !== undefined ? val.value : val)"
                        :options="setting.options"
                        dense
                        outlined
                        emit-value
                        map-options
                        style="min-width: 200px"
                      />

                      <!-- Number -->
                      <q-input
                        v-else-if="setting.type === 'number'"
                        :model-value="setting.value as any"
                        @update:model-value="val => onSettingChange(setting.id, Number(val))"
                        type="number"
                        dense
                        outlined
                        style="width: 100px"
                      />

                      <!-- String -->
                      <q-input
                        v-else-if="setting.type === 'string'"
                        :model-value="setting.value as any"
                        @update:model-value="val => onSettingChange(setting.id, val)"
                        dense
                        outlined
                        style="min-width: 250px"
                      />

                      <!-- Other (JSON/Array) -->
                      <div v-else class="text-caption text-grey-6">
                        Зміна через API поки не підтримується
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </div>
        </q-scroll-area>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useGeminiStore } from 'src/stores/gemini';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const store = useGeminiStore();
const { settings, settingsHash } = storeToRefs(store);

const loading = ref(false);
const lastSentHash = ref<string | null>(null);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const categories = computed(() => {
  const cats = new Set<string>();
  settings.value.forEach(s => cats.add(s.category || 'Загальні'));
  return Array.from(cats).sort();
});

function getSettingsByCategory(cat: string) {
  return settings.value.filter(s => (s.category || 'Загальні') === cat);
}

function loadSettings() {
  loading.value = true;
  store.loadSettings();
  // We wait for the message to come back via handleMessage in the store
  setTimeout(() => { loading.value = false; }, 1000);
}

function onSettingChange(id: string, value: unknown) {
  const newHash = crypto.randomUUID();
  lastSentHash.value = newHash;
  store.updateSetting(id, value, newHash);
}

// Watch for dialog open/close to manage subscriptions
watch(isOpen, (val) => {
  if (val) {
    store.subscribe(['state:session:settings:hash']);
  } else {
    store.unsubscribe(['state:session:settings:hash']);
    store.clearSettings();
    lastSentHash.value = null;
  }
}, { immediate: true });

// Watch for external settings changes
watch(settingsHash, (newHash) => {
  // Trigger load if hash arrives/changes and we didn't just send it ourselves
  if (newHash && newHash !== lastSentHash.value && isOpen.value) {
    console.log('Settings hash updated, loading data...');
    loadSettings();
  }
});

onMounted(() => {
  // Logic handled by immediate watch(isOpen)
});

onUnmounted(() => {
  if (isOpen.value) {
    store.unsubscribe(['state:session:settings:hash']);
    store.clearSettings();
  }
});
</script>
