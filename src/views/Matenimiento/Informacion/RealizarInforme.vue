<template>
  <div class="maintenance-report">
    <div class="logo-watermark"></div>
    
    <div class="report-container">
      <header class="report-header">
        <h1>Gestión de actividades de mantenimiento</h1>
        <h2>{{ isEditMode ? 'Editar informe' : 'Nuevo informe de mantenimiento' }}</h2>
      </header>

      <div class="report-card">
        <div class="order-number-container">
          <label>{{ isEditMode ? 'Informe:' : 'Orden de trabajo:' }} {{ isEditMode ? formData.Informe : (workOrder?.radicado || 'Cargando...') }}</label>
        </div>
        
        <div class="section-header">
          <h2>Datos del informe</h2>
          <button class="save-button" @click="saveReport">
            {{ isEditMode ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>No. Informe</label>
            <input type="text" v-model="formData.Informe" :readonly="isEditMode" />
          </div>
          
          <div class="form-group">
            <label>Costo</label>
            <input 
              type="text" 
              v-model="formData.cost" 
              placeholder="$ 000.000"
              @input="formatCost" 
            />
          </div>
          
          <div class="form-group">
            <label>Horas</label>
            <input 
              type="text" 
              v-model="formData.hours" 
              placeholder="24 horas"
              @input="formatHours" 
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Repuestos</label>
            <textarea 
              v-model="formData.responses" 
              placeholder="Detalle los repuestos utilizados..."
              class="parts-textarea"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Trabajo realizado</label>
            <textarea 
              v-model="formData.workDone" 
              placeholder="Describa el trabajo realizado"
            ></textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label>Observaciones</label>
            <textarea 
              v-model="formData.observation"
              placeholder="Ingrese observaciones adicionales..."
            ></textarea>
          </div>
        </div>
      </div>

      <div class="report-card" v-if="!isEditMode || (isEditMode && showAssetInfo)">
        <h2 class="asset-info-header">Información del bien</h2>
        
        <div class="info-grid">
          <div class="info-column">
            <div class="info-group">
              <label>Centro de formación</label>
              <p>{{ assetInfo.trainingCenterId?.[0]?.name || 'No disponible' }}</p>
            </div>
            
            <div class="info-group">
              <label>Marca</label>
              <p>{{ assetInfo.brand || 'No disponible' }}</p>
            </div>
            
            <div class="info-group">
              <label>Número de serie</label>
              <p>{{ assetInfo.serialNumber || 'No disponible' }}</p>
            </div>
          </div>
          
          <div class="info-column">
            <div class="info-group">
              <label>Ubicación</label>
              <p>{{ assetInfo.location || 'No disponible' }}</p>
            </div>
            
            <div class="info-group">
              <label>Modelo</label>
              <p>{{ assetInfo.modelo || 'No disponible' }}</p>
            </div>
            
            <div class="info-group">
              <label>Tipo de equipo</label>
              <p>{{ assetInfo.equipmentType || 'No disponible' }}</p>
            </div>
          </div>
          
          <div class="info-column">
            <div class="info-group">
              <label>Fecha de adquisición</label>
              <p>{{ formatDate(assetInfo.acquisitionDate) || 'No disponible' }}</p>
            </div>
            
            <div class="info-group">
              <label>Cuentadante</label>
              <p>{{ assetInfo.accountant || 'No disponible' }}</p>
            </div>
            
            <div class="info-group">
              <label>Estado</label>
              <p>{{ assetInfo.status || 'No disponible' }}</p>
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
import apiService from "../../../service/apiservice";
import { useRouter } from 'vue-router';

export default {
  name: 'MaintenanceReport',
  setup() {
    const router = useRouter();
    const radicado = ref('');
    const wordOrdenId = ref('');
    const workOrder = ref(null);
    const reportId = ref('');
    const isEditMode = ref(false);
    const showAssetInfo = ref(true);
    
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
      Informe: '',
      cost: '',
      hours: '',
      responses: '',
      workDone: '',
      observation: '',
      contactName: '',
      phone: '',
      trackingNumber: '',
      orderId: '',
      _id: ''
    });

    // Función para formatear la fecha
    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-CO');
    };

    // Función para formatear el costo
    const formatCost = (event) => {
      let value = event.target.value.replace(/[^\d]/g, '');
      if (value) {
        value = parseInt(value).toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        });
        formData.value.cost = value;
      }
    };

    // Función para formatear las horas
    const formatHours = (event) => {
      let value = event.target.value.replace(/[^\d]/g, '');
      if (value) {
        formData.value.hours = `${value} horas`;
      }
    };
    
    const generateReportCode = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const sequential = Math.floor(Math.random() * 9000) + 1000;
      
      // Formato: INF-YYYYMMDDXXXX donde XXXX es un número secuencial
      formData.value.Informe = `INF-${year}${month}${day}-${sequential}`;
      return formData.value.Informe;
    };

    // Función para cargar datos de un informe existente
    const fetchReportData = async (id) => {
      try {
        Swal.fire({
          title: 'Cargando informe...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        const response = await apiService.get(`/work-report/${id}`);
        
        if (!response) {
          throw new Error('No se encontró el informe');
        }
        
        // Mapear los datos del informe al formulario
        formData.value = {
          Informe: response.Informe || '',
          cost: response.costs ? response.costs.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }) : '',
          hours: response.hours ? `${response.hours} horas` : '',
          responses: response.responses || '',
          workDone: response.workDone || '',
          observation: response.observation || '',
          orderId: response.orderId || '',
          _id: response._id || id
        };
        
        // Si hay ID de orden, intentar cargar información del activo
        if (response.orderId) {
          try {
            const orderResponse = await apiService.get(`/word-orden/${response.orderId}`);
            if (orderResponse && orderResponse.solicitud && orderResponse.solicitud._id) {
              await fetchAssetInfo(orderResponse.solicitud._id);
              showAssetInfo.value = true;
            } else {
              showAssetInfo.value = false;
            }
          } catch (error) {
            console.error('Error al cargar información de la orden:', error);
            showAssetInfo.value = false;
          }
        } else {
          showAssetInfo.value = false;
        }
        
        Swal.close();
        
      } catch (error) {
        console.error('Error al cargar el informe:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el informe',
          confirmButtonColor: '#39a900'
        });
        router.push('/Informes');
      }
    };

    const fetchData = async () => {
      try {
        // Verificar si estamos en modo edición
        const editMode = Cookies.get('EditMode');
        const reportIdFromCookie = Cookies.get('Id_INF');
        
        if (editMode === 'true' && reportIdFromCookie) {
          // Estamos en modo edición
          isEditMode.value = true;
          reportId.value = reportIdFromCookie;
          
          // Cargar datos del informe
          await fetchReportData(reportIdFromCookie);
          
        } else {
          // Estamos en modo creación
          isEditMode.value = false;
          
          Swal.fire({
            title: 'Cargando...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
          
          const Id = Cookies.get('OrdenId');
          if (!Id) throw new Error('No se encontró el ID de la orden');
          
          wordOrdenId.value = Id;
          formData.value.orderId = Id;
          
          const response = await apiService.get(`/word-orden/${Id}`);
          workOrder.value = response;
          radicado.value = response?.radicado || '';
          
          if (workOrder.value?.solicitud?._id) {
            await fetchAssetInfo(workOrder.value.solicitud._id);
          }
          
          generateReportCode();
          
          Swal.close();
        }
        
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
          
          if (response.requesterName) {
            formData.value.contactName = response.requesterName;
          }
          if (response.requesterPhone) {
            formData.value.phone = response.requesterPhone;
          }
          if (response.trackingNumber) {
            formData.value.trackingNumber = response.trackingNumber;
          }
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
          title: isEditMode.value ? 'Actualizando...' : 'Guardando...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        if (!formData.value.cost || !formData.value.hours || !formData.value.workDone) {
          throw new Error('Por favor complete todos los campos requeridos');
        }
        
        // Preparar datos para enviar
        const reportData = {
          Informe: formData.value.Informe,
          costs: parseFloat(formData.value.cost.replace(/[^\d.-]/g, '')),
          hours: parseInt(formData.value.hours),
          responses: formData.value.responses,
          observation: formData.value.observation,
          workDone: formData.value.workDone,
          orderId: formData.value.orderId,
          status: true
        };
        
        let response;
        
        if (isEditMode.value) {
          // Actualizar informe existente
          response = await apiService.patch(`/work-report/${formData.value._id}`, reportData);
        } else {
          // Crear nuevo informe
          response = await apiService.post('/work-report', reportData);
        }
        
        if (response.success || response._id) {
          // Limpiar cookies después de guardar
          Cookies.remove('EditMode');
          Cookies.remove('Id_INF');
          
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: isEditMode.value ? 'Informe actualizado correctamente' : 'Informe guardado correctamente',
            confirmButtonColor: '#39a900'
          }).then(() => {
            // Redirigir a la lista de informes
            router.push('/gestiones');
          });
        } else {
          throw new Error(isEditMode.value ? 'Error al actualizar el informe' : 'Error al guardar el informe');
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
      
      // Limpiar cookies al desmontar el componente
      return () => {
        if (!isEditMode.value) {
          Cookies.remove('EditMode');
          Cookies.remove('Id_INF');
        }
      };
    });
    
    return {
      radicado,
      workOrder,
      assetInfo,
      formData,
      isEditMode,
      showAssetInfo,
      saveReport,
      generateReportCode,
      formatDate,
      formatCost,
      formatHours
    };
  }
}
</script>

