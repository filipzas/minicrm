<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import StatusPill from '$lib/components/StatusPill.svelte';
  import { apiFetch, getToken } from '$lib/api';
  import { formatEuDate, normalizeEuDate } from '$lib/date';
  import type { Client } from '$lib/data';

  let clients: Client[] = [];
  let loading = true;
  let error = '';
  let showModal = false;
  let modalMode: 'create' | 'edit' = 'create';
  let saving = false;
  let formError = '';
  let formName = '';
  let formIndustry = '';
  let formOwner = '';
  let formStatus: Client['status'] = 'lead';
  let formLastTouch = '';
  let selectedClient: Client | null = null;

  let search = '';
  let filterStatus = '';
  let filterOwner = '';

  const loadClients = async () => {
    const token = getToken();
    if (!token) {
      goto('/login');
      return;
    }

    loading = true;
    error = '';

    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (filterStatus) params.set('status', filterStatus);
    if (filterOwner.trim()) params.set('owner', filterOwner.trim());

    const query = params.toString();

    try {
      clients = await apiFetch<Client[]>(`/clients${query ? `?${query}` : ''}`);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to load clients.';
    } finally {
      loading = false;
    }
  };

  onMount(loadClients);

  const resetForm = () => {
    formName = '';
    formIndustry = '';
    formOwner = '';
    formStatus = 'lead';
    formLastTouch = '';
    formError = '';
  };

  const openCreate = () => {
    modalMode = 'create';
    selectedClient = null;
    resetForm();
    showModal = true;
  };

  const openEdit = (client: Client) => {
    modalMode = 'edit';
    selectedClient = client;
    formName = client.name ?? '';
    formIndustry = client.industry ?? '';
    formOwner = client.owner ?? '';
    formStatus = client.status ?? 'lead';
    formLastTouch = client.lastTouch ?? '';
    formError = '';
    showModal = true;
  };

  const closeModal = () => {
    showModal = false;
    formError = '';
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      formError = 'Client name is required.';
      return;
    }

    saving = true;
    formError = '';
    try {
      if (modalMode === 'create') {
        await apiFetch<Client>('/clients', {
          method: 'POST',
          body: JSON.stringify({
            name: formName,
            industry: formIndustry || undefined,
            owner: formOwner || undefined,
            status: formStatus,
            lastTouch: normalizeEuDate(formLastTouch) || undefined
          })
        });
      } else if (selectedClient) {
        await apiFetch<Client>(`/clients/${selectedClient.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: formName,
            industry: formIndustry || undefined,
            owner: formOwner || undefined,
            status: formStatus,
            lastTouch: normalizeEuDate(formLastTouch) || undefined
          })
        });
      }

      await loadClients();
      closeModal();
    } catch (err) {
      formError = err instanceof Error ? err.message : 'Unable to save client.';
    } finally {
      saving = false;
    }
  };

  const handleDelete = async (clientId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this client?')) {
      return;
    }

    try {
      await apiFetch(`/clients/${clientId}`, { method: 'DELETE' });
      await loadClients();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to delete client.';
    }
  };
</script>

<section class="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h2 class="font-display text-xl text-ink">Clients</h2>
      <p class="text-sm text-slate">Track accounts and collaboration status.</p>
    </div>
    <div class="flex flex-wrap gap-3">
      <button
        class="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay"
        on:click={openCreate}
      >
        Add client
      </button>
    </div>
  </div>

  <form class="mt-6 grid gap-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr_auto]" on:submit|preventDefault={loadClients}>
    <input
      class="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
      placeholder="Search clients"
      bind:value={search}
    />
    <select
      class="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
      bind:value={filterStatus}
    >
      <option value="">All statuses</option>
      <option value="lead">Lead</option>
      <option value="active">Active</option>
      <option value="paused">Paused</option>
    </select>
    <input
      class="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
      placeholder="Owner"
      bind:value={filterOwner}
    />
    <button
      class="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
      type="submit"
    >
      Apply
    </button>
  </form>

  <div class="mt-6 grid gap-4">
    {#if loading}
      <p class="rounded-2xl border border-ink/10 bg-clay/60 px-4 py-3 text-sm text-slate">
        Loading clients...
      </p>
    {:else if error}
      <p class="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
        {error}
      </p>
    {:else if clients.length === 0}
      <p class="rounded-2xl border border-ink/10 bg-clay/60 px-4 py-3 text-sm text-slate">
        No clients found.
      </p>
    {:else}
      {#each clients as client}
        <a
          href={`/app/clients/${client.id}`}
          class="group rounded-2xl border border-ink/10 bg-clay/60 px-5 py-4 transition hover:-translate-y-0.5 hover:border-ink/30"
        >
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-ink group-hover:text-ink">{client.name}</p>
              <p class="text-xs uppercase tracking-[0.2em] text-slate">{client.industry}</p>
            </div>
            <div class="flex items-center gap-3">
              <p class="text-xs text-slate">Owner: {client.owner}</p>
              <p class="text-xs text-slate">Last touch: {formatEuDate(client.lastTouch) || client.lastTouch}</p>
              <StatusPill
                label={client.status}
                tone={client.status === 'active' ? 'mint' : client.status === 'lead' ? 'sky' : 'coral'}
              />
              <button
                class="rounded-full border border-ink/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink"
                on:click|preventDefault|stopPropagation={() => openEdit(client)}
              >
                Edit
              </button>
              <button
                class="rounded-full border border-coral/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-coral"
                on:click|preventDefault|stopPropagation={() => handleDelete(client.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </a>
      {/each}
    {/if}
  </div>
</section>

{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
    <div class="w-full max-w-md rounded-3xl border border-ink/10 bg-white/90 p-6 shadow-soft backdrop-blur">
      <div class="flex items-center justify-between">
        <h3 class="font-display text-xl text-ink">{modalMode === 'create' ? 'Add client' : 'Edit client'}</h3>
        <button
          class="rounded-full border border-ink/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate"
          on:click={closeModal}
        >
          Close
        </button>
      </div>

      <form class="mt-5 space-y-4" on:submit|preventDefault={handleSave}>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Name</span>
          <input
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40"
            placeholder="Lumen Studio"
            bind:value={formName}
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Industry</span>
          <input
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40"
            placeholder="Design"
            bind:value={formIndustry}
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Owner</span>
          <input
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40"
            placeholder="Nadia"
            bind:value={formOwner}
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Status</span>
          <select
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40"
            bind:value={formStatus}
          >
            <option value="lead">lead</option>
            <option value="active">active</option>
            <option value="paused">paused</option>
          </select>
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Last touch</span>
          <input
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40"
            placeholder="dd/mm/yyyy"
            bind:value={formLastTouch}
          />
        </label>

        {#if formError}
          <p class="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-coral">
            {formError}
          </p>
        {/if}

        <button
          type="submit"
          class="w-full rounded-full bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-clay"
          disabled={saving}
        >
          {saving ? 'Saving...' : modalMode === 'create' ? 'Create client' : 'Save changes'}
        </button>
      </form>
    </div>
  </div>
{/if}
