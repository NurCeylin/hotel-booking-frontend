<template>
  <div v-if="hotel" class="hotel-detail">
    <h2>{{ hotel.name }}</h2>
    <img :src="hotel.image" alt="Otel Resmi" class="hotel-image" />
    <div class="price-row">
      <span v-if="hotel.discount !== null && hotel.discount !== undefined">
        <s>{{ hotel.price }} TL</s>
        <strong class="discounted-price">{{ calculateDiscountWithDiscount(hotel.price, hotel.discount) }} TL</strong>
      </span>
      <span v-else>
        <strong>{{ hotel.price }} TL</strong>
      </span>
    </div>
    <div v-if="hotel.amenities && hotel.amenities.length">
      <h3>Otel Özellikleri</h3>
      <div class="amenities-chart-container">
        <canvas ref="amenitiesChart"></canvas>
      </div>
    </div>

    <div v-if="hotel.latitude && hotel.longitude" class="hotel-map-detail">
      <HotelMapSingle :lat="hotel.latitude" :lng="hotel.longitude" :name="hotel.name" />
    </div>

    <div v-if="hotel.comments?.length">
      <h3 class="comments-title" @click="toggleGraph">Yorumlar
        <span class="show-graph-btn">{{ showGraph ? '▲' : '▼' }}</span>
      </h3>
      <div v-if="showGraph" class="service-graph">
        <canvas ref="serviceChart"></canvas>
      </div>
      <ul>
        <li v-for="(comment, index) in hotel.comments" :key="index">
          <strong>{{ comment.user }}</strong> -
          <span class="comment-date">{{ formatDate(comment.date) }}</span>
          <span v-if="comment.rating">- {{ comment.rating }}/10</span>
          <br />
          {{ comment.text }}
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
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import HotelMapSingle from '../components/HotelMapSingle.vue';
import { Chart } from 'chart.js/auto';

const hotel = ref(null);
const newComment = ref('');
const username = localStorage.getItem('username');
const route = useRoute();
const showGraph = ref(false);
const serviceChart = ref(null);
const amenitiesChart = ref(null);

const loadHotel = async () => {
  try {
    console.log('Otel ID:', route.params.id);
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/hotels/${route.params.id}`);
    console.log('API Response:', res.data);
    hotel.value = res.data;
  } catch (err) {
    console.error("Otel verisi alınamadı:", err);
    console.error("Hata detayı:", err.response?.data);
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/hotels/${route.params.id}/comments`, {
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

const calculateDiscountWithDiscount = (price, discount) => {
  if (discount !== null && discount !== undefined) {
    return Math.round(price * (1 - discount / 100));
  }
  return price;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
};

const toggleGraph = async () => {
  showGraph.value = !showGraph.value;
  if (showGraph.value) {
    await nextTick();
    drawServiceGraph();
  }
};

function drawServiceGraph() {
  if (!hotel.value.comments?.length) return;
  // Servis puanlarını topla (örnek: temizlik, konum, hizmet, olanaklar, çevre)
  const services = ['Temizlik', 'Personel ve servis', 'İmkan ve özellikler', 'Konaklama yeri', 'Çevre dostluğu'];
  const keys = ['cleanliness', 'service', 'amenities', 'location', 'environment'];
  const sums = [0, 0, 0, 0, 0];
  let count = 0;
  hotel.value.comments.forEach(c => {
    if (c.ratings) {
      keys.forEach((k, i) => {
        if (typeof c.ratings[k] === 'number') {
          sums[i] += c.ratings[k];
        }
      });
      count++;
    }
  });
  const avgs = sums.map(s => count ? (s / count).toFixed(1) : 0);
  if (serviceChart.value && serviceChart.value._chart) {
    serviceChart.value._chart.destroy();
  }
  const ctx = serviceChart.value.getContext('2d');
  serviceChart.value._chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: services,
      datasets: [{
        label: 'Servis Puanı',
        data: avgs,
        backgroundColor: '#2c3e50',
        borderRadius: 8,
        barThickness: 24
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          min: 0,
          max: 10
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function drawAmenitiesChart() {
  if (!hotel.value || !hotel.value.amenities || !hotel.value.amenities.length) return;
  const ctx = amenitiesChart.value;
  if (!ctx) return;
  if (ctx._chart) ctx._chart.destroy();
  ctx._chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hotel.value.amenities.map(a => a.name),
      datasets: [{
        label: 'Puan',
        data: hotel.value.amenities.map(a => a.score),
        backgroundColor: '#e61e38',
        borderRadius: 8,
        barThickness: 18
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          min: 0,
          max: 10
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

onMounted(async () => {
  await loadHotel();
  await nextTick();
  drawAmenitiesChart();
});
</script>

<style scoped>
.hotel-detail {
  max-width: 700px;
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
.price-row {
  font-size: 1.3rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.discounted-price {
  color: #e61e38;
  font-weight: bold;
  font-size: 1.4rem;
  margin-left: 8px;
}
.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin: 0 0 16px 0;
  padding: 0;
  list-style: none;
}
.amenities-list li {
  background: #f7f7f7;
  color: #e61e38;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(230,30,56,0.06);
}
.hotel-map-detail {
  margin: 18px 0 24px 0;
}
.comments-title {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
}
.show-graph-btn {
  font-size: 1.2rem;
  color: #e61e38;
}
.service-graph {
  margin: 12px 0 18px 0;
}
.comment-date {
  color: #888;
  font-size: 0.95rem;
  margin-left: 4px;
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
.amenities-chart-container {
  margin-bottom: 1rem;
}
</style>
