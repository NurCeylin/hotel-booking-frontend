<template>
  <div class="banner">
    <div class="banner-content">
      <h1 class="banner-title">Sırada neresi var?</h1>
      <div class="search-box">
        <input class="search-input" placeholder="Şehir" v-model="city" />
        <input class="search-input" type="date" v-model="checkIn" />
        <input class="search-input" type="date" v-model="checkOut" />
        <input class="search-input" type="number" min="1" v-model="guests" placeholder="Misafir sayısı" />
        <button class="search-btn" @click="searchHotels">Ara</button>
      </div>
    </div>
  </div>
  <div class="home-main-row">
    <div class="map-col">
      <HotelMap />
    </div>
    <div class="hotel-list-col">
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
            <p v-if="hotel.points !== undefined">Puan: {{ hotel.points }}</p>
            <p v-if="hotel.comments && hotel.comments.length">{{ hotel.comments.length }} yorum</p>
            <div v-if="username" class="discount-badge-inline">
              %{{ hotel.discount !== null && hotel.discount !== undefined ? hotel.discount : 10 }} indirim
            </div>
            <p v-if="username">
              <span v-if="hotel.discount !== null && hotel.discount !== undefined">
                <s>{{ hotel.price }} TL</s>
                <strong>{{ calculateDiscountWithDiscount(hotel.price, hotel.discount) }} TL</strong>
              </span>
              <span v-else>
                <s>{{ hotel.price }} TL</s>
                <strong>{{ calculateDiscount(hotel.price) }} TL</strong>
              </span>
            </p>
            <p v-else>
              <strong>{{ hotel.price }} TL</strong><br />
              <small class="info-msg">Üye fiyatını görmek için giriş yapın</small>
            </p>
          </div>
        </div>
      </div>
      <p v-if="hotels.length === 0 && searched" class="no-results">Sonuç bulunamadı.</p>
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
  <button class="hamburger" :class="{ open: menuOpen }" @click="toggleMenu" aria-label="Menüyü Aç/Kapat">
    <span :class="{'bar': true, 'open': menuOpen}"></span>
    <span :class="{'bar': true, 'open': menuOpen}"></span>
    <span :class="{'bar': true, 'open': menuOpen}"></span>
  </button>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import axios from 'axios';
import { Chart } from 'chart.js';
import HotelMap from '../components/HotelMap.vue';
import { useRouter } from 'vue-router';

const hotels = ref([]);
const selectedHotel = ref(null);
const city = ref('');
const checkIn = ref('');
const checkOut = ref('');
const guests = ref(1);
const searched = ref(false);
const username = ref('');
const photo = ref('');
const country = ref('');
const router = useRouter();
const menuOpen = ref(false);

const backendUrl = import.meta.env.VITE_API_URL;

const photoUrl = computed(() =>
  photo.value && !photo.value.startsWith('http')
    ? `${backendUrl}${photo.value.startsWith('/') ? '' : '/'}${photo.value}`
    : photo.value
);

const checkLogin = () => {
  username.value = localStorage.getItem('username') || '';
  photo.value = localStorage.getItem('photo') || '';
  country.value = localStorage.getItem('country') || 'turkey';
};

