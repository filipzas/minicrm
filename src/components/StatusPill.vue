<template>
  <span :class="pillClass">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  tone: { type: String, default: 'ink' }
});

const pillClass = computed(() => {
  const base = 'rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]';
  switch (props.tone) {
    case 'mint':
      return `${base} bg-mint/20 text-mint`;
    case 'coral':
      return `${base} bg-coral/20 text-coral`;
    case 'sky':
      return `${base} bg-sky/20 text-sky`;
    default:
      return `${base} bg-ink/10 text-ink`;
  }
});
</script>
