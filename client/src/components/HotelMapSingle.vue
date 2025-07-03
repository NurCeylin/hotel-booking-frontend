<template>
  <div class="single-map" ref="mapContainer"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
const props = defineProps({
  lat: Number,
  lng: Number,
  name: String
});
const mapContainer = ref(null);

onMounted(() => {
  if (!window.google || !window.google.maps) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA0QHjVmfgyaHuc7kfFUaz7G1uzVaP4kDU&callback=initMapSingle`;
    script.async = true;
    window.initMapSingle = initMap;
    document.head.appendChild(script);
  } else {
    initMap();
  }
});

function initMap() {
  const map = new window.google.maps.Map(mapContainer.value, {
    zoom: 14,
    center: { lat: props.lat, lng: props.lng }
  });
  new window.google.maps.Marker({
    position: { lat: props.lat, lng: props.lng },
    map,
    title: props.name
  });
}
</script>

<style scoped>
.single-map {
  width: 100%;
  height: 220px;
  border-radius: 10px;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
</style> 