<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <nav class="navbar">
          <div class="logo-section">
            <div class="brand-text">
              <div class="brand-group">
                <span>Tecnoparque</span>
                <span>Nodo Neiva</span>
              </div>
              <div class="separator"></div>
              <div class="brand-group">
                <span>Servicios</span>
                <span>Tecnológicos</span>
              </div>
            </div>
          </div>
          <div class="auth-buttons">
            <button class="btn btn-primary">
              <i-lucide-user class="btn-icon" />
              Iniciar Sesión
            </button>
            <button class="btn btn-primary">
              <i-lucide-plus class="btn-icon" />
              Registrarse
            </button>
          </div>
        </nav>
        <div class="hero-content">
          <h1 class="hero-title">
            Bienvenidos al sistema de gestión<br />
            de inventarios de la regional Huila
          </h1>
          <p class="hero-subtitle">
            Gestione y controle sus activos de manera eficiente
          </p>
        </div>
      </div>
    </div>

    <!-- Updated Inventory Section -->
    <div class="search-section">
      <h1 class="title">Consulta de Bienes</h1>
      <p class="subtitle">Selecciona el tipo de búsqueda que deseas realizar.</p>
      
      <div class="search-container">
        <div class="search-group">
          <div class="search-input-wrapper">
            <span class="search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Número de serie, cédula o placa..." 
              class="search-input"
            />
          </div>
          
          <select v-model="searchType" class="search-type">
            <option value="serial">Número de serie</option>
            <option value="cedula">Cédula</option>
            <option value="placa">Placa</option>
          </select>
          
          <button @click="handleSearch" class="search-button">
            Consultar
          </button>
        </div>
      </div>

      <!-- Table section -->
      <div class="py-4 container-fluid">
        <div class="row">
          <div class="col-12">
            <div v-if="loading" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>
            <Table
  v-else
  :tableId="TABLE_ID"
  title="Bienes"
  :headers="headers"
  :rows="filteredRows"
  :fields="fields"
  @edit="handleSearch"
  @delete="handleDelete"
/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useStore } from "vuex"
  import { onBeforeUnmount, onBeforeMount } from "vue"
import Table from '../../components/Table.vue'

  const searchQuery = ref('')
  const searchType = ref('serial')
  const filteredRows = ref([]);
  
  const headers = ref([
    { text: "Nombre", value: "name" },
    { text: "Ubicación", value: "location" },
    { text: "Fecha de adquisición", value: "acquisitionDate" },
    { text: "Tipo de equipo", value: "equipmentType" },
    { text: "Número de serie", value: "serialNumber" },
    { text: "Código de inventario", value: "inventoryCode" },
    { text: "Cuentadante", value: "accountHolder" },
  ])
  
  const fields = ref({
    name: {
      value: "name",
      class: "align-middle",
      textClass: "text-xs font-weight-bold mb-0",
    },
    location: {
      value: "location",
      class: "align-middle",
      textClass: "text-xs font-weight-bold mb-0",
    },
    acquisitionDate: {
      value: "acquisitionDate",
      class: "align-middle",
      textClass: "text-xs font-weight-bold",
    },
    equipmentType: {
      value: "equipmentType",
      class: "align-middle",
      textClass: "text-xs font-weight-bold",
    },
    serialNumber: {
      value: "serialNumber",
      class: "align-middle",
      textClass: "text-xs font-weight-bold",
    },
    inventoryCode: {
      value: "inventoryCode",
      class: "align-middle",
      textClass: "text-xs font-weight-bold",
    },
    accountHolder: {
      value: "accountHolder",
      class: "align-middle",
      textClass: "text-xs font-weight-bold",
    },
  })
  

  const rows = computed(() => store.getters['tables/getTableData'](TABLE_ID));
  const loading = computed(() => store.getters['tables/isTableLoading'](TABLE_ID));

const formatDateTime = (date) => {
  if(date){
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(date)
      .toLocaleDateString("es-ES", options)
      .replace(".", "");
  };
};

// Configuración de filtros
const filterOptions = ref([
  {
    field: 'status',
    label: 'Estado',
    type: 'select',
    options: ['Activo', 'Inactivo']
  },
  {
    field: 'location',
    label: 'Ubicación',
    type: 'select',
    options: []
  },
  {
    field: 'categoryId',
    label: 'Categoría',
    type: 'select',
    options: []
  }
]);


const updateFilterOptions = (data) => {
  const locations = new Set();
  const categories = new Set();

  data.forEach(item => {
    if (item.location) locations.add(item.location);
    if (item.categoryId?.name) categories.add(item.categoryId.name);
  });

  filterOptions.value = filterOptions.value.map(filter => {
    if (filter.field === 'location') {
      filter.options = Array.from(locations).sort();
    } else if (filter.field === 'categoryId') {
      filter.options = Array.from(categories).sort();
    }
    return filter;
  });
};


