<template>
    <v-container class="maintenance-container">
      <div class="header-section">
        <div>
          <h1 class="text-h4 font-weight-bold main-title">
            Gestión actividades de mantenimiento
          </h1>
          <div class="text-subtitle-1 text-grey-darken-1 mb-6">
            Orden de trabajo
          </div>
        </div>
        <img 
          src="../../../assets/logoSena.jpg" 
          alt="SENA Logo" 
          class="sena-logo"
        >
      </div>
  
      <v-card class="mb-6 custom-card" v-if="ordenData">
        <v-card-text>
          <h2 class="section-title">
            Información de la orden de trabajo
          </h2>
          
          <div class="d-flex content-wrapper">
            <div class="flex-grow-1 info-section">
              <v-row>
                <v-col cols="12" md="6">
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
                    <div class="info-value status">{{ ordenData.state ? 'Ejecutado' : 'Sin ejecutar' }}</div>
                  </div>
                </v-col>
                
                <v-col cols="12" md="6">
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
                    <div class="info-value pending">{{ ordenData.fechaFin ? formatDate(ordenData.fechaFin) : 'Sin culminar' }}</div>
                  </div>
                </v-col>
              </v-row>
            </div>

            <div class="image-section">
              <img
                class="maintenance-image"
                src="../../../assets/img/image-planear-mantenimiento.png"
                alt="Planear mantenimiento"
              >
              <v-btn
                color="green-darken-2"
                class="action-button"
              >
                Realizar informe
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
  
      <v-card class="mb-6 custom-card" v-if="assetInfo">
        <v-card-text>
          <h2 class="section-title">
            Información del Activo
          </h2>
          
          <div class="d-flex content-wrapper">
            <div class="flex-grow-1 info-section">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="info-item">
                    <div class="info-label">Nombre del Activo</div>
                    <div class="info-value">{{ assetInfo.name }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Ubicación</div>
                    <div class="info-value">{{ assetInfo.location }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Fecha de Adquisición</div>
                    <div class="info-value">{{ formatDate(assetInfo.acquisitionDate) }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Marca</div>
                    <div class="info-value">{{ assetInfo.brand }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Modelo</div>
                    <div class="info-value">{{ assetInfo.modelo }}</div>
                  </div>
                </v-col>
                
                <v-col cols="12" md="6">
                  <div class="info-item">
                    <div class="info-label">Tipo de Equipo</div>
                    <div class="info-value">{{ assetInfo.equipmentType }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Centro de Formación</div>
                    <div class="info-value">{{ assetInfo.trainingCenterId?.[0]?.name }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Número de Serie</div>
                    <div class="info-value">{{ assetInfo.serialNumber }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Código de Inventario</div>
                    <div class="info-value">{{ assetInfo.inventoryCode }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Responsable del Activo</div>
                    <div class="info-value">{{ assetInfo.accountHolder }}</div>
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
import { ref, onMounted } from 'vue';
import apiService from '../../../service/apiService';
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";

const ordenData = ref(null);
const assetInfo = ref(null);
const userName = ref('');

const fetchOrdenData = async () => {
  try {
    const ordenId = localStorage.getItem('OrdenId');
    if (!ordenId) {
      console.error('No se encontró el ID de la orden');
      return;
    }

    const response = await apiService.get(`/word-orden/${ordenId}`);
    ordenData.value = response.data || response;
    
    if (ordenData.value) {
      // Si tenemos el ID de la solicitud, buscamos la información del activo
      if (ordenData.value.solicitud?.solicitudId) {
        await fetchAssetInfo(ordenData.value.solicitud.solicitudId);
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

onMounted(async () => {
    await handleUser();
    await fetchOrdenData();
});
</script>
  
  <style scoped>
  .maintenance-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .main-title {
    color: #ffffff;
    margin-bottom: 0.5rem;
  }

  .sena-logo {
    width: 100px;
    height: auto;
  }

  .custom-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
    background: #ffffff;
    margin-bottom: 2rem;
  }

  .section-title {
    color: #39a900;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    text-align: center;

  }

  .content-wrapper {
    gap: 2rem;
  }

  .info-section {
    flex: 1;
  }

  .info-item {
    margin-bottom: 1.5rem;
  }

  .info-label {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .info-value {
    color: #333;
    font-size: 1rem;
    font-weight: 500;
    
  }

  .status, .status-good {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-weight: 500;
  }

  .status {
    background-color: #fff3cd;
    color: #856404;
  }

  .status-good {
    background-color: #d4edda;
    color: #155724;
  }

  .pending {
    color: #856404;
  }

  .order-number {
    color: #39a900;
    font-weight: 600;
  }

  .image-section {
    width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .maintenance-image {
    width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .action-button {
    background-color: #39a900 !important;
    color: white !important;
    padding: 0.5rem 2rem !important;
    border-radius: 6px !important;
    font-weight: 500 !important;
    text-transform: none !important;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 4px rgba(57, 169, 0, 0.2) !important;
    transition: all 0.3s ease;
  }

  .action-button:hover {
    background-color: #2d8000 !important;
    box-shadow: 0 4px 8px rgba(57, 169, 0, 0.3) !important;
    transform: translateY(-1px);
  }

  .asset-info {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
  }

  @media (max-width: 960px) {
    .content-wrapper {
      flex-direction: column;
    }

    .image-section {
      width: 100%;
      max-width: 300px;
      margin: 0 auto;
    }
  }
  </style>