<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import StatusPill from '$lib/components/StatusPill.svelte';
  import { apiFetch, getToken } from '$lib/api';
  import type { Lead } from '$lib/data';

  let leads: Lead[] = [];
  let loading = true;
  let error = '';

  const loadLeads = async () => {
    const token = getToken();
    if (!token) {
      goto('/login');
      return;
    }

    try {
      const data = await apiFetch<Lead[]>('/leads');
      leads = data.map((lead) => ({
        ...lead,
        value: typeof lead.value === 'number' ? `$${lead.value}` : lead.value
      }));
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to load leads.';
    } finally {
      loading = false;
    }
  };

  onMount(loadLeads);
</script>

<section class="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h2 class="font-display text-xl text-ink">Leads</h2>
      <p class="text-sm text-slate">Keep the pipeline moving with clear stages.</p>
    </div>
    <button class="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
      Add lead
    </button>
  </div>

  <div class="mt-6 grid gap-4 md:grid-cols-2">
    {#if loading}
      <p class="rounded-2xl border border-ink/10 bg-clay/60 px-4 py-3 text-sm text-slate">
        Loading leads...
      </p>
    {:else if error}
      <p class="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
        {error}
      </p>
    {:else}
      {#each leads as lead}
        <div class="rounded-2xl border border-ink/10 bg-clay/70 p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-ink">{lead.name}</p>
            <StatusPill label={lead.value} tone="ink" />
          </div>
          <div class="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate">
            <span>{lead.stage}</span>
            <span>Owner {lead.owner}</span>
          </div>
          <div class="mt-4 h-2 w-full rounded-full bg-white">
            <div
              class="h-2 rounded-full bg-mint"
              style={`width: ${lead.stage === 'discovery' ? '20%' : lead.stage === 'proposal' ? '50%' : lead.stage === 'negotiation' ? '75%' : '100%'}`}
            />
          </div>
        </div>
      {/each}
    {/if}
  </div>
</section>
