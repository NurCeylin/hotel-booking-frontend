<template>
  <div id="map" style="height: 200px; width: 50px; border: 1px solid #ccc; margin-top: 20px;"></div>
</template>

<script>
export default {
  name: 'HotelMap',
  mounted() {
    // Google Maps API yüklendikten sonra çalışacak global callback fonksiyonu
    window.initMap = this.initMap;

    // Eğer Google Maps henüz yüklenmediyse script ekle
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA0QHjVmfgyaHuc7kfFUaz7G1uzVaP4kDU&callback=initMap`;
      script.async = true;
      document.head.appendChild(script);
    } else {
      this.initMap(); // maps zaten yüklü ise hemen çalıştır
    }
  },
  methods: {
    async initMap() {
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6,
        center: { lat: 39.9208, lng: 32.8541 } // Türkiye merkezi (Ankara)
      });

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotels`);
        const hotels = await response.json();

        hotels.forEach(hotel => {
          if (typeof hotel.latitude === 'number' && typeof hotel.longitude === 'number') {
            new google.maps.Marker({
              position: { lat: hotel.latitude, lng: hotel.longitude },
              map,
              title: hotel.name
            });
          }
        });
      } catch (err) {
        console.error("Oteller alınamadı:", err);
      }
    }
  }
};
</script>
