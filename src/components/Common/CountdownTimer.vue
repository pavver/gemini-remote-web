<template>
  <span>{{ formattedTime }}</span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  seconds: number;
}>();

const { t } = useI18n();
const remainingSeconds = ref(props.seconds);
let intervalId: ReturnType<typeof setInterval> | null = null;

const formattedTime = computed(() => {
  const s = remainingSeconds.value;
  if (s <= 0) return `0${t('system.units.s')}`;

  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  const parts = [];
  if (h > 0) parts.push(`${h}${t('system.units.h')}`);
  if (m > 0 || h > 0) parts.push(`${m}${t('system.units.m')}`);
  parts.push(`${sec}${t('system.units.s')}`);

  return parts.join(' ');
});

const startTimer = () => {
  stopTimer();
  intervalId = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--;
    } else {
      stopTimer();
    }
  }, 1000);
};

const stopTimer = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

watch(() => props.seconds, (newVal) => {
  remainingSeconds.value = newVal;
  startTimer();
});

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  stopTimer();
});
</script>
