<template>
    <div class="app-container" v-if="workOrder">
      <main class="main-content">
        <section class="info-card">
          <div class="header-section">
            <h2 class="main-title">
              Información de la orden de trabajo
              <p>#Orden de Trabajo -> {{ workOrderStatusText }}</p>
            </h2>
            <div class="novedades">Novedades - ></div>
          </div>
  
          <div class="info-content">
            <div class="work-order-grid">
              <!-- Left Column -->
              <div class="left-column">
                <div class="info-group">
                  <label>Responsable</label>
                  <p class="value">{{ workOrder.tecnicoId?.name || "Nombre"}}</p>
                </div>
                
                <div class="info-group">
                  <label>Prioridad</label>
                  <p class="value priority">{{ workOrder.prioridad }}</p>
                </div>
                
                <div class="info-group">
                  <label>Estado</label>
                  <p class="value status" :class="{ 'executed': workOrder.workOrderStatus }">
                    {{ workOrderStatusText }}
                  </p>
                </div>
              </div>
  
              <!-- Center Column -->
              <div class="center-column">
                <div class="info-group">
                  <label>Número de orden de trabajo</label>
                  <p class="value order-number">{{ workOrder.trackingNumber }}</p>
                </div>
                
                <div class="info-group date-field">
                  <label>Fecha de creación</label>
                  <p class="value">{{ formatDate(workOrder.createdAt) }}</p>
                </div>
                
                <div class="info-group">
                  <label>Fecha de actualización</label>
                  <p class="value">{{ formatDate(workOrder.updatedAt) }}</p>
                </div>
              </div>
  
              <!-- Right Column -->
              <div class="right-column">
                <img 
                  :src="assetInfo?.image || '/placeholder.svg?height=180&width=120'"
                  :alt="assetInfo?.name || 'Imagen del equipo'"
                  class="device-image"
                />
                <button class="view-report-btn">Ver informe</button>
              </div>
            </div>
  
            <div class="trabajo-section">
              <label>Descripción del problema</label>
              <div class="trabajo-input">
                <p>{{ workOrder.issueDescription || 'No disponible' }}</p>
              </div>
            </div>
          </div>
        </section>
  
        <!-- Información del bien section -->
        <section class="info-card" v-if="assetInfo">
          <h2 class="section-title">Información del bien</h2>
          <div class="info-content">
            <div class="asset-info-grid">
              <div class="info-group">
                <label>Marca</label>
                <p class="value">{{ assetInfo.brand || 'No disponible' }}</p>
              </div>
              
              <div class="info-group">
                <label>Centro de formación</label>
                <p class="value">{{ assetInfo.trainingCenterId?.[0]?.name || 'No disponible' }}</p>
              </div>
              
              <div class="info-group">
                <label>Código de inventario</label>
                <p class="value">{{ assetInfo.inventoryCode || 'No disponible' }}</p>
              </div>
  
              <div class="info-group">
                <label>Número de serie</label>
                <p class="value">{{ assetInfo.serialNumber || 'No disponible' }}</p>
              </div>
              
              <div class="info-group">
                <label>Modelo</label>
                <p class="value">{{ assetInfo.modelo || 'No disponible' }}</p>
              </div>
              
              <div class="info-group">
                <label>Ubicación</label>
                <p class="value">{{ assetInfo.location || 'No disponible' }}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    <div v-else>Cargando...</div>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue';
  import apiService from '../../../service/apiService';
  import Cookies from "js-cookie";
  
  export default {
    name: 'WorkOrderDetails',
    setup() {
      const workOrder = ref(null);
      const assetInfo = ref(null);
  
      const workOrderStatusText = computed(() =>
  workOrder.value?.state     ? 'Ejecutada' : 'Sin ejecutar'
);

      const fetchData = async () => {
        try {
          const Id = Cookies.get('OrdenId');
          console.log('OrdenId:', Id);
          
          const response = await apiService.get(`/word-orden/${Id}` );
          workOrder.value = response.data || response;
          console.log('Work Order:', workOrder.value);
  
          if (workOrder.value?.solicitud?.solicitudId) {
            await fetchAssetInfo(workOrder.value.solicitud.solicitudId);
          }
        } catch (error) {
          console.error('Error al obtener los datos de la orden:', error);
        }
      };
  
      const fetchAssetInfo = async (solicitudId) => {
        try {
          console.log('Fetching asset info for solicitudId:', solicitudId);
          const response = await apiService.get(`/application-maintenance/Consultar/${solicitudId}`);
          assetInfo.value = response.data?.assetInfo || response.assetInfo;
          console.log('Asset Info:', assetInfo.value);
        } catch (error) {
          console.error('Error al obtener la información del activo:', error);
        }
      };
  
      const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'Fecha no disponible';
      };
  
      onMounted(fetchData);
  
      return {
        workOrder,
        assetInfo,
        workOrderStatusText,
        formatDate
      };
    }
  };
  </script>
  
  <style scoped>

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .info-card {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 24px;
    overflow: hidden;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .main-title {
    color: #4CAF50;
    font-size: 24px;
    font-weight: 500;
    margin: 0;
  }
  
  
  
  .info-content {
    padding: 24px;
  }
  
  .work-order-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 300px;
    gap: 30px;
    margin-bottom: 30px;
  }
  
  .info-group {
    margin-bottom: 20px;
  }
  
  .info-group label {
    display: block;
    color: #666;
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .info-group .value {
    font-size: 16px;
    color: #333;
    margin: 0;
  }
  
  .date-field {
    padding: 10px;
  }
  
 
  
  .priority, .status {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 14px;
  }
  
  
  
  .status {
    background-color: #FFEBEE;
    color: #F44336;
  }
  
  .status.executed {
    background-color: #E8F5E9;
    color: #4CAF50;
  }
  
  .right-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .device-image {
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }
  
  .view-report-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    width: 100%;
    transition: background-color 0.2s;
  }
  
  .view-report-btn:hover {
    background-color: #388E3C;
  }
  
  .trabajo-section {
    margin-top: 30px;
  }
  
  .trabajo-section label {
    display: block;
    color: #666;
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .trabajo-input {
    border: 1px solid #ececec;
    border-radius: 8px;
    padding: 16px;
    min-height: 100px;
  }
  
  .trabajo-input p {
    margin: 0;
    line-height: 1.5;
  }
  
  .asset-info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  
  .section-title {
    color: #4CAF50;
    font-size: 20px;
    padding: 20px 24px;
    margin: 0;
    border-bottom: 1px solid #e0e0e0;
  }
  
  @media (max-width: 1024px) {
    .work-order-grid {
      grid-template-columns: 1fr 1fr;
    }
    
    .right-column {
      grid-column: span 2;
    }
  }
  
  @media (max-width: 768px) {
    .work-order-grid {
      grid-template-columns: 1fr;
    }
    
    .right-column {
      grid-column: auto;
    }
    
    .asset-info-grid {
      grid-template-columns: 1fr;
    }
    
    .info-content {
      padding: 16px;
    }
  }
  </style>
  
  