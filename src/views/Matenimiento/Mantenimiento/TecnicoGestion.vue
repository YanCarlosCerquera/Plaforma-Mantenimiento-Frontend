<script setup>
import { ref, computed, onMounted } from "vue";
import ArgonButton from "@/components/ArgonButton.vue";

// Estado
const tecnico = ref(null);
const ordenes = ref([]);
const total = ref(0);
const totalMantenimientos = ref(0);
const totalInformes = ref(0);
const loading = ref(true);
const error = ref(null);
const activeTab = ref('ordenes');
const searchQuery = ref('');
const activeFilters = ref([]);
const sortBy = ref('radicado');
const selectedOrder = ref(null);

// Datos computados
const filteredOrdenes = computed(() => {
  let result = [...ordenes.value];
  
  // Aplicar búsqueda
  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(orden => 
      orden.radicado.toLowerCase().includes(query) ||
      orden.prioridad.toLowerCase().includes(query)
    );
  }
  
  // Aplicar filtros
  if (activeFilters.value.length > 0) {
    result = result.filter(orden => 
      activeFilters.value.includes(orden.prioridad)
    );
  }
  
  // Aplicar ordenamiento
  result.sort((a, b) => {
    if (sortBy.value === 'radicado') {
      return a.radicado.localeCompare(b.radicado);
    } else if (sortBy.value === 'fechaInicio') {
      return new Date(a.fechaInicio) - new Date(b.fechaInicio);
    } else if (sortBy.value === 'prioridad') {
      const prioridadOrder = { 'alta': 1, 'media': 2, 'baja': 3 };
      return prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
    }
    return 0;
  });
  
  return result;
});

const allMantenimientos = computed(() => {
  // Crear una lista plana de todos los mantenimientos con referencia a su orden
  const mantenimientos = [];
  ordenes.value.forEach(orden => {
    orden.mantenimientos.forEach(mant => {
      mantenimientos.push({
        ...mant,
        ordenId: orden.id,
        radicado: orden.radicado
      });
    });
  });
  return mantenimientos;
});

const allInformes = computed(() => {
  // Crear una lista plana de todos los informes con referencia a su orden
  const informes = [];
  ordenes.value.forEach(orden => {
    orden.informes.forEach(inf => {
      informes.push({
        ...inf,
        ordenId: orden.id,
        radicado: orden.radicado
      });
    });
  });
  return informes;
});

