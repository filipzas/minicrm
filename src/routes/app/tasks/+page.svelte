<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import StatusPill from '$lib/components/StatusPill.svelte';
  import { apiFetch, getToken } from '$lib/api';
  import { formatEuDate, normalizeEuDate } from '$lib/date';
  import type { Client, Task } from '$lib/data';

  let tasks: Task[] = [];
  let clients: Client[] = [];
  let loading = true;
  let error = '';
  let formError = '';
  let showNewTask = false;
  let saving = false;
  let formTitle = '';
  let formClientId = '';
  let formDue = '';
  let formStatus: Task['status'] = 'todo';

  $: clientLookup = new Map(clients.map((client) => [client.id, client.name]));

  const loadTasks = async () => {
    const token = getToken();
    if (!token) {
      goto('/login');
      return;
    }

    try {
      const [tasksData, clientsData] = await Promise.all([
        apiFetch<Task[]>('/tasks'),
        apiFetch<Client[]>('/clients')
      ]);
      tasks = tasksData;
      clients = clientsData;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to load tasks.';
    } finally {
      loading = false;
    }
  };

  onMount(loadTasks);

  $: if ($page.url.searchParams.get('new') === '1') {
    showNewTask = true;
  }

  const closeModal = () => {
    showNewTask = false;
    if ($page.url.searchParams.get('new') === '1') {
      goto('/app/tasks', { replaceState: true });
    }
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) {
      formError = 'Task title is required.';
      return;
    }

    saving = true;
    formError = '';
    try {
      await apiFetch<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: formTitle,
          clientId: formClientId || null,
          due: normalizeEuDate(formDue) || null,
          status: formStatus
        })
      });
      await loadTasks();
      formTitle = '';
      formClientId = '';
      formDue = '';
      formStatus = 'todo';
      closeModal();
    } catch (err) {
      formError = err instanceof Error ? err.message : 'Unable to create task.';
    } finally {
      saving = false;
    }
  };
</script>

<section class="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h2 class="font-display text-xl text-ink">Tasks</h2>
      <p class="text-sm text-slate">Assign tasks directly to clients.</p>
    </div>
    <div class="flex flex-wrap gap-3">
      <button class="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
        Filter
      </button>
      <button
        class="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay"
        on:click={() => (showNewTask = true)}
      >
        New task
      </button>
    </div>
  </div>

  <div class="mt-6 space-y-4">
    {#if loading}
      <p class="rounded-2xl border border-ink/10 bg-clay/60 px-4 py-3 text-sm text-slate">
        Loading tasks...
      </p>
    {:else if error}
      <p class="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
        {error}
      </p>
    {:else}
      {#each tasks as task}
        <div class="rounded-2xl border border-ink/10 bg-clay/70 px-5 py-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-ink">{task.title}</p>
              <p class="text-xs uppercase tracking-[0.2em] text-slate">
                {task.client ?? clientLookup.get(task.clientId ?? '') ?? task.clientId ?? 'Unassigned'}
              </p>
            </div>
            <div class="flex items-center gap-4">
              <p class="text-xs text-slate">Due {formatEuDate(task.due) || task.due || 'TBD'}</p>
              <StatusPill
                label={task.status}
                tone={task.status === 'done' ? 'mint' : task.status === 'todo' ? 'coral' : 'sky'}
              />
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</section>

{#if showNewTask}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
    <div class="w-full max-w-md rounded-3xl border border-ink/10 bg-white/90 p-6 shadow-soft backdrop-blur">
      <div class="flex items-center justify-between">
        <h3 class="font-display text-xl text-ink">Create task</h3>
        <button
          class="rounded-full border border-ink/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate"
          on:click={closeModal}
        >
          Close
        </button>
      </div>

      <form
        class="mt-5 space-y-4"
        on:submit|preventDefault={handleCreate}
      >
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Title</span>
          <input
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40"
            placeholder="Prepare proposal review"
            bind:value={formTitle}
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Client</span>
          <select
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40"
            bind:value={formClientId}
          >
            <option value="">Unassigned</option>
            {#each clients as client}
              <option value={client.id}>{client.name}</option>
            {/each}
          </select>
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Due date</span>
          <input
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40"
            type="text"
            placeholder="dd/mm/yyyy"
            bind:value={formDue}
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Status</span>
          <select
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40"
            bind:value={formStatus}
          >
            <option value="todo">todo</option>
            <option value="in-progress">in-progress</option>
            <option value="done">done</option>
          </select>
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
          {saving ? 'Saving...' : 'Create task'}
        </button>
      </form>
    </div>
  </div>
{/if}
