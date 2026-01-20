<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'vue-router';

const router = useRouter()

const latitud = ref(null);
const longitud = ref(null);
const nombreCalle = ref('');
const cargando = ref(false);

let map = null;
let markerseleccion = null;

const inicializarMapa = async () => {
    await nextTick(); 

    const centroInicial = [39.032719, -0.215864];

    map = L.map('map').setView(centroInicial, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    markerseleccion = L.marker([0, 0]).addTo(map);

    map.on('click', async (e) => {
        latitud.value = e.latlng.lat;
        longitud.value = e.latlng.lng;

        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitud.value}&lon=${longitud.value}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            nombreCalle.value = data.address.road || data.display_name;

            markerseleccion
                .setLatLng(e.latlng)
                .bindPopup("Ubicación seleccionada")
                .openPopup();

        } catch (error) {
            console.error("Error al obtener dirección:", error);
            nombreCalle.value = "Dirección no encontrada";
        }
    });
};

const guardarUbicacion = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Sesión no válida. Por favor, inicia sesión.");
        return;
    }

    cargando.value = true;

    const datos = {
        direccion: nombreCalle.value,
        latitud: latitud.value,
        longitud: longitud.value
    };

    try {
        const respuesta = await axios.put('http://localhost:8080/api/ubicacionusuario', datos, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if(respuesta.status === 201){
            alert("Dirección actualizada correctamente.");
            console.log("Respuesta:", respuesta.data);
            router.push('/cuenta');
        }

    } catch (error) {
        console.error("Error al guardar:", error.response?.data);
        alert("Hubo un error al guardar los datos.");
    } finally {
        cargando.value = false;
    }
};

onMounted(() => {
    inicializarMapa();
});
</script>
<template>
  <div class="main-container">
    <div class="card">
      <h2 class="title">Configuración de Ubicación</h2>
      
      <div class="map-section">
        <div id="map" class="leaflet-map"></div>
      </div>

      <div class="status-section">
        <div v-if="nombreCalle" class="info-box animate-in">
          <p class="label">Dirección seleccionada:</p>
          <p class="address-text">{{ nombreCalle }}</p>
          
          <button @click="guardarUbicacion" :disabled="cargando" class="btn-primary">
            <span v-if="!cargando">Confirmar y Guardar</span>
            <span v-else>Procesando...</span>
          </button>
        </div>
        
        <div v-else class="empty-state">
          <p>Haz clic en el mapa para marcar tu posición en el mapa</p>
        </div>
      </div>
    </div>
  </div>
</template>