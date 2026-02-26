<script setup lang="ts">
const isOpen = defineModel<boolean>('open', { default: false });
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
      path.value = recentPaths.value[0] || '/home/radxa/gemini';
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
  <UModal 
    v-model:open="isOpen" 
    :prevent-close="loading"
    :ui="{ 
      content: 'bg-[var(--color-vsc-bg)] border border-[var(--color-vsc-border)] shadow-2xl rounded-lg overflow-hidden ring-0 w-[calc(100vw-2rem)] sm:w-[450px] mx-auto pointer-events-auto',
      overlay: 'bg-black/80 backdrop-blur-sm pointer-events-auto'
    }"
  >
    <template #content="{ close }">
      <div class="flex flex-col bg-[var(--color-vsc-bg)]">
        <!-- Custom Header -->
        <div class="flex items-center justify-between border-b border-[var(--color-vsc-border)] px-4 py-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-rocket-launch" class="text-[var(--color-vsc-blue)] w-4 h-4" />
            <h3 class="text-xs sm:text-sm font-bold text-neutral-200 uppercase tracking-widest">
              Open Project
            </h3>
          </div>
          <UButton 
            color="neutral" 
            variant="ghost" 
            icon="i-heroicons-x-mark" 
            :disabled="loading"
            class="hover:bg-[var(--color-vsc-active)] cursor-pointer"
            @click="close" 
          />
        </div>

        <!-- Custom Body -->
        <div class="px-4 py-6 space-y-6">
          <UFormField 
            label="Directory Path" 
            :ui="{ 
              label: 'text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1',
            }"
          >
            <template #description>
              <span class="text-[9px] text-neutral-600 italic">Absolute path to your project folder</span>
            </template>
            <UInput 
              v-model="path" 
              placeholder="/home/radxa/..." 
              icon="i-heroicons-folder" 
              size="md" 
              class="w-full" 
              :disabled="loading"
              :ui="{ 
                base: 'font-mono text-xs bg-[var(--color-vsc-sidebar)] border-[var(--color-vsc-border)] text-neutral-300',
              }"
              @keydown.enter="handleSubmit"
            />
          </UFormField>

          <div v-if="recentPaths.length > 0" class="space-y-2 pt-2">
            <span class="text-[8px] sm:text-[9px] font-black text-neutral-600 uppercase tracking-widest">Recent Projects</span>
            <div class="flex flex-col gap-1 max-h-[150px] overflow-y-auto pr-1">
              <button
                v-for="p in recentPaths"
                :key="p"
                type="button"
                class="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[var(--color-vsc-active)] cursor-pointer text-[10px] sm:text-xs font-mono text-neutral-500 hover:text-neutral-300 transition-colors border border-transparent hover:border-[var(--color-vsc-border)] text-left w-full"
                @click="selectRecent(p)"
              >
                <UIcon name="i-heroicons-clock" class="w-3 h-3 opacity-50 flex-shrink-0" />
                <span class="truncate">{{ p }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Custom Footer -->
        <div class="flex justify-end gap-2 sm:gap-3 border-t border-[var(--color-vsc-border)] px-4 py-3">
          <UButton 
            color="neutral" 
            variant="ghost" 
            label="Cancel" 
            size="sm"
            :disabled="loading"
            class="hover:bg-[var(--color-vsc-active)] cursor-pointer"
            @click="close" 
          />
          <UButton 
            color="primary" 
            label="Launch" 
            size="sm"
            class="bg-[var(--color-vsc-blue)] hover:bg-[var(--color-vsc-blue-bright)] px-4 font-bold cursor-pointer"
            :loading="loading"
            @click="handleSubmit" 
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
