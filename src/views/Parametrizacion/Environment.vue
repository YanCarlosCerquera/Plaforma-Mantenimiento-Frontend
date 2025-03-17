<script setup>
import { onMounted, ref } from "vue";
import AuthorsTable from "../components/AuthorsTable.vue";
import apiService from "../../service/apiservice";
import Swal from 'sweetalert2';

// Estado reactivo
const rows = ref([]);
const isLoading = ref(false);
const instructors = ref([]);
const trainingCenters = ref([]);
const dialog = ref(false);
const isEditing = ref(false);
const mobile = ref(false);

// Detectar si es dispositivo móvil
onMounted(() => {
  const checkMobile = () => {
    mobile.value = window.innerWidth < 768;
  };
  window.addEventListener('resize', checkMobile);
  checkMobile();
  
  // Limpiar event listener
  return () => {
    window.removeEventListener('resize', checkMobile);
  };
});

const currentEnvironment = ref({
  name: "",
  code: "",
  typeEnvironment: ["Laboratory"],
  capacity: 0,
  floor: 1,
  building: "",
  trainingCenter: "",
  responsibleUser: ""
});

// Opciones para el tipo de ambiente
const environmentTypes = ref([
  "Laboratory",
  "Classroom",
  "Workshop",
  "Conference Room"
]);

// Configuración de la tabla
const headers = ref([
  "Nombre",
  "Código Ambiente",
  "Tipo Ambiente",
  "Capacidad",
  "Edificio",
  "Responsable",
]);

const fields = ref({
  name: {
    value: "name",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  code: {
    value: "code",
    class: "align-middle",
    textClass: "text-xs font-weight-bold mb-0",
  },
  typeEnvironment: {
    value: "typeEnvironment",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
    formatter: (value) => Array.isArray(value) ? value.join(", ") : value
  },
  capacity: {
    value: "capacity",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  building: {
    value: "building",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  responsibleUser: {
    value: "responsibleUser.name",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
});

const icons = ref([
  { class: "fas fa-trash", method: handleDelete },
  { class: "fas fa-edit", method: handleEdit },
]);

const fetchAllData = async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      fetchEnvironments(),
      fetchInstructors(),
      fetchTrainingCenters()
    ]);
  } catch (error) {
    console.error("Error fetching data:", error);
    showErrorAlert("Error al cargar los datos");
  } finally {
    isLoading.value = false;
  }
};

const fetchEnvironments = async () => {
  try {
    const response = await apiService.get("/environments");
    rows.value = response;
  } catch (error) {
    console.error("Error fetching environments:", error);
    showErrorAlert("Error al cargar los ambientes");
  }
};

// Corregido para acceder a response.data
const fetchInstructors = async () => {
  try {
    const response = await apiService.get("/users/Instructor");
    // Verificar si la respuesta tiene la estructura esperada
    if (response && response.success && Array.isArray(response.data)) {
      instructors.value = response.data.map(item => ({
        id: item._id,
        name: item.name,
        assignedRol: item.assignedRol.name
      }));
      console.log("Instructores cargados:", instructors.value);
    } else {
      console.error("Formato de respuesta inesperado:", response);
      showErrorAlert("Error en el formato de respuesta de instructores");
    }
  } catch (error) {
    console.error("Error fetching instructors:", error);
    showErrorAlert("Error al cargar los instructores");
  }
};

const fetchTrainingCenters = async () => {
  try {
    const response = await apiService.get("/training-centers");
    // Verificar si la respuesta tiene una estructura similar a la de instructores
    if (response && response.success && Array.isArray(response.data)) {
      trainingCenters.value = response.data;
    } else {
      trainingCenters.value = response; // Mantener compatibilidad con el formato anterior
    }
  } catch (error) {
    console.error("Error fetching training centers:", error);
    showErrorAlert("Error al cargar los centros de formación");
  }
};

// Función para mostrar alerta de error
const showErrorAlert = (message) => {
  Swal.fire({
    title: 'Error',
    text: message,
    icon: 'error',
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#d33'
  });
};

// Función para mostrar alerta de éxito
const showSuccessAlert = (message) => {
  Swal.fire({
    title: '¡Éxito!',
    text: message,
    icon: 'success',
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#3085d6'
  });
};

async function handleDelete(item) {
  // Usar SweetAlert2 para confirmación
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Deseas eliminar el ambiente "${item.name}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await apiService.delete(`/environments/${item._id}`);
      await fetchEnvironments();
      showSuccessAlert('Ambiente eliminado correctamente');
    } catch (error) {
      console.error("Error deleting environment:", error);
      showErrorAlert("Error al eliminar el ambiente");
    }
  }
}

function handleEdit(item) {
  isEditing.value = true;
  currentEnvironment.value = {
    _id: item._id,
    name: item.name,
    code: item.code,
    typeEnvironment: item.typeEnvironment || ["Laboratory"],
    capacity: item.capacity,
    floor: item.floor,
    building: item.building,
    trainingCenter: item.trainingCenter?._id || "",
    responsibleUser: item.responsibleUser?._id || ""
  };
  dialog.value = true;
}

