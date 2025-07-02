<template>
  <div class="auth-container">
    <h2>Kayıt Ol</h2>
    <form @submit.prevent="register" enctype="multipart/form-data">
      <input v-model="name" type="text" placeholder="İsim" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Şifre" required />
      <input v-model="country" type="text" placeholder="Ülke" required />
      <input v-model="city" type="text" placeholder="Şehir" required />
      <input type="file" @change="handlePhoto" accept="image/*" />
      <button type="submit">Kayıt Ol</button>
    </form>
    <p v-if="success" class="success">Kayıt başarılı, yönlendiriliyorsunuz...</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const country = ref('');
const city = ref('');
const photo = ref(null);
const error = ref('');
const success = ref(false);
const router = useRouter();

const handlePhoto = (event) => {
  photo.value = event.target.files[0];
};

const register = async () => {
  try {
    const formData = new FormData();
    formData.append('name', name.value);
    formData.append('email', email.value);
    formData.append('password', password.value);
    formData.append('country', country.value);
    formData.append('city', city.value);
    if (photo.value) {
      formData.append('photo', photo.value);
    }

    await axios.post('http://localhost:3000/api/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    localStorage.setItem('username', name.value); // Kullanıcı adı saklanır
    success.value = true;
    error.value = '';

    setTimeout(() => {
      router.push('/');
    }, 1000);
  } catch (err) {
    success.value = false;
    error.value = err.response?.data?.error || 'Kayıt başarısız';
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
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
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
.success {
  color: green;
  margin-top: 1rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>
