<script lang="ts">
  export let label: string;
  export let tone: 'mint' | 'coral' | 'sky' | 'ink' = 'ink';
</script>

<span
  class={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
    tone === 'mint'
      ? 'bg-mint/20 text-mint'
      : tone === 'coral'
        ? 'bg-coral/20 text-coral'
        : tone === 'sky'
          ? 'bg-sky/20 text-sky'
          : 'bg-ink/10 text-ink'
  }`}
>
  {label}
</span>
