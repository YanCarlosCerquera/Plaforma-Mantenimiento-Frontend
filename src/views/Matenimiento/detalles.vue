<template>
  <div class="planear-mantenimiento-form">
    <header class="form-header">
      <div>
        <h1 class="title">Gestión de actividades de mantenimiento</h1>
        <h2 class="subtitle">Solicitud de mantenimiento</h2>
      </div>
    </header>

    <form @submit.prevent="handleSubmit" class="form-container" v-if="requestData">
      <section class="form-section">
        <h3 class="section-title">Información de la planeación</h3>

        <div class="form-section-content">
          <div class="form-grid">
            <div class="form-group">
              <label>Establecer prioridad</label>
              <select 
                class="form-select"
                v-model="priority"
              >
                <option selected>Seleccionar...</option>
                <option>alta</option>
                <option>media</option>
                <option>baja</option>
                <option>Sin Terminar</option>
              </select>
            </div>

            <div class="form-group">
              <label>Fecha de Inicio</label>
              <input 
              type="date"
              class="form-input"
                :value="formatDate(requestData.createdAt)"
                x
              />
            </div>

            <div class="form-group">
              <label>Fecha sugerida mantenimiento</label>
              <input 
                type="date"
                class="form-input"
                v-model="maintenanceDate"
              /> 
            </div>

            <div class="form-group tracking-number-container">
              <label>Orden de trabajo No:</label>
              <div class="input-with-button">
                <input 
                  type="text"
                  class="form-input"
                  :value="workOrderNumber"
                  placeholder="OT-MT-2025-f00"
                  readonly
                />
                <button 
                  type="button" 
                  class="generate-button"
                  @click="generateNewTrackingNumber"
                  title="Generar nuevo número"
                >
                  <i class="fas fa-cog"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Autorizada por</label>
              <input 
                type="text"
                class="form-input"
                :value="userName"
                readonly
              />
            </div>

            <div class="form-group">
              <label>Técnico Asignado</label>
              <select 
                class="form-select"
                v-model="selectedTechnician"
              >
                <option value="" disabled selected>Seleccionar Técnico...</option>
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
          <img
            class="form-section-content-image"
            src="../../assets/img/image-planear-mantenimiento.png"
            alt="Planear mantenimiento"
          >
        </div>
        <div class="form">
          <label>Radicado de solicitud </label>
          <input 
            type="text"
            class="form-input short-input"
            :value="requestData?.trackingNumber"
            readonly
          />
        </div>
      </section>

      <section class="form-section">
        <h3 class="section-title">Información del bien</h3>

        <div class="form-grid">
          <div class="form-group">
            <label>Centro de formación</label>
            <p>{{ requestData.assetInfo?.trainingCenterId.name || 'No disponible' }}</p>
          </div>

          <div class="form-group">
            <label>Ubicación</label>
            <p>{{ requestData.assetInfo?.location || 'No disponible' }}</p>
          </div>

          <div class="form-group">
            <label>Fecha de adquisición</label>
            <p>{{ formatDate(requestData.assetInfo?.acquisitionDate) }}</p>
          </div>

          <div class="form-group">
            <label>Marca</label>
            <p>{{ requestData.assetInfo?.brand || 'No disponible' }}</p>
          </div>

          <div class="form-group">
            <label>Modelo</label>
            <p>{{ requestData.assetInfo?.modelo || 'No disponible' }}</p>
          </div>

          <div class="form-group">
            <label>Cuentadante</label>
            <p>{{ requestData.assetInfo?.accountHolder || 'No disponible' }}</p>
          </div>

          <div class="form-group">
            <label>Número de serie</label>
            <p>{{ requestData.assetInfo?.serialNumber || 'No disponible' }}</p>
          </div>

          <div class="form-group">
            <label>Tipo de equipo</label>
            <p>{{ requestData.assetInfo?.equipmentType || 'No disponible' }}</p>
          </div>

          <div class="form-group">
            <label>Estado</label>
            <p>{{ requestData.assetInfo?.status ? 'Bueno' : 'Malo' }}</p>
          </div>
        </div>
      </section>

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
import apiService from '../../service/apiService';
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
  workOrderNumber.value = `OT-MT-${year}-f${counter}`;
  currentCounter.value = (currentCounter.value + 1) % 100; 
};

const formatDate = (dateString) => {
  if (!dateString) return 'No disponible';
  return new Date(dateString).toLocaleDateString();
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
      solicitud: {
        solicitudId: requestData.value._id
      }
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

  
    
});
</script>
<style scoped>
.planear-mantenimiento-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.form {
  margin-bottom: 2rem;

}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.title {
  color: #0f610f;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

.subtitle {
  color: rgba(#0f610f, 0.7);
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
}

.sena-logo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #fff;
  padding: 6px;
}

.form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
}

.form-section-content-image {
  margin: auto;
}

.section-title {
  color: #2EA12E;
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group p {
  margin-left: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

textarea {
  color: rgb(103, 116, 142);
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #2EA12E;
  box-shadow: 0 0 0 2px rgba(46, 161, 46, 0.1);
}

.form-actions {
  margin-top: 2rem;
  text-align: center;
}

.btn-submit {
  background-color: #2EA12E;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover {
  background-color: #248f24;
}

.btn-submit:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.tracking-number-container {
  position: relative;
}

.input-with-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.generate-button {
  background-color: #2EA12E;
  color: white;
  border: none;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.generate-button:hover {
  background-color: #248f24;
}

.generate-button i {
  font-size: 1.2rem;
}

.fa-spinner {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .planear-mantenimiento-form {
    padding: 1rem;
  }

  .form-container {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>