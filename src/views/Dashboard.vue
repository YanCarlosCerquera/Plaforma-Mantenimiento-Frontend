<script setup>
import { ref, onMounted, computed } from 'vue';
import Cookies from 'js-cookie';
import MiniStatisticsCard from "@/examples/Cards/MiniStatisticsCard.vue";
import GradientLineChart from "@/examples/Charts/GradientLineChart.vue";
import CategoriesList from "./components/CategoriesList.vue";
import apiService from "../service/apiService";

// Referencias reactivas
const userId = ref(null);
const tecnico = ref(null);
const ordenes = ref([]);
const stats = ref({
  total: 0,
  totalMantenimientos: 0,
  totalInformes: 0,
  ejecutadas: 0,
  pendientes: 0
});
const loading = ref(false);
const error = ref(null);

// Datos para el gráfico
const chartData = computed(() => {
  // Crear un objeto para contar órdenes por mes
  const ordenesPorMes = {
    'Ene': 0, 'Feb': 0, 'Mar': 0, 'Abr': 0, 'May': 0, 'Jun': 0,
    'Jul': 0, 'Ago': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dic': 0
  };
  
  // Contar órdenes por mes
  ordenes.value.forEach(orden => {
    if (orden.fechaCreacion) {
      const fecha = new Date(orden.fechaCreacion);
      const mes = fecha.getMonth(); // 0-11
      const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      ordenesPorMes[nombresMeses[mes]]++;
    }
  });
  
  return {
    labels: Object.keys(ordenesPorMes),
    datasets: [
      {
        label: 'Ordenes de trabajo',
        data: Object.values(ordenesPorMes),
      },
    ],
  };
});

// Obtener datos del usuario desde el token JWT
const getUserData = () => {
  const authToken = Cookies.get('authToken');
  
  if (authToken) {
    try {
      const tokenParts = authToken.split('.');
      const payload = JSON.parse(atob(tokenParts[1])); 
      const userIdFromToken = payload.sub; 
      
      console.log('ID del usuario desde token:', userIdFromToken);
      
      if (userIdFromToken) {
        userId.value = userIdFromToken;
        fetchWorkOrders(userIdFromToken);
      }
    } catch (err) {
      console.error('Error al decodificar el token:', err);
      // Para pruebas, usar un ID fijo
      fetchWorkOrders('67c243f92902fb9b19d729da');
    }
 
  }
};

const fetchWorkOrders = async (technicianId) => {
  loading.value = true;
  error.value = null;
  
  try {
    console.log('Obteniendo órdenes para el técnico ID:', technicianId);
    
    const data = await apiService.get(`/word-orden/tecnico/${technicianId}`);
    console.log('Datos recibidos:', data);
    
    if (data) {
      processResponse(data);
    } else {
      console.error('La respuesta no contiene datos');
      error.value = 'La respuesta no contiene datos';
    }
    
  } catch (err) {
    console.error('Error al obtener órdenes de trabajo:', err);
    error.value = `Error: ${err.message || 'Error desconocido'}`;
  } finally {
    loading.value = false;
  }
};

// Procesar la respuesta de la API
const processResponse = (data) => {
  console.log('Procesando datos:', data);
  
  // Guardar datos del técnico
  tecnico.value = data.tecnico;
  console.log('Técnico:', tecnico.value);
  
  // Guardar las órdenes de trabajo
  ordenes.value = data.ordenes || [];
  console.log('Órdenes:', ordenes.value);
  
  // Calcular órdenes ejecutadas y pendientes
  const ejecutadas = ordenes.value.filter(orden => orden.estado).length;
  const pendientes = ordenes.value.length - ejecutadas;
  
  // Actualizar estadísticas
  stats.value = {
    total: data.total || 0,
    totalMantenimientos: data.totalMantenimientos || 0,
    totalInformes: data.totalInformes || 0,
    ejecutadas,
    pendientes
  };
  
  console.log('Estadísticas:', stats.value);
};

