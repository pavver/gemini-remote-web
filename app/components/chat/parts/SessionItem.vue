<script setup lang="ts">
const props = defineProps<{
  id: string;
  dir: string;
  isActive: boolean;
  status?: {
    model?: string;
    ramUsage: string;
  } | null;
}>();

const emit = defineEmits(['select', 'stop']);

const folderName = computed(() => {
  if (!props.dir) return 'New Session';
  const parts = props.dir.split('/');
  return parts[parts.length - 1] || props.dir;
});

const displayPath = computed(() => {
  if (!props.dir) return props.id.split('-')[0];
  return props.dir.length > 30 ? '...' + props.dir.slice(-27) : props.dir;
});
</script>

<template>
  <div 
    class="group px-3 py-2 cursor-pointer transition-all border-l-2 relative mb-0.5"
    :class="isActive 
      ? 'bg-[var(--color-vsc-active)] border-[var(--color-vsc-blue)] text-white' 
      : 'border-transparent text-neutral-400 hover:bg-[var(--color-vsc-active)] hover:text-neutral-200'"
    @click="emit('select', id)"
  >
    <div class="flex justify-between items-center gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <UIcon name="i-heroicons-folder" class="w-4 h-4 flex-shrink-0 opacity-70" />
        <div class="flex flex-col min-w-0">
          <span class="text-xs font-bold truncate">{{ folderName }}</span>
          <span class="text-[9px] opacity-50 truncate font-mono">{{ displayPath }}</span>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <!-- Re-added status badges in sidebar list -->
        <span v-if="status?.ramUsage" class="text-[8px] opacity-40 hidden sm:group-hover:inline">{{ status.ramUsage }}</span>
        <UButton
          icon="i-heroicons-x-mark"
          color="neutral"
          variant="ghost"
          size="xs"
          class="opacity-0 group-hover:opacity-100 transition-opacity p-1"
          @click.stop="emit('stop', id)"
        />
      </div>
    </div>
    
    <!-- Optional: show model in sidebar if session is active -->
    <div v-if="status?.model && isActive" class="mt-1 ml-6">
       <span class="text-[8px] bg-neutral-800 px-1 rounded text-blue-400 uppercase tracking-widest font-black">{{ status.model }}</span>
    </div>
  </div>
</template>
