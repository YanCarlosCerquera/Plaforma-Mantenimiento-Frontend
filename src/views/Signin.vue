<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-container">
        <img :src="logo" alt="SENA logo" class="logo" />
        <h1 class="main-title">CIES HUILA</h1>
      </div>
      <p class="subtitle">Ingresa tus credenciales para acceder</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="documentType">Tipo de documento</label>
          <select id="documentType" v-model="formData.typeDocument" required>
            <option v-for="type in documentTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="document">Número de documento</label>
          <input id="document" type="text" v-model="formData.document" required
            placeholder="Ingrese su número de documento" />
        </div>

        <div class="form-group password-group">
          <label for="password">Contraseña</label>
          <input :type="showPassword ? 'text' : 'password'" id="password" v-model="formData.password" required
            placeholder="Ingrese su contraseña" />
          <button type="button" class="toggle-password" @click="togglePassword">
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>

        <div class="form-group remember-me">
          <a href="/RecuperarContrase" class="forgot-password">¿Olvidaste tu contraseña?</a>
        </div>

        <button type="submit" class="submit-btn">Ingresar</button>
      </form>

      <p class="signup-link">
        ¿No tienes una cuenta? <a href="/signup">Crea tu cuenta</a>
      </p>
    </div>

    <div class="background-image">
      <div class="overlay"></div>
      <div class="content">
        <h1>"Centro de la empresa, la industria y los servicios"</h1>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { onBeforeUnmount, onBeforeMount } from "vue";
import apiService from "../service/apiService";
import logo from "@/assets/img/sena-logo.png";

const router = useRouter();
const store = useStore();
const body = document.getElementsByTagName("body")[0];

const documentTypes = [
  { value: "", label: "Selecciona tu tipo de documento" },
  { value: "Cédula de Ciudadanía", label: "Cédula de Ciudadanía" },
  { value: "Cédula de Extranjería", label: "Cédula de Extranjería" },
  { value: "Tarjeta de Identidad", label: "Tarjeta de Identidad" },
];



const formData = ref({
  typeDocument: "",
  document: "",
  password: "",
});

const rememberMe = ref(false);
const showPassword = ref(false);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  try {
    const response = await apiService.post("auth/login", formData.value);
    const token = response.result.access_token;
    const menu = response.result.menu;

    if (token) {
      Cookies.set("authToken", token, {
        httpOnly: false,
        secure: true,
        sameSite: "strict",
        expires: rememberMe.value ? 7 : 1,
      });

      store.commit("setAuthToken", token);
    }

    if (menu) {
      Cookies.set("menu", JSON.stringify(menu), {
        secure: true,
        sameSite: "strict",
        expires: rememberMe.value ? 7 : 1,
      });
    }

    Swal.fire({
      title: "¡Bienvenido!",
      text: "Has iniciado sesión correctamente.",
      icon: "success",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: "#28a745",
      iconColor: "white",
      customClass: {
        title: "text-white",
        content: "text-white",
      },
    });

    router.push("/dashboard-default");
  } catch (error) {
    Swal.fire({
      title: "Error",
      text:
        error.response?.data?.message ||
        "Hubo un problema al intentar iniciar sesión.",
      icon: "error",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: "#dc3545",
      iconColor: "white",
      customClass: {
        title: "text-white",
        content: "text-white",
      },
    });
  }
};

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
.login-container {
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
}

.login-card {
  flex: 1;
  max-width: 500px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #d8e0d7ad;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  margin:auto 2rem;
  max-height: 700px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.logo {
  max-width: 40px;
  margin-right: 1rem;
}

.main-title {
  font-size: 1.75rem;
  color: #39A900;
  margin: 0;
}

.subtitle {
  font-size: 0.95rem;
  color: #000000;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #000000;
  font-size: 0.9rem;
  font-weight: 700;
}

h1 {
  color: #fff;
}

input,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #39A900;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.password-group {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 70%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #000;
  font-size: 1.2rem;
}

.toggle-password:hover {
  color: #28a745;
}

.forgot-password {
  color: #1ca349;
  text-decoration: none;
  font-size: 1rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #218838;
}

.signup-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.signup-link a {
  color: #28a745;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}

.background-image {
  flex: 1;
  background-image: url("../assets/image208.png");
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(40, 167, 70, 0.2);
  backdrop-filter: blur(8px);
}

.content {
  position: relative;
  z-index: 1;
  padding: 2rem;
}

.content h2 {
  font-size: 2rem;
  color: white;
  margin-bottom: 1rem;
}

.content p {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-card {
    max-width: 100%;
    margin: 1rem;
  }

  .background-image {
    display: none;
  }
}

@media (max-width: 576px) {
  .login-card {
    max-width: 100%;
    margin:auto 1rem;
    padding: 1.5rem;
    max-height: 700px;
  }
}

@media (min-width: 577px) and (max-width: 992px) {
  .login-card {
    max-width: 80%;
    margin:auto 1.5rem;
    padding: 1.75rem;
    max-height: 700px;
  }
}

@media (min-width: 993px) {
  .login-card {
    flex: 1;
    max-width: 500px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: #d8e0d7ad;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    margin:auto 2rem;
    max-height: 700px;
  }
}
</style>