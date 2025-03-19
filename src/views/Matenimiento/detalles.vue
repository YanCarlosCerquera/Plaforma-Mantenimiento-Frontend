<template>
  <div class="work-order-scheduler">
    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="scheduler-container" v-if="requestData">
      <!-- Header with progress indicator -->
      

      <!-- Main content area -->
      <div class="scheduler-content">
        <!-- Request Information Card -->
        <div class="card request-info-card">
          <div class="card-header">
            <h2 class="card-title">
              <i class="fas fa-clipboard-list"></i> Solicitud de Mantenimiento
            </h2>
            <div class="tracking-badge">
              <span>Radicado:</span>
              <strong>{{ requestData?.trackingNumber || 'No disponible' }}</strong>
            </div>
          </div>
          
          <div class="card-body">
            <div class="request-details">
              <div class="request-info">
                <div class="info-row">
                  <div class="info-item">
                    <label><i class="fas fa-calendar"></i> Fecha de solicitud</label>
                    <p>{{ formatDate(requestData?.createdAt) }}</p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-user"></i> Solicitante</label>
                    <p>{{ requestData?.requesterName || 'No especificado' }}</p>
                  </div>
                  <div class="info-item">
                    <label><i class="fas fa-phone"></i> Contacto</label>
                    <p>{{ requestData?.requesterPhone || 'No especificado' }}</p>
                  </div>
                </div>
              </div>
              
              <div class="asset-preview">
                <div class="asset-image">
                  <img
                    :src="requestData?.assetInfo?.image"
                    alt="Imagen"
                    @error="handleImageError"
                  />
                </div>
                <div class="asset-summary">
                  <h3>{{ requestData?.assetInfo?.name || 'Activo' }}</h3>
                  <div class="asset-tags">
                    <span class="tag">{{ requestData?.assetInfo?.equipmentType || 'Sin tipo' }}</span>
                    <span class="tag">{{ requestData?.assetInfo?.brand || 'Sin marca' }}</span>
                    <span class="tag status" :class="getStatusClass(requestData?.assetInfo?.status)">
                      {{ requestData?.assetInfo?.status ? 'Bueno' : 'Malo' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Work Order Scheduling Card -->
        <div class="card scheduling-card">
          <div class="card-header">
            <h2 class="card-title">
              <i class="fas fa-tools"></i> Programación de Orden de Trabajo
            </h2>
          </div>
          
          <div class="card-body">
            <div class="scheduling-grid">
              <!-- Work Order Number -->
              <div class="form-group">
                <label for="workOrderNumber">
                  <i class="fas fa-hashtag"></i> Número de Orden
                  <span class="required">*</span>
                </label>
                <div class="input-with-button">
                  <input 
                    type="text"
                    id="workOrderNumber"
                    class="form-input"
                    v-model="workOrderNumber"
                    placeholder="OT-00-2024"
                    readonly
                  />
                  <button 
                    type="button" 
                    class="icon-button generate-button"
                    @click="generateNewTrackingNumber"
                    title="Generar nuevo número"
                  >
                    <i class="fas fa-sync-alt"></i>
                  </button>
                </div>
                <small class="form-hint">Número único de identificación para esta orden</small>
              </div>
              
              <!-- Priority Selection -->
              <div class="form-group">
                <label for="priority">
                  <i class="fas fa-flag"></i> Prioridad
                  <span class="required">*</span>
                </label>
                <div class="custom-select">
                  <select 
                    id="priority"
                    class="form-input" 
                    v-model="priority"
                    :class="{ 'error': validationErrors.priority }"
                  >
                    <option value="" disabled>Seleccionar...</option>
                    <option value="Urgente" class="priority-urgent">Urgente</option>
                    <option value="alta" class="priority-high">Alta</option>
                    <option value="media" class="priority-medium">Media</option>
                    <option value="baja" class="priority-low">Baja</option>
                    <option value="Sin Terminar" class="priority-pending">Sin Terminar</option>
                  </select>
                  <div class="select-arrow"><i class="fas fa-chevron-down"></i></div>
                </div>
                <small v-if="validationErrors.priority" class="error-message">
                  {{ validationErrors.priority }}
                </small>
              </div>
              
              <!-- Maintenance Date -->
              <div class="form-group">
                <label for="maintenanceDate">
                  <i class="fas fa-calendar-day"></i> Fecha de Mantenimiento
                  <span class="required">*</span>
                </label>
                <input 
                  type="date"
                  id="maintenanceDate"
                  class="form-input"
                  v-model="maintenanceDate"
                  :min="minDate"
                  :class="{ 'error': validationErrors.maintenanceDate }"
                />
                <small v-if="validationErrors.maintenanceDate" class="error-message">
                  {{ validationErrors.maintenanceDate }}
                </small>
              </div>
              
              <!-- Technician Assignment -->
              <div class="form-group">
                <label for="technician">
                  <i class="fas fa-user-cog"></i> Técnico Asignado
                  <span class="required">*</span>
                </label>
                <div class="custom-select">
                  <select 
                    id="technician"
                    class="form-input" 
                    v-model="selectedTechnician"
                    :class="{ 'error': validationErrors.technician }"
                  >
                    <option value="" disabled>Seleccionar técnico...</option>
                    <option 
                      v-for="tech in technicians" 
                      :key="tech.id" 
                      :value="tech.value"
                      :class="{ 'inactive': !isTechnicianActive(tech.label) }"
                    >
                      {{ tech.label }}
                    </option>
                  </select>
                  <div class="select-arrow"><i class="fas fa-chevron-down"></i></div>
                </div>
                <small v-if="validationErrors.technician" class="error-message">
                  {{ validationErrors.technician }}
                </small>
              </div>
              
              <!-- Authorized By -->
              <div class="form-group">
                <label for="authorizedBy">
                  <i class="fas fa-user-check"></i> Autorizado por
                </label>
                <input 
                  type="text"
                  id="authorizedBy"
                  class="form-input"
                  :value="userName"
                  readonly
                />
                <small class="form-hint">Usuario que autoriza esta orden de trabajo</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Asset Details Card -->
        <div class="card asset-details-card">
          <div class="card-header">
            <h2 class="card-title">
              <i class="fas fa-laptop"></i> Detalles del Activo
            </h2>
            <button type="button" class="toggle-button" @click="toggleAssetDetails">
              {{ showAssetDetails ? 'Ocultar detalles' : 'Mostrar detalles' }}
              <i :class="showAssetDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </button>
          </div>
          
          <div class="card-body" v-if="showAssetDetails">
            <div class="asset-details-grid">
              <div class="detail-item">
                <label><i class="fas fa-building"></i> Ambiente</label>
                <p>{{ requestData?.environmentInfo?.name || 'No especificado' }}</p>
              </div>

              <div class="detail-item">
                <label><i class="fas fa-map-marker-alt"></i> Ubicación</label>
                <p>{{ requestData?.assetInfo?.location || 'No especificado' }}</p>
              </div>
              
              <div class="detail-item">
                <label><i class="fas fa-calendar-plus"></i> Fecha de adquisición</label>
                <p>{{ formatDate(requestData?.assetInfo?.acquisitionDate) }}</p>
              </div>
              
              <div class="detail-item">
                <label><i class="fas fa-tag"></i> Marca</label>
                <p>{{ requestData?.assetInfo?.brand || 'No especificado' }}</p>
              </div>
              
              <div class="detail-item">
                <label><i class="fas fa-laptop"></i> Modelo</label>
                <p>{{ requestData?.assetInfo?.modelo || 'No especificado' }}</p>
              </div>
              
              <div class="detail-item">
                <label><i class="fas fa-user-tie"></i> Cuentadante</label>
                <p>{{ requestData?.assetInfo?.accountHolder || 'No especificado' }}</p>
              </div>
              
              <div class="detail-item">
                <label><i class="fas fa-barcode"></i> Número de serie</label>
                <p>{{ requestData?.assetInfo?.serialNumber || 'No especificado' }}</p>
              </div>
              
              <div class="detail-item">
                <label><i class="fas fa-cog"></i> Tipo de equipo</label>
                <p>{{ requestData?.assetInfo?.equipmentType || 'No especificado' }}</p>
              </div>
              
              <div class="detail-item">
                <label><i class="fas fa-info-circle"></i> Estado</label>
                <p class="status-text" :class="getStatusClass(requestData?.assetInfo?.status)">
                  {{ requestData?.assetInfo?.status ? 'Bueno' : 'Malo' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="scheduler-actions">
        <button type="button" class="btn-secondary" @click="resetForm">
          <i class="fas fa-undo"></i> Reiniciar
        </button>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          <i class="fas fa-calendar-check"></i>
          <span v-if="isSubmitting">Programando...</span>
          <span v-else>Programar Mantenimiento</span>
        </button>
      </div>
    </form>

    <!-- Empty state when no data is available -->
    <div v-else-if="!isLoading" class="empty-state">
      <div class="empty-state-icon">
        <i class="fas fa-clipboard-list"></i>
      </div>
      <h2>No hay datos disponibles</h2>
      <p>No se encontró información de la solicitud de mantenimiento.</p>
      <button class="btn-primary" @click="goBack">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import apiService from '../../service/apiservice';
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

const router = useRouter();
const userId = ref(null);
const userName = ref('');
const requestData = ref(null);
const currentCounter = ref(0);
const workOrderNumber = ref('');
const maintenanceDate = ref('');
const priority = ref('');
const technicians = ref([]);
const selectedTechnician = ref('');
const isLoading = ref(true);
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const showAssetDetails = ref(false);

// Validation state
const validationErrors = ref({
  priority: '',
  maintenanceDate: '',
  technician: ''
});

// Computed properties
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});



// Methods
const fetchUserName = async (userId) => {
  try {
    const response = await apiService.get(`users/${userId}`);
    return response?.name || response?.username || 'No disponible';
  } catch (error) {
    console.error('Error al obtener el nombre del usuario:', error);
    return 'No disponible';
  }
};

const generateNewTrackingNumber = () => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const counter = currentCounter.value.toString().padStart(2, '0');
  workOrderNumber.value = `OT-${counter}-${month}-${year}`;
  currentCounter.value = (currentCounter.value + 1) % 100;
  
  // Add animation effect
  const inputElement = document.getElementById('workOrderNumber');
  if (inputElement) {
    inputElement.classList.add('highlight-animation');
    setTimeout(() => {
      inputElement.classList.remove('highlight-animation');
    }, 1000);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'No disponible';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error de formato';
  }
};

const getStatusClass = (status) => {
  return status ? 'status-good' : 'status-bad';
};

const isTechnicianActive = (label) => {
  return label?.includes('Activo') || false;
};

const toggleAssetDetails = () => {
  showAssetDetails.value = !showAssetDetails.value;
};



const resetForm = () => {
  Swal.fire({
    title: '¿Reiniciar formulario?',
    text: 'Se perderán los datos ingresados',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#39A900',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, reiniciar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      priority.value = '';
      maintenanceDate.value = new Date().toISOString().split('T')[0];
      selectedTechnician.value = '';
      generateNewTrackingNumber();
      validationErrors.value = {
        priority: '',
        maintenanceDate: '',
        technician: ''
      };
      isSubmitted.value = false;
    }
  });
};

