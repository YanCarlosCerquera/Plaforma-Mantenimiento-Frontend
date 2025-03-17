<template>
  <div class="maintenance-form">
    <form @submit.prevent="handleSubmit" class="form-container" v-if="requestData">
      <!-- Programming Information Card -->
      <div class="form-card">
        <h2 class="section-title">Información de la programación</h2>
        
        <div class="form-content">
          <div class="form-grid">
            <!-- Left side form fields -->
            <div class="form-column">
              <div class="form-group">
                <label>Establecer prioridad</label>
                <select class="form-control" v-model="priority">
                  <option selected>Seleccionar...</option>
                  <option>Urgente</option>
                  <option>alta</option>
                  <option>media</option>
                  <option>baja</option>
                  <option>Sin Terminar</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Fecha sugerida mantenimiento</label>
                <input 
                  type="date"
                  class="form-control"
                  v-model="maintenanceDate"
                />
              </div>
              
              <div class="form-group">
                <label>Autorizada por</label>
                <input 
                  type="text"
                  class="form-control"
                  :value="userName"
                  readonly
                />
              </div>
            </div>
            
            <!-- Right side form fields -->
            <div class="form-column">
              <div class="form-group">
                <label>Fecha de solicitud:</label>
                <input 
                  type="date"
                  class="form-control"
                  :value="formatDate(requestData.assetInfo.createdAt)"
                />
              </div>
              
              <div class="form-group">
                <label>Orden de trabajo No:</label>
                <div class="input-with-button">
                  <input 
                    type="text"
                    class="form-control"
                    :value="workOrderNumber"
                    placeholder="OT-20-2024"
                    readonly
                  />
                  <button 
                    type="button" 
                    class="refresh-button"
                    @click="generateNewTrackingNumber"
                    title="Generar nuevo número"
                  >
                    <i class="fas fa-sync-alt"></i>
                  </button>
                </div>
              </div>
              
              <div class="form-group">
                <label>Asignada a</label>
                <select 
                  class="form-control"
                  v-model="selectedTechnician"
                >
                  <option value="" disabled selected>Técnico</option>
                  <option 
                    v-for="tech in technicians" 
                    :key="tech.id" 
                    :value="tech.value"
                  >
                    {{ tech.label }}
                  </option>
                </select>
              </div>
            </div>
            
            <!-- Device image -->
            <div class="device-image-container">
              <img
                :src="requestData.assetInfo?.image"
                alt="Planear mantenimiento"
                class="device-image"
              />
            </div>
          </div>
          
          <!-- Tracking number field -->
          <div class="tracking-number">
            <label>Radicado de solicitud</label>
            <input 
              type="text"
              class="form-control"
              :value="requestData?.trackingNumber"
              readonly
            />
          </div>
        </div>
      </div>
      
      <!-- Asset Information Card -->
      <div class="form-card">
        <h2 class="section-title">Información del bien</h2>
        
        <div class="asset-info-grid">
          <div class="info-group">
            <label>Ambiente</label>
            <p>{{ requestData.environmentInfo?.name }}</p>
          </div>

          <div class="info-group">
            <label>Ubicación</label>
            <p>{{ requestData.assetInfo?.location  }}</p>
          </div>
          
          <div class="info-group">
            <label>Fecha de adquisición</label>
            <p>{{ formatDate(requestData.assetInfo?.acquisitionDate)  }}</p>
          </div>
          
          <div class="info-group">
            <label>Marca</label>
            <p>{{ requestData.assetInfo?.brand  }}</p>
          </div>
          
          <div class="info-group">
            <label>Modelo</label>
            <p>{{ requestData.assetInfo?.modelo }}</p>
          </div>
          
          <div class="info-group">
            <label>Cuentadante</label>
            <p>{{ requestData.assetInfo?.accountHolder }}</p>
          </div>
          
          <div class="info-group">
            <label>Número de serie</label>
            <p>{{ requestData.assetInfo?.serialNumber  }}</p>
          </div>
          
          <div class="info-group">
            <label>Tipo de equipo</label>
            <p>{{ requestData.assetInfo?.equipmentType  }}</p>
          </div>
          
          <div class="info-group">
            <label>Estado</label>
            <p>{{ requestData.assetInfo?.status ? 'Bueno' : 'Malo' }}</p>
          </div>
        </div>
      </div>
      
      <!-- Submit button -->
      <div class="form-actions">
        <button 
          type="submit"
          class="btn-submit"
          :disabled="isLoading"
        >
          <span v-if="isLoading">
            <i class="fas fa-spinner fa-spin"></i> Procesando...
          </span>
          <span v-else>Programar</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import apiService from '../../service/apiservice';
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";
import Swal from 'sweetalert2';

const userId = ref(null);
const userName = ref('');
const requestData = ref(null);
const currentCounter = ref(0);
const workOrderNumber = ref('');
const maintenanceDate = ref('');
const priority = ref('');
const technicians = ref([]);
const selectedTechnician = ref('');
const isLoading = ref(false);

const fetchUserName = async (userId) => {
  try {
    const response = await apiService.get(`users/${userId}`);
    return response.name || response.username || 'No disponible';
  } catch (error) {
    console.error('Error al obtener el nombre del usuario:', error);
    return 'No disponible';
  }
};

const generateNewTrackingNumber = () => {
  const year = new Date().getFullYear();
  const counter = currentCounter.value.toString().padStart(2, '0');
  workOrderNumber.value = `OT-${counter}-${year}`;
  currentCounter.value = (currentCounter.value + 1) % 100; 
};

const formatDate = (dateString) => {
  if (!dateString) return 'No disponible';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');
};