// Métodos
const fetchData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('http://localhost:3000/word-orden/tecnico/67c61e895d4d1bb80f30e10a');
    
    if (!response.ok) {
      throw new Error(`Error al cargar datos: ${response.status}`);
    }
    
    const data = await response.json();
    
    tecnico.value = data.tecnico;
    ordenes.value = data.ordenes;
    total.value = data.total;
    totalMantenimientos.value = data.totalMantenimientos;
    totalInformes.value = data.totalInformes;
    
    // Seleccionar la primera orden por defecto si hay alguna
    if (ordenes.value.length > 0) {
      selectedOrder.value = ordenes.value[0].id;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    error.value = 'Error al cargar los datos. Por favor, intente nuevamente.';
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatNumber = (number) => {
  return new Intl.NumberFormat('es-CO').format(number);
};

const getPrioridadText = (prioridad) => {
  const prioridades = {
    'baja': 'Baja',
    'media': 'Media',
    'alta': 'Alta'
  };
  
  return prioridades[prioridad] || prioridad;
};

const getPrioridadClass = (prioridad) => {
  const classes = {
    'alta': 'danger',
    'media': 'warning',
    'baja': 'success'
  };
  
  return classes[prioridad] || 'primary';
};

const selectOrder = (id) => {
  selectedOrder.value = id;
};

const toggleFilter = (filter) => {
  const index = activeFilters.value.indexOf(filter);
  if (index === -1) {
    activeFilters.value.push(filter);
  } else {
    activeFilters.value.splice(index, 1);
  }
};

const clearFilters = () => {
  activeFilters.value = [];
};

// Cargar datos al montar el componente
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="g-sidenav-show bg-gray-100">
    <div class="min-height-300 bg-primary position-absolute w-100"></div>
    <main class="main-content position-relative border-radius-lg">
      <!-- Header -->
      <nav class="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl" id="navbarBlur">
        <div class="container-fluid py-1 px-3">
          <nav aria-label="breadcrumb">
            <h6 class="font-weight-bolder text-white mb-0">Panel de Órdenes de Trabajo</h6>
          </nav>
          <div class="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar">
            <div class="ms-md-auto pe-md-3 d-flex align-items-center">
              <div class="input-group">
                <span class="input-group-text text-body"><i class="fas fa-search" aria-hidden="true"></i></span>
                <input type="text" class="form-control" placeholder="Buscar..." v-model="searchQuery">
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div class="container-fluid py-4">
        <!-- Spinner de carga -->
        <div v-if="loading" class="text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-3">Cargando datos...</p>
        </div>

        <!-- Mensaje de error -->
        <div v-else-if="error" class="alert alert-danger text-white text-center my-5">
          <p>{{ error }}</p>
          <ArgonButton color="white" size="sm" @click="fetchData">Reintentar</ArgonButton>
        </div>

        <div v-else>
          <!-- Perfil del Técnico -->
          <div class="row">
            <div class="col-12">
              <div class="card bg-transparent shadow-xl mb-4">
                <div class="overflow-hidden position-relative border-radius-xl bg-cover" style="background-image: url('https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/card-visa.jpg');">
                  <span class="mask bg-gradient-dark"></span>
                  <div class="card-body position-relative z-index-1 p-3">
                    <div class="d-flex">
                      <div class="avatar avatar-xl position-relative me-3">
                        <span class="avatar-img rounded-circle bg-gray-100">
                          <i class="fas fa-user text-primary" style="font-size: 2rem;"></i>
                        </span>
                      </div>
                      <div class="d-flex flex-column">
                        <h5 class="text-white mt-0 mb-1">{{ tecnico?.nombre || 'Cargando...' }}</h5>
                        <p class="text-white text-sm mb-0">{{ tecnico?.cargo || '' }} | {{ tecnico?.documento?.tipo || '' }}: {{ tecnico?.documento?.numero || '' }}</p>
                        <p class="text-white text-sm mb-0">{{ tecnico?.email || '' }} | {{ tecnico?.telefono || '' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="row">
            <div class="col-xl-4 col-sm-6 mb-4">
              <div class="card">
                <div class="card-body p-3">
                  <div class="row">
                    <div class="col-8">
                      <div class="numbers">
                        <p class="text-sm mb-0 text-uppercase font-weight-bold">Órdenes de Trabajo</p>
                        <h5 class="font-weight-bolder mb-0">
                          {{ total }}
                        </h5>
                      </div>
                    </div>
                    <div class="col-4 text-end">
                      <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                        <i class="fas fa-clipboard-list text-lg opacity-10" aria-hidden="true"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-4 col-sm-6 mb-4">
              <div class="card">
                <div class="card-body p-3">
                  <div class="row">
                    <div class="col-8">
                      <div class="numbers">
                        <p class="text-sm mb-0 text-uppercase font-weight-bold">Mantenimientos</p>
                        <h5 class="font-weight-bolder mb-0">
                          {{ totalMantenimientos }}
                        </h5>
                      </div>
                    </div>
                    <div class="col-4 text-end">
                      <div class="icon icon-shape bg-gradient-warning shadow text-center border-radius-md">
                        <i class="fas fa-tools text-lg opacity-10" aria-hidden="true"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-xl-4 col-sm-6 mb-4">
              <div class="card">
                <div class="card-body p-3">
                  <div class="row">
                    <div class="col-8">
                      <div class="numbers">
                        <p class="text-sm mb-0 text-uppercase font-weight-bold">Informes</p>
                        <h5 class="font-weight-bolder mb-0">
                          {{ totalInformes }}
                        </h5>
                      </div>
                    </div>
                    <div class="col-4 text-end">
                      <div class="icon icon-shape bg-gradient-success shadow text-center border-radius-md">
                        <i class="fas fa-file-alt text-lg opacity-10" aria-hidden="true"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Filtros -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card mb-4">
                <div class="card-header pb-0 px-3">
                  <div class="row">
                    <div class="col-md-6">
                      <h6 class="mb-0">Filtros</h6>
                    </div>
                    <div class="col-md-6 d-flex justify-content-end align-items-center">
                      <div class="me-3">
                        <label class="form-label me-2">Ordenar por:</label>
                        <select class="form-select form-select-sm" v-model="sortBy">
                          <option value="radicado">Radicado</option>
                          <option value="fechaInicio">Fecha de inicio</option>
                          <option value="prioridad">Prioridad</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-body px-3 py-2">
                  <div class="d-flex flex-wrap gap-2">
                    <span 
                      class="badge bg-light text-dark me-2 mb-2 p-2" 
                      :class="{ 'bg-danger text-white': activeFilters.includes('alta') }"
                      style="cursor: pointer;"
                      @click="toggleFilter('alta')"
                    >
                      Alta prioridad
                      <i v-if="activeFilters.includes('alta')" class="fas fa-times-circle ms-1"></i>
                    </span>
                    <span 
                      class="badge bg-light text-dark me-2 mb-2 p-2" 
                      :class="{ 'bg-warning text-white': activeFilters.includes('media') }"
                      style="cursor: pointer;"
                      @click="toggleFilter('media')"
                    >
                      Media prioridad
                      <i v-if="activeFilters.includes('media')" class="fas fa-times-circle ms-1"></i>
                    </span>
                    <span 
                      class="badge bg-light text-dark me-2 mb-2 p-2" 
                      :class="{ 'bg-success text-white': activeFilters.includes('baja') }"
                      style="cursor: pointer;"
                      @click="toggleFilter('baja')"
                    >
                      Baja prioridad
                      <i v-if="activeFilters.includes('baja')" class="fas fa-times-circle ms-1"></i>
                    </span>
                    <button 
                      v-if="activeFilters.length > 0" 
                      class="btn btn-sm btn-outline-secondary mb-2"
                      @click="clearFilters"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pestañas de navegación -->
          <div class="row mb-4">
            <div class="col-12">
              <ul class="nav nav-pills nav-fill p-1 bg-white rounded-pill shadow mb-3" role="tablist">
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link mb-0 px-0 py-1" 
                    :class="{ 'active': activeTab === 'ordenes' }"
                    @click="activeTab = 'ordenes'"
                    type="button"
                  >
                    <i class="fas fa-clipboard-list me-2"></i>Órdenes
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link mb-0 px-0 py-1" 
                    :class="{ 'active': activeTab === 'mantenimientos' }"
                    @click="activeTab = 'mantenimientos'"
                    type="button"
                  >
                    <i class="fas fa-tools me-2"></i>Mantenimientos
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button 
                    class="nav-link mb-0 px-0 py-1" 
                    :class="{ 'active': activeTab === 'informes' }"
                    @click="activeTab = 'informes'"
                    type="button"
                  >
                    <i class="fas fa-file-alt me-2"></i>Informes
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <!-- Contenido de las pestañas -->
          <!-- Órdenes de Trabajo -->
          <div v-if="activeTab === 'ordenes'" class="row">
            <div class="col-12">
              <div class="card">
                <div class="card-header pb-0 px-3">
                  <h6 class="mb-0">Órdenes de Trabajo</h6>
                </div>
                <div class="card-body pt-4 p-3">
                  <div v-if="filteredOrdenes.length === 0" class="text-center py-5">
                    <p class="text-muted">No hay órdenes de trabajo que coincidan con los filtros.</p>
                  </div>
                  <ul v-else class="list-group">
                    <li
                      v-for="orden in filteredOrdenes"
                      :key="orden.id"
                      class="list-group-item border-0 d-flex p-4 mb-2 mt-3 border-radius-lg"
                      :class="{ 'bg-gray-100': selectedOrder === orden.id }"
                      @click="selectOrder(orden.id)"
                      style="cursor: pointer;"
                    >
                      <div class="d-flex flex-column">
                        <div class="d-flex align-items-center mb-2">
                          <h6 class="mb-0 text-sm me-2">{{ orden.radicado }}</h6>
                          <span 
                            class="badge me-2" 
                            :class="`bg-gradient-${getPrioridadClass(orden.prioridad)}`"
                          >
                            {{ getPrioridadText(orden.prioridad) }}
                          </span>
                          <span 
                            class="badge" 
                            :class="orden.estado ? 'bg-gradient-success' : 'bg-gradient-secondary'"
                          >
                            {{ orden.estado ? 'Activa' : 'Inactiva' }}
                          </span>
                        </div>
                        <span class="mb-2 text-xs">
                          Fecha Inicio:
                          <span class="text-dark font-weight-bold ms-sm-2">{{ formatDate(orden.fechaInicio) }}</span>
                        </span>
                        <span class="mb-2 text-xs">
                          Fecha Fin:
                          <span class="text-dark ms-sm-2 font-weight-bold">{{ formatDate(orden.fechaFin) }}</span>
                        </span>
                        <span class="text-xs">
                          Fecha Creación:
                          <span class="text-dark ms-sm-2 font-weight-bold">{{ formatDate(orden.fechaCreacion) }}</span>
                        </span>
                      </div>
                      <div class="ms-auto text-end">
                        <div class="d-flex flex-column align-items-end">
                          <div class="d-flex align-items-center mb-2">
                            <span class="me-2 text-xs text-muted">Mantenimientos:</span>
                            <span class="badge bg-primary">{{ orden.mantenimientos.length }}</span>
                          </div>
                          <div class="d-flex align-items-center">
                            <span class="me-2 text-xs text-muted">Informes:</span>
                            <span class="badge bg-info">{{ orden.informes.length }}</span>
                          </div>
                        </div>
                        <div class="mt-3">
                          <ArgonButton color="primary" size="sm" variant="outline" class="me-2">
                            <i class="fas fa-eye me-2"></i>Ver
                          </ArgonButton>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Mantenimientos -->
          <div v-if="activeTab === 'mantenimientos'" class="row">
            <div class="col-12">
              <div class="card mb-4">
                <div class="card-header pb-0 px-3">
                  <div class="row">
                    <div class="col-6 d-flex align-items-center">
                      <h6 class="mb-0">Mantenimientos Realizados</h6>
                    </div>
                    <div class="col-6 text-end">
                      <ArgonButton color="primary" size="sm" variant="outline">Exportar</ArgonButton>
                    </div>
                  </div>
                </div>
                <div class="card-body px-0 pt-0 pb-2">
                  <div v-if="allMantenimientos.length === 0" class="text-center py-5">
                    <p class="text-muted">No hay mantenimientos registrados.</p>
                  </div>
                  <div v-else class="table-responsive p-0">
                    <table class="table align-items-center mb-0">
                      <thead>
                        <tr>
                          <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Orden</th>
                          <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Tipo</th>
                          <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Descripción</th>
                          <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Observación</th>
                          <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Repuestos</th>
                          <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Fecha</th>
                          <th class="text-secondary opacity-7"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(mant, index) in allMantenimientos" :key="index">
                          <td>
                            <div class="d-flex px-2 py-1">
                              <div class="d-flex flex-column justify-content-center">
                                <h6 class="mb-0 text-sm">{{ mant.radicado }}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span class="badge bg-gradient-info">{{ mant.tipo }}</span>
                          </td>
                          <td>
                            <p class="text-xs font-weight-bold mb-0">{{ mant.descripcion }}</p>
                          </td>
                          <td>
                            <p class="text-xs font-weight-bold mb-0">{{ mant.observacion }}</p>
                          </td>
                          <td>
                            <p class="text-xs font-weight-bold mb-0">{{ mant.estadoRepuestos }}</p>
                          </td>
                          <td>
                            <p class="text-xs font-weight-bold mb-0">{{ formatDate(mant.fechaCreacion) }}</p>
                          </td>
                          <td class="align-middle">
                            <button class="btn btn-link text-secondary mb-0">
                              <i class="fa fa-ellipsis-v text-xs"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Informes -->
          <div v-if="activeTab === 'informes'" class="row">
            <div class="col-12">
              <div class="card h-100 mb-4">
                <div class="card-header pb-0 px-3">
                  <div class="row">
                    <div class="col-6 d-flex align-items-center">
                      <h6 class="mb-0">Informes Realizados</h6>
                    </div>
                    <div class="col-6 text-end">
                      <ArgonButton color="success" size="sm" variant="outline">Exportar</ArgonButton>
                    </div>
                  </div>
                </div>
                <div class="card-body p-3 pb-0 mb-0">
                  <div v-if="allInformes.length === 0" class="text-center py-5">
                    <p class="text-muted">No hay informes registrados.</p>
                  </div>
                  <ul v-else class="list-group">
                    <li
                      v-for="(informe, index) in allInformes"
                      :key="index"
                      class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg"
                    >
                      <div class="d-flex flex-column">
                        <h6 class="mb-1 text-dark font-weight-bold text-sm">
                          {{ formatDate(informe.fechaCreacion) }}
                        </h6>
                        <span class="text-xs">{{ informe.radicado }}</span>
                        <div class="mt-2">
                          <span class="badge bg-gradient-primary me-2">Costos: ${{ formatNumber(informe.costos) }}</span>
                          <span class="badge bg-gradient-info">Horas: {{ informe.horas }}</span>
                        </div>
                        <p class="text-xs mt-2">
                          <strong>Trabajo realizado:</strong> {{ informe.trabajoRealizado }}
                        </p>
                      </div>
                      <div class="d-flex align-items-center text-sm">
                        <button class="btn btn-link text-dark text-sm mb-0 px-0 ms-4">
                          <i class="far fa-file-excel fa-lg" style="color: #047c22;"></i>            
                        </button>
                        <button class="btn btn-link text-dark text-sm mb-0 px-0 ms-4">
                          <i class="fa-solid fa-file-pdf fa-lg" style="color: #bd0000;"></i>            
                        </button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
/* Estilos adicionales para complementar los de Argon */
.min-height-300 {
  min-height: 300px;
}

.border-radius-lg {
  border-radius: 0.75rem;
}

.nav-pills .nav-link.active {
  background-color: #5e72e4;
  color: white;
}

.nav-pills .nav-link {
  color: #344767;
  font-weight: 500;
}

.nav-pills .nav-link:hover {
  background-color: rgba(94, 114, 228, 0.1);
}

.list-group-item {
  transition: all 0.2s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.35em 0.65em;
}

.bg-gradient-primary {
  background-image: linear-gradient(310deg, #5e72e4 0%, #825ee4 100%);
}

.bg-gradient-success {
  background-image: linear-gradient(310deg, #2dce89 0%, #2dcecc 100%);
}

.bg-gradient-warning {
  background-image: linear-gradient(310deg, #fb6340 0%, #fbb140 100%);
}

.bg-gradient-danger {
  background-image: linear-gradient(310deg, #f5365c 0%, #f56036 100%);
}

.bg-gradient-info {
  background-image: linear-gradient(310deg, #1171ef 0%, #11cdef 100%);
}

.bg-gradient-secondary {
  background-image: linear-gradient(310deg, #627594 0%, #a8b8d8 100%);
}

.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 0.875rem;
}

.font-weight-bold {
  font-weight: 600;
}

.icon-shape {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.border-radius-md {
  border-radius: 0.5rem;
}

.shadow {
  box-shadow: 0 0.25rem 0.375rem -0.0625rem rgba(20, 20, 20, 0.12), 0 0.125rem 0.25rem -0.0625rem rgba(20, 20, 20, 0.07) !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Estilos para el spinner de carga */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Estilos para las tarjetas */
.card {
  box-shadow: 0 20px 27px 0 rgba(0, 0, 0, 0.05);
  border: 0;
}

/* Estilos para las tablas */
.table thead th {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Estilos para los botones de acción */
.btn-link {
  text-decoration: none;
}

.btn-link:hover {
  opacity: 0.8;
}
</style>