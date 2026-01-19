<template>
  <div v-if="loading" class="rounded-2xl border border-ink/10 bg-white/80 px-6 py-4 text-sm text-slate shadow-soft">
    Loading dashboard...
  </div>
  <p v-else-if="error" class="rounded-2xl border border-coral/20 bg-coral/10 px-6 py-4 text-sm text-coral">
    {{ error }}
  </p>
  <template v-else>
    <div class="grid gap-6 lg:grid-cols-3">
      <StatCard label="Active clients" :value="String(activeClients)" tone="mint" />
      <StatCard label="Leads in flow" :value="String(activeLeads)" tone="sky" />
      <StatCard label="Paused" :value="String(pausedClients)" tone="coral" />
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section class="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-xl text-ink">Client status</h2>
          <StatusPill label="Live" tone="mint" />
        </div>
        <div class="mt-6 space-y-4">
          <div
            v-for="client in clients"
            :key="client.id"
            class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-clay/60 px-4 py-3"
          >
            <div>
              <p class="text-sm font-semibold text-ink">{{ client.name }}</p>
              <p class="text-xs uppercase tracking-[0.2em] text-slate">{{ client.industry }}</p>
            </div>
            <div class="flex items-center gap-3">
              <p class="text-xs text-slate">{{ formatEuDate(client.lastTouch) || client.lastTouch }}</p>
              <StatusPill :label="client.status" :tone="statusTone(client.status)" />
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 class="font-display text-xl text-ink">Priority tasks</h2>
        <div class="mt-6 space-y-4">
          <div v-for="task in tasks" :key="task.id" class="rounded-2xl border border-ink/10 bg-white px-4 py-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-ink">{{ task.title }}</p>
              <p class="text-xs text-slate">{{ formatEuDate(task.due) || task.due }}</p>
            </div>
            <div class="mt-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate">
              <span>{{ task.client || task.clientId || 'Unassigned' }}</span>
              <StatusPill :label="task.status" :tone="taskTone(task.status)" />
            </div>
          </div>
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
        <div v-for="lead in leads" :key="lead.id" class="rounded-2xl border border-ink/10 bg-clay/70 p-4">
          <p class="text-sm font-semibold text-ink">{{ lead.name }}</p>
          <p class="text-xs uppercase tracking-[0.2em] text-slate">{{ lead.stage }}</p>
          <div class="mt-4 flex items-center justify-between">
            <p class="text-xs text-slate">{{ lead.owner }}</p>
            <StatusPill :label="lead.value" tone="ink" />
          </div>
        </div>
      </div>
    </section>
  </template>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import StatCard from '../../components/StatCard.vue';
import StatusPill from '../../components/StatusPill.vue';
import { apiFetch } from '../../lib/api';
import { formatEuDate } from '../../lib/date';

const clients = ref([]);
const leads = ref([]);
const tasks = ref([]);
const loading = ref(true);
const error = ref('');

const activeClients = computed(() => clients.value.filter((client) => client.status === 'active').length);
const activeLeads = computed(() => clients.value.filter((client) => client.status === 'lead').length);
const pausedClients = computed(() => clients.value.filter((client) => client.status === 'paused').length);

const statusTone = (status) => (status === 'active' ? 'mint' : status === 'lead' ? 'sky' : 'coral');
const taskTone = (status) => (status === 'done' ? 'mint' : status === 'todo' ? 'coral' : 'sky');

const loadAll = async () => {
  loading.value = true;
  error.value = '';
  try {
    const [clientsData, leadsData, tasksData] = await Promise.all([
      apiFetch('/clients'),
      apiFetch('/leads'),
      apiFetch('/tasks')
    ]);
    clients.value = clientsData;
    leads.value = leadsData.map((lead) => ({
      ...lead,
      value: typeof lead.value === 'number' ? `$${lead.value}` : lead.value
    }));
    tasks.value = tasksData;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load dashboard.';
  } finally {
    loading.value = false;
  }
};

onMounted(loadAll);
</script>
