<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { clearToken, clearUser, getUser } from '$lib/api';

  const nav = [
    { label: 'Dashboard', href: '/app' },
    { label: 'Clients', href: '/app/clients' },
    { label: 'Leads', href: '/app/leads' },
    { label: 'Tasks', href: '/app/tasks' }
  ];

  let userName = '';

  $: pathname = $page.url.pathname;
  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    clearToken();
    clearUser();
    goto('/login');
  };

  onMount(() => {
    const user = getUser();
    userName = user?.name ?? '';
  });
</script>

<div class="min-h-screen bg-transparent px-6 py-8">
  <div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[260px_1fr]">
    <aside class="relative rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-soft backdrop-blur">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-slate">Mini CRM</p>
          <p class="font-display text-xl text-ink">Atlas Desk</p>
        </div>
        <div class="h-9 w-9 rounded-full bg-coral/20" />
      </div>

      <nav class="mt-8 space-y-3">
        {#each nav as item}
          <a
            class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em]"
            class:bg-ink={isActive(item.href)}
            class:text-clay={isActive(item.href)}
            class:text-slate={!isActive(item.href)}
            href={item.href}
          >
            {item.label}
            <span class="h-2 w-2 rounded-full bg-coral/70" />
          </a>
        {/each}
      </nav>

      <div class="mt-10 rounded-2xl border border-ink/10 bg-clay p-4 text-sm text-slate">
        <p class="font-semibold text-ink">Team roles</p>
        <p class="mt-2">Admin controls, audit log, CSV import.</p>
      </div>
    </aside>

    <section class="space-y-8">
      <header class="flex flex-col gap-4 rounded-3xl border border-ink/10 bg-white/70 px-6 py-5 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-slate">Workspace</p>
          <h1 class="font-display text-2xl text-ink">
            {userName ? `Good afternoon, ${userName}` : 'Good afternoon'}
          </h1>
        </div>
        <div class="flex flex-wrap gap-3">
          <input
            class="w-full rounded-full border border-ink/10 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral/50 sm:w-64"
            placeholder="Search clients, tasks"
          />
          <a
            href="/app/tasks?new=1"
            class="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay"
          >
            New task
          </a>
          <button
            class="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
            on:click={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <slot />
    </section>
  </div>
</div>
