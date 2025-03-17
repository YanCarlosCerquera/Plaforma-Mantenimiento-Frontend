<script setup>
import { ref, onMounted, computed } from 'vue';
import Cookies from 'js-cookie';
import MiniStatisticsCard from "@/examples/Cards/MiniStatisticsCard.vue";
import GradientLineChart from "@/examples/Charts/GradientLineChart.vue";
import CategoriesList from "./components/CategoriesList.vue";
import apiService from "../service/apiservice";
import Pagination from './components/Pagination.vue';

// Referencias reactivas
const userId = ref(null);
const tecnico = ref(null);
const ordenes = ref([]);
const activos = ref([]); // Nueva referencia para almacenar los activos
const userRole = ref(null); // Nueva referencia para almacenar el rol del usuario
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
  if (userRole.value === 'almacenista') {
    // Crear un objeto para contar activos por categoría
    const activosPorCategoria = {};
    
    // Contar activos por categoría
    activos.value.forEach(activo => {
      const categoria = activo.categoria || 'Sin categoría';
      if (!activosPorCategoria[categoria]) {
        activosPorCategoria[categoria] = 0;
      }
      activosPorCategoria[categoria]++;
    });
    
    // Limitar a 12 categorías para mejor visualización
    const categorias = Object.keys(activosPorCategoria).slice(0, 12);
    const cantidades = categorias.map(cat => activosPorCategoria[cat]);
    
    return {
      labels: categorias,
      datasets: [
        {
          label: 'Activos por categoría',
          data: cantidades,
        },
      ],
    };
  } else {
    // Para técnicos y otros roles, usar datos de órdenes por mes
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ordenesPorMes = Array(12).fill(0); // Inicializar array con ceros
    
    // Contar órdenes por mes
    ordenes.value.forEach(orden => {
      if (orden.fechaInicio) {
        const fecha = new Date(orden.fechaInicio);
        const mes = fecha.getMonth(); // 0-11
        ordenesPorMes[mes]++;
      }
    });
    
    return {
      labels: meses,
      datasets: [
        {
          label: 'Ordenes de trabajo',
          data: ordenesPorMes,
        },
      ],
    };
  }
});

// Estadísticas para almacenista
const almacenistaStats = computed(() => {
  if (!activos.value.length) return {
    total: 0,
    activosActivos: 0,
    activosInactivos: 0,
    categorias: 0,
    ubicacionPrincipal: 'Ninguna'
  };
  
  // Contar activos por estado
  const activosActivos = activos.value.filter(activo => activo.estado).length;
  const activosInactivos = activos.value.length - activosActivos;
  
  // Contar activos por ubicación
  const ubicaciones = {};
  activos.value.forEach(activo => {
    const ubicacion = activo.ubicacion || 'Sin ubicación';
    if (!ubicaciones[ubicacion]) {
      ubicaciones[ubicacion] = 0;
    }
    ubicaciones[ubicacion]++;
  });
  
  // Encontrar la ubicación con más activos
  let ubicacionPrincipal = 'Ninguna';
  let maxActivos = 0;
  for (const [ubicacion, cantidad] of Object.entries(ubicaciones)) {
    if (cantidad > maxActivos) {
      maxActivos = cantidad;
      ubicacionPrincipal = ubicacion;
    }
  }
  
  return {
    total: activos.value.length,
    activosActivos,
    activosInactivos,
    categorias: new Set(activos.value.map(a => a.categoria)).size,
    ubicacionPrincipal
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
      
      // Intentar obtener el rol del usuario desde el token
      userRole.value = payload.role || null;
      
      console.log('ID del usuario desde token:', userIdFromToken);
      console.log('Rol del usuario:', userRole.value);
      
      if (userIdFromToken) {
        userId.value = userIdFromToken;
        fetchUserData(userIdFromToken);
      }
    } catch (err) {
      console.error('Error al decodificar el token:', err);
      // Para pruebas, usar un ID fijo
      fetchUserData('67c243f92902fb9b19d729da');
    }
  }
};

const fetchUserData = async (userId) => {
  loading.value = true;
  error.value = null;
  
  try {
    console.log('Obteniendo datos para el usuario ID:', userId);
    
    // La misma API ahora devuelve datos diferentes según el rol
    const data = await apiService.get(`/word-orden/tecnico/${userId}`);
    console.log('Datos recibidos:', data);
    
    if (data) {
      // Determinar el rol basado en la respuesta
      if (data.activos) {
        userRole.value = 'almacenista';
        processAlmacenistaResponse(data);
      } else {
        processResponse(data);
      }
    } else {
      console.error('La respuesta no contiene datos');
      error.value = 'La respuesta no contiene datos';
    }
    
  } catch (err) {
    console.error('Error al obtener datos:', err);
    error.value = `Error: ${err.message || 'Error desconocido'}`;
  } finally {
    loading.value = false;
  }
};

