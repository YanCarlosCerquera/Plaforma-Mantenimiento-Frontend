<template>
    <div class="reset-password" :style="backgroundStyle">
      <div class="overlay"></div>
      <button class="back-button" @click="navigateToSignIn">
        <i class="fas fa-arrow-left"></i> Volver al inicio de sesión
      </button>
      <div class="content-wrapper">
        <div class="form-container">
          <div class="form-card">
            <div class="header">
              <div class="logo-section">
                <img :src="logoSena" alt="SENA" class="logo" />
                <div class="title-group">
                  <h1>Tecnoparque</h1>
                  <h2>Nodo Neiva</h2>
                </div>
              </div>
              <div class="separator">|</div>
              <div class="title-group">
                <h1>Servicios</h1>
                <h2>Tecnológicos</h2>
              </div>
            </div>
  
            <div class="form-content">
              <h2 class="form-title">Restablecer Contraseña</h2>
              <p class="form-description">
                {{ currentStepDescription }}
              </p>
  
              <form @submit.prevent="handleSubmit">
                <div v-if="currentStep === 'select-method'" class="recovery-options">
                  <button
                    v-for="method in recoveryMethods"
                    :key="method.value"
                    type="button"
                    class="recovery-option"
                    @click="selectRecoveryMethod(method.value)"
                  >
                    <i :class="method.icon"></i>
                    {{ method.label }}
                  </button>
                </div>
  
                <div v-if="currentStep === 'enter-code'" class="form-group">
                  <label for="code">Código de recuperación</label>
                  <input
                    id="code"
                    v-model="code"
                    type="text"
                    placeholder="Ingrese el código recibido"
                    :disabled="codeVerified"
                  />
                </div>
  
                <div v-if="currentStep === 'reset-password'" class="password-fields">
                  <div class="form-group">
                    <label for="password">Nueva Contraseña</label>
                    <input
                      id="password"
                      v-model="password"
                      type="password"
                      placeholder="Ingrese su nueva contraseña"
                    />
                  </div>
  
                  <div class="form-group">
                    <label for="confirmPassword">Confirmar Contraseña</label>
                    <input
                      id="confirmPassword"
                      v-model="confirmPassword"
                      type="password"
                      placeholder="Confirme su nueva contraseña"
                    />
                  </div>
                </div>
  
                <button 
                  type="submit" 
                  class="submit-button"
                  :disabled="isLoading"
                >
                  {{ submitButtonText }}
                </button>
              </form>
  
              <div v-if="currentStep !== 'select-method'" class="alternative-options">
                <p>¿Problemas con este método?</p>
                <button @click="resetRecoveryProcess" class="text-button">
                  Intentar otro método de recuperación
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onBeforeMount, onBeforeUnmount } from 'vue';
  import { useRouter } from 'vue-router';
  import { useStore } from 'vuex';
  import apiService from '../service/apiservice';
  import fondoImage2 from '../assets/fondo2.jpg';
  import logoSena from '../assets/logoSena.jpg';
  
  const router = useRouter();
  const store = useStore();
  const body = document.getElementsByTagName("body")[0];
  
  const code = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const userId = ref('');
  const isLoading = ref(false);
  const codeVerified = ref(false);
  const currentStep = ref('select-method');
  const selectedMethod = ref('');
  
  const recoveryMethods = [
    { value: 'email', label: 'Correo Electrónico', icon: 'fas fa-envelope' },
    { value: 'sms', label: 'SMS', icon: 'fas fa-mobile-alt' },
    { value: 'questions', label: 'Preguntas de Seguridad', icon: 'fas fa-question-circle' },
  ];
  
  const backgroundStyle = computed(() => ({
    backgroundImage: `url(${fondoImage2})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }));
  
  const currentStepDescription = computed(() => {
    switch (currentStep.value) {
      case 'select-method':
        return 'Selecciona un método para restablecer tu contraseña';
      case 'enter-code':
        return 'Ingresa el código de recuperación recibido';
      case 'reset-password':
        return 'Ingresa y confirma tu nueva contraseña';
      default:
        return '';
    }
  });
  
  const submitButtonText = computed(() => {
    if (isLoading.value) {
      return "Procesando...";
    }
    switch (currentStep.value) {
      case 'select-method':
        return "Seleccionar método";
      case 'enter-code':
        return "Verificar Código";
      case 'reset-password':
        return "Restablecer Contraseña";
      default:
        return "Continuar";
    }
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
  
  onMounted(() => {
    const storedUserId = localStorage.getItem('resetUserId');
    if (storedUserId) {
      userId.value = storedUserId;
    } else {
      showToast("Error", "No se encontró el ID de usuario para el reseteo de contraseña");
      router.push('/auth/forgot-password');
    }
  });
  
  const navigateToSignIn = () => {
    router.push("/auth/sign-in");
  };
  
  const showToast = (title, description) => {
    // Implement your toast notification here
    alert(`${title}: ${description}`);
  };
  
  const selectRecoveryMethod = async (method) => {
    selectedMethod.value = method;
    isLoading.value = true;
    try {
      // Simular una llamada a la API para solicitar el código de recuperación
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast("Código enviado", `Se ha enviado un código de recuperación a tu ${method === 'email' ? 'correo electrónico' : method === 'sms' ? 'teléfono' : 'preguntas de seguridad'}.`);
      currentStep.value = 'enter-code';
    } catch (error) {
      showToast("Error", "No se pudo enviar el código de recuperación. Por favor, intente nuevamente.");
    } finally {
      isLoading.value = false;
    }
  };
  
  const verifyCode = async () => {
    if (!code.value) {
      showToast("Campo incompleto", "Por favor, ingrese el código de recuperación.");
      return false;
    }
  
    isLoading.value = true;
    try {
      const response = await apiService.post("/auth/verify-code", {
        userId: userId.value,
        code: code.value,
        method: selectedMethod.value
      });
  
      if (response.isValid) {
        codeVerified.value = true;
        currentStep.value = 'reset-password';
        showToast("Código verificado", "Por favor, ingrese su nueva contraseña.");
        return true;
      } else {
        showToast("Código inválido", "El código ingresado no es válido. Por favor, intente nuevamente.");
        return false;
      }
    } catch (error) {
      console.error("Error al verificar el código:", error);
      showToast("Error", error instanceof Error ? error.message : "Hubo un error al verificar el código");
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  const resetPassword = async () => {
    if (!password.value || !confirmPassword.value) {
      showToast("Campos incompletos", "Por favor, complete todos los campos de contraseña.");
      return;
    }
  
    if (password.value !== confirmPassword.value) {
      showToast("Error", "Las contraseñas no coinciden");
      return;
    }
  
    isLoading.value = true;
    try {
      const response = await apiService.post("/auth/reset-password", {
        userId: userId.value,
        code: code.value,
        nuevaContrasena: password.value,
        method: selectedMethod.value
      });
  
      showToast("Éxito", response.message);
      localStorage.removeItem('resetUserId');
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      showToast("Error", error instanceof Error ? error.message : "Hubo un error al restablecer la contraseña");
    } finally {
      isLoading.value = false;
    }
  };
  
  const handleSubmit = async () => {
    switch (currentStep.value) {
      case 'enter-code':
        await verifyCode();
        break;
      case 'reset-password':
        await resetPassword();
        break;
    }
  };
  
  const resetRecoveryProcess = () => {
    currentStep.value = 'select-method';
    selectedMethod.value = '';
    code.value = '';
    password.value = '';
    confirmPassword.value = '';
    codeVerified.value = false;
  };
  </script>
  
  <style scoped>
  /* Estilos existentes */
  .reset-password {
    min-height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
  }
  
  .back-button {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 2;
    background-color: white;
    color: #39a900;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .back-button:hover {
    background-color: #f0f0f0;
  }
  
  .content-wrapper {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 28rem;
    padding: 1rem;
  }
  
  .form-card {
    background-color: white;
    border-radius: 0.75rem;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }
  
  .logo-section {
    display: flex;
    align-items: center;
  }
  
  .logo {
    height: 45px;
    margin-right: 1rem;
  }
  
  .separator {
    font-size: 2rem;
    color: #ccc;
    margin: 0 1rem;
  }
  
  .title-group {
    text-align: left;
  }
  
  .title-group h1 {
    font-size: 1.25rem;
    font-weight: bold;
    margin: 0;
  }
  
  .title-group h2 {
    font-size: 1rem;
    font-weight: normal;
    margin: 0;
  }
  
  .form-content {
    text-align: center;
  }
  
  .form-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
  }
  
  .form-description {
    font-size: 0.875rem;
    color: #4a5568;
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
    text-align: left;
  }
  
  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
  }
  
  .submit-button {
    width: 100%;
    background-color: #39a900;
    color: white;
    border: none;
    padding: 0.75rem;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .submit-button:hover:not(:disabled) {
    background-color: #2d8000;
  }
  
  .submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .password-fields {
    margin-top: 1rem;
  }
  
  /* Nuevos estilos para las opciones de recuperación */
  .recovery-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .recovery-option {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 1rem;
    color: #4a5568;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
  }
  
  .recovery-option:hover {
    background-color: #e5e7eb;
    border-color: #d1d5db;
  }
  
  .recovery-option i {
    font-size: 1.25rem;
  }
  
  .alternative-options {
    margin-top: 1.5rem;
    text-align: center;
  }
  
  .alternative-options p {
    font-size: 0.875rem;
    color: #4a5568;
    margin-bottom: 0.5rem;
  }
  
  .text-button {
    background: none;
    border: none;
    color: #39A900;
    font-size: 0.875rem;
    cursor: pointer;
    text-decoration: underline;
  }
  
  .text-button:hover {
    color: #2d8000;
  }
  </style>