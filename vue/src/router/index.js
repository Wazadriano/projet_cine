import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import ProfileView from '../views/ProfileView.vue';
import NotFoundView from '../views/NotFoundView.vue';
import FilmDetailView from '../views/FilmDetailView.vue';
import MyListsView from '../views/MyListsView.vue';

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/film/:id', name: 'FilmDetail', component: FilmDetailView },
  { path: '/my-lists', name: 'MyList', component: MyListsView },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/favoris',
    name: 'Favoris',
    component: () => import('../views/FavorisView.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/listes-partagees',
    name: 'SharedLists',
    component: () => import('@/views/SharedListsView.vue'),
    meta: { requiresAuth: true }
  },

  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});


router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
