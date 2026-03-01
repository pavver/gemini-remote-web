<script setup lang="ts">
const props = defineProps<{
  disabled: boolean;
}>();

const emit = defineEmits(['send']);
const message = ref('');
const { suggestions, requestSuggestions } = useOrchestrator();
const selectedSuggestionIndex = ref(0);

const showSuggestions = computed(() => suggestions.value.length > 0 && message.value.startsWith('/'));

watch(message, (newVal) => {
  if (newVal.startsWith('/') && newVal.length > 0) {
    requestSuggestions(newVal);
  } else {
    suggestions.value = [];
  }
  selectedSuggestionIndex.value = 0;
});

function handleSend() {
  if (!message.value.trim() || props.disabled) return;
  emit('send', message.value);
  message.value = '';
  suggestions.value = [];
}

function selectSuggestion(s: any) {
  message.value = s.value + ' ';
  suggestions.value = [];
}

function handleKeyDown(e: KeyboardEvent) {
  if (showSuggestions.value) {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.value[selectedSuggestionIndex.value]) {
        selectSuggestion(suggestions.value[selectedSuggestionIndex.value]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedSuggestionIndex.value = (selectedSuggestionIndex.value + 1) % suggestions.value.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedSuggestionIndex.value = (selectedSuggestionIndex.value - 1 + suggestions.value.length) % suggestions.value.length;
    } else if (e.key === 'Escape') {
      suggestions.value = [];
    }
  } else if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}
</script>

<template>
  <footer class="p-3 sm:p-6 bg-[var(--color-vsc-bg)] border-t border-[var(--color-vsc-border)] backdrop-blur-md pb-[safe-area-inset-bottom] relative">
    <div class="max-w-5xl mx-auto relative">
      <!-- Suggestions List -->
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div 
          v-if="showSuggestions" 
          class="absolute bottom-full left-0 mb-2 w-full max-w-xs bg-[var(--color-vsc-sidebar)] border border-[var(--color-vsc-border)] rounded-lg shadow-2xl overflow-hidden z-50 font-mono text-xs"
        >
          <div class="px-3 py-2 border-b border-[var(--color-vsc-border)] bg-black/20 flex items-center justify-between">
            <span class="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Commands</span>
            <span class="text-[8px] text-neutral-600">Tab to select</span>
          </div>
          <div class="max-h-48 overflow-y-auto">
            <button
              v-for="(s, index) in suggestions"
              :key="s.value"
              type="button"
              class="w-full px-3 py-2 flex flex-col gap-0.5 text-left transition-colors"
              :class="index === selectedSuggestionIndex ? 'bg-[var(--color-vsc-blue)] text-white' : 'hover:bg-[var(--color-vsc-active)] text-neutral-400'"
              @click="selectSuggestion(s)"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold">{{ s.label }}</span>
                <span v-if="index === selectedSuggestionIndex" class="text-[8px] opacity-60 uppercase">Selected</span>
              </div>
              <span v-if="s.description" class="text-[9px] opacity-70 truncate">{{ s.description }}</span>
            </button>
          </div>
        </div>
      </Transition>

      <form @submit.prevent="handleSend" class="flex items-end gap-2 sm:gap-3">
        <UTextarea
          v-model="message"
          class="flex-1"
          placeholder="Message or /command..."
          :rows="1"
          :max-rows="10"
          autoresize
          size="md"
          variant="outline"
          color="neutral"
          :disabled="disabled"
          :ui="{ 
            base: 'text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 font-sans bg-[var(--color-vsc-sidebar)] rounded-xl sm:rounded-2xl shadow-inner'
          }"
          @keydown="handleKeyDown"
        />
        <UButton
          type="submit"
          icon="i-heroicons-arrow-up-circle"
          color="primary"
          size="md"
          variant="solid"
          class="rounded-xl h-[40px] w-[40px] sm:h-[52px] sm:w-[52px] flex items-center justify-center flex-shrink-0 bg-[var(--color-vsc-blue)] hover:bg-[var(--color-vsc-blue-bright)] transition-all active:scale-95"
          :loading="disabled"
        />
      </form>
    </div>
  </footer>
</template>
