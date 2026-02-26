<script setup lang="ts">
interface ToolCall {
  name: string;
  status: string;
  args?: any;
}

defineProps<{
  tools: ToolCall[]
}>();

function getStatusIcon(status: string) {
  switch (status) {
    case 'success': return 'i-heroicons-check-circle';
    case 'error': return 'i-heroicons-exclamation-circle';
    default: return 'i-heroicons-arrow-path';
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'success': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20';
    default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  }
}

function formatArgs(args: any): string {
  if (!args) return ''; // We'll show a special tag below instead
  if (typeof args !== 'object') return String(args);
  
  const importantFields = ['path', 'file_path', 'query', 'command', 'url', 'dir_path', 'pattern', 'text'];
  for (const field of importantFields) {
    if (args[field]) {
      const val = String(args[field]);
      return val.length > 40 ? '...' + val.slice(-37) : val;
    }
  }
  
  const keys = Object.keys(args);
  if (keys.length > 0) {
    const val = String(args[keys[0]]);
    return val.length > 40 ? '...' + val.slice(-37) : val;
  }
  
  return 'Object';
}
</script>

<template>
  <div class="flex flex-col items-start w-full gap-2 my-1">
    <div class="max-w-[98%] sm:max-w-[90%] bg-neutral-900/20 border border-neutral-800/50 p-3 rounded-xl rounded-tl-none flex flex-col gap-2.5">
      <div class="flex items-center gap-2 px-1">
        <UIcon name="i-heroicons-wrench-screwdriver" class="w-3.5 h-3.5 text-neutral-500" />
        <span class="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] leading-none">
          Tool Execution
        </span>
      </div>

      <div class="flex flex-wrap gap-2">
        <div 
          v-for="tool in tools" 
          :key="tool.name"
          class="flex flex-col gap-1"
        >
          <div 
            class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all duration-300"
            :class="getStatusClass(tool.status)"
          >
            <UIcon 
              :name="getStatusIcon(tool.status)" 
              class="w-3.5 h-3.5"
              :class="{ 'animate-spin': tool.status === 'pending' }"
            />
            <span class="font-bold">{{ tool.name }}</span>
            
            <!-- Arguments Display -->
            <span v-if="tool.args" class="opacity-80 text-white/70 border-l border-white/10 pl-2 ml-1">
              {{ formatArgs(tool.args) }}
            </span>
            <span v-else-if="tool.status === 'success'" class="opacity-30 text-red-400 border-l border-white/10 pl-2 ml-1 italic">
              (no data)
            </span>

            <span class="opacity-40 text-[9px] uppercase tracking-tighter">{{ tool.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
