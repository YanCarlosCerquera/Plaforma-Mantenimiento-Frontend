<template>
  <main class="main-content mt-0">
    <!-- Hero / Encabezado -->
    <div class="page-header align-items-start min-vh-50 pb-11 md:h-60 position-relative" :style="backgroundStyle">
      <!-- Overlay mask -->
      <span class="mask bg-gradient-dark opacity-6 md:h-60"></span>
      
      <!-- Home button positioned in top-left corner -->
      <div class="position-absolute top-0 left-0 p-3 z-index-2">
        <ArgonButton color="success" size="sm" class="rounded-none shadow-lg p-2" title="Inicio" @click="handleIndex">
          Regresar <i class="fa-solid fa-house"></i>
        </ArgonButton>
      </div>
      
      <div class="container row">
        <div class="row justify-content-center mt-8 md:mt-16">
          <div class="col-lg-12 text-left mx-auto mt-8 md:mt-16">
            <h1 class="text-white mb-2 mt-1 md:mt-12 md:text-4xl lg:text-4xl sm:text-xs">
              Bienvenidos al sistema de gestión de inventarios de la regional Huila
            </h1>
          </div>
        </div>
      </div>
      
      <div class="container row d-flex justify-content-end flex-wrap">
        <div class="d-flex flex-column flex-md-row justify-content-end w-100">
          <ArgonButton color="success" class="my-2 md:my-4 mb-2 w-100 w-md-25 md:w-1/4 lg:w-1/5" @click="handleLoginClick">
            Ingresar
          </ArgonButton>
          <ArgonButton color="success" class="my-2 md:my-4 mb-2 w-100 w-md-25 md:w-1/4 lg:w-1/5 mx-md-3" @click="handleSignup">
            Registrarse
          </ArgonButton>
        </div>
      </div>
    </div>

    <!-- Sección de consulta de solicitudes -->
    <div class="p-4 md:p-6">
      <!-- Título principal -->
      <h1 class="text-2xl md:text-3xl font-bold text-green-600 mb-2">
        Consulta el estado de tu solicitud
      </h1>
      <p class="text-sm mb-4">
        Ingresa el número de solicitud.
      </p>

      <!-- Campo de búsqueda + botón -->
      <div class="search-group mb-4">
        <div class="search-input-wrapper">
          <Search class="search-icon" size="18" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Radicado de solicitud"
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>
        <button 
          class="consultar-btn"
          @click="handleSearch"
        >
          Consultar
        </button>
      </div>

      <!-- Fecha y hora del reporte a la derecha -->
      <div class="report-date">
        <span>
          Fecha y hora del reporte: {{ currentDateTime }}
        </span>
        <FileText class="icon" size="20" />
        <FileSpreadsheet class="icon" size="20" />
      </div>

      <!-- Indicadores de carga y error -->
      <div v-if="loading" class="text-center my-4">
        <Loader2 class="animate-spin inline-block" size="24" />
        <span class="ml-2">Cargando solicitudes...</span>
      </div>
      <div v-if="error" class="text-center my-4 text-red-600">
        <AlertCircle class="inline-block mr-2" size="24" />
        {{ error }}
      </div>

      <!-- Tabla de solicitudes -->
      <div v-if="!loading && !error" class="table-container">
        <table>
          <thead>
            <tr>
              <th>Radicado de solicitud</th>
              <th>Solicitante</th>
              <th>Teléfono</th>
              <th>Tipo de mantenimiento</th>
              <th>Serial</th>
              <th>Estado OT</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="req in requests"
              :key="req.trackingNumber"
            >
              <td>{{ req.trackingNumber }}</td>
              <td>{{ req.requesterName }}</td>
              <td>{{ req.requesterPhone }}</td>
              <td>{{ req.maintenanceType }}</td>
              <td>{{ req.serialNumber }}</td>
              <td>
                <span 
                  :class="[
                    'status-badge',
                    req.workOrderStatus ? 'status-assigned' : 'status-unassigned'
                  ]"
                >
                  {{ req.workOrderStatus ? 'Asignada' : 'No asignada' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="!loading && !error && requests.length === 0" class="text-center my-4 text-gray-600">
        <FileSearch class="inline-block mb-2" size="32" />
        <p>No se encontraron solicitudes que coincidan con tu búsqueda.</p>
      </div>
      
      <!-- Paginación -->
      <div v-if="!loading && !error && totalPages > 1" class="pagination">
        <button class="pagination-btn" @click="prevPage" :disabled="currentPage === 1">
          <ChevronLeft size="16" />
        </button>
        <button 
          v-for="page in displayedPages" 
          :key="page" 
          class="pagination-btn" 
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button class="pagination-btn" @click="nextPage" :disabled="currentPage === totalPages">
          <ChevronRight size="16" />
        </button>
      </div>
    </div>
  </main>
  <AppFooter />
</template>

<script>
import { ref, computed, onMounted, onBeforeMount, onBeforeUnmount, } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import ArgonButton from "@/components/ArgonButton.vue";
import AppFooter from "../../../examples/PageLayout/Footer.vue";
import fondoImage2 from "../../../assets/image208.png";
import { 
  Search, 
  FileText, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  AlertCircle,
  FileSearch
} from 'lucide-vue-next';
import apiService from "../../../service/apiservice";

export default {
  name: "Solicitudes",
  components: {
    ArgonButton,
    AppFooter,
    Search,
    FileText,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    FileSearch
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const body = document.getElementsByTagName("body")[0];
    
    // Estado reactivo
    const currentPage = ref(1);
    const totalPages = ref(1);
    const itemsPerPage = 5; // Número de elementos por página
    const searchQuery = ref('');
    const currentDateTime = ref('');
    const requests = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const isSearchActive = ref(false);

    // Función para obtener las solicitudes de la API con paginación del servidor
    const fetchRequests = async (page = 1) => {
      loading.value = true;
      error.value = null;
      
      try {
        // Construir la URL base con parámetros de paginación
        let url = `/application-maintenance?limit=${itemsPerPage}&page=${page}`;
        
        // Si hay una búsqueda activa, añadir los parámetros de búsqueda
        if (isSearchActive.value && searchQuery.value) {
          url += `&trackingNumber=${encodeURIComponent(searchQuery.value)}`;
        }
        
        console.log("Fetching maintenance requests with URL:", url);
        const response = await apiService.get(url);
        
        // Verificar si la respuesta tiene la estructura esperada con data y meta
        if (response && response.data && response.meta) {
          requests.value = response.data;
          totalPages.value = response.meta.totalPages || 1;
          currentPage.value = response.meta.page || 1;
        } else {
          // Fallback para compatibilidad con versiones anteriores
          requests.value = response || [];
          
          // Si no hay metadatos, calcular la paginación manualmente
          if (Array.isArray(requests.value)) {
            totalPages.value = Math.ceil(requests.value.length / itemsPerPage);
            
            // Si estamos en modo de búsqueda y hay resultados, aplicar paginación manual
            if (isSearchActive.value && searchQuery.value) {
              const start = (page - 1) * itemsPerPage;
              const end = start + itemsPerPage;
              requests.value = requests.value.slice(start, end);
            }
          } else {
            totalPages.value = 1;
          }
          currentPage.value = page;
        }
      } catch (err) {
        console.error("Error fetching maintenance requests:", err);
        error.value = "Error al cargar las solicitudes. Por favor, intente de nuevo.";
        requests.value = []; // Asegurarse de que requests sea un array vacío en caso de error
        totalPages.value = 1;
      } finally {
        loading.value = false;
      }
    };

    // Computed property para las páginas a mostrar en la paginación
    const displayedPages = computed(() => {
      const range = 2;
      let start = Math.max(1, currentPage.value - range);
      let end = Math.min(totalPages.value, currentPage.value + range);

      if (start > 1) {
        start += 1;
      }
      if (end < totalPages.value) {
        end -= 1;
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (start > 2) {
        pages.unshift('...');
      }
      if (start > 1) {
        pages.unshift(1);
      }
      if (end < totalPages.value - 1) {
        pages.push('...');
      }
      if (end < totalPages.value) {
        pages.push(totalPages.value);
      }

      return pages;
    });

    // Funciones de navegación
    const prevPage = () => {
      if (currentPage.value > 1) {
        goToPage(currentPage.value - 1);
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        goToPage(currentPage.value + 1);
      }
    };

    const goToPage = (page) => {
      if (typeof page === 'number') {
        currentPage.value = page;
        fetchRequests(page);
      }
    };

    const handleSearch = () => {
      // Activar el modo de búsqueda si hay un término de búsqueda
      isSearchActive.value = !!searchQuery.value;
      
      // Reiniciar a la primera página al realizar una nueva búsqueda
      currentPage.value = 1;
      fetchRequests(1);
    };

    // Actualización de fecha y hora
    const updateDateTime = () => {
      const now = new Date();
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      currentDateTime.value = now.toLocaleDateString('es-ES', options);
    };

    // Hooks del ciclo de vida
    onMounted(() => {
      updateDateTime();
      setInterval(updateDateTime, 60000); // Actualizar cada minuto
      fetchRequests(1); // Cargar las solicitudes al montar el componente
    });

    onBeforeMount(() => {
      store.state.hideConfigButton = true;
      store.state.showNavbar = false;
      store.state.showSidenav = false;
      store.state.showFooter = false;
      body.classList.remove("bg-gray-100");
    });

    onBeforeUnmount(() => {
      store.state.hideConfigButton = false;
      store.state.showNavbar = true;
      store.state.showSidenav = true;
      store.state.showFooter = true;
      body.classList.add("bg-gray-100");
    });

    // Estilos computados
    const backgroundStyle = computed(() => ({
      backgroundImage: `url(${fondoImage2})`,
      backgroundSize: "stretch",
      backgroundPosition: "top"
    }));

    // Funciones de manejo de eventos
    const handleLoginClick = () => {
      router.push("/sign-in");
    };

    const handleSignup = () => {
      router.push("/sign-up");
    };
    
    const handleIndex = () => {
      router.push("/");
    };

    return {
      requests,
      currentPage,
      totalPages,
      displayedPages,
      prevPage,
      nextPage,
      goToPage,
      searchQuery,
      handleSearch,
      currentDateTime,
      backgroundStyle,
      handleLoginClick,
      handleSignup,
      handleIndex,
      loading,
      error
    };
  }
};
</script>

<style scoped>
.position-relative {
  position: relative;
}
h1 {
  color: #39A900;
  margin-bottom: 8px;
}

/* Estilos para el grupo de búsqueda */
.search-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input {
  padding: 8px 8px 8px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  height: 38px;
  font-size: 14px;
}

.consultar-btn {
  background-color: #39A900;
  border: none;
  color: white;
  padding: 8px 16px;
  height: 38px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
}

/* Estilos para la fecha del reporte */
.report-date {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.report-date .icon {
  margin-left: 8px;
  cursor: pointer;
}

/* Estilos de la tabla */
.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  padding: 10px 15px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f5f5f5;
  font-weight: 500;
}

tr:last-child td {
  border-bottom: none;
}

/* Estilos para los badges de estado */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-assigned {
  background-color: #e6f4ea;
  color: #137333;
}

.status-unassigned {
  background-color: #fce8e6;
  color: #c5221f;
}

/* Estilos de paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  margin: 0 3px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background-color: #39A900;
  color: white;
  border-color: #39A900;
}

/* Animación para el spinner de carga */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .search-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input-wrapper,
  .consultar-btn {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .report-date {
    flex-direction: column;
    align-items: flex-end;
  }
  
  .report-date .icon {
    margin-top: 5px;
  }
}
</style>