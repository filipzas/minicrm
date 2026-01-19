import { createRouter, createWebHistory } from 'vue-router';
import { getToken } from '../lib/api';
import HomeView from '../views/Home.vue';
import LoginView from '../views/Login.vue';
import RegisterView from '../views/Register.vue';
import AppLayout from '../views/app/AppLayout.vue';
import DashboardView from '../views/app/Dashboard.vue';
import ClientsView from '../views/app/Clients.vue';
import ClientDetailView from '../views/app/ClientDetail.vue';
import LeadsView from '../views/app/Leads.vue';
import TasksView from '../views/app/Tasks.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    {
      path: '/app',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardView },
        { path: 'clients', name: 'clients', component: ClientsView },
        { path: 'clients/:id', name: 'client', component: ClientDetailView },
        { path: 'leads', name: 'leads', component: LeadsView },
        { path: 'tasks', name: 'tasks', component: TasksView }
      ]
    }
  ]
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !getToken()) {
    return { name: 'login' };
  }
  return true;
});

export default router;
