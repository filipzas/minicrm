<template>
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
          @click="showNewTask = true"
        >
          New task
        </button>
      </div>
    </div>

    <div class="mt-6 space-y-4">
      <p v-if="loading" class="rounded-2xl border border-ink/10 bg-clay/60 px-4 py-3 text-sm text-slate">
        Loading tasks...
      </p>
      <p v-else-if="error" class="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
        {{ error }}
      </p>
      <div v-else v-for="task in tasks" :key="task.id" class="rounded-2xl border border-ink/10 bg-clay/70 px-5 py-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-ink">{{ task.title }}</p>
            <p class="text-xs uppercase tracking-[0.2em] text-slate">
              {{ task.client || clientLookup.get(task.clientId || '') || task.clientId || 'Unassigned' }}
            </p>
          </div>
          <div class="flex items-center gap-4">
            <p class="text-xs text-slate">Due {{ formatEuDate(task.due) || task.due || 'TBD' }}</p>
            <StatusPill :label="task.status" :tone="taskTone(task.status)" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <div v-if="showNewTask" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
    <div class="w-full max-w-md rounded-3xl border border-ink/10 bg-white/90 p-6 shadow-soft backdrop-blur">
      <div class="flex items-center justify-between">
        <h3 class="font-display text-xl text-ink">Create task</h3>
        <button
          class="rounded-full border border-ink/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate"
          @click="closeModal"
        >
          Close
        </button>
      </div>

      <form class="mt-5 space-y-4" @submit.prevent="handleCreate">
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Title</span>
          <input
            v-model="formTitle"
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40"
            placeholder="Prepare proposal review"
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Client</span>
          <select
            v-model="formClientId"
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40"
          >
            <option value="">Unassigned</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">{{ client.name }}</option>
          </select>
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Due date</span>
          <input
            v-model="formDue"
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40"
            type="text"
            placeholder="dd/mm/yyyy"
          />
        </label>
        <label class="block">
          <span class="text-xs uppercase tracking-[0.2em] text-slate">Status</span>
          <select
            v-model="formStatus"
            class="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral/40"
          >
            <option value="todo">todo</option>
            <option value="in-progress">in-progress</option>
            <option value="done">done</option>
          </select>
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
          {{ saving ? 'Saving...' : 'Create task' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import StatusPill from '../../components/StatusPill.vue';
import { apiFetch } from '../../lib/api';
import { formatEuDate, normalizeEuDate } from '../../lib/date';

const route = useRoute();
const router = useRouter();

const tasks = ref([]);
const clients = ref([]);
const loading = ref(true);
const error = ref('');
const formError = ref('');
const showNewTask = ref(false);
const saving = ref(false);

const formTitle = ref('');
const formClientId = ref('');
const formDue = ref('');
const formStatus = ref('todo');

const clientLookup = computed(() => new Map(clients.value.map((client) => [client.id, client.name])));

const taskTone = (status) => (status === 'done' ? 'mint' : status === 'todo' ? 'coral' : 'sky');

const loadTasks = async () => {
  loading.value = true;
  error.value = '';
  try {
    const [tasksData, clientsData] = await Promise.all([apiFetch('/tasks'), apiFetch('/clients')]);
    tasks.value = tasksData;
    clients.value = clientsData;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load tasks.';
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  showNewTask.value = false;
  formError.value = '';
  if (route.query.new === '1') {
    router.replace('/app/tasks');
  }
};

const handleCreate = async () => {
  if (!formTitle.value.trim()) {
    formError.value = 'Task title is required.';
    return;
  }

  saving.value = true;
  formError.value = '';
  try {
    await apiFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: formTitle.value,
        clientId: formClientId.value || null,
        due: normalizeEuDate(formDue.value) || null,
        status: formStatus.value
      })
    });
    await loadTasks();
    formTitle.value = '';
    formClientId.value = '';
    formDue.value = '';
    formStatus.value = 'todo';
    closeModal();
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Unable to create task.';
  } finally {
    saving.value = false;
  }
};

watch(
  () => route.query.new,
  (value) => {
    if (value === '1') {
      showNewTask.value = true;
    }
  },
  { immediate: true }
);

onMounted(loadTasks);
</script>
