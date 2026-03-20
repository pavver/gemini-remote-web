<template>
  <q-card 
    flat 
    bordered 
    class="setting-card transition-all"
    :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-white'"
  >
    <!-- Використовуємо column на мобілці, row на десктопі -->
    <q-item class="q-py-md column-on-mobile">
      <q-item-section class="col">
        <q-item-label class="text-weight-bold text-subtitle1">
          {{ setting.label }}
          <q-badge v-if="setting.requiresRestart" color="orange-2" text-color="orange-9" class="q-ml-sm text-weight-bold">
            <q-icon name="restart_alt" size="12px" class="q-mr-xs" /> ПЕРЕЗАПУСК
          </q-badge>
        </q-item-label>
        <q-item-label caption class="q-mt-xs text-grey-7 description-text">
          {{ setting.description || 'Опис відсутній для цього параметра.' }}
        </q-item-label>
      </q-item-section>

      <!-- Контейнер для елементів керування -->
      <q-item-section side class="control-section no-padding-mobile">
        <!-- Boolean (Toggle зазвичай добре виглядає і в рядок) -->
        <q-toggle
          v-if="setting.type === 'boolean'"
          :model-value="!!setting.value"
          @update:model-value="val => $emit('change', setting.id, val)"
          color="primary"
          size="lg"
        />

        <!-- Enum -->
        <q-select
          v-else-if="setting.type === 'enum' && setting.options"
          :model-value="setting.value"
          @update:model-value="val => $emit('change', setting.id, val.value !== undefined ? val.value : val)"
          :options="setting.options"
          dense
          outlined
          emit-value
          map-options
          class="full-width-mobile min-width-200"
        />

        <!-- Number -->
        <q-input
          v-else-if="setting.type === 'number'"
          :model-value="String(setting.value)"
          @update:model-value="val => $emit('change', setting.id, Number(val))"
          type="number"
          dense
          outlined
          class="full-width-mobile width-100"
        />

        <!-- String -->
        <q-input
          v-else-if="setting.type === 'string'"
          :model-value="String(setting.value)"
          @update:model-value="val => $emit('change', setting.id, val)"
          dense
          outlined
          class="full-width-mobile min-width-250"
        />

        <!-- Unsupported -->
        <div v-else class="text-caption text-grey-5 italic q-mt-sm-mobile">
          JSON/Array (лише читання)
        </div>
      </q-item-section>
    </q-item>
  </q-card>
</template>

<script setup lang="ts">
import type { RemoteSettingDefinition } from '../../types/protocol';

defineProps<{
  setting: RemoteSettingDefinition;
}>();

defineEmits(['change']);
</script>

<style scoped>
.setting-card {
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
}

.body--dark .setting-card {
  border-color: rgba(255,255,255,0.05);
}

.setting-card:hover {
  border-color: rgba(var(--q-primary), 0.3);
}

.min-width-200 { min-width: 200px; }
.min-width-250 { min-width: 250px; }
.width-100 { width: 100px; }

.description-text {
  max-width: 550px;
}

@media (max-width: 599px) {
  .column-on-mobile {
    flex-direction: column !important;
    align-items: flex-start !important;
  }
  
  .control-section {
    width: 100%;
    margin-top: 16px;
    padding-left: 0 !important;
  }
  
  .full-width-mobile {
    width: 100% !important;
    min-width: 100% !important;
  }
  
  .no-padding-mobile {
    padding: 0 !important;
  }
  
  .q-mt-sm-mobile {
    margin-top: 8px;
  }
}

.transition-all {
  transition: all 0.2s ease;
}
</style>
