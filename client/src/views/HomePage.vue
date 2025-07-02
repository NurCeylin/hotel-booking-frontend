<template>
  <div class="home-container">
    <h2>Otel Ara</h2>
    <form @submit.prevent="searchHotels">
      <input v-model="city" type="text" placeholder="Şehir" required />
      <input v-model="checkInDate" type="date" required />
      <input v-model.number="guests" type="number" min="1" placeholder="Kişi Sayısı" required />
      <button type="submit">Ara</button>
    </form>

    <!-- Otel listesi -->
    <div v-if="hotels.length > 0" class="hotel-list">
      <div v-for="hotel in hotels" :key="hotel._id" class="hotel-card">
        <router-link :to="`/hotels/${hotel._id}`">
          <img :src="hotel.image" alt="Otel Resmi" class="hotel-image" />
        </router-link>
        <div class="hotel-info">
          <h3>
            <router-link :to="`/hotels/${hotel._id}`">
              {{ hotel.name }}
            </router-link>
          </h3>
          <p>Puan: {{ hotel.rating }} ⭐ ({{ hotel.commentCount }} yorum)</p>
          <p v-if="username">
            <s>{{ hotel.price }} TL</s>
            <strong>{{ calculateDiscount(hotel.price) }} TL</strong>
          </p>
          <p v-else>
            <strong>{{ hotel.price }} TL</strong><br />
            <small class="info-msg">Üye fiyatını görmek için giriş yapın</small>
          </p>
          <!-- Yorumlar Butonu -->
          <button @click="showComments(hotel)">Yorumları Göster</button>
        </div>
      </div>
    </div>

    <!-- Yorumlar ve grafik -->
    <div v-if="selectedHotel" class="comments-section">
      <h3>Yorumlar ve Servis Dağılımı</h3>
      <div v-for="comment in selectedHotel.comments" :key="comment._id" class="comment">
        <p>{{ comment.text }} - Puan: {{ comment.rating }}</p>
      </div>
      <div v-if="selectedHotel.services">
        <p><strong>Servis Dağılımı:</strong></p>
        <canvas id="servicesChart"></canvas>
      </div>
    </div>

    <p v-if="hotels.length === 0 && searched" class="no-results">Sonuç bulunamadı.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Chart } from 'chart.js';
import HotelMap from '../components/HotelMap.vue';

const hotels = ref([]);
const selectedHotel = ref(null);
const city = ref('');
const checkInDate = ref('');
const guests = ref(1);
const searched = ref(false);
const username = localStorage.getItem('username');

const fetchHotels = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/hotels');
    hotels.value = res.data;
  } catch (err) {
    console.error('Otel verileri alınamadı:', err);
  }
};

const searchHotels = async () => {
  searched.value = true;
  try {
    const res = await axios.get('http://localhost:3000/api/hotels/search', {
      params: {
        city: city.value,
        date: checkInDate.value,
        guests: guests.value,
        country: localStorage.getItem('country') || 'turkey'
      }
    });
    hotels.value = res.data;
  } catch (err) {
    console.error('Arama sırasında hata:', err);
  }
};

const showComments = (hotel) => {
  selectedHotel.value = hotel;
  if (hotel.comments) {
    drawServicesChart(hotel.comments);
  }
};

const calculateDiscount = (price) => {
  return Math.round(price * 0.9);
};

const drawServicesChart = (comments) => {
  const serviceRatings = {
    cleanliness: 0,
    location: 0,
    value: 0,
    comfort: 0,
    service: 0
  };

  // Servislere göre puanları toplama
  comments.forEach(comment => {
    serviceRatings.cleanliness += comment.ratings.cleanliness || 0;
    serviceRatings.location += comment.ratings.location || 0;
    serviceRatings.value += comment.ratings.value || 0;
    serviceRatings.comfort += comment.ratings.comfort || 0;
    serviceRatings.service += comment.ratings.service || 0;
  });

  const chartData = {
    labels: ['Temizlik', 'Konum', 'Fiyat/Değer', 'Konfor', 'Hizmet'],
    datasets: [{
      label: 'Servis Puanları',
      data: [
        serviceRatings.cleanliness / comments.length,
        serviceRatings.location / comments.length,
        serviceRatings.value / comments.length,
        serviceRatings.comfort / comments.length,
        serviceRatings.service / comments.length
      ],
      backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#F4A300'],
    }]
  };

  // Chart.js ile grafik çizme
  const ctx = document.getElementById('servicesChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

onMounted(() => {
  fetchHotels();
});
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}
input {
  flex: 1 1 30%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 0.5rem 1rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.hotel-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.hotel-card {
  display: flex;
  gap: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
}
.hotel-image {
  width: 150px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}
.hotel-info {
  flex: 1;
}
.no-results {
  text-align: center;
  color: #888;
}
.comments-section {
  margin-top: 2rem;
}
.comment {
  padding: 0.5rem;
  border: 1px solid #ccc;
  margin-bottom: 1rem;
}
</style>
