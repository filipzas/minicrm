<template>
  <section class="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="font-display text-xl text-ink">Leads</h2>
        <p class="text-sm text-slate">Keep the pipeline moving with clear stages.</p>
      </div>
      <button class="rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
        Add lead
      </button>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <p v-if="loading" class="rounded-2xl border border-ink/10 bg-clay/60 px-4 py-3 text-sm text-slate">
        Loading leads...
      </p>
      <p v-else-if="error" class="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
        {{ error }}
      </p>
      <div v-else v-for="lead in leads" :key="lead.id" class="rounded-2xl border border-ink/10 bg-clay/70 p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-ink">{{ lead.name }}</p>
          <StatusPill :label="lead.value" tone="ink" />
        </div>
        <div class="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate">
          <span>{{ lead.stage }}</span>
          <span>Owner {{ lead.owner }}</span>
        </div>
        <div class="mt-4 h-2 w-full rounded-full bg-white">
          <div class="h-2 rounded-full bg-mint" :style="{ width: stageWidth(lead.stage) }" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import StatusPill from '../../components/StatusPill.vue';
import { apiFetch } from '../../lib/api';

const leads = ref([]);
const loading = ref(true);
const error = ref('');

const stageWidth = (stage) => {
  if (stage === 'discovery') return '20%';
  if (stage === 'proposal') return '50%';
  if (stage === 'negotiation') return '75%';
  return '100%';
};

const loadLeads = async () => {
  loading.value = true;
  error.value = '';
  try {
    const data = await apiFetch('/leads');
    leads.value = data.map((lead) => ({
      ...lead,
      value: typeof lead.value === 'number' ? `$${lead.value}` : lead.value
    }));
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load leads.';
  } finally {
    loading.value = false;
  }
};

onMounted(loadLeads);
</script>