<style scoped>
.maintenance-report {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Arial, sans-serif;
  position: relative;
}

.logo-watermark {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="50" font-size="80" text-anchor="middle" dominant-baseline="middle" fill="rgba(57, 169, 0, 0.03)">SENA</text></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 80% 80%;
  pointer-events: none;
  z-index: -1;
}

.report-header {
  text-align: left;
  margin-bottom: 30px;
}

.report-header h1 {
  color: #ffffff;
  font-size: 24px;
  margin: 0;
  margin-bottom: 8px;
}

.report-header h2 {
  color: #494949;
  font-size: 20px;
  margin: 0;
}

.report-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-number-container {
  margin-bottom: 20px;
}

.order-number-container label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  color: #39a900;
  font-size: 20px;
  margin: 0;
}

.save-button {
  background: #39a900;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.save-button:hover {
  background: #2d8500;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #39a900;
  outline: none;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.parts-textarea {
  min-height: 100px;
}

.asset-info-header {
  color: #39a900;
  font-size: 20px;
  margin: 0 0 24px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-group label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.info-group p {
  font-size: 14px;
  color: #333;
}

/* Button styles */
.save-button {
  background-color: #39A900;
  color: white;
  border: none;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.save-button:hover {
  background-color: #2d8000;
}

/* Responsive styles */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .save-button {
    width: 100%;
  }
}
</style>