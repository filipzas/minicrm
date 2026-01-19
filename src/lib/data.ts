export type ClientStatus = 'active' | 'paused' | 'lead';

export type Client = {
  id: string;
  name: string;
  industry: string;
  owner: string;
  status: ClientStatus;
  lastTouch: string;
};

export type Task = {
  id: string;
  title: string;
  client?: string;
  clientId?: string | null;
  due?: string | null;
  status: 'todo' | 'in-progress' | 'done';
};

export type Lead = {
  id: string;
  name: string;
  stage: 'discovery' | 'proposal' | 'negotiation' | 'won';
  value: string | number;
  owner: string;
};

export const clients: Client[] = [
  {
    id: 'c-102',
    name: 'Lumen Studio',
    industry: 'Design',
    owner: 'Nadia',
    status: 'active',
    lastTouch: '06/02/2024'
  },
  {
    id: 'c-103',
    name: 'Riverline Coffee',
    industry: 'Hospitality',
    owner: 'Mateo',
    status: 'lead',
    lastTouch: '05/02/2024'
  },
  {
    id: 'c-104',
    name: 'BrightSide Legal',
    industry: 'Legal',
    owner: 'Nadia',
    status: 'paused',
    lastTouch: '30/01/2024'
  },
  {
    id: 'c-105',
    name: 'Atlas Mobility',
    industry: 'Logistics',
    owner: 'Mila',
    status: 'active',
    lastTouch: '06/02/2024'
  }
];

export const tasks: Task[] = [
  {
    id: 't-201',
    title: 'Kickoff call and discovery notes',
    client: 'Lumen Studio',
    due: '06/02/2024',
    status: 'in-progress'
  },
  {
    id: 't-202',
    title: 'Send proposal draft',
    client: 'Riverline Coffee',
    due: '08/02/2024',
    status: 'todo'
  },
  {
    id: 't-203',
    title: 'Review contract addendum',
    client: 'BrightSide Legal',
    due: '09/02/2024',
    status: 'done'
  }
];

export const leads: Lead[] = [
  {
    id: 'l-301',
    name: 'Pebble Hotel',
    stage: 'proposal',
    value: '$8.2k',
    owner: 'Nadia'
  },
  {
    id: 'l-302',
    name: 'Nordic Health',
    stage: 'negotiation',
    value: '$12k',
    owner: 'Mila'
  },
  {
    id: 'l-303',
    name: 'Studio March',
    stage: 'discovery',
    value: '$4k',
    owner: 'Mateo'
  }
];
