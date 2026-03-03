<script setup lang="ts">
import type { ConfirmationRequest, ConfirmationOption } from '../../types/api';

const props = defineProps<{
  request: ConfirmationRequest
}>();

const emit = defineEmits<{
  (e: 'respond', data: { id: number; confirmed: boolean; choice?: string }): void;
}>();

const title = computed(() => {
  switch (props.request.type) {
    case 'tool_approval': return 'Tool Execution Request';
    case 'command_approval': return 'Command Permission';
    case 'extension_update': return 'Extension Update Available';
    case 'auth_consent': return 'Authorization Required';
    default: return 'Security Check';
  }
});

const description = computed(() => {
  switch (props.request.type) {
    case 'tool_approval': return 'The model wants to use an automated tool:';
    case 'command_approval': return 'A sensitive system command requires your approval:';
    case 'extension_update': return 'New versions of your extensions are ready:';
    case 'auth_consent': return 'The system needs permission to access your credentials:';
    default: return 'The system is requesting permission for an action:';
  }
});

function handleChoice(opt: ConfirmationOption) {
  if (!props.request) return;
  
  const value = opt.value;
  // Explicit confirmation logic
  const confirmed = value !== 'cancel' && value !== 'false';
  
  emit('respond', { id: props.request.id, confirmed, choice: value });
}
</script>

<template>
  <div v-if="request" :key="request.id" class="flex flex-col items-start w-full my-6 animate-in fade-in zoom-in-95 duration-500">
    <div class="w-full max-w-4xl border border-neutral-700 rounded-lg overflow-hidden bg-[#181818] shadow-2xl">
      <!-- Terminal-like top border -->
      <div class="h-1 bg-gradient-to-r from-amber-500/50 via-amber-500 to-amber-500/50"></div>
      
      <!-- Header -->
      <div class="px-4 py-2 border-b border-neutral-800 bg-black/40 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon :name="request.type === 'extension_update' ? 'i-heroicons-arrow-path' : 'i-heroicons-shield-exclamation'" 
                 :class="request.type === 'extension_update' ? 'text-blue-500' : 'text-amber-500'" class="w-4 h-4" />
          <span class="text-[10px] font-black text-neutral-200 uppercase tracking-[0.2em]">{{ title }}</span>
        </div>
        <span class="text-[9px] font-mono text-neutral-600">REQ_ID: {{ request.id.toString().slice(-8) }}</span>
      </div>

      <div class="p-6 space-y-5">
        <!-- Prompt context placeholder -->
        <div class="flex items-start gap-3 text-neutral-400">
          <UIcon name="i-heroicons-question-mark-circle" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p class="text-xs sm:text-sm font-medium leading-relaxed">
            {{ description }}
          </p>
        </div>

        <!-- The Content -->
        <div class="bg-black p-5 rounded-md border border-neutral-800 font-[var(--font-cascadia)] text-xs sm:text-sm text-white leading-relaxed shadow-inner break-words">
          <span class="text-emerald-500 mr-2">$</span>{{ request.prompt }}
        </div>

        <!-- Diff View if present -->
        <ChatPartsDiffView 
          v-if="request.fileDiff" 
          :diff-content="request.fileDiff" 
          :filename="request.fileName" 
        />

        <!-- Inline Options -->
        <div class="space-y-2 pt-2">
          <p class="text-[9px] text-neutral-500 font-black uppercase tracking-[0.2em] mb-3 px-1">
            Choose an option to proceed:
          </p>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              v-for="(opt, index) in (request.options || [])"
              :key="opt.value"
              type="button"
              class="px-4 py-3 rounded-md border border-neutral-800 text-left text-[11px] font-bold transition-all hover:border-[var(--color-vsc-blue)] hover:bg-[var(--color-vsc-blue)]/5 group flex items-center gap-3 cursor-pointer"
              :class="opt.value !== 'cancel' ? 'text-neutral-300' : 'text-red-400/80 hover:border-red-500/50 hover:bg-red-500/5'"
              @click="handleChoice(opt)"
            >
              <span class="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[9px] group-hover:bg-current group-hover:text-[#181818] transition-colors flex-shrink-0">
                {{ index + 1 }}
              </span>
              <span class="leading-tight">{{ opt.label }}</span>
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
