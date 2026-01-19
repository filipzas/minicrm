<template>
  <section class="relative flex min-h-screen items-center justify-center px-6 py-20">
    <div class="absolute inset-0">
      <div class="absolute right-10 top-16 h-64 w-64 rounded-full bg-mint/30 blur-3xl" />
      <div class="absolute bottom-12 left-24 h-56 w-56 rounded-full bg-sky/30 blur-3xl" />
    </div>

    <div class="relative w-full max-w-md rounded-3xl border border-ink/10 bg-white/80 p-8 shadow-soft backdrop-blur">
      <h1 class="font-display text-3xl text-ink">Create account</h1>
      <p class="mt-2 text-sm text-slate">Start tracking clients with clarity.</p>

      <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Name</span>
          <input
            v-model="name"
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mint/50"
            type="text"
            placeholder="Alex Rivera"
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Email</span>
          <input
            v-model="email"
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mint/50"
            type="email"
            placeholder="you@company.com"
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Password</span>
          <input
            v-model="password"
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mint/50"
            type="password"
            placeholder="••••••••"
          />
        </label>
        <p
          v-if="error"
          class="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-coral"
        >
          {{ error }}
        </p>
        <button
          type="submit"
          class="w-full rounded-full bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-clay"
          :disabled="loading"
        >
          {{ loading ? 'Creating...' : 'Create account' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-slate">
        Already have access?
        <RouterLink class="font-semibold text-ink" to="/login">Sign in</RouterLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { apiFetch, setToken, setUser } from '../lib/api';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;
  try {
    const response = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: name.value, email: email.value, password: password.value })
    });
    setToken(response.token);
    setUser(response.user);
    router.push('/app');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed';
  } finally {
    loading.value = false;
  }
};
</script>
