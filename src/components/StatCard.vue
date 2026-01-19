<template>
  <div class="rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
    <p class="text-xs uppercase tracking-[0.25em] text-slate">{{ label }}</p>
    <div class="mt-3 flex items-center justify-between">
      <p class="text-3xl font-semibold text-ink">{{ value }}</p>
      <span :class="['h-3 w-3 rounded-full', toneClass]" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  tone: { type: String, default: 'mint' }
});

const toneClass = computed(() => {
  if (props.tone === 'coral') return 'bg-coral';
  if (props.tone === 'sky') return 'bg-sky';
  return 'bg-mint';
});
</script>
