<script lang="ts">
  import { goto } from '$app/navigation';
  import { apiFetch, setToken, setUser } from '$lib/api';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  const handleSubmit = async () => {
    error = '';
    loading = true;
    try {
      const response = await apiFetch<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
        '/auth/login',
        {
        method: 'POST',
        body: JSON.stringify({ email, password })
        }
      );
      setToken(response.token);
      setUser(response.user);
      goto('/app');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Login failed';
    } finally {
      loading = false;
    }
  };
</script>

<section class="relative flex min-h-screen items-center justify-center px-6 py-20">
  <div class="absolute inset-0">
    <div class="absolute left-10 top-20 h-56 w-56 rounded-full bg-sky/40 blur-3xl" />
    <div class="absolute bottom-16 right-24 h-64 w-64 rounded-full bg-coral/30 blur-3xl" />
  </div>

  <div class="relative w-full max-w-md rounded-3xl border border-ink/10 bg-white/80 p-8 shadow-soft backdrop-blur">
    <h1 class="font-display text-3xl text-ink">Sign in</h1>
    <p class="mt-2 text-sm text-slate">Access your CRM workspace.</p>

    <form
      class="mt-6 space-y-4"
      on:submit|preventDefault={handleSubmit}
    >
      <label class="block">
        <span class="text-xs uppercase tracking-[0.2em] text-slate">Email</span>
        <input
          class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/50"
          type="email"
          placeholder="you@company.com"
          bind:value={email}
        />
      </label>
      <label class="block">
        <span class="text-xs uppercase tracking-[0.2em] text-slate">Password</span>
        <input
          class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/50"
          type="password"
          placeholder="••••••••"
          bind:value={password}
        />
      </label>
      {#if error}
        <p class="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-coral">
          {error}
        </p>
      {/if}
      <button
        type="submit"
        class="w-full rounded-full bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-clay"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate">
      New here? <a class="font-semibold text-ink" href="/register">Create an account</a>
    </p>
  </div>
</section>
