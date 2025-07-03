<template>
  <div>
    <header class="header">
      <div class="logo">
        <span class="logo-icon">🏨</span>
        <span class="logo-text">Hotels.com</span>
      </div>
      <button class="hamburger" :class="{ open: menuOpen }" @click="toggleMenu" aria-label="Menüyü Aç/Kapat">
        <span v-if="!menuOpen" class="chevron-icon">▼</span>
        <span v-else class="chevron-icon">▲</span>
      </button>
      <nav class="nav" :class="{ open: menuOpen }">
        <template v-if="username">
          <span class="welcome">
            <img v-if="photoUrl" :src="photoUrl" alt="Profil Fotoğrafı" class="profile-photo" />
            Merhaba, {{ username }}
          </span>
          <button class="nav-link" @click="logout">Çıkış yap</button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">Giriş yap</router-link>
          <router-link to="/register" class="nav-link">Kayıt ol</router-link>
        </template>
        <router-link to="/" class="nav-link">Anasayfa</router-link>
      </nav>
    </header>
    <router-view />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const photo = ref('');
const menuOpen = ref(false);
const router = useRouter();
const backendUrl = import.meta.env.VITE_API_URL;

const photoUrl = computed(() =>
  photo.value && !photo.value.startsWith('http')
    ? `${backendUrl}${photo.value.startsWith('/') ? '' : '/'}${photo.value}`
    : photo.value
);

const checkLogin = () => {
  username.value = localStorage.getItem('username') || '';
  photo.value = localStorage.getItem('photo') || '';
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('photo');
  username.value = '';
  photo.value = '';
  router.push('/');
};

const continueAsGuest = () => {
  localStorage.removeItem('username');
  router.push('/');
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

onMounted(() => {
  checkLogin();
  window.addEventListener('storage', checkLogin);
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 40px;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.logo {
  display: flex;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
  color: #e61e38;
}
.logo-icon {
  font-size: 2.2rem;
  margin-right: 8px;
}
.logo-text {
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 1px;
}
.nav {
  display: flex;
  gap: 24px;
  align-items: center;
  background: none !important;
  box-shadow: none !important;
}
.nav-link {
  color: #e61e38;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  background: none !important;
  border: none !important;
  padding: 0 !important;
  box-shadow: none !important;
  cursor: pointer;
  transition: color 0.2s;
}
.nav-link:hover {
  color: #111;
}
.welcome {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #222;
}
.profile-photo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
}
.hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 20;
}
.chevron-icon {
  font-size: 2rem;
  color: #e61e38;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}
.nav {
  display: flex;
  gap: 24px;
  align-items: center;
  background: none !important;
  box-shadow: none !important;
}
.nav-link {
  color: #e61e38;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  background: none !important;
  border: none !important;
  padding: 0 !important;
  box-shadow: none !important;
  cursor: pointer;
  transition: color 0.2s;
}
.nav-link:hover {
  color: #111;
}
.welcome {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #222;
}
.profile-photo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
}
@media (max-width: 700px) {
  .nav,
  .nav.open {
    position: absolute;
    top: 70px;
    right: 0;
    background: #e3e8f7 !important;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    width: 200px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    padding: 16px 0 16px 16px;
    border-radius: 0 0 0 12px;
    display: none;
    z-index: 10;
  }
  .nav.open {
    display: flex;
  }
  .hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: none;
    border: none;
  }
  .header {
    position: relative;
  }
  .welcome {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-bottom: 8px;
  }
  .profile-photo {
    width: 40px;
    height: 40px;
    margin-bottom: 4px;
    margin-top: 2px;
  }
  .nav-link {
    width: 100%;
    text-align: left;
    padding: 10px 0 10px 8px !important;
    margin: 0;
    border-radius: 6px;
    background: none !important;
  }
}
</style>
