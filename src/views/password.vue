  <script setup>
  import { ref, onBeforeMount, onBeforeUnmount } from "vue";
  import { useStore } from "vuex";
  import ArgonSelect from "@/components/ArgonSelect.vue";
  import Alert from "../views/components/Alert.vue";
  import apiService from '../service/apiservice';
  import { useRouter } from 'vue-router';

  const store = useStore();
  const router = useRouter();
  const body = document.getElementsByTagName("body")[0];

  // Reactive references
  const typeDocument = ref("");
  const numberDocument = ref("");
  const isLoading = ref(false);
  const alertShow = ref(false);
  const alertMessage = ref("");
  const alertType = ref("info");

  // Document type options
  const documentTypes = [
    { value: "", label: "Selecciona tu tipo de documento" },
    { value: "Cédula de Ciudadanía", label: "Cédula de Ciudadanía" },
    { value: "Cédula de Extranjería", label: "Cédula de Extranjería" },
    { value: "Tarjeta de Identidad", label: "Tarjeta de Identidad" },
  ];

  // Lifecycle hooks
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

  // Navigation function


  // Alert function
  const showAlert = (message, type = 'info') => {
    alertMessage.value = message;
    alertType.value = type;
    alertShow.value = true;
    setTimeout(() => {
      alertShow.value = false;
    }, 5000);
  };

  // Form submission handler
  const handleSubmit = async () => {
    if (!typeDocument.value || !numberDocument.value) {
      showAlert('Por favor, complete todos los campos.', 'warning');
      return;
    }

    isLoading.value = true;
    try {
      const response = await apiService.post('/auth/iniciar-recuperacion', {
        typeDocument: typeDocument.value,
        numberDocument: numberDocument.value,
      });

      if (response && response.userId) {
        localStorage.setItem('resetUserId', response.userId);
        showAlert('Correo enviado, revisa tu bandeja de entrada', 'success');
        router.push('/ResetPassword');
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('Error al iniciar la recuperación:', error);
      showAlert(error instanceof Error ? error.message : 'Hubo un error al procesar la solicitud.', 'error');
    } finally {
      isLoading.value = false;
    }
  };
  </script>

  <template>
    <div class="forgot-password">
      <div class="background-overlay"></div>
      <div class="content-wrapper">
        <div class="form-container">
          <div class="form-card">
            <Alert 
              :show="alertShow" 
              :message="alertMessage" 
              :type="alertType" 
              @close="alertShow = false"
            />
            <div class="header">
              <div class="logo-section">
                <img src="../assets/logoSena.jpg" alt="SENA" class="sena-logo" />
                <div class="header-titles">
                  <div class="title-group">
                    <h1>Tecnoparque</h1>
                    <h2>Nodo Neiva</h2>
                  </div>
                  <div class="divider">|</div>
                  <div class="title-group">
                    <h1>Servicios</h1>
                    <h2>Tecnológicos</h2>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-content">
              <h2 class="form-title">Recuperar Cuenta</h2>
              <p class="form-description">
                Ingresa tu tipo y número de documento para recibir instrucciones de recuperación
              </p>

              <form @submit.prevent="handleSubmit">
                <div class="form-group">
                  <label for="documentType">Tipo de documento</label>
                  <div class="select-wrapper">
                    <argon-select
                      id="typeDocument"
                      v-model="typeDocument"
                      placeholder=""
                      name="typeDocument"
                      size="lg"
                      :options="documentTypes"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="documentNumber">Número de documento</label>
                  <input
                    id="documentNumber"
                    type="text"
                    v-model="numberDocument"
                    placeholder="Ingrese su número de documento"
                  />
                </div>

                <button 
                  type="submit" 
                  class="submit-button"
                  :disabled="isLoading || !typeDocument || !numberDocument"
                >
                  {{ isLoading ? 'Enviando...' : 'Enviar' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <style scoped>
  /* ... (previous styles remain unchanged) ... */

  .form-card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative; /* Added for alert positioning */
  }
  .forgot-password {
    min-height: 100vh;
    width: 100%;
    position: relative;
    background-image: url('../assets/fondo2.jpg');
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
  }

  .content-wrapper {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 20px;
    z-index: 1;
  }

  .form-card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .header {
    margin-bottom: 32px;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .sena-logo {
    width: 60px;
    height: auto;
  }

  .header-titles {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .title-group {
    text-align: left;
  }

  .title-group h1 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .title-group h2 {
    font-size: 16px;
    font-weight: 500;
    color: #666;
    margin: 0;
  }

  .divider {
    color: #ccc;
    font-size: 24px;
    margin: 0 8px;
  }

  .form-content {
    text-align: center;
  }

  .form-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }

  .form-description {
    color: #666;
    font-size: 14px;
    margin-bottom: 32px;
  }

  .form-group {
    margin-bottom: 24px;
    text-align: left;
  }

  .form-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
  }

  .select-wrapper {
    position: relative;
  }

  select,
  input {
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    color: #333;
    transition: border-color 0.2s;
  }

  select:focus,
  input:focus {
    outline: none;
    border-color: #39A900;
  }

  input::placeholder {
    color: #999;
  }

  .submit-button {
    width: 100%;
    padding: 14px;
    background: #39A900;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .submit-button:hover:not(:disabled) {
    background: #2d8000;
  }

  .submit-button:disabled {
    background: #a8d8a8;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    .content-wrapper {
      margin: 16px;
    }

    .form-card {
      padding: 24px;
    }

    .logo-section {
      flex-direction: column;
      gap: 16px;
    }

    .header-titles {
      flex-direction: column;
      gap: 8px;
    }

    .divider {
      display: none;
    }

    .title-group {
      text-align: center;
    }
  }
  /* ... (rest of the styles remain unchanged) ... */
  </style>