const goBack = () => {
  router.go(-1);
};

const validateForm = () => {
  let isValid = true;
  validationErrors.value = {
    priority: '',
    maintenanceDate: '',
    technician: ''
  };
  
  if (!workOrderNumber.value) {
    Swal.fire({
      title: '¡Error!',
      text: 'Por favor genere un número de orden de trabajo',
      icon: 'error',
      confirmButtonColor: '#39A900'
    });
    return false;
  }
  
  if (!priority.value || priority.value === 'Seleccionar...') {
    validationErrors.value.priority = 'Por favor seleccione una prioridad';
    isValid = false;
  }

  if (!maintenanceDate.value) {
    validationErrors.value.maintenanceDate = 'Por favor seleccione una fecha de mantenimiento';
    isValid = false;
  }
  
  if (!selectedTechnician.value) {
    validationErrors.value.technician = 'Por favor seleccione un técnico';
    isValid = false;
  }

  return isValid;
};

const fetchTechnicians = async () => {
  try {
    const response = await apiService.get(`users/Tecnicos`);
    if (response && response.data) {
      technicians.value = response.data.map(tech => ({
        id: tech._id || '',
        label: `${tech.name || 'Sin nombre'} - ${tech.state ? 'Activo' : 'Inactivo'}`,
        value: tech._id || ''
      }));
    }
    return response;
  } catch (error) {
    console.error("Error fetching technicians:", error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudieron cargar los técnicos disponibles',
      icon: 'error',
      confirmButtonColor: '#39A900'
    });
  }
};

