<template>
  <div class="maintenance-report">
    <div class="logo-watermark"></div>
    
    <div class="report-container">
      <header class="report-header">
        <h1>Informe de mantenimiento</h1>
      </header>

      <div class="report-card">
        <div class="order-number-container">
          <label>Orden de trabajo: {{  }}</label>
        </div>
        
        <div class="section-header">
          <h2>Datos del informe</h2>
          <button class="save-button" @click="saveReport">Guardar</button>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>No. Orden de trabajo</label>
            <input type="text" v-model="formData.reportNumber" placeholder="INF-2024-XXXXXXX" />
          </div>
          
          <div class="form-group">
            <label>Costo</label>
            <input type="text" v-model="formData.cost" placeholder="$ 000.000" />
          </div>
          
          <div class="form-group">
            <label>Horas</label>
            <input type="text" v-model="formData.hours" placeholder="24 horas" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Repuestos</label>
            <textarea v-model="formData.responses" placeholder="..." class="parts-textarea"></textarea>
          </div>
          
          <div class="form-group">
            <label>Trabajo realizado</label>
            <textarea v-model="formData.workDone" placeholder="Describa el trabajo realizado"></textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label>Observaciones</label>
            <textarea v-model="formData.observation"></textarea>
          </div>
        </div>
      </div>

      <div class="report-card">
        <h2 class="asset-info-header">Información del bien</h2>
        
        <div class="info-grid">
          <div class="info-column">
            <div class="info-group">
              <label>Centro de formación</label>
              <p>{{ assetInfo.trainingCenterId?.[0]?.name }}</p>
            </div>
            
            <div class="info-group">
              <label>Marca</label>
              <p>{{ assetInfo.brand }}</p>
            </div>
            
            <div class="info-group">
              <label>Número de serie</label>
              <p>{{ assetInfo.serialNumber }}</p>
            </div>
          </div>
          
          <div class="info-column">
            <div class="info-group">
              <label>Ubicación</label>
              <p>{{ assetInfo.location }}</p>
            </div>
            
            <div class="info-group">
              <label>Modelo</label>
              <p>{{ assetInfo.modelo }}</p>
            </div>
            
            <div class="info-group">
              <label>Tipo de equipo</label>
              <p>{{ assetInfo.equipmentType }}</p>
            </div>
          </div>
          
          <div class="info-column">
            <div class="info-group">
              <label>Fecha de adquisición</label>
              <p>{{ assetInfo.acquisitionDate }}</p>
            </div>
            
            <div class="info-group">
              <label>Cuentadante</label>
              <p>{{ "No disponible" }}</p>
            </div>
            
            <div class="info-group">
              <label>Estado</label>
              <p>{{ assetInfo.status }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import apiService from "../../../service/apiService"



export default {
  name: 'MaintenanceReport',
  setup() {
    const radicado = ref('');
    const wordOrdenId = ref('');
    const workOrder = ref(null);
    const assetInfo = ref({
      trainingCenter: '',
      location: '',
      acquisitionDate: '',
      brand: '',
      model: '',
      accountant: '',
      serialNumber: '',
      equipmentType: '',
      status: ''
    });
    
    const formData = ref({
      reportNumber: 'INF-2024-9123123',
      cost: '',
      hours: '',
      responses: '',
      workDone: '',
      observation: '',
      contactName: '',
      phone: '',
      trackingNumber: '',
      orderId: ''
    });
    
    
  
    
    const fetchData = async () => {
      try {
      
        Swal.fire({
          title: 'Cargando...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        
        const Id = Cookies.get('OrdenId')
        if (!Id) throw new Error('No se encontró el ID de la orden');
        
        wordOrdenId.value = Id;
        
        const response = await apiService.get(`/word-orden/${Id}`);
        workOrder.value = response;
        
        
        if (workOrder.value?.solicitud?.solicitudId) {
          await fetchAssetInfo(workOrder.value.solicitud.solicitudId);
        }
        
        Swal.close();
        
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos',
          confirmButtonColor: '#39a900'
        });
      }
    };

    const fetchAssetInfo = async (solicitudId) => {
      try {
        const response = await apiService.get(`/application-maintenance/Consultar/${solicitudId}`);
        if (response?.data?.assetInfo || response?.assetInfo) {
          assetInfo.value = response.data?.assetInfo || response.assetInfo;
          
         
        }
      } catch (error) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'No se pudo cargar la información del activo',
          toast: true,
          position: 'top-end',
          timer: 3000
        });
      }
    };
    
    const saveReport = async () => {
      try {
        Swal.fire({
          title: 'Guardando...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        // Validar campos requeridos
        if (!formData.value.cost || !formData.value.hours || !formData.value.workDone) {
          throw new Error('Por favor complete todos los campos requeridos');
        }
        
        // Preparar datos para enviar
        const reportData = {
          costs: parseFloat(formData.value.cost.replace(/[^\d.-]/g, '')),
          hours: parseInt(formData.value.hours),
          responses: formData.value.responses,
          observation: formData.value.observation,
          workDone: formData.value.workDone,
          orderId: formData.value.orderId,
          status: true
        };
        
        // Enviar datos
        const response = await apiService.post('/workreports', reportData);
        
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Informe guardado correctamente',
            confirmButtonColor: '#39a900'
          });
        } else {
          throw new Error('Error al guardar el informe');
        }
      } catch (error) {
        console.error('Error al guardar:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo guardar el informe',
          confirmButtonColor: '#39a900'
        });
      }
    };
    
    onMounted(() => {
      fetchData();
    });
    
    return {
      radicado,
      assetInfo,
      formData,
      saveReport
    };
  }
}
</script>

<style scoped>
/* Global styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}




.report-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header styles */
.report-header {
  margin-bottom: 20px;
  text-align: left;
}

.report-header h1 {
  color: #333;
  font-size: 24px;
  font-weight: bold;
}

.order-number-container {
  font-size: 14px;
  color: #555;
  margin-bottom: 15px;
}

/* Card styles */
.report-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  color: #40b820;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  width: 100%;
}

.asset-info-header {
  margin-bottom: 20px;
  text-align: center;
}

/* Form styles */
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.form-group.full-width {
  width: 100%;
}

label {
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
}

input, textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
}

textarea {
  resize: none;
  min-height: 100px;
}

.parts-textarea {
  border: 1px solid #1e88e5;
  border-radius: 4px;
}

/* Info grid for the bottom section */
.info-grid {
  display: flex;
  gap: 20px;
}

.info-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-group {
  display: flex;
  flex-direction: column;
}

.info-group p {
  padding: 10px 0;
  font-size: 14px;
  color: #333;
}

/* Button styles */
.save-button {
  background-color: #40b820;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-button:hover {
  background-color: #359818;
}

/* Responsive styles */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .info-grid {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    align-items: center;
  }
  
  .save-button {
    margin-top: 10px;
    width: 100%;
  }
}
</style>