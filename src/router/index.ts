import { createRouter, createWebHistory } from 'vue-router'

export const ROUTE_NAMES = {
  home: 'home',
  settings: 'settings',
  game: 'game',
} as const

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: ROUTE_NAMES.home,
      component: () => import('@/modules/home/views/HomeView.vue'),
    },
    {
      path: '/settings',
      name: ROUTE_NAMES.settings,
      component: () => import('@/modules/settings/views/SettingsView.vue'),
    },
    {
      path: '/game',
      name: ROUTE_NAMES.game,
      component: () => import('@/modules/game/views/GameView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: ROUTE_NAMES.home },
    },
  ],
})