const fetchData = async () => {
  await store.dispatch('tables/fetchTableData', {
    tableId: TABLE_ID,
    endpoint: "/assets",
    formatters: {
      acquisitionDate: formatDateTime
    }
  });

  updateFilterOptions(rows.value);
}


  const store = useStore()
  const body = document.getElementsByTagName("body")[0]
  const TABLE_ID = 'bienes-table';
  
  onBeforeMount(() => {
    store.state.hideConfigButton = true
    store.state.showNavbar = false
    store.state.showSidenav = false
    store.state.showFooter = false
    body.classList.remove("bg-gray-100")
  })
  
  onBeforeUnmount(() => {
    store.state.hideConfigButton = false
    store.state.showNavbar = true
    store.state.showSidenav = true
    store.state.showFooter = true
    body.classList.add("bg-gray-100")
  })
  

  
  const handleSearch = () => {
  if (!searchQuery.value) {
    // Si no hay valor de búsqueda, muestra todos los datos
    filteredRows.value = rows.value;
    return;
  }

  // Filtra los datos según el tipo de búsqueda
  filteredRows.value = rows.value.filter((row) => {
    if (searchType.value === 'serialNumber') {
      return row.serialNumber.toLowerCase().includes(searchQuery.value.toLowerCase());
    } else if (searchType.value === 'inventoryCode') {
      return row.inventoryCode.toLowerCase().includes(searchQuery.value.toLowerCase());
    }
    return true; // Si no coincide ninguno de los tipos, muestra todos los datos
  });
};
  
  const handleDelete = (assetId) => {
    console.log('Delete asset with ID:', assetId)
  }
  
  onMounted(async () => {
  await fetchData();
  filteredRows.value = rows.value; // Inicializa filteredRows con los datos originales
});
  </script>
  
  <style scoped>
 .hero-section {
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
      url('../../../assets/img//heroo.png');
    background-size: cover;
    background-position: center;
    min-height: 500px;
    position: relative;
  }
  
  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 0;
  }
  
  .logo-section {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
  
  .brand-text {
    display: flex;
    align-items: center;
    gap: 2rem;
    color: white;
  }
  
  .brand-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .brand-group span {
    font-size: 1rem;
    font-weight: 600;
  }
  
  .separator {
    width: 2px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.5);
  }
  
  .hero-content {
    padding: 4rem 0;
    max-width: 800px;
  }
  
  .hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    color: white;
    line-height: 1.2;
    margin-bottom: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .auth-buttons {
    display: flex;
    gap: 1rem;
  }
  
  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .btn-primary {
    background-color: #39a900;
    color: white;
    border: none;
  }
  
  .btn-primary:hover {
    background-color: #2d8600;
  }
  
  
  .btn {
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .btn-icon {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
  
  .btn-primary {
    background-color: #39a900;
    color: white;
    border-radius: 10px;
  }
  
  .hero-title {
    font-size: 2.5rem;
    font-weight: bold;
    max-width: 800px;
    margin: 5rem 0 0 0;
    line-height: 1.2;
    text-align: left;
    padding-left: 1rem;
  }
  
  /* New search section styles */
  .search-section {
    padding: 2rem;
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .title {
    color: #39a900;
    font-size: 1.875rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: #4b5563;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }
  
  .search-container {
    display: flex;
    align-items: center; /* Alinea verticalmente los elementos */
    gap: 10px; /* Espacio entre los elementos */
}
  
  .search-group {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .search-input-wrapper {
    position: relative;
    flex: 1;
  }
  
  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
  }
  
  .search-input {
    min-width: 300px;
    padding: 0.5rem 0.75rem 0.5rem 2.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  .search-type {
    min-width: 300px;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background-color: white;
    font-size: 0.875rem;
  }
  
  .search-button {
    padding: 0.5rem 1.5rem;
    background-color: #39a900;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .search-button:hover {
    background-color: #328f00;
  }
  
  .date-export {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }
  
  .date {
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .export-icons {
    display: flex;
    gap: 0.5rem;
  }
  
  .icon-button {
    padding: 0.25rem;
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    transition: color 0.2s;
  }
  
  .icon-button:hover {
    color: #374151;
  }
  
  @media (max-width: 768px) {
    .hero-title {
      font-size: 1.8rem;
    }
    
    .brand-text {
      display: none;
    }
  
    .Position-relative {
      margin-left: 0;
      gap: 0.5rem;
    }
  
    .btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  
    .search-group {
      flex-direction: column;
    }
    
    .search-input-wrapper {
      width: 100%;
    }
    
    .search-type {
      width: 100%;
    }
  
    .search-button {
      width: 100%;
    }
  
    .date-export {
      flex-direction: column;
      gap: 1rem;
    }
  }
  </style>