// Formatear fecha para mostrar en la tabla
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Obtener estado formateado
const getStatusText = (estado) => {
  return estado ? 'Ejecutada' : 'Pendiente';
};



// Recargar datos
const reloadData = () => {
  if (userId.value) {
    fetchWorkOrders(userId.value);
  } else {
    fetchWorkOrders(userId.value);
  }
};

onMounted(() => {
  console.log('Componente montado');
  getUserData();
});
</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-lg-12">
        <!-- Estado de carga y errores -->
        <div v-if="loading" class="alert alert-info">
          <i class="fa fa-spinner fa-spin me-2"></i> Cargando datos...
        </div>
        
        <div v-if="error" class="alert alert-danger">
          {{ error }}
          <button class="btn btn-sm btn-outline-danger ms-2" @click="reloadData">
            Reintentar
          </button>
        </div>
        
        <!-- Información del técnico -->
       
        
        <!-- Tarjetas de estadísticas -->
        <div class="row">
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="Total Órdenes"
              :value="stats.total.toString()"
              :icon="{
                component: 'ni ni-world',
                background: 'bg-gradient-primary',
                shape: 'rounded-circle',
              }"
            />
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="Órdenes Ejecutadas"
              :value="stats.ejecutadas.toString()"
              :icon="{
                component: 'ni ni-paper-diploma',
                background: 'bg-gradient-success',
                shape: 'rounded-circle',
              }"
            />
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="Órdenes Pendientes"
              :value="stats.pendientes.toString()"           
              :icon="{
                component: 'ni ni-cart',
                background: 'bg-gradient-warning',
                shape: 'rounded-circle',
              }"
            />
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="Total Mantenimientos"
              :value="stats.totalMantenimientos.toString()"
              :icon="{
                component: 'ni ni-settings',
                background: 'bg-gradient-info',
                shape: 'rounded-circle',
              }"
            />
          </div>
        </div>
        
        <!-- Gráfico -->
        <div class="row">
          <div class="col-lg-12 mb-lg">
            <div class="card z-index-2">
              <gradient-line-chart
                id="chart-line"
                title="Ordenes de trabajo por mes"
                :chart="chartData"
              />
            </div>
          </div>
        </div>
        
        <!-- Tabla de órdenes de trabajo y categorías -->
        <div class="row mt-4">
          <div class="col-lg-7 mb-lg-0 mb-4">
            <div class="card">
              <div class="p-3 pb-0 card-header">
                <div class="d-flex justify-content-between">
                  <h6 class="mb-2">Órdenes de Trabajo ({{ ordenes.length }})</h6>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table align-items-center">
                  <thead>
                    <tr>
                      <th>Radicado</th>
                      <th>Equipo</th>
                      <th>Ubicación</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Fin</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="orden in ordenes" :key="orden.id">
                      <td>{{ orden.radicado }}</td>
                      <td>
                        <span v-if="orden.activo && orden.activo.length > 0">
                          {{ orden.activo[0].nombre }}
                        </span>
                        <span v-else>No disponible</span>
                      </td>
                      <td>
                        <span v-if="orden.activo && orden.activo.length > 0">
                          {{ orden.activo[0].ubicacion }}
                        </span>
                        <span v-else>No disponible</span>
                      </td>
                      <td>{{ formatDate(orden.fechaInicio) }}</td>
                      <td>{{ formatDate(orden.fechaFin) }}</td>
                      <td>
                        <span class="badge" :class="orden.estado ? 'bg-success' : 'bg-warning'">
                          {{ getStatusText(orden.estado) }}
                        </span>
                      </td>
                     
                    </tr>
                    <tr v-if="ordenes.length === 0 && !loading">
                      <td colspan="7" class="text-center py-4">
                        No hay órdenes de trabajo asignadas
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="col-lg-5">
            <categories-list title="Categorías de Equipos" />
          </div>
        </div>
        
        <!-- Para depuración -->
       
      </div>
    </div>
  </div>
</template>

