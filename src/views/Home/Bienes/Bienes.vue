<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <div class="navbar">
          <div class="logo-section">
            <img src="/placeholder.svg?height=40&width=40" alt="SENA Logo" class="logo" />
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
          <div class="Position-relative">
            <button class="btn btn-primary">
              <svg class="btn-icon" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
              </svg>
              Iniciar Sesión
            </button>
            <button class="btn btn-primary">
              <svg class="btn-icon" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              Registrarse
            </button>
          </div>
        </div>
        <h1 class="hero-title">
          Bienvenidos al sistema de gestión<br />
          de inventarios de la regional Huila
        </h1>
      </div>
    </div>

    <!-- Inventory Section -->
    <div class="inventory-section">
      <div class="search-container">
        <h2 class="search-title">Consulta de Bienes</h2>
        <p class="search-subtitle">Selecciona el tipo de búsqueda que deseas realizar.</p>
        
        
        <div class="search-controls">
          <div class="search-input-group">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Número de serie, cédula o placa..." 
              class="search-input"
            />
            <select v-model="searchType" class="search-type">
              <option value="serial">Número de serie</option>
              <option value="cedula">Cédula</option>
              <option value="placa">Placa</option>
            </select>
          </div>
          <button @click="handleSearch" class="search-button">
            Consultar
          </button>
        </div>


        <div class="date-info">
          <span>Fecha y hora del reporte: {{ currentDateTime }}</span>
          <div class="export-buttons">
            <button class="export-btn">
              <i class="fas fa-file-pdf text-red-600"></i>
            </button>
            <button class="export-btn">
              <i class="fas fa-file-excel text-green-600"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="inventory-table">
          <thead>
            <tr>
              <th>Código inventario</th>
              <th>Serial</th>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Fecha adquisición</th>
              <th>Último mantenimiento</th>
              <th>Cuentadante</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.code">
              <td>{{ item.code }}</td>
              <td>{{ item.serial }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.location }}</td>
              <td>{{ formatDate(item.acquisitionDate) }}</td>
              <td>{{ formatDate(item.lastMaintenance) }}</td>
              <td>{{ item.user }}</td>
              <td>
                <span :class="['status-badge', item.status === 'Bueno' ? 'status-good' : 'status-bad']">
                  {{ item.status }}
                </span>
              </td>
              <td>
                <button class="action-btn" @click="viewDetails(item)">
                  <i class="fas fa-search"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <Footer/>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from "vuex";
import { onBeforeUnmount, onBeforeMount } from "vue";
import Footer from '../../../examples/PageLayout/Footer.vue';


// Search state
const searchQuery = ref('')
const searchType = ref('serial')

// Mock data - replace with your actual data source
const inventoryItems = ref([
  {
    code: '95271025953',
    serial: 'E25953X',
    name: 'Certificador DSX5000',
    location: 'Amb. Tec. de la Información',
    acquisitionDate: '2019-09-04',
    lastMaintenance: '2019-09-04',
    user: 'Yan Carlos Cerquera',
    status: 'Bueno'
  },
  {
    code: '95271025953',
    serial: 'E25953X',
    name: 'Comedware',
    location: 'Amb. Tec. de la Información',
    acquisitionDate: '2019-05-28',
    lastMaintenance: '2019-05-28',
    user: 'Nicolas Cerquera',
    status: 'Dañado'
  },
  {
    code: '95271025953',
    serial: 'E25953X',
    name: 'Soldadora',
    location: 'Ambiente 102',
    acquisitionDate: '2019-11-23',
    lastMaintenance: '2019-11-23',
    user: 'Juan Escobar',
    status: 'Dañado'
  },
  {
    code: '95271025953',
    serial: 'E25953X',
    name: 'Microscopio 01',
    location: 'Lab. Metrología',
    acquisitionDate: '2019-02-05',
    lastMaintenance: '2019-02-05',
    user: 'Yan Carlos Cerquera',
    status: 'Bueno'
  },
  {
    code: '95271025953',
    serial: 'E25953X',
    name: 'Compresor',
    location: 'Ambiente 102',
    acquisitionDate: '2019-07-29',
    lastMaintenance: '2019-07-29',
    user: 'Nicolas Cerquera',
    status: 'Bueno'
  }
])

// Computed property for filtered items
const filteredItems = computed(() => {
  if (!searchQuery.value) return inventoryItems.value
  
  return inventoryItems.value.filter(item => {
    const searchValue = searchQuery.value.toLowerCase()
    switch (searchType.value) {
      case 'serial':
        return item.serial.toLowerCase().includes(searchValue)
      case 'cedula':
        return item.user.toLowerCase().includes(searchValue)
      case 'placa':
        return item.code.toLowerCase().includes(searchValue)
      default:
        return true
    }
  })
})
const body = document.getElementsByTagName("body")[0];


const store = useStore();
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

// Current date time
const currentDateTime = computed(() => {
  return new Date().toLocaleString('es-CO', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
})

// Format date helper
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// View details handler
const viewDetails = (item) => {
  console.log('View details for:', item)
  // Implement your view details logic here
}

// Search handler
const handleSearch = () => {
  console.log('Searching for:', searchQuery.value, 'by:', searchType.value)
  // Implement additional search logic if needed
}
</script>

<style scoped>
.hero-section {
  background-image: url('../../../assets/img//heroo.png');
  background-size: cover;
  background-position: center;
  height: 400px;
  position: relative;
  color: white;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-text {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-group {
  display: flex;
  flex-direction: column;
  margin-left: -2rem;
}

.brand-group span {
  color: rgb(255, 255, 255);
  font-size: 15px;
  font-weight: bold;
  line-height: 1.2;
}

.separator {
  width: 2px;
  height: 40px;
  background-color: white;
}

.Position-relative {
  position: relative;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-left: 500px;
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

.inventory-section {
  padding: 2rem;
  background-color: white;
}

.search-container {
  margin-bottom: 2rem;
}

.search-title {
  color: #39a900;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.search-subtitle {
  color: #666;
  margin-bottom: 1rem;
}

.search-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  max-width: 800px;
  justify-content: space-between;
}

.search-input-group {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.search-input {
  width: 300px;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
}

.search-type {
  width: 150px;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
}

.search-button {
  padding: 0.5rem 2rem;
  background-color: #39a900;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}
.search-button:hover {
  background-color: #2f8c00;
}

.date-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 0.875rem;
  margin-top: 1rem;
}


.export-buttons {
  display: flex;
  gap: 0.5rem;
}

.export-btn {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

.inventory-table th,
.inventory-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.inventory-table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #1a202c;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-good {
  background-color: #def7ec;
  color: #039855;
}

.status-bad {
  background-color: #fde2e2;
  color: #e02424;
}

.action-btn {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #4a5568;
}

.action-btn:hover {
  color: #2d3748;
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

  .search-controls {
    flex-direction: column;
  }
  
  .search-input-group {
    flex-direction: column;
  }
  
  .search-type {
    width: 100%;
  }
}
</style>