function handleCreate() {
  isEditing.value = false;
  currentEnvironment.value = {
    name: "",
    code: "",
    typeEnvironment: ["Laboratory"],
    capacity: 0,
    floor: 1,
    building: "",
    trainingCenter: trainingCenters.value.length > 0 ? trainingCenters.value[0]._id : "",
    responsibleUser: instructors.value.length > 0 ? instructors.value[0].id : ""
  };
  dialog.value = true;
}

function handleCancel() {
  dialog.value = false;
}

async function handleSubmit() {
  try {
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Guardando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    if (isEditing.value) {
      const { _id, ...environmentData } = currentEnvironment.value;
      await apiService.patch(`/environments/${_id}`, environmentData);
      showSuccessAlert('Ambiente actualizado correctamente');
    } else {
      await apiService.post("/environments", currentEnvironment.value);
      showSuccessAlert('Ambiente creado correctamente');
    }
    
    dialog.value = false;
    await fetchEnvironments(); 
    Swal.close();
  } catch (error) {
    console.error("Error saving environment:", error);
    Swal.close();
    showErrorAlert("Error al guardar el ambiente");
  }
}

// Agregar logs para depuración
onMounted(() => {
  console.log("Componente montado, cargando datos...");
  fetchAllData();
});
</script>

<template>
  <div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <AuthorsTable 
            title="Gestión de Ambientes" 
            :headers="headers" 
            :rows="rows" 
            :fields="fields"
            :icons="icons"
            :isLoading="isLoading"
          >
            <template #add-button>
              <button class="btn btn-custom" @click="handleCreate">
                <i class="fas fa-plus me-2"></i>Agregar Nuevo Ambiente
              </button>
            </template>
          </AuthorsTable>
        </div>
      </div>
    </div>
    
    <!-- Diálogo para crear/editar ambientes -->
    <v-dialog v-model="dialog" :fullscreen="mobile" scrollable persistent max-width="800px">
      <v-card class="bg-white">
        <v-card-title class="card-title d-flex align-items-center justify-content-center text-h4 text-success"
          style="margin: 1rem">
          {{ isEditing ? 'Editar ambiente' : 'Crear nuevo ambiente' }}
        </v-card-title>
        <v-card-text class="card-body p-3">
          <v-container>
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="row" style="width: 100%">
                  <div class="col-md-6 mb-3">
                    <label for="name" class="form-control-label">Nombre del ambiente</label>
                    <input type="text" class="form-control" id="name" v-model="currentEnvironment.name" required />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="code" class="form-control-label">Código</label>
                    <input type="text" class="form-control" id="code" v-model="currentEnvironment.code" required />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="typeEnvironment" class="form-control-label">Tipo de ambiente</label>
                    <select class="form-select" id="typeEnvironment" v-model="currentEnvironment.typeEnvironment[0]">
                      <option v-for="type in environmentTypes" :key="type" :value="type">
                        {{ type }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="capacity" class="form-control-label">Capacidad</label>
                    <input type="number" class="form-control" id="capacity" v-model.number="currentEnvironment.capacity" min="1" required />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="floor" class="form-control-label">Piso</label>
                    <input type="number" class="form-control" id="floor" v-model.number="currentEnvironment.floor" min="1" />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="building" class="form-control-label">Edificio</label>
                    <input type="text" class="form-control" id="building" v-model="currentEnvironment.building" />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="trainingCenter" class="form-control-label">Centro de formación</label>
                    <select class="form-select" id="trainingCenter" v-model="currentEnvironment.trainingCenter">
                      <option v-for="center in trainingCenters" :key="center._id" :value="center._id">
                        {{ center.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="responsibleUser" class="form-control-label">Responsable</label>
                    <select class="form-select" id="responsibleUser" v-model="currentEnvironment.responsibleUser">
                      <option v-for="instructor in instructors" :key="instructor.id" :value="instructor.id">
                        {{ instructor.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <v-card-actions class="d-flex justify-content-center mt-4" style="gap: 60px; padding-top: 20px">
                <button class="btn btn-danger" type="button" @click="handleCancel">
                  Cancelar
                </button>
                <button class="btn btn-success" type="submit">
                  {{ isEditing ? 'Guardar cambios' : 'Crear ambiente' }}
                </button>
              </v-card-actions>
            </form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.btn-custom {
  background-color: white;
  color: #39A900;
  border: 1px solid #2d8000;
  transition: all 0.3s ease;
  margin-bottom: 0%;
}

.btn-custom:hover {
  background-color: #2d8000;
  color: white;
}

.v-card {
  color: rgba(0, 0, 0, 0.87);
}

.v-card-title {
  color: rgba(0, 0, 0, 0.87);
}

.v-card-text {
  color: rgba(0, 0, 0, 0.6);
}

.form-control, .form-select {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: 1px solid #ced4da;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: #39A900;
  box-shadow: 0 0 0 0.25rem rgba(57, 169, 0, 0.25);
}

.form-control-label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.btn-success {
  background-color: #39A900;
  border-color: #39A900;
}

.btn-success:hover {
  background-color: #2d8000;
  border-color: #2d8000;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background-color: #bb2d3b;
  border-color: #b02a37;
}
</style>