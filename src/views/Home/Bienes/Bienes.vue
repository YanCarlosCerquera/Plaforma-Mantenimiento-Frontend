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

    <!-- Sección de consulta de activos -->
    <div class="p-4 md:p-6">
      <!-- Título principal -->
      <h1 class="text-2xl md:text-3xl font-bold text-green-600 mb-2">
        Consulta de Bienes
      </h1>
      <p class="text-sm mb-4">
        Selecciona el tipo de búsqueda que deseas realizar.
      </p>

      <div class="search-container">
      <div class="search-group mb-4">
        <div class="search-input-wrapper">
          <Search class="search-icon" size="18" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Número de serie, cédula o placa..."
            class="search-input"
          />
        </div>
        
        <select v-model="searchType" class="search-type">
          <option value="serialNumber">Número de serie</option>
          <option value="cedula">Cédula</option>
          <option value="placa">Placa</option>
        </select>
        
        <button 
          class="consultar-btn"
          @click="handleSearch"
        >
          Consultar
        </button>
      </div>
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
        <span class="ml-2">Cargando activos...</span>
      </div>
      <div v-if="error" class="text-center my-4 text-red-600">
        <AlertCircle class="inline-block mr-2" size="24" />
        {{ error }}
      </div>

      <!-- Tabla de activos -->
      <div v-if="!loading && !error" class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Fecha de adquisición</th>
              <th>Tipo de equipo</th>
              <th>Número de serie</th>
              <th>Código de inventario</th>
              <th>Cuentadante</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="asset in paginatedAssets"
              :key="asset.id"
            >
              <td>{{ asset.name }}</td>
              <td>{{ asset.location }}</td>
              <td>{{ asset.acquisitionDate }}</td>
              <td>{{ asset.equipmentType }}</td>
              <td>{{ asset.serialNumber }}</td>
              <td>{{ asset.inventoryCode }}</td>
              <td>{{ asset.accountHolder }}</td>
              <td>
                <span 
                  :class="[
                    'status-badge',
                    asset.status ? 'status-good' : 'status-damaged'
                  ]"
                >
                  {{ asset.status ? 'Bueno' : 'Dañado' }}
                </span>
              </td>
              <td>
                <div class="actions-cell">
                  <router-link :to="`/assets/detail`" class="action-btn" title="Ver detalle">
                    <Eye size="18" />
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="!loading && !error && paginatedAssets.length === 0" class="text-center my-4 text-gray-600">
        <FileSearch class="inline-block mb-2" size="32" />
        <p>No se encontraron activos que coincidan con tu búsqueda.</p>
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
import { useRouter } from "vue-router";
import ArgonButton from "@/components/ArgonButton.vue";
import fondoImage2 from "../../../assets/image208.png";
import { 
  Search, 
  FileText, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  AlertCircle,
  Eye,
  FileSearch
} from 'lucide-vue-next';
import apiService from "../../../service/apiService";
import AppFooter from "../../../examples/PageLayout/Footer.vue";

export default {
  name: "ConsultaActivos",
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
    Eye,
    FileSearch
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const body = document.getElementsByTagName("body")[0];
    
    // Estado reactivo
    const currentPage = ref(1);
    const itemsPerPage = 5;
    const searchQuery = ref('');
    const searchType = ref('serialNumber');
    const currentDateTime = ref('');
    const assets = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // Función para obtener los activos de la API
    const fetchAssets = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await apiService.get("/assets");
        assets.value = response || [];
      } catch (err) {
        console.error("Error fetching assets:", err);
        error.value = "Error al cargar los activos. Por favor, intente de nuevo.";
        assets.value = []; // Asegurarse de que assets sea un array vacío en caso de error
      } finally {
        loading.value = false;
      }
    };

    // Computed properties para el manejo de datos y paginación
    const filteredAssets = computed(() => {
      if (!assets.value || assets.value.length === 0) return [];
      
      if (!searchQuery.value) return assets.value;
      
      return assets.value.filter(asset => {
        const query = searchQuery.value.toLowerCase();
        
        if (searchType.value === 'serialNumber') {
          return asset.serialNumber && asset.serialNumber.toLowerCase().includes(query);
        } else if (searchType.value === 'cedula') {
          return asset.accountHolder && asset.accountHolder.toLowerCase().includes(query);
        } else if (searchType.value === 'placa') {
          return asset.inventoryCode && asset.inventoryCode.toLowerCase().includes(query);
        }
        
        return false;
      });
    });

    const totalPages = computed(() => Math.max(1, Math.ceil(filteredAssets.value.length / itemsPerPage)));

    const paginatedAssets = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredAssets.value.slice(start, end);
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

    // Función para ver detalle de un activo
    const viewAssetDetail = (assetId) => {
      router.push(`/activos/detalle/${assetId}`);
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
      fetchAssets(); // Cargar los activos al montar el componente
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
      assets,
      paginatedAssets,
      currentPage,
      totalPages,
      displayedPages,
      prevPage,
      nextPage,
      goToPage,
      searchQuery,
      searchType,
      handleSearch,
      currentDateTime,
      backgroundStyle,
      handleLoginClick,
      handleSignup,
      loading,
      error,
      viewAssetDetail
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

.search-container {
  display: flex;
  align-items: center;
  gap: 5px; /* Espacio entre elementos */
}

.search-input {
  padding: 8px 8px 8px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  height: 38px;
  font-size: 14px;
}

.search-type {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
  height: 38px;
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

/* Estilos para la celda de acciones */
.actions-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  color: #4CAF50;
  background-color: #e8f5e9;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #4CAF50;
  color: white;
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
  .search-type,
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