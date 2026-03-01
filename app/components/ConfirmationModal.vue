<script setup lang="ts">
const props = defineProps<{
  request: {
    id: number;
    prompt: string;
    type: string;
    options?: string[];
  } | null;
}>();

const emit = defineEmits<{
  (e: 'respond', data: { id: number; confirmed: boolean; choice?: string }): void;
}>();

const isOpen = computed(() => !!props.request);

function handleConfirm() {
  if (props.request) {
    emit('respond', { id: props.request.id, confirmed: true });
  }
}

function handleCancel() {
  if (props.request) {
    emit('respond', { id: props.request.id, confirmed: false });
  }
}

function handleChoice(choice: string) {
  if (props.request) {
    emit('respond', { id: props.request.id, confirmed: true, choice });
  }
}
</script>

<template>
  <UModal 
    :open="isOpen" 
    :prevent-close="true"
    :ui="{ 
      content: 'bg-[var(--color-vsc-bg)] border border-[var(--color-vsc-border)] shadow-2xl rounded-lg overflow-hidden ring-0 w-[calc(100vw-2rem)] sm:w-[450px] mx-auto pointer-events-auto',
      overlay: 'bg-black/80 backdrop-blur-sm pointer-events-auto'
    }"
  >
    <template #content>
      <div class="flex flex-col bg-[var(--color-vsc-bg)]">
        <!-- Header -->
        <div class="flex items-center gap-3 border-b border-[var(--color-vsc-border)] px-4 py-3 bg-red-500/5">
          <UIcon name="i-heroicons-shield-exclamation" class="text-red-500 w-5 h-5" />
          <h3 class="text-sm font-bold text-neutral-200 uppercase tracking-widest">
            Action Confirmation
          </h3>
        </div>

        <!-- Body -->
        <div class="px-6 py-8">
          <div class="bg-[var(--color-vsc-sidebar)] border border-[var(--color-vsc-border)] p-4 rounded-md mb-6 shadow-inner">
            <p class="text-xs sm:text-sm font-mono text-neutral-300 leading-relaxed break-words">
              {{ request?.prompt }}
            </p>
          </div>

          <div v-if="request?.options" class="flex flex-col gap-2 mb-2">
            <UButton
              v-for="opt in request.options"
              :key="opt"
              color="neutral"
              variant="soft"
              block
              class="text-[10px] uppercase font-bold tracking-widest border border-white/5"
              @click="handleChoice(opt)"
            >
              {{ opt }}
            </UButton>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 sm:gap-3 border-t border-[var(--color-vsc-border)] px-4 py-3 bg-black/10">
          <UButton 
            color="neutral" 
            variant="ghost" 
            label="Deny" 
            size="sm"
            class="hover:bg-red-500/10 hover:text-red-400 cursor-pointer px-4"
            @click="handleCancel" 
          />
          <UButton 
            color="primary" 
            label="Approve Action" 
            size="sm"
            class="bg-[var(--color-vsc-blue)] hover:bg-[var(--color-vsc-blue-bright)] px-6 font-black uppercase tracking-tighter cursor-pointer shadow-lg shadow-blue-900/20"
            @click="handleConfirm" 
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
