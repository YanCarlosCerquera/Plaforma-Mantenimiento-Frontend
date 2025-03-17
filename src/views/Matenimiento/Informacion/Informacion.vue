<template>
  <div class="orden-trabajo-container">
    <div class="header">
    </div>

    <div class="card orden-card" v-if="ordenData">
      <div class="card-content">
        <h2 class="section-title">Información de la orden de trabajo</h2>
        
        <div class="content-grid">
          <div class="info-column">
            <div class="info-item">
              <div class="info-label">Responsable</div>
              <div class="info-value">{{ userName }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Prioridad</div>
              <div class="info-value">{{ ordenData.prioridad }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Estado</div>
              <div class="info-value">{{ ordenData.state ? 'Ejecutado' : 'Sin ejecutar' }}</div>
            </div>
          </div>
          
          <div class="info-column">
            <div class="info-item">
              <div class="info-label">Número de orden de trabajo</div>
              <div class="info-value order-number">{{ ordenData.radicado }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Fecha de asignación</div>
              <div class="info-value">{{ formatDate(ordenData.fechaInicio) }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Fecha de terminación</div>
              <div class="info-value">{{ ordenData.fechaFin ? formatDate(ordenData.fechaFin) : 'Sin culminar' }}</div>
            </div>
          </div>
          
          <div class="image-column">
            <img 
              class="device-image" 
              src="../../../assets/img/image-planear-mantenimiento.png" 
              alt="Equipo de mantenimiento"
            >
            <button
            @click="handleViwe"
            class="action-button">Realizar informe</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card asset-card" v-if="assetInfo">
      <div class="card-content">
        <h2 class="section-title">Información del Activo</h2>
        
        <div class="content-grid">
          <div class="info-column">
            <div class="info-item">
              <div class="info-label">Ambiente</div>
              <div class="info-value">{{ environmentInfo.name }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Marca</div>
              <div class="info-value">{{ assetInfo.brand }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Número de serie</div>
              <div class="info-value">{{ assetInfo.serialNumber }}</div>
            </div>
          </div>
          
          <div class="info-column">
            <div class="info-item">
              <div class="info-label">Ubicación</div>
              <div class="info-value">{{ assetInfo.location }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Modelo</div>
              <div class="info-value">{{ assetInfo.modelo }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Tipo de equipo</div>
              <div class="info-value">{{ assetInfo.equipmentType }}</div>
            </div>
          </div>
          
          <div class="info-column">
            <div class="info-item">
              <div class="info-label">Fecha de adquisición</div>
              <div class="info-value">{{ formatDate(assetInfo.acquisitionDate) }}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Cuentadante</div>
              <div class="info-value">{{ assetInfo.accountHolder }}</div>
            </div>
            
            <div class="info-item">
    <div class="info-label">Estado</div>
    <div class="info-value status-good">{{ assetInfo.status ? "Bueno" : "Dañado" }}</div>
</div>


          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiService from '../../../service/apiservice';
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";
import { useRouter } from 'vue-router';

const ordenData = ref(null);
const assetInfo = ref(null);
const environmentInfo = ref(null);
const userName = ref('');
const router = useRouter(null)

const fetchOrdenData = async () => {
  try {
    const ordenId = Cookies.get('OrdenId');
    if (!ordenId) {
      console.error('No se encontró el ID de la orden');
      return;
    }

    const response = await apiService.get(`/word-orden/${ordenId}`);
    ordenData.value = response.data || response;
    
    if (ordenData.value.solicitud) {
      // Si tenemos el ID de la solicitud, buscamos la información del activo
      if (ordenData.value.solicitud._id) {
        await fetchAssetInfo(ordenData.value.solicitud._id);
      }
    }
  } catch (error) {
    console.error('Error al obtener los datos de la orden:', error);
  }
};

const fetchAssetInfo = async (solicitudId) => {
  try {
    const response = await apiService.get(`/application-maintenance/Consultar/${solicitudId}`);
    assetInfo.value = response.data?.assetInfo || response.assetInfo;
    environmentInfo.value = response.data?.environmentInfo || response.environmentInfo;
  } catch (error) {
    console.error('Error al obtener la información del activo:', error);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const handleUser = async () => {
  try {
    const token = Cookies.get('authToken');
    if (!token) {
      console.error('No se encontró el token de autenticación');
      return;
    }

    const decodedToken = jwtDecode(token);
    const userId = decodedToken.sub;

    const userData = await apiService.get(`/users/${userId}`);

    if (userData && userData.name) {
      userName.value = userData.name;
    } else {
      console.error('No se pudo obtener el nombre del usuario');
    }
  } catch (error) {
    console.error("Error al obtener los detalles del usuario:", error);
  }
};

const handleViwe = async ()=> {
  router.push("/RealizarInforme")
}
onMounted(async () => {
  await handleUser();
  await fetchOrdenData();
});
</script>

<style scoped>
/* Base styles */
.orden-trabajo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding:0 20px;
  position: relative;
  overflow: hidden;
}



.header {
  text-align: center;
  margin-bottom: 30px;
}

.main-title {
  color: #39A900;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

/* Card styles */
.card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  overflow: hidden;
  position: relative;
}

.card-content {
  padding: 25px;
}

.section-title {
  color: #39A900;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  margin-top: 0;
  margin-bottom: 30px;
}

/* Grid layout */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .image-column {
    grid-column: span 2;
    justify-self: center;
  }
}

@media (max-width: 600px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .image-column {
    grid-column: span 1;
  }
}

/* Info items */
.info-item {
  margin-bottom: 20px;
}

.info-label {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
  font-weight: 500;
}

.info-value {
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.order-number {
  color: #39A900;
  font-weight: 600;
}

.status-good {
  display: inline-block;
  padding: 4px 12px;
  background-color: #d4edda;
  color: #39A900;
  border-radius: 4px;
  font-weight: 500;
}

/* Image and button */
.image-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.device-image {
  width: 100%;
  max-width: 200px;
  height: auto;
  object-fit: contain;
}

.action-button {
  background-color: #39a900;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(57, 169, 0, 0.3);
}

.action-button:hover {
  background-color: #2d8000;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(57, 169, 0, 0.4);
}
</style>