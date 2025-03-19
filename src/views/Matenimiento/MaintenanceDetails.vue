<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <div>
          <!-- Header simple -->
          
          <div class="card-body">
            <!-- Estado de carga -->
            <div v-if="isLoading" class="text-center py-4">
              <div class="spinner-border text-sena" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-2">Cargando información...</p>
            </div>
            
            <!-- Error - No se encontró información -->
            <div v-else-if="!maintenance" class="text-center py-4">
              <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
              <h5>No se encontró información</h5>
              <p class="text-muted">No se pudo encontrar el registro de mantenimiento solicitado.</p>
              <button class="btn bg-sena text-white mt-2" @click="goBack">
                Volver a la lista
              </button>
            </div>
            
            <!-- Contenido principal -->
            <div v-else>
              <!-- Información del Activo y Orden -->
              <div class="mb-4">
                <div class="row">
                  <div class="col-md-6 mb-4">
                    <div class="card h-100">
                      <div class="card-header bg-light">
                        <h6 class="mb-0">Información del Activo</h6>
                      </div>
                      <div class="card-body">
                        <div v-if="workOrder && workOrder.asset" class="row">
                          <div class="col-sm-6 mb-3">
                            <p class="text-muted mb-1 small">Nombre del Activo</p>
                            <p class="mb-0 fw-bold">{{ workOrder.asset.name || 'No disponible' }}</p>
                          </div>
                          <div class="col-sm-6 mb-3">
                            <p class="text-muted mb-1 small">Código de Inventario</p>
                            <p class="mb-0 fw-bold">{{ workOrder.asset.inventoryCode || 'No disponible' }}</p>
                          </div>
                          <div class="col-sm-6 mb-3">
                            <p class="text-muted mb-1 small">Número de Serie</p>
                            <p class="mb-0 fw-bold">{{ workOrder.asset.serialNumber || 'No disponible' }}</p>
                          </div>
                          <div class="col-sm-6 mb-3">
                            <p class="text-muted mb-1 small">Ubicación</p>
                            <p class="mb-0 fw-bold">{{ workOrder.asset.location || 'No disponible' }}</p>
                          </div>
                        </div>
                        <div v-else class="text-center py-3">
                          <p class="mb-0 text-muted">No hay información del activo disponible</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-4">
                    <div class="card h-100">
                      <div class="card-header bg-light">
                        <h6 class="mb-0">Detalles de la Orden</h6>
                      </div>
                      <div class="card-body">
                        <div v-if="workOrder" class="row">
                          <div class="col-sm-6 mb-3">
                            <p class="text-muted mb-1 small">Número de Orden</p>
                            <p class="mb-0 fw-bold">{{ workOrder.radicado || 'No disponible' }}</p>
                          </div>
                          <div class="col-sm-6 mb-3">
                            <p class="text-muted mb-1 small">Prioridad</p>
                            <p class="mb-0 fw-bold">{{ capitalizeFirst(workOrder.prioridad) || 'No disponible' }}</p>
                          </div>
                          <div class="col-sm-6 mb-3">
                            <p class="text-muted mb-1 small">Fecha Inicio</p>
                            <p class="mb-0 fw-bold">{{ formatDateShort(workOrder.fechaInicio) }}</p>
                          </div>
                          <div class="col-sm-6 mb-3">
                            <p class="text-muted mb-1 small">Fecha Fin</p>
                            <p class="mb-0 fw-bold">{{ formatDateShort(workOrder.fechaFin) }}</p>
                          </div>
                          <div class="col-sm-6 mb-3">
                            <p class="text-muted mb-1 small">Estado</p>
                            <p class="mb-0">
                              <!-- CORREGIDO: Invertir la lógica del estado -->
                              <span class="badge" :class="workOrder.state ? 'bg-success' : 'bg-secondary'">
                                {{ workOrder.state ? 'Finalizada' : 'Activa' }}
                              </span>
                            </p>
                          </div>
                          <div class="col-sm-6 mb-3">
                            <p class="text-muted mb-1 small">Estado Tiempo</p>
                            <p class="mb-0">
                              <span class="badge" :class="getTimeStateBadgeClass(workOrder)">
                                {{ getTimeStateText(workOrder) }}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div v-else class="text-center py-3">
                          <p class="mb-0 text-muted">No hay información de orden disponible</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Personal Asignado -->
              <div class="mb-4">
                <h6 class="border-bottom pb-2 mb-3">Personal Asignado</h6>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <div class="card">
                      <div class="card-body">
                        <h6 class="card-title">Técnico</h6>
                        <p class="card-text">{{ workOrder?.tecnicoId?.name || 'No asignado' }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <div class="card">
                      <div class="card-body">
                        <h6 class="card-title">Instructor</h6>
                        <p class="card-text">{{ workOrder?.instructorId?.name || 'No asignado' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Detalles del Mantenimiento -->
              <div class="mb-4">
                <h6 class="border-bottom pb-2 mb-3">Detalles del Mantenimiento</h6>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <div class="card">
                      <div class="card-header bg-light">
                        <div class="d-flex justify-content-between align-items-center">
                          <h6 class="mb-0">Información del Mantenimiento</h6>
                          <span class="badge" :class="getTypeBadgeClass(maintenance.typeMaintenance)">
                            {{ maintenance.typeMaintenance }}
                          </span>
                        </div>
                      </div>
                      <div class="card-body">
                        <div class="row">
                          <div class="col-sm-6 mb-3">
                            <p class="text-muted mb-1 small">Estado</p>
                            <p class="mb-0">
                              <span class="badge" :class="getStateBadgeClass(maintenance.state)">
                                {{ maintenance.state ? 'Completado' : 'Pendiente' }}
                              </span>
                            </p>
                          </div>
                          <div class="col-sm-6 mb-3">
                            <p class="text-muted mb-1 small">Fecha de Creación</p>
                            <p class="mb-0 fw-bold">{{ formatDateShort(maintenance.createdAt) }}</p>
                          </div>
                          <div class="col-sm-6 mb-3">
                            <p class="text-muted mb-1 small">Repuestos Utilizados</p>
                            <p class="mb-0 fw-bold">{{ maintenance.sparePartsStatus || 'No especificado' }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <div class="card h-100">
                      <div class="card-header bg-light d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">Informes Relacionados</h6>
                        <div v-if="workOrder && workOrder.informes && workOrder.informes.length > 0">
                          <button class="btn btn-sm bg-sena text-white" @click="viewReports">
                            Ver Informes
                          </button>
                        </div>
                      </div>
                      <div class="card-body">
                        <div v-if="workOrder && workOrder.informes && workOrder.informes.length > 0">
                          <ul class="list-group list-group-flush">
                            <li v-for="(informe, index) in workOrder.informes" :key="index" class="list-group-item px-0">
                              <div class="d-flex justify-content-between align-items-center">
                                <div>
                                  <p class="mb-0 small">{{ formatDateShort(informe.createdAt) }}</p>
                                  <p class="mb-0 fw-bold">{{ informe.hours }} hrs - ${{ informe.costs }}</p>
                                </div>
                                <button class="btn btn-sm bg-sena text-white" @click="viewReport(informe._id)">
                                  Ver
                                </button>
                              </div>
                            </li>
                          </ul>
                        </div>
                        <div v-else class="text-center py-3">
                          <p class="mb-0 text-muted">No hay informes asociados a este mantenimiento</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Descripción y Observaciones -->
              <div class="mb-4">
                <h6 class="border-bottom pb-2 mb-3">Descripción y Observaciones</h6>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <div class="card h-100">
                      <div class="card-header bg-light">
                        <h6 class="mb-0">Descripción del Trabajo</h6>
                      </div>
                      <div class="card-body">
                        <p class="mb-0">{{ maintenance.description || 'Sin descripción' }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <div class="card h-100">
                      <div class="card-header bg-light">
                        <h6 class="mb-0">Observaciones</h6>
                      </div>
                      <div class="card-body">
                        <p class="mb-0">{{ maintenance.observation || 'Sin observaciones' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Repuestos -->
              <div class="mb-4" v-if="maintenance.sparePartsStatus === 'Si'">
                <h6 class="border-bottom pb-2 mb-3">Detalles de Repuestos</h6>
                <div class="card">
                  <div class="card-body">
                    <p class="mb-0">{{ maintenance.sparePartsDetails || 'Sin detalles de repuestos' }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Firma del técnico -->
              <div>
                <h6 class="border-bottom pb-2 mb-3">Firma del Técnico</h6>
                <div class="card">
                  <div class="card-body text-center">
                    <div v-if="maintenance.technicalSignature" class="signature-container">
                      <img 
                        :src="maintenance.technicalSignature" 
                        alt="Firma del técnico" 
                        class="img-fluid signature-image"
                      />
                    </div>
                    <div v-else>
                      <p class="mb-0 text-muted">No hay firma disponible</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import apiService from "../../service/apiservice";

export default {
  setup() {
    const isLoading = ref(true);
    const maintenance = ref(null);
    const workOrder = ref(null);
    const router = useRouter();

    const fetchMaintenanceDetails = async () => {
      try {
        isLoading.value = true;
        const maintenanceId = Cookies.get('maintenanceId');
        
        if (!maintenanceId) {
          showErrorNotification('No se encontró el ID del mantenimiento');
          return;
        }
        
        const response = await apiService.get(`/maintenance/${maintenanceId}`);
        maintenance.value = response;
        
        // Si el mantenimiento tiene un ID de orden de trabajo, obtener los detalles
        if (maintenance.value && maintenance.value.wordOrdenId) {
          await fetchWorkOrderDetails(maintenance.value.wordOrdenId);
        }
      } catch (error) {
        console.error('Error al obtener detalles del mantenimiento:', error);
        showErrorNotification('Error al cargar los detalles del mantenimiento');
      } finally {
        isLoading.value = false;
      }
    };

    const fetchWorkOrderDetails = async (orderId) => {
      try {
        if (!orderId) return;
        
        // Si orderId es un objeto y tiene _id, usar ese valor
        const id = typeof orderId === 'object' && orderId._id ? orderId._id : orderId;
        
        const response = await apiService.get(`/word-orden/${id}`);
        workOrder.value = response;
        console.log('Detalles de la orden de trabajo:', workOrder.value);
      } catch (error) {
        console.error('Error al obtener detalles de la orden de trabajo:', error);
      }
    };

    const formatDateShort = (dateString) => {
      if (!dateString) return 'No disponible';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        return 'Fecha inválida';
      }
    };

    const capitalizeFirst = (str) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const getTypeBadgeClass = (type) => {
      if (!type) return 'bg-secondary';
      
      const typeLower = type.toLowerCase();
      if (typeLower.includes('preventivo')) {
        return 'bg-info';
      } else if (typeLower.includes('correctivo')) {
        return 'bg-warning';
      } else {
        return 'bg-primary';
      }
    };

    const getStateBadgeClass = (state) => {
      return state ? 'bg-success' : 'bg-warning';
    };

    // CORREGIDO: Actualizar la función para usar workOrder completo y verificar state
    const getTimeStateBadgeClass = (workOrder) => {
      if (!workOrder || !workOrder.estadoTiempo) return 'bg-secondary';
      
      // Si la orden está finalizada (state = true), mostrar verde
      if (workOrder.state === true) {
        return 'bg-success';
      }
      
      // Si no está finalizada, usar la lógica original
      if (workOrder.estadoTiempo.estaVencida) {
        return 'bg-danger';
      } else if (workOrder.estadoTiempo.estaProximaAVencer) {
        return 'bg-warning';
      } else {
        return 'bg-info';
      }
    };

    // CORREGIDO: Actualizar la función para usar workOrder completo y verificar state
    const getTimeStateText = (workOrder) => {
      if (!workOrder || !workOrder.estadoTiempo) return 'No disponible';
      
      // Si la orden está finalizada (state = true), mostrar "Ejecutada"
      if (workOrder.state === true) {
        return 'Ejecutada';
      }
      
      // Si no está finalizada, usar la lógica original
      if (workOrder.estadoTiempo.estaVencida) {
        return `Vencida (${workOrder.estadoTiempo.diasRetraso} días)`;
      } else if (workOrder.estadoTiempo.estaProximaAVencer) {
        return `Próxima a vencer (${workOrder.estadoTiempo.diasRestantes} días)`;
      } else {
        return `En tiempo (${workOrder.estadoTiempo.diasRestantes} días)`;
      }
    };

    const viewReports = () => {
      if (!workOrder.value || !workOrder.value._id) return;
      
      Cookies.set('OrdenId', workOrder.value._id, { expires: 1 });
      
      // Redirigir a la página de informes
      router.push('/informes');
    };

    const viewReport = (reportId) => {
      if (!reportId) return;
      
      Cookies.set('Id_INF', reportId, { expires: 1 });
      
      // Redirigir a la página de detalle de informe
      router.push('/detalle-informe');
    };

    const goBack = () => {
      router.go(-1);
    };

    const showErrorNotification = (message) => {
      Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonColor: '#39A900'
      });
    };

    onMounted(() => {
      fetchMaintenanceDetails();
    });

    return {
      isLoading,
      maintenance,
      workOrder,
      formatDateShort,
      capitalizeFirst,
      getTypeBadgeClass,
      getStateBadgeClass,
      getTimeStateBadgeClass,
      getTimeStateText,
      viewReports,
      viewReport,
      goBack
    };
  }
};
</script>

<style scoped>
/* Colores básicos */
.bg-sena {
  background-color: #39A900 !important;
}

.text-sena {
  color: #39A900 !important;
}

.badge {
  font-weight: normal;
  padding: 0.35em 0.65em;
}

.signature-image {
  max-height: 150px;
  object-fit: contain;
}

/* Botones */
.btn-sena, .bg-sena {
  background-color: #39A900;
  border-color: #39A900;
  color: white;
}

.btn-sena:hover, .bg-sena:hover {
  background-color: #2d8700;
  border-color: #2d8700;
}

/* Lista de informes */
.list-group-item {
  border-left: none;
  border-right: none;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}
</style>