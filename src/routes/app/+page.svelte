<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import StatCard from '$lib/components/StatCard.svelte';
  import StatusPill from '$lib/components/StatusPill.svelte';
  import { apiFetch, getToken } from '$lib/api';
  import { formatEuDate } from '$lib/date';
  import type { Client, Lead, Task } from '$lib/data';

  let clients: Client[] = [];
  let leads: Lead[] = [];
  let tasks: Task[] = [];
  let loading = true;
  let error = '';

  const loadAll = async () => {
    const token = getToken();
    if (!token) {
      goto('/login');
      return;
    }

    try {
      const [clientsData, leadsData, tasksData] = await Promise.all([
        apiFetch<Client[]>('/clients'),
        apiFetch<Lead[]>('/leads'),
        apiFetch<Task[]>('/tasks')
      ]);

      clients = clientsData;
      leads = leadsData.map((lead) => ({
        ...lead,
        value: typeof lead.value === 'number' ? `$${lead.value}` : lead.value
      }));
      tasks = tasksData;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to load dashboard.';
    } finally {
      loading = false;
    }
  };

  $: activeClients = clients.filter((client) => client.status === 'active').length;
  $: activeLeads = clients.filter((client) => client.status === 'lead').length;
  $: pausedClients = clients.filter((client) => client.status === 'paused').length;

  onMount(loadAll);
</script>

{#if loading}
  <p class="rounded-2xl border border-ink/10 bg-white/80 px-6 py-4 text-sm text-slate shadow-soft">
    Loading dashboard...
  </p>
{:else if error}
  <p class="rounded-2xl border border-coral/20 bg-coral/10 px-6 py-4 text-sm text-coral">
    {error}
  </p>
{:else}
  <div class="grid gap-6 lg:grid-cols-3">
    <StatCard label="Active clients" value={String(activeClients)} tone="mint" />
    <StatCard label="Leads in flow" value={String(activeLeads)} tone="sky" />
    <StatCard label="Paused" value={String(pausedClients)} tone="coral" />
  </div>

  <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
    <section class="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div class="flex items-center justify-between">
        <h2 class="font-display text-xl text-ink">Client status</h2>
        <StatusPill label="Live" tone="mint" />
      </div>
      <div class="mt-6 space-y-4">
        {#each clients as client}
          <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-clay/60 px-4 py-3">
            <div>
              <p class="text-sm font-semibold text-ink">{client.name}</p>
              <p class="text-xs uppercase tracking-[0.2em] text-slate">{client.industry}</p>
            </div>
            <div class="flex items-center gap-3">
              <p class="text-xs text-slate">{formatEuDate(client.lastTouch) || client.lastTouch}</p>
              <StatusPill
                label={client.status}
                tone={client.status === 'active' ? 'mint' : client.status === 'lead' ? 'sky' : 'coral'}
              />
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section class="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
      <h2 class="font-display text-xl text-ink">Priority tasks</h2>
      <div class="mt-6 space-y-4">
        {#each tasks as task}
          <div class="rounded-2xl border border-ink/10 bg-white px-4 py-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-ink">{task.title}</p>
              <p class="text-xs text-slate">{formatEuDate(task.due) || task.due}</p>
            </div>
            <div class="mt-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate">
              <span>{task.client ?? task.clientId ?? 'Unassigned'}</span>
              <StatusPill
                label={task.status}
                tone={task.status === 'done' ? 'mint' : task.status === 'todo' ? 'coral' : 'sky'}
              />
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>

  <section class="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-xl text-ink">Leads pipeline</h2>
      <button class="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
        Export
      </button>
    </div>
    <div class="mt-6 grid gap-4 sm:grid-cols-3">
      {#each leads as lead}
        <div class="rounded-2xl border border-ink/10 bg-clay/70 p-4">
          <p class="text-sm font-semibold text-ink">{lead.name}</p>
          <p class="text-xs uppercase tracking-[0.2em] text-slate">{lead.stage}</p>
          <div class="mt-4 flex items-center justify-between">
            <p class="text-xs text-slate">{lead.owner}</p>
            <StatusPill label={lead.value} tone="ink" />
          </div>
        </div>
      {/each}
    </div>
  </section>
{/if}