const resetForm = () => {
  priority.value = 'Seleccionar...';
  maintenanceDate.value = '';
  selectedTechnician.value = '';
  workOrderNumber.value = '';
  generateNewTrackingNumber();
};

const validateForm = () => {
  if (!workOrderNumber.value) {
    Swal.fire({
      title: '¡Error!',
      text: 'Por favor genere un número de orden de trabajo',
      icon: 'error'
    });
    return false;
  }
  
  if (!selectedTechnician.value) {
    Swal.fire({
      title: '¡Error!',
      text: 'Por favor seleccione un técnico',
      icon: 'error'
    });
    return false;
  }

  if (!maintenanceDate.value) {
    Swal.fire({
      title: '¡Error!',
      text: 'Por favor seleccione una fecha de mantenimiento',
      icon: 'error'
    });
    return false;
  }

  if (priority.value === 'Seleccionar...') {
    Swal.fire({
      title: '¡Error!',
      text: 'Por favor seleccione una prioridad',
      icon: 'error'
    });
    return false;
  }

  return true;
};

const fetchTenico = async () => {
  try {
    const response = await apiService.get(`users/Tecnicos`);
    if (response && response.data) {
      technicians.value = response.data.map(tech => ({
        id: tech._id,
        label: `${tech.name}-${tech.state ? 'Activo' : 'Inactivo'}`,
        value: tech._id
      }));
    }
    return response;
  } catch (error) {
    console.error("Error fetching technicians:", error);
  }
};

const handleView = async () => {
  try {
    const id = localStorage.getItem('selectedRequestId');
    const response = await apiService.get(`application-maintenance/Consultar/${id}`);
    requestData.value = Array.isArray(response) ? response[0] : response;
    console.log('Datos de la API:', requestData.value);
    
    // Generate initial work order number
    generateNewTrackingNumber();
  } catch (error) {
    console.error('Error al obtener los datos de la vista:', error);
  }
}

const handleSUser = async () => {
  try {
    const token = Cookies.get('authToken');
    console.log('Token encontrado:', token);

    if (!token) {
      console.error('No se encontró el token de autenticación');
      return null;
    }

    const decodedToken = jwtDecode(token);
    console.log('Token decodificado:', decodedToken);

    if (!decodedToken.sub) {
      console.error('El token no contiene el ID del usuario');
      return null;
    }

    userId.value = decodedToken.sub;
    // Fetch and set user name
    userName.value = await fetchUserName(decodedToken.sub);
    
    return decodedToken.sub;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
};

const handleSubmit = async () => {
  try {
    if (!validateForm()) return;
    
    isLoading.value = true;
    
    const workOrderData = {
      radicado: workOrderNumber.value,
      tecnicoId: selectedTechnician.value,
      instructorId: userId.value,
      fechaInicio: new Date(requestData.value.createdAt).toISOString(),
      fechaFin: new Date(maintenanceDate.value).toISOString(),
      prioridad: priority.value,
      solicitud: requestData.value._id
    };

    const response = await apiService.post("/word-orden", workOrderData);
    console.log('Orden de trabajo creada:', response);
    
    await Swal.fire({
      title: '¡Exitoso!',
      text: 'Orden de trabajo creada exitosamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });

    resetForm();
    
  } catch (error) {
    console.error('Error al crear la orden de trabajo:', error);
    Swal.fire({
      title: '¡Error!',
      text: 'Error al crear la orden de trabajo: ' + (error.response?.data?.message || error.message),
      icon: 'error'
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  const userData = await handleSUser();
  if (userData) {
    console.log('ID del usuario:', userData);
  } else {
    console.error('No se pudo obtener el ID del usuario');
  }
  
  await handleView();
  await fetchTenico();
  
  // Set default date to today if not already set
  if (!maintenanceDate.value) {
    const today = new Date();
    maintenanceDate.value = today.toISOString().split('T')[0];
  }
});
</script>

<style scoped>
.maintenance-form {
  max-width: 1200px;
  margin: 0 auto;
  padding:0 20px;
  color: #333;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 30px;
  position: relative;
  overflow: hidden;
}

.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(144, 238, 144, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  z-index: 0;
  pointer-events: none;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 25px;
  padding-bottom: 10px;
  position: relative;
  color: #39A900;
  border-bottom: 2px solid #39A900;
  text-align: center; /* Centra el texto */
}


.form-content {
  position: relative;
  z-index: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 30px;
  margin-bottom: 20px;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.form-control:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.form-control:read-only {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.input-with-button {
  display: flex;
  align-items: center;
  gap: 10px;
}

.refresh-button {
  background-color: #39A900;
  color: white;
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-button:hover {
  background-color: #388E3C;
}

.refresh-button i {
  font-size: 1.2rem;
}

.device-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.device-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.tracking-number {
  margin-top: 20px;
  max-width: 300px;
}

.asset-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
  position: relative;
  z-index: 1;
}

.info-group {
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.info-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #555;
}

.info-group p {
  margin: 0;
  font-size: 0.95rem;
  color: #333;
}

.form-actions {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.btn-submit {
  background-color: #39A900;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 40px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-submit:hover {
  background-color: #388E3C;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.btn-submit:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 992px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .device-image-container {
    grid-column: span 2;
    margin-top: 20px;
  }
  
  .asset-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .device-image-container {
    grid-column: span 1;
  }
  
  .asset-info-grid {
    grid-template-columns: 1fr;
  }
  
  .maintenance-form {
    padding: 10px;
  }
  
  .form-card {
    padding: 20px;
  }
}
</style>