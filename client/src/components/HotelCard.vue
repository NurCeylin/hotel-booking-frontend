<template>
  <div class="hotel-card">
    <img :src="hotel.image" alt="Hotel Image" />
    <h3>{{ hotel.name }}</h3>
    <p>Fiyat: {{ hotel.price }}₺</p>
    <p v-if="hotel.comments && hotel.comments.length">{{ hotel.comments.length }} yorum</p>
    <button @click="goToDetail">Detay</button>
  </div>
</template>

<script>
export default {
  props: {
    hotel: Object
  },
  methods: {
    goToDetail() {
      alert(`Detay sayfası henüz hazır değil. Otel ID: ${this.hotel.id}`)
    }
  }
}
</script>

<style scoped>
.hotel-card {
  border: 1px solid #ccc;
  padding: 1rem;
  width: 250px;
}
.hotel-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  margin-bottom: 10px;
}
</style>
