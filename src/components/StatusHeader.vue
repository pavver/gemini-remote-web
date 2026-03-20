<template>
  <q-header 
    elevated 
    :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-white text-grey-9'" 
    height-hint="60"
  >
    <q-toolbar class="q-px-md" style="min-height: 60px">
      <q-btn flat dense round icon="menu" @click="$emit('toggle-left')" class="q-mr-sm" />
      
      <q-toolbar-title class="row items-center no-wrap">
        <div class="text-weight-bold text-h6 q-mr-sm">Gemini CLI</div>
        <q-badge v-if="gemini.activeModel" outline color="primary" class="gt-xs q-px-sm">
          {{ gemini.activeModel }}
        </q-badge>
      </q-toolbar-title>

      <q-space />

      <!-- Системні метрики (тільки для десктопа/планшета) -->
      <div v-if="gemini.isConnected" class="gt-sm row items-center q-gutter-x-md q-mr-lg">
        <div class="row items-center text-caption text-grey-7">
          <q-icon name="memory" size="16px" class="q-mr-xs" />
          {{ gemini.ramUsage || '0 MB' }}
        </div>
        
        <q-separator vertical inset :dark="$q.dark.isActive" />

        <div class="column justify-center" style="min-width: 120px">
          <div class="row items-center justify-between text-caption text-grey-7 q-mb-xs">
            <q-icon name="toll" size="14px" />
            <span>{{ formatNumber(gemini.tokens.total) }} / {{ formatNumber(gemini.tokensLimit) }}</span>
          </div>
          <q-linear-progress 
            :value="gemini.tokens.total / gemini.tokensLimit" 
            size="4px" 
            rounded 
            color="primary" 
            track-color="grey-4"
          />
        </div>
      </div>

      <div class="row items-center q-gutter-x-sm">
        <!-- Налаштування інтерфейсу -->
        <q-btn flat round dense icon="tune" color="grey-7">
          <q-tooltip>Налаштування інтерфейсу</q-tooltip>
          <q-menu :dark="$q.dark.isActive" style="min-width: 200px">
            <q-list padding>
              <q-item-label header>Відображення</q-item-label>
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>Думки моделі</q-item-label>
                  <q-item-label caption>Показувати процес мислення в чаті</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle 
                    :model-value="gemini.uiSettings.showThoughts" 
                    @update:model-value="gemini.toggleUIPreference('showThoughts')"
                    color="primary" 
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <!-- Перемикач теми -->
        <q-btn 
          flat 
          round 
          dense 
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" 
          @click="$q.dark.toggle()"
          :color="$q.dark.isActive ? 'amber' : 'grey-7'"
        >
          <q-tooltip>{{ $q.dark.isActive ? 'Світла тема' : 'Темна тема' }}</q-tooltip>
        </q-btn>

        <!-- Налаштування -->
        <q-btn 
          flat 
          round 
          dense 
          icon="settings" 
          color="grey-7"
          @click="$emit('open-settings')"
        >
          <q-tooltip>Системні налаштування</q-tooltip>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useGeminiStore } from '../stores/gemini';

const $q = useQuasar();
const gemini = useGeminiStore();

defineEmits(['toggle-left', 'open-settings']);

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}
</script>