const fetchRequestData = async () => {
  try {
    isLoading.value = true;
    const id = localStorage.getItem('selectedRequestId');
    
    if (!id) {
      throw new Error('No se encontró ID de solicitud');
    }
    
    const response = await apiService.get(`application-maintenance/Consultar/${id}`);
    if (!response) {
      throw new Error('No se recibieron datos de la API');
    }
    
    requestData.value = Array.isArray(response) ? response[0] : response;
    console.log('Datos de la solicitud:', requestData.value);
    
    // Generate initial work order number
    generateNewTrackingNumber();
    
    // Set default date to today
    maintenanceDate.value = new Date().toISOString().split('T')[0];
  } catch (error) {
    console.error('Error al obtener los datos de la solicitud:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo cargar la información de la solicitud',
      icon: 'error',
      confirmButtonColor: '#39A900'
    });
  } finally {
    isLoading.value = false;
  }
};

const getUserData = async () => {
  try {
    const token = Cookies.get('authToken');
    
    if (!token) {
      console.error('No se encontró el token de autenticación');
      return null;
    }

    const decodedToken = jwtDecode(token);
    
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
    
    isSubmitting.value = true;
    
    // Verify requestData exists
    if (!requestData.value || !requestData.value._id) {
      throw new Error('Datos de solicitud no disponibles');
    }
    
    // Prepare work order data
    const workOrderData = {
      radicado: workOrderNumber.value,
      tecnicoId: selectedTechnician.value,
      instructorId: userId.value,
      fechaInicio: new Date(requestData.value?.createdAt || new Date()).toISOString(),
      fechaFin: new Date(maintenanceDate.value).toISOString(),
      prioridad: priority.value,
      solicitud: requestData.value._id,
      state: false
    };

    console.log('Enviando datos:', workOrderData);

    // Submit work order
    const response = await apiService.post("/word-orden", workOrderData);
    console.log('Respuesta del servidor:', response);
    
    isSubmitted.value = true;
    
    // Show success message with more details
    await Swal.fire({
      title: '¡Orden de trabajo creada!',
      html: `
        <div style="text-align: left; margin-top: 20px;">
          <p><strong>Número:</strong> ${workOrderNumber.value}</p>
          <p><strong>Prioridad:</strong> ${priority.value}</p>
          <p><strong>Fecha programada:</strong> ${formatDate(maintenanceDate.value)}</p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#39A900'
    });

    // Ask if user wants to create another work order
    const { isConfirmed } = await Swal.fire({
      title: '¿Qué desea hacer ahora?',
      text: 'Puede crear otra orden o volver al listado',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#39A900',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Crear otra orden',
      cancelButtonText: 'Volver al listado'
    });

    if (isConfirmed) {
      resetForm();
    } else {
      // Navigate back to the list
      router.push('/mantenimientos/ordenes-trabajo');
    }
    
  } catch (error) {
    console.error('Error al crear la orden de trabajo:', error);
    let errorMessage = 'Error al crear la orden de trabajo';
    
    if (error.response?.data?.message) {
      errorMessage += ': ' + error.response.data.message;
    } else if (error.message) {
      errorMessage += ': ' + error.message;
    }
    
    Swal.fire({
      title: '¡Error!',
      text: errorMessage,
      icon: 'error',
      confirmButtonColor: '#39A900'
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  try {
    const userData = await getUserData();
    if (!userData) {
      console.warn('No se pudo obtener información del usuario, continuando con datos limitados');
    }
    
    // Load data in parallel but handle errors separately
    const promises = [
      fetchRequestData().catch(error => {
        console.error('Error al cargar datos de solicitud:', error);
        return null;
      }),
      fetchTechnicians().catch(error => {
        console.error('Error al cargar técnicos:', error);
        return null;
      })
    ];
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error durante la inicialización:', error);
  } finally {
    isLoading.value = false;
  }
});

// Watch for changes to update form validity
watch([priority, maintenanceDate, selectedTechnician], () => {
  // Clear validation errors when fields change
  if (priority.value) validationErrors.value.priority = '';
  if (maintenanceDate.value) validationErrors.value.maintenanceDate = '';
  if (selectedTechnician.value) validationErrors.value.technician = '';
});
</script>

<style scoped>
/* Main container */
.work-order-scheduler {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
  position: relative;
  min-height: 100vh;
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(57, 169, 0, 0.2);
  border-radius: 50%;
  border-top-color: #39A900;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Header with progress steps */
.scheduler-header {
  margin-bottom: 30px;
  text-align: center;
}

.main-title {
  font-size: 2rem;
  color: #39A900;
  margin-bottom: 20px;
  font-weight: 700;
}

.progress-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1.2rem;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.step-label {
  font-size: 0.9rem;
  color: #777;
  font-weight: 500;
  transition: all 0.3s ease;
}

.step-connector {
  flex: 1;
  height: 3px;
  background-color: #f0f0f0;
  margin: 0 15px;
  position: relative;
  top: -25px;
  z-index: 0;
  max-width: 100px;
  transition: background-color 0.3s ease;
}

.step.active .step-icon {
  background-color: #39A900;
  color: white;
  box-shadow: 0 4px 8px rgba(57, 169, 0, 0.2);
}

.step.active .step-label {
  color: #39A900;
  font-weight: 600;
}

.step.active + .step-connector {
  background-color: #39A900;
}

/* Main content area */
.scheduler-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.scheduler-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Card styling */
.card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #eaeaea;
}

.card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  padding: 20px 25px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.3rem;
  color: #39A900;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title i {
  font-size: 1.2rem;
}

.card-body {
  padding: 25px;
}

/* Request info card */
.tracking-badge {
  background-color: #f0f8ff;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #d0e8ff;
}

.tracking-badge strong {
  color: #0066cc;
}

.request-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.request-info {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
}

.info-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.info-item label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.info-item p {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
}

.asset-preview {
  display: flex;
  align-items: center;
  gap: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
}

.asset-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
}

.asset-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.asset-summary {
  flex: 1;
}

.asset-summary h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #333;
}

.asset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  color: #555;
}

.tag.status {
  font-weight: 600;
}

.status-good {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-bad {
  background-color: #ffebee;
  color: #c62828;
}

/* Scheduling card */
.scheduling-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.required {
  color: #f44336;
  margin-left: 3px;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.form-input:focus {
  outline: none;
  border-color: #39A900;
  box-shadow: 0 0 0 3px rgba(57, 169, 0, 0.2);
}

.form-input:read-only {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-input.error {
  border-color: #f44336;
}

.form-hint {
  display: block;
  font-size: 0.8rem;
  color: #777;
  margin-top: 5px;
}

.error-message {
  display: block;
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 5px;
}

.input-with-button {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-button {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.generate-button {
  background-color: #39A900;
  color: white;
}

.generate-button:hover {
  background-color: #2d8000;
}

/* Custom select styling */
.custom-select {
  position: relative;
}

.select-arrow {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #777;
}

.custom-select select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 30px;
}

.custom-select select option {
  padding: 10px;
}

.priority-urgent {
  color: #d32f2f;
  font-weight: 600;
}

.priority-high {
  color: #f57c00;
  font-weight: 600;
}

.priority-medium {
  color: #0288d1;
}

.priority-low {
  color: #388e3c;
}

.priority-pending {
  color: #616161;
}

.inactive {
  color: #999;
  font-style: italic;
}

/* Asset details card */
.toggle-button {
  background: none;
  border: none;
  color: #39A900;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.toggle-button:hover {
  text-decoration: underline;
}

.asset-details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.detail-item {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  transition: all 0.2s;
}

.detail-item:hover {
  background-color: #f0f0f0;
}

.detail-item label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.detail-item p {
  margin: 0;
  font-size: 0.95rem;
  color: #333;
}

.status-text {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
}

/* Form actions */
.scheduler-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-primary, .btn-secondary {
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.btn-primary {
  background-color: #39A900;
  color: white;
  box-shadow: 0 4px 6px rgba(57, 169, 0, 0.2);
}

.btn-primary:hover {
  background-color: #2d8000;
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(57, 169, 0, 0.25);
}

.btn-primary:disabled {
  background-color: #a0d8a0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e9e9e9;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 12px;
  margin: 50px auto;
  max-width: 500px;
}

.empty-state-icon {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 20px;
}

.empty-state h2 {
  color: #555;
  margin-bottom: 10px;
}

.empty-state p {
  color: #777;
  margin-bottom: 30px;
}

/* Animations */
.highlight-animation {
  animation: highlight 1s ease;
}

@keyframes highlight {
  0% { background-color: #e8f5e9; }
  100% { background-color: #f9f9f9; }
}

/* Responsive styles */
@media (max-width: 992px) {
  .scheduling-grid {
    grid-template-columns: 1fr;
  }
  
  .asset-details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .asset-details-grid {
    grid-template-columns: 1fr;
  }
  
  .info-row {
    grid-template-columns: 1fr;
  }
  
  .asset-preview {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .asset-image {
    width: 100%;
    height: auto;
    aspect-ratio: 16/9;
  }
  
  .scheduler-actions {
    flex-direction: column;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .progress-steps {
    flex-direction: column;
    gap: 20px;
  }
  
  .step-connector {
    width: 3px;
    height: 20px;
    margin: 0;
    top: 0;
  }
}
</style>