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

    setTimeout(() => {
        map.invalidateSize();
    }, 200);

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

    cargando.value = true;

    const datos = {
        direccion: nombreCalle.value,
        latitud: latitud.value,
        longitud: longitud.value
    };

    try {
        const respuesta = await axios.put('http://localhost:3000/api/actualizarubicacion', datos, {withCredentials: true});

        if(respuesta.status === 201){
            alert("Dirección actualizada correctamente.");
            console.log("Respuesta:", respuesta.data);
            router.push('/perfil');
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
  <div class="zona-config">
    <div class="modulo-postal">
      <h2 class="texto-cabecera">Configuración de Ubicación</h2>
      
      <div class="marco-mapa">
        <div id="map" class="render-mapa"></div>
      </div>

      <div class="bloque-inferior">
        <div v-if="nombreCalle" class="ficha-resultado fade-arriba">
          <p class="mini-titulo">Dirección seleccionada:</p>
          <p class="dato-direccion">{{ nombreCalle }}</p>
          
          <button @click="guardarUbicacion" :disabled="cargando" class="accion-confirmar">
            <span v-if="!cargando">Confirmar y Guardar</span>
            <span v-else>Procesando...</span>
          </button>
        </div>
        
        <div v-else class="recordatorio-click">
          <p>Haz clic en el mapa para marcar tu posición en el mapa</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.zona-config {
  min-height: 100vh;
  background-color: #F0F0F0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.modulo-postal {
  background-color: #FFFFFF;
  width: 100%;
  max-width: 700px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  overflow: hidden;
  padding: 24px;
}

.texto-cabecera {
  color: purple;
  margin-bottom: 20px;
  font-weight: 700;
  text-align: center;
}

.render-mapa {
  height: 350px;
  width: 100%;
  border-radius: 12px;
  border: 2px solid #F0F0F0;
}

.bloque-inferior {
  margin-top: 20px;
}

.ficha-resultado {
  background-color: #FFF0F5; /* LavenderBlush para el rosa suave */
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #FFC0CB; /* Pink */
}

.mini-titulo {
  color: #800080; /* Purple */
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.dato-direccion {
  color: #333;
  font-weight: 500;
  margin-bottom: 15px;
}

.accion-confirmar {
  background-color: #FFC0CB; /* Pink */
  color: white;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.accion-confirmar:hover {
  background-color: #DB7093; /* PaleVioletRed */
}

.accion-confirmar:disabled {
  background-color: #800080; /* Purple */
  cursor: not-allowed;
}

.recordatorio-click {
  text-align: center;
  color: #FFC0CB; /* Pink */
  font-style: italic;
  padding: 10px;
}

.fade-arriba {
  animation: sutilAparicion 0.5s ease-out;
}

@keyframes sutilAparicion {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>