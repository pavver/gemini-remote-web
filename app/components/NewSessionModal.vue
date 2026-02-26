<script setup lang="ts">
const isOpen = defineModel<boolean>({ default: false });
const props = defineProps<{
  loading?: boolean
}>();
const emit = defineEmits(['submit']);

const path = ref('');
const recentPaths = ref<string[]>([]);

onMounted(() => {
  const saved = localStorage.getItem('gemini_recent_paths');
  if (saved) {
    recentPaths.value = JSON.parse(saved);
    if (recentPaths.value.length > 0) {
      const firstPath = recentPaths.value[0];
      if (firstPath) {
        path.value = firstPath;
      }
    }
  } else {
    path.value = '/home/radxa/gemini';
  }
});

function handleSubmit() {
  if (!path.value || props.loading) return;
  
  const updated = [path.value, ...recentPaths.value.filter(p => p !== path.value)].slice(0, 5);
  localStorage.setItem('gemini_recent_paths', JSON.stringify(updated));
  
  emit('submit', path.value);
}

function selectRecent(p: string) {
  if (props.loading) return;
  path.value = p;
}
</script>

<template>
  <UModal v-model:open="isOpen" :prevent-close="loading">
    <template #content>
      <UCard class="w-[450px] shadow-2xl border border-[var(--color-vsc-border)]">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
              <UIcon name="i-heroicons-rocket-launch" class="text-[var(--color-vsc-blue)] w-4 h-4" />
              Open Project
            </h3>
            <UButton 
              color="neutral" 
              variant="ghost" 
              icon="i-heroicons-x-mark" 
              :disabled="loading"
              @click="isOpen = false" 
            />
          </div>
        </template>

        <div class="space-y-6 py-4">
          <UFormField 
            label="Directory Path" 
            description="Absolute path to your project folder"
            :ui="{ label: 'text-[10px] font-black uppercase tracking-widest text-neutral-500' }"
          >
            <UInput 
              v-model="path" 
              placeholder="/home/radxa/..." 
              icon="i-heroicons-folder" 
              size="lg" 
              class="w-full" 
              :disabled="loading"
              :ui="{ base: 'font-mono text-xs' }"
            />
          </UFormField>

          <div v-if="recentPaths.length > 0" class="space-y-3 pt-2">
            <span class="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Recent Projects</span>
            <div class="flex flex-col gap-1">
              <div
                v-for="p in recentPaths"
                :key="p"
                class="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[var(--color-vsc-active)] cursor-pointer text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-colors border border-transparent hover:border-neutral-800"
                @click="selectRecent(p)"
              >
                <UIcon name="i-heroicons-clock" class="w-3 h-3 opacity-50" />
                <span class="truncate">{{ p }}</span>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton 
              color="neutral" 
              variant="ghost" 
              label="Cancel" 
              size="sm"
              :disabled="loading"
              @click="isOpen = false" 
            />
            <UButton 
              color="primary" 
              label="Launch Session" 
              size="sm"
              class="bg-[var(--color-vsc-blue)] hover:bg-[var(--color-vsc-blue-bright)]"
              :loading="loading"
              @click="handleSubmit" 
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
