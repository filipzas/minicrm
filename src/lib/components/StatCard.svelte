<script lang="ts">
  export let label: string;
  export let value: string;
  export let tone: 'mint' | 'coral' | 'sky' = 'mint';
</script>

<div class={`rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur`}>
  <p class="text-xs uppercase tracking-[0.25em] text-slate">{label}</p>
  <div class="mt-3 flex items-center justify-between">
    <p class="text-3xl font-semibold text-ink">{value}</p>
    <span
      class={`h-3 w-3 rounded-full ${tone === 'mint' ? 'bg-mint' : tone === 'coral' ? 'bg-coral' : 'bg-sky'}`}
    />
  </div>
</div>
