<template>
  <div class="register-container">
    <div class="register-card">
      <div class="logo-container">
        <img :src="logo" alt="Logo SENA" class="logo" />
        <h1 class="main-title">CIES HUILA</h1>
      </div>
      <h2 class="welcome-text">Crear una cuenta</h2>
      <p class="subtitle">Ingresa tus datos para registrarte</p>

      <form @submit.prevent="handleRegister" class="form-center">
        <div class="form-grid">
          <div class="form-group">
            <label for="name">
              <UserIcon class="input-icon" /> Nombre completo
            </label>
            <input
              id="name"
              type="text"
              v-model="formData.name"
              required
              placeholder="Ingrese su nombre completo"
            />
          </div>

          <div class="form-group">
            <label for="email">
              <MailIcon class="input-icon" /> Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              v-model="formData.email"
              required
              placeholder="Ingrese su correo electrónico"
            />
          </div>

          <div class="form-group">
            <label for="documentType">
              <FileTextIcon class="input-icon" /> Tipo de documento
            </label>
            <div class="select-wrapper">
              <select
                id="documentType"
                v-model="formData.typeDocument"
                required
              >
                <option
                  v-for="type in documentTypes"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="numberDocument">
              <HashIcon class="input-icon" /> Número de documento
            </label>
            <input
              id="numberDocument"
              type="text"
              v-model="formData.numberDocument"
              required
              placeholder="Ingrese su número de documento"
            />
          </div>

          <div class="form-group">
            <label for="phone">
              <PhoneIcon class="input-icon" /> Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              v-model="formData.phone"
              required
              placeholder="Ingrese su número de teléfono"
              @input="formatPhoneNumber"
              maxlength="10"
            />
          </div>

          <div class="form-group">
            <label for="password">
              <LockIcon class="input-icon" /> Contraseña
            </label>
            <input
              id="password"
              type="password"
              v-model="formData.password"
              required
              placeholder="Ingrese su contraseña"
            />
          </div>
        </div>

        <button type="submit" class="submit-btn">Registrarse</button>
      </form>

      <p class="signin-link">
        ¿Ya tienes una cuenta? <a href="/signin">Iniciar sesión</a>
      </p>
    </div>

    <div class="particles-background">
      <div id="particles-js"></div>
      <div class="content">
        <h2>"Centro de la empresa, la industria y los servicios"</h2>
      </div>
    </div>

    <div v-if="alert" :class="['alert', `alert-${alert.type}`]">
      {{ alert.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import apiService from "../service/apiService";
import logo from "@/assets/img/sena-logo.png";
import { onBeforeUnmount, onBeforeMount } from "vue";
import {
  UserIcon,
  MailIcon,
  FileTextIcon,
  HashIcon,
  PhoneIcon,
  LockIcon,
} from "lucide-vue-next";
import "particles.js";
const router = useRouter();
const store = useStore();
const body = document.getElementsByTagName("body")[0];

const documentTypes = [
  { value: "", label: "Selecciona tu tipo de documento" },
  { value: "Cédula de Ciudadanía", label: "Cédula de Ciudadanía" },
  { value: "Cédula de Extranjería", label: "Cédula de Extranjería" },
  { value: "Tarjeta de Identidad", label: "Tarjeta de Identidad" },
];

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
  // Inicializar particles.js
  if (typeof window !== "undefined" && window.particlesJS) {
    window.particlesJS("particles-js", {
      particles: {
        number: { value: 150, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: {
          value: 0.5,
          random: false,
          anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false },
        },
        size: {
          value: 3,
          random: true,
          anim: { enable: false, speed: 40, size_min: 0.1, sync: false },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#ffffff",
          opacity: 0.4,
          width: 1,
        },
        move: {
          enable: true,
          speed: 6,
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: { enable: false, rotateX: 600, rotateY: 1200 },
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "gra" },
          onclick: { enable: true, mode: "push" },
          resize: true,
        },
        modes: {
          grab: { distance: 400, line_linked: { opacity: 1 } },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3,
          },
          repulse: { distance: 200, duration: 0.4 },
          push: { particles_nb: 4 },
          remove: { particles_nb: 2 },
        },
      },
      retina_detect: true,
    });
  }
});

