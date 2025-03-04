<template>
    <main class="main-content mt-0">
      <!-- Hero / Encabezado -->
      <div class="page-header align-items-start min-vh-50 pb-11 md:h-60" :style="backgroundStyle">
        <span class="mask bg-gradient-dark opacity-6 md:h-60"></span>
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
        <div class="flex items-center mb-4">
          <div class="search-container">
            <Search class="search-icon" size="18" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Radicado de solicitud"
              class="search-input"
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
          <i class="fa-solid fa-file-pdf"></i>
          
          <i class="fas fa-file-excel"></i>
                </div>
  
        <!-- Indicadores de carga y error -->
        <div v-if="loading" class="text-center my-4">
          <Loader2 class="animate-spin inline-block" size="24" />
          Cargando solicitudes...
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
                v-for="req in paginatedRequests"
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
  import { ref, computed, onMounted, onBeforeMount, onBeforeUnmount } from "vue";
  import { useStore } from "vuex";
  import ArgonButton from "@/components/ArgonButton.vue";
  import AppFooter from "../../../examples/PageLayout/Footer.vue";
  import fondoImage2 from "../../../assets/image208.png";
  import { 
    Search, 
    ChevronLeft, 
    ChevronRight,
    Loader2,
    AlertCircle,
  } from 'lucide-vue-next';
import apiService from "../../../service/apiService";
  
  export default {
    name: "Solicitudes",
    components: {
      ArgonButton,
      AppFooter,
      Search,
      ChevronLeft,
      ChevronRight,
      Loader2,
      AlertCircle
    },
    setup() {
      const store = useStore();
      const body = document.getElementsByTagName("body")[0];
      
      // Estado reactivo
      const currentPage = ref(1);
      const itemsPerPage = 5;
      const searchQuery = ref('');
      const currentDateTime = ref('');
      const requests = ref([]);
      const loading = ref(false);
      const error = ref(null);
  
      // Función para obtener las solicitudes de la API
      const fetchRequests = async () => {
        loading.value = true;
        error.value = null;
        try {
          const response = await apiService.get("/application-maintenance");
          requests.value = response;
        } catch (err) {
          console.error("Error fetching requests:", err);
          error.value = "Error al cargar las solicitudes. Por favor, intente de nuevo.";
          requests.value = []; // Asegurarse de que requests sea un array vacío en caso de error
        } finally {
          loading.value = false;
        }
      };
  
      // Computed properties para el manejo de datos y paginación
      const filteredRequests = computed(() => {
        if (!requests.value) return [];
        return requests.value.filter(req =>
          req.trackingNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          req.requesterName.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      });
  
      const totalPages = computed(() => Math.max(1, Math.ceil(filteredRequests.value.length / itemsPerPage)));
  
      const paginatedRequests = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredRequests.value.slice(start, end);
      });
  
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
          currentPage.value--;
        }
      };
  
      const nextPage = () => {
        if (currentPage.value < totalPages.value) {
          currentPage.value++;
        }
      };
  
      const goToPage = (page) => {
        if (typeof page === 'number') {
          currentPage.value = page;
        }
      };
  
      const handleSearch = () => {
        currentPage.value = 1;
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
        fetchRequests(); // Cargar las solicitudes al montar el componente
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
        console.log("Iniciar sesión");
      };
  
      const handleSignup = () => {
        console.log("Registrarse");
      };
  
      return {
        requests,
        paginatedRequests,
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
        loading,
        error
      };
    }
  };
  </script>
  
  <style scoped>
  /* Estilos para la sección de consulta */
  h1 {
    color: #4CAF50;
    margin-bottom: 8px;
  }
  
  /* Estilos para el campo de búsqueda */
  .search-container {
    position: relative;
    display: inline-block;
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
    width: 220px;
    height: 38px;
    font-size: 14px;
  }
  
  .consultar-btn {
    background-color: #4CAF50;
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
    margin-left: 10px;
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
  }
  
  /* Estilos de la tabla */
  .table-container {
    overflow-x: auto;
    margin-bottom: 20px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
  }
  
  th, td {
    padding: 10px 15px;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: 500;
    text-align: left;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  /* Estilos para los estados */
  .status-badge {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 4px;
    text-align: center;
    width: 100px;
    font-size: 13px;
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
    background-color: #4CAF50;
    color: white;
    border-color: #4CAF50;
  }
  
  .pagination-ellipsis {
    margin: 0 3px;
  }
  </style>