// Procesar la respuesta para almacenista
const processAlmacenistaResponse = (data) => {
  console.log('Procesando datos de almacenista:', data);
  
  // Guardar datos del usuario
  tecnico.value = data.usuario;
  
  // Guardar los activos
  activos.value = data.activos || [];
  console.log('Activos:', activos.value);
  
  // Las estadísticas se calculan en el computed almacenistaStats
};

// Procesar la respuesta de la API para técnicos y otros roles
const processResponse = (data) => {
  console.log('Procesando datos de técnico:', data);
  
  // Guardar datos del técnico
  tecnico.value = data.usuario;
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

// Obtener estado de activo formateado
const getActivoStatusText = (estado) => {
  return estado ? 'Activo' : 'Inactivo';
};

// Recargar datos
const reloadData = () => {
  if (userId.value) {
    fetchUserData(userId.value);
  } else {
    getUserData();
  }
};

const page = ref(1);
const itemsPerPage = ref(5);

const paginatedActivos = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return activos.value.slice(start, end);
});

const paginatedOrdenes = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return ordenes.value.slice(start, end);
});

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
        
        <!-- Tarjetas de estadísticas para almacenista -->
        <div v-if="userRole === 'almacenista'" class="row">
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="Total Activos"
              :value="almacenistaStats.total.toString()"
              :icon="{
                component: 'ni ni-box-2',
                background: 'bg-gradient-primary',
                shape: 'rounded-circle',
              }"
            />
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="Activos en Uso"
              :value="almacenistaStats.activosActivos.toString()"
              :icon="{
                component: 'ni ni-check-bold',
                background: 'bg-gradient-success',
                shape: 'rounded-circle',
              }"
            />
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="Activos Inactivos"
              :value="almacenistaStats.activosInactivos.toString()"           
              :icon="{
                component: 'ni ni-fat-remove',
                background: 'bg-gradient-warning',
                shape: 'rounded-circle',
              }"
            />
          </div>
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="Categorías"
              :value="almacenistaStats.categorias.toString()"
              :icon="{
                component: 'ni ni-tag',
                background: 'bg-gradient-info',
                shape: 'rounded-circle',
              }"
            />
          </div>
        </div>
        
        <!-- Tarjetas de estadísticas para otros roles -->
        <div v-else class="row">
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
        <div class="row mt-4">
          <div class="col-lg-12 mb-lg">
            <gradient-line-chart
              id="chart-line"
              :title="userRole === 'almacenista' ? 'Activos por categoría' : 'Ordenes de trabajo por mes'"
              :chart="chartData"
            />
          </div>
        </div>
        
        <!-- Tabla de activos para almacenista -->
        <div v-if="userRole === 'almacenista'" class="row mt-4">
          <div class="col-lg-7 mb-lg-0 mb-4">
            <div class="card">
              <div class="p-3 pb-0 card-header">
                <div class="d-flex justify-content-between">
                  <h6 class="mb-2">Inventario de Activos ({{ activos.length }})</h6>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table align-items-center">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Ubicación</th>
                      <th>Fecha Adquisición</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="activo in paginatedActivos" :key="activo.id">
                      <td>{{ activo.codigoInventario }}</td>
                      <td>{{ activo.nombre }}</td>
                      <td>{{ activo.categoria }}</td>
                      <td>{{ activo.ubicacion }}</td>
                      <td>{{ formatDate(activo.fechaAdquisicion) }}</td>
                      <td>
                        <span class="badge" :class="activo.estado ? 'bg-success' : 'bg-warning'">
                          {{ getActivoStatusText(activo.estado) }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="activos.length === 0 && !loading">
                      <td colspan="6" class="text-center py-4">
                        No hay activos registrados
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Pagination class="pagination"
                  :totalPages="Math.ceil(activos.length / itemsPerPage)"
                  :currentPage="page"
                  @page-change="page = $event"
                />
              </div>
            </div>
          </div>
          
          <div class="col-lg-5">
            <categories-list title="Categorías de Equipos" />
          </div>
        </div>
        
        <!-- Tabla de órdenes de trabajo para otros roles -->
        <div v-else class="row mt-4">
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
                    <tr v-for="orden in paginatedOrdenes" :key="orden.id">
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
                      <td colspan="6" class="text-center py-4">
                        No hay órdenes de trabajo asignadas
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Pagination class="pagination"
                  :totalPages="Math.ceil(ordenes.length / itemsPerPage)"
                  :currentPage="page"
                  @page-change="page = $event"
                />
              </div>
            </div>
          </div>
          
          <div class="col-lg-5">
            <categories-list title="Categorías de Equipos" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.pagination{
  margin-bottom: 20px;
}

</style>