const formData = ref({
  name: "",
  email: "",
  phone: "",
  typeDocument: "",
  numberDocument: "",
  password: "",
});

const alert = ref(null);

const handleValidation = () => {
  const { email, name, typeDocument, numberDocument, phone, password } =
    formData.value;
  if (
    !email ||
    !name ||
    !typeDocument ||
    !numberDocument ||
    !phone ||
    !password
  ) {
    showAlert("Por favor, complete todos los campos", "error");
    return false;
  }
  if (!/^(\+57)?[3]\d{9}$/.test(phone)) {
    showAlert(
      "El número de teléfono debe tener 10 dígitos y comenzar con 3",
      "error"
    );
    return false;
  }

  return true;
};

const handleRegister = async () => {
  if (!handleValidation()) return;

  try {
    await apiService.post("/auth/registro", {
      ...formData.value,
      phone: `57${formData.value.phone}`,
    });
    showAlert("Registro exitoso", "success");
    router.push("/signin");
  } catch (error) {
    if (error.response && error.response.status === 400) {
      showAlert(error.response.data.message, "error");
    } else {
      showAlert(
        "Ocurrió un error. Por favor, intente nuevamente más tarde.",
        "error"
      );
    }
  }
};

const showAlert = (message, type) => {
  alert.value = { message, type };
  setTimeout(() => {
    alert.value = null;
  }, 5000);
};

const formatPhoneNumber = (event) => {
  let input = event.target.value.replace(/\D/g, "");
  if (input.length > 10) input = input.slice(0, 10);
  formData.value.phone = input;
};
</script>

<style scoped>
.register-container {
  display: flex;
  min-height: 100vh;
}

.register-card {
  flex: 1;
  max-width: 700px;
  padding: 1em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #d8e0d7ad;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  margin:auto 2rem;
}



.logo-container {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  justify-content: center;
}

.logo {
  width: 40px;
  height: 40px;
  margin-right: 1rem;
  justify-content: center;
}

.main-title {
  font-size: 1.5rem;
  color: #28a745;
  font-weight: 700;
  margin: 0;
  text-align: center;
}

.welcome-text {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 700;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.subtitle {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
}

.input-icon {
  margin-right: 0.5rem;
  color: #28a745;
  width: 1rem;
  height: 1rem;
}

input,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
}

.select-wrapper {
  position: relative;
}

.select-wrapper::after {
  content: "\25BC";
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  pointer-events: none;
  color: #666;
}

.submit-btn {
  width: 100%;
  max-width: 600px;
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 1.5rem;
}

.submit-btn:hover {
  background-color: #218838;
}

.signin-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.signin-link a {
  color: #28a745;
  text-decoration: none;
  font-weight: 600;
}

.particles-background {
  flex: 1;
  position: relative;
  overflow: hidden;
}

#particles-js {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #218838;
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  color: white;
  text-align: center;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.content h2 {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1rem;
}

.content p {
  font-size: 1.1rem;
}

.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 1000;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 1024px) {
  .register-container {
    flex-direction: column;
  }

  .register-card {
    max-width: 80%;
    margin-left: 6rem;

  }

  .particles-background {
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .register-card {
    padding: 1rem;
    max-height: auto;
    margin-top: 1em;
  }

  .welcome-text {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  input,
  select {
    padding: 0.5rem;
  }

  .submit-btn {
    padding: 0.5rem;
  }

  .content h2 {
    font-size: 2rem;
  }

  .content p {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .register-card {
    padding: 1rem;
    max-height: auto;
    margin-top: 2em;
  }

  .welcome-text {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  input,
  select {
    padding: 0.5rem;
  }

  .submit-btn {
    padding: 0.5rem;
  }

  .content h2 {
    font-size: 2rem;
  }

  .content p {
    font-size: 1rem;
  }
}
</style>
