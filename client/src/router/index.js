import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import HotelDetailPage from '../views/HotelDetailPage.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/hotels/:id', component: HotelDetailPage } 
];


const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
