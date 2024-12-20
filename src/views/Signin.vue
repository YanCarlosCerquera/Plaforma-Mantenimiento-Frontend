<script setup>
const documentTypes = [
  { value: "", label: "Selecciona tu tipo de documento" },
  { value: "Cédula de Ciudadanía", label: "Cédula de Ciudadanía" },
  { value: "Cédula de Extranjería", label: "Cédula de Extranjería" },
  { value: "Tarjeta de Identidad", label: "Tarjeta de Identidad" },
];
import { ref } from "vue";
import { onBeforeUnmount, onBeforeMount } from "vue";
import { useStore } from "vuex";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonSwitch from "@/components/ArgonSwitch.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import logo from "@/assets/img/sena-logo.png";
import apiService from "../service/apiService";
const body = document.getElementsByTagName("body")[0];

const formData = ref( {
  typeDocument: "",
  document: "",
  password: "",
})

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

const handleLogin = async (event) => {
  event.preventDefault();
  try{
    await apiService.post('auth/login', formData.value)
  
    alert("registrado")
  }catch(error){
    alert("mal")
  }

};


</script>

<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row">
      <div class="col-12">
        <navbar isBlur="blur  border-radius-lg my-3 py-2 start-0 end-0 mx-4 shadow" v-bind:darkMode="true"
          isBtn="bg-gradient-success" />
      </div>
    </div>
  </div>
  <main class="mt-0 main-content">
    <section>
      <div class="page-header min-vh-100">
        <div class="container">
          <div class="row">
            <div class="mx-auto col-xl-4 col-lg-5 col-md-7 d-flex flex-column mx-lg-0">
              <div class="card card-plain">
                <div class="pb-0 card-header  justify-content-center aling-items-center">
                  <img :src="darkMode || sidebarType === 'bg-default' ? logoWhite : logo" class="img h-30 w-25 mx-auto position-relative align-middle text-center" alt="main_logo" />
                  <h4 class="font-weight-bolder text-center">Iniciar sesión</h4>
                  <p class="mb-0 text-center">Ingresa tu tipo y numero de documento junto a tu contraseña para ingresar
                  </p>
                </div>
                <div class="card-body">
                  <form role="form">
                    <div class="mb-3">  
                      <argon-select id="documentType" placeholder="" name="documentType" size="lg"
                        v-model="formData.typeDocument" :options="documentTypes" />

                    </div>
                    <div class="mb-3">
                      <argon-input id="email" type="email" placeholder="Número de documento" name="email" size="lg" v-model="formData.document" />
                    </div>
                    <div class="mb-3">
                      <argon-input id="password" type="password" placeholder="Contraseña" name="password" size="lg" v-model="formData.password"/>
                    </div>
                    <argon-switch id="rememberMe" name="remember-me">Recordar</argon-switch>
                    
                    <div class="text-center">
                      <a href="javascript:;" class="text-sm text-success text-gradient font-weight-bold">Olvidaste tu contraseña?</a>
                    </div>
                    <div class="text-center">
                      <argon-button class="mt-4" variant="gradient" color="success" fullWidth
                        size="lg" @click="handleLogin($event)">Ingresar</argon-button>
                    </div>
                  </form>
                </div>
                <div class="px-1 pt-0 text-center card-footer px-lg-2">
                  <p class="mx-auto mb-4 text-sm">
                    No tienes una cuenta?
                    <a href="javascript:;" class="text-success text-gradient font-weight-bold">Crea tu cuenta</a>
                  </p>
                </div>
              </div>
            </div>
            <div
              class="top-0 my-auto text-center col-6 d-lg-flex d-none h-100 pe-0 position-absolute end-0 justify-content-center flex-column">
              <div
                class="position-relative bg-gradient-primary h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center overflow-hidden"
                style="
                  background-image: url(https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjv6akz9dR0_TN22Vp5VwC-lheE2JVeR9OkujqwaSB0qkF2Er4tYzEPXHUaipg5xScDaHQ-RuP50JIPEnDpXaH1ChAXnetVzxwWPLnYScWmNF-0HJsW3TMSR93rXRcXOguZnv4bKcIfKMc/w631-h355-rw/sena+industria.jpg;);
                  background-size: cover;

                ">
                <span class="mask bg-gradient-success opacity-6"></span>
                <h3 class="mt-5 text-white font-weight-bolder position-relative">
                  "Centro de la empresa, la insdustria y los servicios"
                </h3>
                <h4 class="text-white position-relative font-weight-bolder ">
                  Servicios tecnologicos (Tecnologias de la informacíon) | Tecnoparque nodo neiva.
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
