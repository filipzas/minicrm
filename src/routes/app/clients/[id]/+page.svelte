<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import StatusPill from '$lib/components/StatusPill.svelte';
  import { apiFetch, getToken } from '$lib/api';
  import { formatEuDate, normalizeEuDate } from '$lib/date';
  import type { Client, Task } from '$lib/data';

  let client: Client | null = null;
  let clientTasks: Task[] = [];
  let loading = true;
  let error = '';

  let showModal = false;
  let saving = false;
  let formError = '';
  let formName = '';
  let formIndustry = '';
  let formOwner = '';
  let formStatus: Client['status'] = 'lead';
  let formLastTouch = '';

  const loadClient = async () => {
    const token = getToken();
    if (!token) {
      goto('/login');
      return;
    }

    try {
      const clientId = $page.params.id;
      client = await apiFetch<Client>(`/clients/${clientId}`);
      clientTasks = await apiFetch<Task[]>(`/tasks?clientId=${clientId}`);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to load client.';
    } finally {
      loading = false;
    }
  };

  onMount(loadClient);

  const openEdit = () => {
    if (!client) return;
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
    if (!client) return;
    if (!formName.trim()) {
      formError = 'Client name is required.';
      return;
    }

    saving = true;
    formError = '';
    try {
      await apiFetch<Client>(`/clients/${client.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: formName,
          industry: formIndustry || undefined,
          owner: formOwner || undefined,
          status: formStatus,
          lastTouch: normalizeEuDate(formLastTouch) || undefined
        })
      });
      await loadClient();
      closeModal();
    } catch (err) {
      formError = err instanceof Error ? err.message : 'Unable to update client.';
    } finally {
      saving = false;
    }
  };

  const handleDelete = async () => {
    if (!client) return;
    if (typeof window !== 'undefined' && !window.confirm('Delete this client?')) {
      return;
    }

    try {
      await apiFetch(`/clients/${client.id}`, { method: 'DELETE' });
      goto('/app/clients');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to delete client.';
    }
  };
</script>

<section class="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
  {#if loading}
    <p class="text-sm text-slate">Loading client...</p>
  {:else if error}
    <p class="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
      {error}
    </p>
  {:else if client}
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-slate">Client profile</p>
        <h2 class="font-display text-2xl text-ink">{client.name}</h2>
      </div>
      <div class="flex items-center gap-3">
        <StatusPill
          label={client.status}
          tone={client.status === 'active' ? 'mint' : client.status === 'lead' ? 'sky' : 'coral'}
        />
        <button
          class="rounded-full border border-ink/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink"
          on:click={openEdit}
        >
          Edit
        </button>
        <button
          class="rounded-full border border-coral/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-coral"
          on:click={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-3">
      <div class="rounded-2xl border border-ink/10 bg-clay/70 p-4">
        <p class="text-xs uppercase tracking-[0.2em] text-slate">Industry</p>
        <p class="mt-2 text-lg font-semibold text-ink">{client.industry}</p>
      </div>
      <div class="rounded-2xl border border-ink/10 bg-clay/70 p-4">
        <p class="text-xs uppercase tracking-[0.2em] text-slate">Owner</p>
        <p class="mt-2 text-lg font-semibold text-ink">{client.owner}</p>
      </div>
      <div class="rounded-2xl border border-ink/10 bg-clay/70 p-4">
        <p class="text-xs uppercase tracking-[0.2em] text-slate">Last touch</p>
        <p class="mt-2 text-lg font-semibold text-ink">{formatEuDate(client.lastTouch) || client.lastTouch}</p>
      </div>
    </div>

    <div class="mt-8">
      <h3 class="font-display text-xl text-ink">Tasks</h3>
      <div class="mt-4 space-y-3">
        {#if clientTasks.length}
          {#each clientTasks as task}
            <div class="rounded-2xl border border-ink/10 bg-white px-4 py-3">
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-ink">{task.title}</p>
                <StatusPill
                  label={task.status}
                  tone={task.status === 'done' ? 'mint' : task.status === 'todo' ? 'coral' : 'sky'}
                />
              </div>
              <p class="mt-2 text-xs uppercase tracking-[0.2em] text-slate">
                Due {formatEuDate(task.due) || task.due || 'TBD'}
              </p>
            </div>
          {/each}
        {:else}
          <p class="text-sm text-slate">No tasks linked to this client yet.</p>
        {/if}
      </div>
    </div>
  {:else}
    <p class="text-sm text-slate">Client not found.</p>
  {/if}
</section>

{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
    <div class="w-full max-w-md rounded-3xl border border-ink/10 bg-white/90 p-6 shadow-soft backdrop-blur">
      <div class="flex items-center justify-between">
        <h3 class="font-display text-xl text-ink">Edit client</h3>
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
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  </div>
{/if}
