const store = {
  users: [],
  clients: [
    {
      id: 'c-102',
      name: 'Lumen Studio',
      industry: 'Design',
      owner: 'Nadia',
      status: 'active',
      lastTouch: '2 days ago'
    },
    {
      id: 'c-103',
      name: 'Riverline Coffee',
      industry: 'Hospitality',
      owner: 'Mateo',
      status: 'lead',
      lastTouch: 'Yesterday'
    },
    {
      id: 'c-104',
      name: 'BrightSide Legal',
      industry: 'Legal',
      owner: 'Nadia',
      status: 'paused',
      lastTouch: '1 week ago'
    },
    {
      id: 'c-105',
      name: 'Atlas Mobility',
      industry: 'Logistics',
      owner: 'Mila',
      status: 'active',
      lastTouch: 'Today'
    }
  ],
  leads: [
    {
      id: 'l-301',
      name: 'Pebble Hotel',
      stage: 'proposal',
      value: 8200,
      owner: 'Nadia'
    },
    {
      id: 'l-302',
      name: 'Nordic Health',
      stage: 'negotiation',
      value: 12000,
      owner: 'Mila'
    },
    {
      id: 'l-303',
      name: 'Studio March',
      stage: 'discovery',
      value: 4000,
      owner: 'Mateo'
    }
  ],
  tasks: [
    {
      id: 't-201',
      title: 'Kickoff call and discovery notes',
      clientId: 'c-102',
      due: '2024-02-06',
      status: 'in-progress'
    },
    {
      id: 't-202',
      title: 'Send proposal draft',
      clientId: 'c-103',
      due: '2024-02-08',
      status: 'todo'
    },
    {
      id: 't-203',
      title: 'Review contract addendum',
      clientId: 'c-104',
      due: '2024-02-09',
      status: 'done'
    }
  ],
  audit: []
};

let counters = {
  users: 1,
  clients: 106,
  leads: 304,
  tasks: 204
};

const makeId = (prefix, key) => {
  const next = counters[key] ?? 1;
  counters[key] = next + 1;
  return `${prefix}-${next}`;
};

const addAudit = (event) => {
  store.audit.unshift({
    id: makeId('a', 'audit'),
    timestamp: new Date().toISOString(),
    ...event
  });
};

module.exports = {
  store,
  makeId,
  addAudit
};
