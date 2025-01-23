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
  
          <div class="date-export">
            <span class="date">Fecha y hora del reporte: {{ currentDateTime }}</span>
            <div class="export-icons">
              <button class="icon-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </button>
              <button class="icon-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
  
        <!-- Table section -->
        <div class="py-2">
          <div class="row">
            <div class="col-12">
              <AuthorsTable 
                :title="'Consultar Bienes'" 
                :headers="headers" 
                :rows="rows" 
                :fields="fields"
                :icons="icons" 
                @edit="handleEdit" 
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
  import AuthorsTable from '../../components/AuthorsTable.vue'
  import apiService from '../../../service/apiService'
  const searchQuery = ref('')
  const searchType = ref('serial')
  const rows = ref([])
  const currentDateTime = computed(() => {
    const now = new Date()
    return now.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  })
  
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
  
  const store = useStore()
  const body = document.getElementsByTagName("body")[0]
  
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
  
  const fetchData = async () => {
    try {
      const response = await apiService.get("/assets")
      if (response) {
        rows.value = (response.data || response)
          .map(asset => ({
            ...asset,
            name: asset?.name || 'N/A',
            location: asset?.location || 'N/A',
            acquisitionDate: asset?.acquisitionDate || 'N/A',
            equipmentType: asset?.equipmentType || 'N/A',
            serialNumber: asset?.serialNumber || 'N/A',
            inventoryCode: asset?.inventoryCode || 'N/A',
            accountHolder: asset?.accountHolder || 'N/A'
          }))
      }
    } catch (error) {
      console.error("Error al obtener los datos:", error)
      rows.value = []
    }
  }
  
  const handleSearch = () => {
    console.log('Searching with:', { query: searchQuery.value, type: searchType.value })
    fetchData()
  }
  
  const handleDelete = (assetId) => {
    console.log('Delete asset with ID:', assetId)
  }
  
  onMounted(async () => {
    await fetchData()
  })
  </script>
  
  <style scoped>
  /* Previous hero section styles remain unchanged */
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
    max-width: 100%;
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
    width: 100%;
    padding: 0.5rem 0.75rem 0.5rem 2.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  .search-type {
    min-width: 150px;
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