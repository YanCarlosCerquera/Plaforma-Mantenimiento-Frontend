<template>
    <div class="min-h-screen bg-white">
      <!-- Hero Section with centered buttons -->
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
  
      <!-- Action Buttons with icons -->
      <div class="container action-buttons">
        <button class="btn btn-action">
          <svg class="action-icon" viewBox="0 0 16 16">
            <path d="M4.5 11.5A.5.5 0 0 1 5 11h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 1 3h12a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5z"/>
          </svg>
          Consulta de bienes registrados
        </button>
        <button class="btn btn-action">
          <svg class="action-icon" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
          </svg>
          Consulta el estado de tu solicitud
        </button>
      </div>
  
      <!-- Form with adjusted layout -->
      <div class="container form-container">
        <div class="form-card">
          <h2 class="form-title">
            <svg class="title-icon" viewBox="0 0 16 16">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
            </svg>
            Realiza tu solicitud de mantenimiento
          </h2>
          <form @submit.prevent="handleSubmit">
            <div class="form-grid">
              <div class="form-group">
                <label>Nombre del solicitante</label>
                <input 
                  v-model="form.requesterName" 
                  type="text" 
                  placeholder="Ingrese el nombre del solicitante"
                  required 
                />
              </div>
              <div class="form-group">
                <label>Número de teléfono</label>
                <input 
                  v-model="form.requesterPhone" 
                  type="tel" 
                  placeholder="Ingrese el numero de teléfono"
                  required 
                />
              </div>
              <div class="form-group">
                <label>Número de serie</label>
                <input 
                  v-model="form.serialNumber" 
                  type="text" 
                  placeholder="Ingrese el numero serial"
                  required 
                />
              </div>
              <div class="form-group full-width">
                <label>Descripción falla presentada</label>
                <textarea 
                  v-model="form.issueDescription" 
                  rows="4"
                  placeholder="Descripción..."
                  required
                ></textarea>
              </div>
              <div class="form-group">
                <label>Código inventario</label>
                <input 
                  v-model="form.inventoryCode" 
                  type="text" 
                  placeholder="Inserte codigo de inventario"
                  required 
                />
              </div>
              <div class="form-group">
                <label>Tipo de mantenimiento</label>
                <select v-model="form.maintenanceType" required>
                  <option value="" disabled selected>Selecciona el tipo de mantenimiento</option>
                  <option value="preventivo">Preventivo</option>
                  <option value="correctivo">Correctivo</option>
                  <option value="desconocido">Desconocido</option>
                </select>
              </div>
              <div class="form-group full-width center-button">
                <button type="submit" class="btn btn-submit">
                  <svg class="btn-icon" viewBox="0 0 16 16">
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.5.5 0 0 1-.9-.3l-2.5-7.5L.146 5.354a.5.5 0 0 1 .3-.9l14.547-5.82a.5.5 0 0 1 .54.11z"/>
                  </svg>
                  Enviar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive } from 'vue'
  
  import { onBeforeUnmount, onBeforeMount } from "vue";
import { useStore } from "vuex";
  
  const form = reactive({
    requesterName: '',
    requesterPhone: '',
    serialNumber: '',
    inventoryCode: '',
    maintenanceType: '',
    issueDescription: '',
  })
  
  const handleSubmit = () => {
    console.log('Form submitted:', form)
  }




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
  </script>
  
  <style scoped>
  :root {
    --primary-green: #39a900;
    --text-dark: #2D3748;
    --text-gray: #ffffff;
  }
  
  .hero-section {
    background-image: url('../../assets/img/heroo.png');
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
    margin-left: -2rem; /* Added negative margin to move left */
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
  
  .nav-buttons {
    display: flex;
    gap: 0.5rem;
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
  
  .action-icon {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
  
  .title-icon {
    width: 20px;
    height: 20px;
    fill: var(--primary-green);
    margin-right: 0.5rem;
  }
  
.btn-primary {
    background-color: #39a900;
    color: var(--primary-green);
    border-radius: 10px;

}

.btn-action {
    background-color: #39a900;
    color: rgb(255, 255, 255);
    height: 120px; /* Increased height */
    flex: 1;
    max-width: 800px; /* Increased max-width */
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    border-radius: 10px;
    margin-top: 2rem; /* Added margin to move buttons down */
}

.hero-title {
    font-size: 2.5rem;
    font-weight: bold;
    max-width: 800px;
    margin: 5rem 0 0 0; /* Changed from 4rem auto 0 to 4rem 0 0 0 */
    line-height: 1.2;
    text-align: left;
    padding-left: 1rem; /* Added padding to prevent text from sticking to the edge */
}

.action-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin: 2rem auto;
    max-width: 1200px;
    padding: 0 1rem;
}
  
  .form-container {
    padding: 2rem 0;
  }
  
  .form-card {
    background: rgb(252, 252, 252);
    border-style: solid;
    padding: 2rem;
    border-color: rgb(245, 245, 245);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .form-title {
    color: var(--primary-green);
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    font-weight: bold;
    display: flex;
    align-items: center;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Responsive grid */
    gap: 1rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-group.full-width {
    grid-column: 1 / -1;
  }
  
  /* Ajuste para alinear código de inventario y tipo de mantenimiento */
  .form-group:nth-last-child(3),
  .form-group:nth-last-child(2) {
    grid-column: span 1; /* Occupy one column on smaller screens */
  }
  
  @media (min-width: 768px) {
    .form-group:nth-last-child(3),
    .form-group:nth-last-child(2) {
      grid-column: span 1; /* Occupy one column on larger screens */
    }
  }
  
  .center-button {
    display: flex;
    justify-content: center;
  }
  
  label {
    color: var(--text-dark);
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  input, select, textarea {
    padding: 0.75rem;
    background-color: white;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    color: var(--text-dark);
    font-size: 0.9rem;
    width: 100%;
  }
  
  input::placeholder, textarea::placeholder {
    color: var(--text-gray);
  }
  
  select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1.5em;
    padding-right: 2.5rem;
  }
  
  .btn-submit {
    background-color: #39a900;
    border-radius: 10px;
    color: #ffffff;
    width: auto;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    margin-top: 1rem;
  }
  
  @media (max-width: 768px) {
    .hero-title {
      font-size: 1.8rem;
    }
  
    .action-buttons {
      flex-direction: column;
    }
  
    .btn-action {
      max-width: 100%;
    }
  
    .form-grid {
      grid-template-columns: 1fr;
    }
    
    .brand-text {
      display: none;
    }
  }
  </style>