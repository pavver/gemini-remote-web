<script setup lang="ts">
const props = defineProps<{
  disabled: boolean;
}>();

const emit = defineEmits(['send']);
const message = ref('');

function handleSend() {
  if (!message.value.trim() || props.disabled) return;
  emit('send', message.value);
  message.value = '';
}
</script>

<template>
  <footer class="p-3 sm:p-6 bg-[var(--color-vsc-bg)] border-t border-[var(--color-vsc-border)] backdrop-blur-md pb-[safe-area-inset-bottom]">
    <form @submit.prevent="handleSend" class="max-w-5xl mx-auto flex items-end gap-2 sm:gap-3">
      <UTextarea
        v-model="message"
        class="flex-1"
        placeholder="Message..."
        :rows="1"
        :max-rows="10"
        autoresize
        size="md"
        variant="outline"
        color="neutral"
        :disabled="disabled"
        :ui="{ 
          base: 'text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 font-sans bg-[var(--color-vsc-sidebar)]',
          rounded: 'rounded-xl sm:rounded-2xl'
        }"
        @keydown.enter.exact.prevent="handleSend"
      />
      <UButton
        type="submit"
        icon="i-heroicons-arrow-up-circle"
        color="primary"
        size="md"
        variant="solid"
        class="rounded-xl h-[40px] w-[40px] sm:h-[52px] sm:w-[52px] flex items-center justify-center flex-shrink-0"
        :loading="disabled"
      />
    </form>
  </footer>
</template>
