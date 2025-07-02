<template>
  <div v-if="hotel" class="hotel-detail">
    <h2>{{ hotel.name }}</h2>
    <img :src="hotel.image" alt="Otel Resmi" class="hotel-image" />
    <p><strong>Fiyat:</strong> {{ hotel.price }} TL</p>
    <p><strong>Puan:</strong> {{ hotel.rating }} ⭐</p>
    <p><strong>Yorum Sayısı:</strong> {{ hotel.commentCount }}</p>

    <div v-if="hotel.comments?.length">
      <h3>Yorumlar</h3>
      <ul>
        <li v-for="(comment, index) in hotel.comments" :key="index">
          <strong>{{ comment.user }}:</strong> {{ comment.text }}
        </li>
      </ul>
    </div>
    <div v-else>
      <p>Henüz yorum yok.</p>
    </div>

    <div v-if="username" class="comment-form">
      <h3>Yorum Ekle</h3>
      <form @submit.prevent="submitComment">
        <textarea
          v-model="newComment"
          placeholder="Yorumunuzu yazın..."
          rows="3"
        ></textarea>
        <button type="submit">Gönder</button>
      </form>
    </div>
    <div v-else>
      <p>Yorum yapmak için giriş yapmalısınız.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const hotel = ref(null);
const newComment = ref('');
const username = localStorage.getItem('username');
const route = useRoute();

const loadHotel = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/hotels/${route.params.id}`);
    hotel.value = res.data;
  } catch (err) {
    console.error("Otel verisi alınamadı:", err);
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;

  try {
    const res = await axios.post(`http://localhost:3000/api/hotels/${route.params.id}/comments`, {
      user: username,
      text: newComment.value
    });

    hotel.value.comments.push(res.data); // Yeni yorumu frontend'e ekle
    hotel.value.commentCount++;
    newComment.value = '';
  } catch (err) {
    console.error("Yorum eklenemedi:", err);
  }
};

onMounted(loadHotel);
</script>

<style scoped>
.hotel-detail {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.hotel-image {
  width: 100%;
  height: auto;
  margin-bottom: 1rem;
  border-radius: 4px;
}
.comment-form {
  margin-top: 1rem;
}
textarea {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
