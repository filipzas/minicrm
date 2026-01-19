<template>
  <section class="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
    <p v-if="loading" class="text-sm text-slate">Loading client...</p>
    <p v-else-if="error" class="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
      {{ error }}
    </p>
    <template v-else-if="client">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-slate">Client profile</p>
          <h2 class="font-display text-2xl text-ink">{{ client.name }}</h2>
        </div>
        <div class="flex items-center gap-3">
          <StatusPill :label="client.status" :tone="statusTone(client.status)" />
          <button
            class="rounded-full border border-ink/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink"
            @click="openEdit"
          >
            Edit
          </button>
          <button
            class="rounded-full border border-coral/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-coral"
            @click="handleDelete"
          >
            Delete
          </button>
        </div>
      </div>

      <div class="mt-6 grid gap-4 sm:grid-cols-3">
        <div class="rounded-2xl border border-ink/10 bg-clay/70 p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-slate">Industry</p>
          <p class="mt-2 text-lg font-semibold text-ink">{{ client.industry }}</p>
        </div>
        <div class="rounded-2xl border border-ink/10 bg-clay/70 p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-slate">Owner</p>
          <p class="mt-2 text-lg font-semibold text-ink">{{ client.owner }}</p>
        </div>
        <div class="rounded-2xl border border-ink/10 bg-clay/70 p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-slate">Last touch</p>
          <p class="mt-2 text-lg font-semibold text-ink">{{ formatEuDate(client.lastTouch) || client.lastTouch }}</p>
        </div>
      </div>

      <div class="mt-8">
        <h3 class="font-display text-xl text-ink">Tasks</h3>
        <div class="mt-4 space-y-3">
          <div v-if="clientTasks.length === 0" class="text-sm text-slate">No tasks linked to this client yet.</div>
          <div v-for="task in clientTasks" :key="task.id" class="rounded-2xl border border-ink/10 bg-white px-4 py-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-ink">{{ task.title }}</p>
              <StatusPill :label="task.status" :tone="taskTone(task.status)" />
            </div>
            <p class="mt-2 text-xs uppercase tracking-[0.2em] text-slate">
              Due {{ formatEuDate(task.due) || task.due || 'TBD' }}
            </p>
          </div>
        </div>
      </div>
    </template>
    <p v-else class="text-sm text-slate">Client not found.</p>
  </section>

  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
    <div class="w-full max-w-md rounded-3xl border border-ink/10 bg-white/90 p-6 shadow-soft backdrop-blur">
      <div class="flex items-center justify-between">
        <h3 class="font-display text-xl text-ink">Edit client</h3>
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
          {{ saving ? 'Saving...' : 'Save changes' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import StatusPill from '../../components/StatusPill.vue';
import { apiFetch } from '../../lib/api';
import { formatEuDate, normalizeEuDate } from '../../lib/date';

const route = useRoute();
const router = useRouter();

const client = ref(null);
const clientTasks = ref([]);
const loading = ref(true);
const error = ref('');

const showModal = ref(false);
const saving = ref(false);
const formError = ref('');
const formName = ref('');
const formIndustry = ref('');
const formOwner = ref('');
const formStatus = ref('lead');
const formLastTouch = ref('');

const statusTone = (status) => (status === 'active' ? 'mint' : status === 'lead' ? 'sky' : 'coral');
const taskTone = (status) => (status === 'done' ? 'mint' : status === 'todo' ? 'coral' : 'sky');

const loadClient = async () => {
  loading.value = true;
  error.value = '';
  try {
    const clientId = route.params.id;
    client.value = await apiFetch(`/clients/${clientId}`);
    clientTasks.value = await apiFetch(`/tasks?clientId=${clientId}`);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load client.';
  } finally {
    loading.value = false;
  }
};

const openEdit = () => {
  if (!client.value) return;
  formName.value = client.value.name || '';
  formIndustry.value = client.value.industry || '';
  formOwner.value = client.value.owner || '';
  formStatus.value = client.value.status || 'lead';
  formLastTouch.value = client.value.lastTouch || '';
  formError.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formError.value = '';
};

const handleSave = async () => {
  if (!client.value) return;
  if (!formName.value.trim()) {
    formError.value = 'Client name is required.';
    return;
  }

  saving.value = true;
  formError.value = '';
  try {
    await apiFetch(`/clients/${client.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: formName.value,
        industry: formIndustry.value || undefined,
        owner: formOwner.value || undefined,
        status: formStatus.value,
        lastTouch: normalizeEuDate(formLastTouch.value) || undefined
      })
    });
    await loadClient();
    closeModal();
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Unable to update client.';
  } finally {
    saving.value = false;
  }
};

const handleDelete = async () => {
  if (!client.value) return;
  if (typeof window !== 'undefined' && !window.confirm('Delete this client?')) {
    return;
  }

  try {
    await apiFetch(`/clients/${client.value.id}`, { method: 'DELETE' });
    router.push('/app/clients');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to delete client.';
  }
};

onMounted(loadClient);
</script>
