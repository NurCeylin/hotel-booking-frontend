<template>
  <div class="auth-container">
    <h2>Giriş Yap</h2>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Şifre" required />
      <button type="submit">Giriş Yap</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const login = async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', {
      email: email.value,
      password: password.value
    });

    // Başarılı login -> bilgileri kaydet
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', res.data.name);
    localStorage.setItem('photo', res.data.photo || ''); // Fotoğrafı kaydediyoruz

    error.value = '';
    router.push('/'); // Ana sayfaya yönlendir
  } catch (err) {
    error.value = err.response?.data?.error || 'Giriş başarısız';
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 2rem auto;
  background: white;
  padding: 2rem;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 0.5rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>
