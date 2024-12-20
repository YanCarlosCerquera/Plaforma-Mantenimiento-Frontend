<script setup>
import { onBeforeUnmount, onBeforeMount, ref } from "vue";
import { useStore } from "vuex";
import AppFooter from "@/examples/PageLayout/Footer.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import apiService from "../service/apiService";
import { useRouter } from "vue-router";


const body = document.getElementsByTagName("body")[0];
const store = useStore();
const router = useRouter();
const documentTypes = [
  { value: "", label: "Selecciona tu tipo de documento" },
  { value: "Cédula de Ciudadanía", label: "Cédula de Ciudadanía" },
  { value: "Cédula de Extranjería", label: "Cédula de Extranjería" },
  { value: "Tarjeta de Identidad", label: "Tarjeta de Identidad" },
];

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
  const { email, name, typeDocument, numberDocument, phone, password } = formData.value;
  if (!email || !name || !typeDocument || !numberDocument || !phone || !password) {
    showAlert('Por favor, complete todos los campos', 'error');
    return false;
  }
  if (!/^(\+57)?[3]\d{9}$/.test(phone)) {
    showAlert('El número de teléfono debe tener 10 dígitos y comenzar con 3', 'error');
    return false;
  }
  return true;
};

const handleRegister = async (event) => {
  event.preventDefault(); 

  if (!handleValidation()) return;

  try {
    const response = await apiService.post('/auth/registro', {
      ...formData.value,
      phone: `57${formData.value.phone}`
    });
    router.push("/signin")
    console.log(response);
    showAlert('Registro exitoso', 'success');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      showAlert(error.response.data.message, 'error');
    } else {
      showAlert('Ocurrió un error. Por favor, intente nuevamente más tarde.', 'error');
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
  let input = event.target.value.replace(/\D/g, '');
  if (input.length > 10) input = input.slice(0, 10);
  formData.value.phone = input;
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

<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row"></div>
  </div>
  <main class="main-content mt-0">
    <div
      class="page-header align-items-start min-vh-50 pt-5 pb-11 m-3 border-radius-lg"
      style="
        background-image: url('https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signup-cover.jpg');
        background-position: top;
      "
    >
      <span class="mask bg-gradient-dark opacity-6"></span>
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-5 text-center mx-auto">
            <h1 class="text-white mb-2 mt-5">Bienvenido!</h1>
            <p class="text-lead text-white">
              Use estos campos para registrarse en nuestra plataforma
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row mt-lg-n10 mt-md-n11 mt-n10 justify-content-center">
        <div class="col-xl-4 col-lg-5 col-md-7 mx-auto">
          <div class="card z-index-0">
            <div class="card-header text-center pt-4">
              <h5>Registro Usuario</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleRegister" role="form">
                <argon-input
                  id="email"
                  type="email"
                  placeholder="Correo"
                  aria-label="Correo"
                  v-model="formData.email"
                />
                <argon-input
                  id="name"
                  type="text"
                  placeholder="Nombre"
                  aria-label="Nombre"
                  v-model="formData.name"
                />
                <argon-select
                  id="documentType"
                  placeholder=""
                  name="documentType"
                  size="lg"
                  v-model="formData.typeDocument"
                  :options="documentTypes"
                />
                <argon-input
                  id="numberDocument"
                  type="text"
                  placeholder="Numero de documento"
                  aria-label="Numero de documento"
                  v-model="formData.numberDocument"
                />
                  <argon-input
                    id="phone"
                    type="tel"
                    placeholder="Teléfono"
                    aria-label="Teléfono"
                    v-model="formData.phone"
                    @input="formatPhoneNumber"
                    maxlength="10"
                  />
                <argon-input
                  id="password"
                  type="password"
                  placeholder="Contraseña"
                  aria-label="Password"
                  v-model="formData.password"
                />
                <argon-input
                  id="password"
                  type="password"
                  placeholder="Confirmar Contraseña"
                  aria-label="Confirmar Contraseña"
                  v-model="formData.password"
                />
                <argon-checkbox checked>
                  <label class="form-check-label" for="flexCheckDefault">
                    <a href="javascript:;" class="text-dark font-weight-bolder"
                      >Términos y Condiciones</a
                    >
                  </label>
                  <p class="text-sm mt-2 mb-0">
                  <a href="/RecuperarContrase" class="text-dark font-weight-bolder"
                    >¿Olvidaste tu contraseña?</a
                  >
                </p>
                </argon-checkbox>
                <div class="text-center">
                  <argon-button
                    type="submit"
                    color="dark"
                    variant="gradient"
                    class="my-4 mb-2"
                    @clik="handleRegister"
                    
                  >
                    Registrar
                  </argon-button>
                </div>
                <p class="text-sm mt-3 mb-0">
                  Already have an account?
                  <a href="javascript:;" class="text-dark font-weight-bolder"
                    >Sign in</a
                  >
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <app-footer />
</template>