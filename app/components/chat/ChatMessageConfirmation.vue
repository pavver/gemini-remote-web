<script setup lang="ts">
const props = defineProps<{
  request: {
    id: number;
    prompt: string;
    options: Array<{label: string, value: string}> | string[];
  }
}>();

const emit = defineEmits<{
  (e: 'respond', data: { id: number; confirmed: boolean; choice?: string }): void;
}>();

function handleChoice(opt: any) {
  if (!props.request) return;
  
  const label = typeof opt === 'string' ? opt : opt.label;
  const value = typeof opt === 'string' ? opt : opt.value;
  
  // Logic: any value that isn't 'cancel' or 'false' is considered confirmed
  const confirmed = value !== 'cancel' && value !== 'false';
  
  emit('respond', { id: props.request.id, confirmed, choice: value });
}
</script>

<template>
  <div v-if="request" class="flex flex-col items-start w-full my-6 animate-in fade-in zoom-in-95 duration-500">
    <div class="w-full max-w-4xl border border-neutral-700 rounded-lg overflow-hidden bg-[#181818] shadow-2xl">
      <!-- Terminal-like top border -->
      <div class="h-1 bg-gradient-to-r from-amber-500/50 via-amber-500 to-amber-500/50"></div>
      
      <!-- Header -->
      <div class="px-4 py-2 border-b border-neutral-800 bg-black/40 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-shield-exclamation" class="text-amber-500 w-4 h-4" />
          <span class="text-[10px] font-black text-neutral-200 uppercase tracking-[0.2em]">Security Check: Action Required</span>
        </div>
        <span class="text-[9px] font-mono text-neutral-600">ID: {{ request.id ? request.id.toString().slice(-6) : 'N/A' }}</span>
      </div>

      <div class="p-6 space-y-5">
        <!-- Prompt context placeholder (mimicking CLI text) -->
        <div class="flex items-start gap-3 text-neutral-400">
          <UIcon name="i-heroicons-question-mark-circle" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p class="text-xs sm:text-sm font-medium leading-relaxed">
            The system is requesting permission to execute the following command in your workspace:
          </p>
        </div>

        <!-- The Command (Black background, White Cascadia text) -->
        <div class="bg-black p-5 rounded-md border border-neutral-800 font-[var(--font-cascadia)] text-xs sm:text-sm text-white leading-relaxed shadow-inner break-words">
          <span class="text-emerald-500 mr-2">$</span>{{ request.prompt || 'Calculating action...' }}
        </div>

        <!-- Inline Options -->
        <div class="space-y-2 pt-2">
          <p class="text-[9px] text-neutral-500 font-black uppercase tracking-[0.2em] mb-3 px-1">
            Choose an option to proceed:
          </p>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              v-for="(opt, index) in (request.options || [])"
              :key="typeof opt === 'string' ? opt : opt.value"
              type="button"
              class="px-4 py-3 rounded-md border border-neutral-800 text-left text-[11px] font-bold transition-all hover:border-[var(--color-vsc-blue)] hover:bg-[var(--color-vsc-blue)]/5 group flex items-center gap-3 cursor-pointer"
              :class="(typeof opt === 'object' ? opt.value : opt) !== 'cancel' ? 'text-neutral-300' : 'text-red-400/80 hover:border-red-500/50 hover:bg-red-500/5'"
              @click="handleChoice(opt)"
            >
              <span class="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[9px] group-hover:bg-current group-hover:text-[#181818] transition-colors flex-shrink-0">
                {{ index + 1 }}
              </span>
              <span class="leading-tight">{{ typeof opt === 'string' ? opt : opt.label }}</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Footer Decoration -->
      <div class="px-4 py-2 bg-black/20 border-t border-neutral-800 flex justify-end">
        <span class="text-[8px] text-neutral-700 uppercase font-black tracking-widest italic">User authorization pending...</span>
      </div>
    </div>
  </div>
</template>