const fetchHotels = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/hotels`);
    hotels.value = res.data.sort((a, b) => (b.points || 0) - (a.points || 0));
  } catch (err) {
    console.error('Otel verileri alınamadı:', err);
  }
};

const searchHotels = async () => {
  searched.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/hotels/search`, {
      params: {
        city: city.value,
        country: country.value,
        date: checkIn.value
      }
    });
    hotels.value = res.data.sort((a, b) => (b.points || 0) - (a.points || 0));
  } catch (err) {
    hotels.value = [];
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

const calculateDiscountWithDiscount = (price, discount) => {
  if (discount !== null && discount !== undefined) {
    return Math.round(price * (1 - discount / 100));
  }
  return calculateDiscount(price);
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

const drawAmenitiesChart = (hotel) => {
  if (!hotel.amenities || !hotel.amenities.length) return;
  const ctx = document.getElementById('amenitiesChart-' + hotel._id);
  if (!ctx) return;
  // Eğer daha önce çizilmişse yok et
  if (ctx._chart) {
    ctx._chart.destroy();
  }
  ctx._chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hotel.amenities.map(a => a.name),
      datasets: [{
        label: 'Puan',
        data: hotel.amenities.map(a => a.score),
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
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

onMounted(async () => {
  checkLogin();
  await fetchHotels();
  await nextTick();
  hotels.value.forEach(hotel => drawAmenitiesChart(hotel));
});

watch(hotels, async (newHotels) => {
  await nextTick();
  newHotels.forEach(hotel => drawAmenitiesChart(hotel));
});
</script>

<style scoped>
.banner {
  background: linear-gradient(120deg, #fbeee6 60%, #e61e38 100%);
  padding: 48px 0 32px 0;
  display: flex;
  justify-content: center;
}
.banner-content {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  padding: 32px 40px;
  min-width: 600px;
  text-align: center;
}
.banner-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #e61e38;
}
.search-box {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
}
.search-input {
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 120px;
}
.search-btn {
  background: #e61e38;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.search-btn:hover {
  background: #b81d24;
}
.home-main-row {
  display: flex;
  flex-direction: row;
  gap: 32px;
  margin-top: 24px;
  padding-left: 40px;
  padding-right: 40px;
}
.map-col {
  flex: 1;
  min-width: 250px;
  max-width: 320px;
  display: flex;
  align-items: flex-start;
}
.hotel-list-col {
  flex: 2;
}
#map {
  width: 100% !important;
  height: 280px !important;
  border: 1px solid #ccc;
  border-radius: 12px;
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
.profile-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-left: 10px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 40px;
  background: #fff;         /* Navbar arka planı beyaz */
  border-bottom: 1px solid #eee;
}
.nav {
  display: flex;
  gap: 24px;
  align-items: center;
  background: none !important; /* Lacivert arka planı kaldır */
  box-shadow: none !important;
}
.nav-link {
  color: #fff;
  background: #e61e38 !important;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  border: none !important;
  padding: 8px 18px !important;
  box-shadow: none !important;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.nav-link:hover {
  background: #b81d24 !important;
  color: #fff;
}
.discount-badge-inline {
  display: inline-block;
  background: #e61e38;
  color: #fff;
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: 6px;
  padding: 2px 8px;
  margin-bottom: 4px;
  margin-right: 6px;
  margin-top: 2px;
  vertical-align: middle;
}
@media (max-width: 900px) {
  .home-main-row {
    flex-direction: column;
    padding-left: 10px;
    padding-right: 10px;
    gap: 16px;
  }
  .map-col, .hotel-list-col {
    max-width: 100%;
    min-width: 0;
  }
  #map {
    height: 220px !important;
  }
}
@media (max-width: 600px) {
  .banner-content {
    min-width: unset;
    padding: 16px 8px;
  }
  .banner-title {
    font-size: 1.2rem;
  }
  .search-box {
    flex-direction: column;
    gap: 8px;
  }
  .hotel-card {
    flex-direction: column;
    padding: 0.5rem;
  }
  .hotel-image {
    width: 100%;
    height: auto;
    max-width: 100%;
  }
  .hotel-info {
    padding: 0.5rem 0 0 0;
  }
  .discount-badge-inline {
    font-size: 0.85rem;
    padding: 2px 6px;
  }
}
@media (max-width: 700px) {
  .nav,
  .nav.open {
    background: none !important;
  }
  .hamburger.open {
    background: none !important;
    border-radius: 8px;
  }
}
.hamburger.open {
  background: none !important;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.bar.open {
  background: #e61e38; /* veya istediğin başka bir renk */
}
</style>
