<template>
  <div>
    <nav class="navbar">
      <router-link to="/" class="logo">Otel Rezervasyon</router-link>
      <div class="menu">
        <span v-if="username">Merhaba, {{ username }}</span>
        <img v-if="photo" :src="photo" alt="Profil Fotoğrafı" class="profile-photo" />
        <router-link v-if="!username" to="/login" class="nav-link">Giriş Yap</router-link>
        <router-link v-if="!username" to="/register" class="nav-link">Kayıt Ol</router-link>
        <button v-if="username" @click="logout" class="logout-button">Çıkış Yap</button>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const photo = ref('');
const router = useRouter();

const checkLogin = () => {
  username.value = localStorage.getItem('username') || '';
  photo.value = localStorage.getItem('photo') || ''; // Fotoğrafı localStorage'dan alıyoruz
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('photo'); // Fotoğrafı da kaldırıyoruz
  username.value = '';
  photo.value = '';
  router.push('/');
};

onMounted(() => {
  checkLogin();

  // Sayfa her yenilendiğinde de kontrol etmek istersen bu satırı ekleyebilirsin
  window.addEventListener('storage', checkLogin);
});
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
}

.logo {
  font-weight: bold;
  font-size: 1.2rem;
  color: white;
  text-decoration: none;
}

.menu {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
}

.nav-link:hover,
.logout-button:hover {
  text-decoration: underline;
}

.logout-button {
  background-color: #e74c3c;
  border: none;
  padding: 0.5rem 1rem;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.profile-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-left: 10px;
}
</style>
