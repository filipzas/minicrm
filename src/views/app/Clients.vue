<template>
  <section class="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="font-display text-xl text-ink">Clients</h2>
        <p class="text-sm text-slate">Track accounts and collaboration status.</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button
          class="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay"
          @click="openCreate"
        >
          Add client
        </button>
      </div>
    </div>

    <form class="mt-6 grid gap-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr_auto]" @submit.prevent="loadClients">
      <input
        v-model="search"
        class="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
        placeholder="Search clients"
      />
      <select
        v-model="filterStatus"
        class="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
      >
        <option value="">All statuses</option>
        <option value="lead">Lead</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
      </select>
      <input
        v-model="filterOwner"
        class="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
        placeholder="Owner"
      />
      <button
        class="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
        type="submit"
      >
        Apply
      </button>
    </form>

    <div class="mt-6 grid gap-4">
      <p v-if="loading" class="rounded-2xl border border-ink/10 bg-clay/60 px-4 py-3 text-sm text-slate">
        Loading clients...
      </p>
      <p v-else-if="error" class="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
        {{ error }}
      </p>
      <p v-else-if="clients.length === 0" class="rounded-2xl border border-ink/10 bg-clay/60 px-4 py-3 text-sm text-slate">
        No clients found.
      </p>
      <RouterLink
        v-else
        v-for="client in clients"
        :key="client.id"
        :to="`/app/clients/${client.id}`"
        class="group rounded-2xl border border-ink/10 bg-clay/60 px-5 py-4 transition hover:-translate-y-0.5 hover:border-ink/30"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-ink group-hover:text-ink">{{ client.name }}</p>
            <p class="text-xs uppercase tracking-[0.2em] text-slate">{{ client.industry }}</p>
          </div>
          <div class="flex items-center gap-3">
            <p class="text-xs text-slate">Owner: {{ client.owner }}</p>
            <p class="text-xs text-slate">Last touch: {{ formatEuDate(client.lastTouch) || client.lastTouch }}</p>
            <StatusPill :label="client.status" :tone="statusTone(client.status)" />
            <button
              class="rounded-full border border-ink/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink"
              @click.prevent.stop="openEdit(client)"
            >
              Edit
            </button>
            <button
              class="rounded-full border border-coral/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-coral"
              @click.prevent.stop="handleDelete(client.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>

  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
    <div class="w-full max-w-md rounded-3xl border border-ink/10 bg-white/90 p-6 shadow-soft backdrop-blur">
      <div class="flex items-center justify-between">
        <h3 class="font-display text-xl text-ink">{{ modalMode === 'create' ? 'Add client' : 'Edit client' }}</h3>
        <button
          class="rounded-full border border-ink/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate"
          @click="closeModal"
        >
          Close
        </button>
      </div>

      <form class="mt-5 space-y-4" @submit.prevent="handleSave">
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Name</span>
          <input
            v-model="formName"
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40"
            placeholder="Lumen Studio"
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Industry</span>
          <input
            v-model="formIndustry"
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40"
            placeholder="Design"
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Owner</span>
          <input
            v-model="formOwner"
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40"
            placeholder="Nadia"
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Status</span>
          <select
            v-model="formStatus"
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40"
          >
            <option value="lead">lead</option>
            <option value="active">active</option>
            <option value="paused">paused</option>
          </select>
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Last touch</span>
          <input
            v-model="formLastTouch"
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky/40"
            placeholder="dd/mm/yyyy"
          />
        </label>

        <p
          v-if="formError"
          class="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-coral"
        >
          {{ formError }}
        </p>

        <button
          type="submit"
          class="w-full rounded-full bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-clay"
          :disabled="saving"
        >
          {{ saving ? 'Saving...' : modalMode === 'create' ? 'Create client' : 'Save changes' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import StatusPill from '../../components/StatusPill.vue';
import { apiFetch } from '../../lib/api';
import { formatEuDate, normalizeEuDate } from '../../lib/date';

const clients = ref([]);
const loading = ref(true);
const error = ref('');

const showModal = ref(false);
const modalMode = ref('create');
const saving = ref(false);
const formError = ref('');
const formName = ref('');
const formIndustry = ref('');
const formOwner = ref('');
const formStatus = ref('lead');
const formLastTouch = ref('');
const selectedClient = ref(null);

const search = ref('');
const filterStatus = ref('');
const filterOwner = ref('');

const statusTone = (status) => (status === 'active' ? 'mint' : status === 'lead' ? 'sky' : 'coral');

const loadClients = async () => {
  loading.value = true;
  error.value = '';

  const params = new URLSearchParams();
  if (search.value.trim()) params.set('q', search.value.trim());
  if (filterStatus.value) params.set('status', filterStatus.value);
  if (filterOwner.value.trim()) params.set('owner', filterOwner.value.trim());

  const query = params.toString();

  try {
    clients.value = await apiFetch(`/clients${query ? `?${query}` : ''}`);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load clients.';
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  formName.value = '';
  formIndustry.value = '';
  formOwner.value = '';
  formStatus.value = 'lead';
  formLastTouch.value = '';
  formError.value = '';
};

const openCreate = () => {
  modalMode.value = 'create';
  selectedClient.value = null;
  resetForm();
  showModal.value = true;
};

const openEdit = (client) => {
  modalMode.value = 'edit';
  selectedClient.value = client;
  formName.value = client.name || '';
  formIndustry.value = client.industry || '';
  formOwner.value = client.owner || '';
  formStatus.value = client.status || 'lead';
  formLastTouch.value = client.lastTouch || '';
  formError.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formError.value = '';
};

const handleSave = async () => {
  if (!formName.value.trim()) {
    formError.value = 'Client name is required.';
    return;
  }

  saving.value = true;
  formError.value = '';
  try {
    const payload = {
      name: formName.value,
      industry: formIndustry.value || undefined,
      owner: formOwner.value || undefined,
      status: formStatus.value,
      lastTouch: normalizeEuDate(formLastTouch.value) || undefined
    };

    if (modalMode.value === 'create') {
      await apiFetch('/clients', { method: 'POST', body: JSON.stringify(payload) });
    } else if (selectedClient.value) {
      await apiFetch(`/clients/${selectedClient.value.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    }

    await loadClients();
    closeModal();
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Unable to save client.';
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (clientId) => {
  if (typeof window !== 'undefined' && !window.confirm('Delete this client?')) {
    return;
  }

  try {
    await apiFetch(`/clients/${clientId}`, { method: 'DELETE' });
    await loadClients();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to delete client.';
  }
};

onMounted(loadClients);
</script>
