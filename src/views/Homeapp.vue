<script setup>
import { onBeforeUnmount, onBeforeMount, computed } from "vue";
import { useStore } from "vuex";
import AppFooter from "@/examples/PageLayout/Footer.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonCheckbox from "@/components/ArgonCheckbox.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import fondoImage2 from '../assets/image208.png';

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

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${fondoImage2})`,
  backgroundSize: 'stretch',
  backgroundPosition: 'center',
}));

</script>

<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row"></div>
  </div>
  <main class="main-content mt-0">
    <div class="page-header align-items-start min-vh-50 pt-5 pb-11 m-3 border-radius-lg" :style="backgroundStyle">
      <span class="mask bg-gradient-dark opacity-6"></span>
      <div class="container">
        <!-- Contenedor de los botones -->
        <div class="d-flex justify-content-end col-lg-12">
          <argon-button class="mt-4 mx-2 position-fixed m-4" variant="gradient" color="success">
            Iniciar sesión
          </argon-button>
          <argon-button class="mt-4 mx-9 position-fixed" variant="gradient" color="success">
            Registrarse
          </argon-button>
        </div>
        <!-- Contenedor del texto -->
        <div class="row text-left mt-5 my-4">
          <div class="row text-left mx-auto">
            <h1 class="text-white mb-3 mt-5 text-left col-8 ">
              Bienvenido al sistema de gestión de inventarios del SENA Regional Huila
            </h1>
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
              <form role="form">
                <argon-input id="email" type="email" placeholder="Correo" aria-label="Correo" />
                <argon-input id="name" type="text" placeholder="Nombre" aria-label="Nombre" />
                <argon-select id="documentType" placeholder="" name="documentType" size="lg" />
                <argon-input id="numberDocument" type="text" placeholder="Numero de documento"
                  aria-label="Numero de documento" />
                <argon-input id="phone" type="tel" placeholder="Teléfono" aria-label="Teléfono" maxlength="10" />
                <argon-input id="password" type="password" placeholder="Contraseña" aria-label="Password" />
                <argon-input id="password" type="password" placeholder="Confirmar Contraseña"
                  aria-label="Confirmar Contraseña" />
                <argon-checkbox checked>
                  <label class="form-check-label" for="flexCheckDefault">
                    <a href="javascript:;" class="text-dark font-weight-bolder">Términos y Condiciones</a>
                  </label>
                  <p class="text-sm mt-2 mb-0">
                    <a href="/RecuperarContrase" class="text-dark font-weight-bolder">¿Olvidaste tu contraseña?</a>
                  </p>
                </argon-checkbox>
                <div class="text-center">
                  <argon-button type="submit" color="dark" variant="gradient" class="my-4 mb-2">
                    Registrar
                  </argon-button>
                </div>
                <p class="text-sm mt-3 mb-0">
                  Already have an account?
                  <a href="javascript:;" class="text-dark font-weight-bolder">Sign in</a>
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