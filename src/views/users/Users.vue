<style>
.swal-title-white {
  color: white;
}
.text-succes{
  color: #39a900 !important
}
</style>
<script setup>
import { onBeforeMount, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { ref } from "vue";
import setNavPills from "@/assets/js/nav-pills.js";
import setTooltip from "@/assets/js/tooltip.js";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import Swal from "sweetalert2";
import apiService from "../../service/apiService";
import ArgonSelect from "@/components/ArgonSelect.vue";
import Cookies from "js-cookie";
const documentTypes = [
  { value: "", label: "Selecciona tu tipo de documento" },
  { value: "Cédula de Ciudadanía", label: "Cédula de Ciudadanía" },
  { value: "Cédula de Extranjería", label: "Cédula de Extranjería" },
  { value: "Tarjeta de Identidad", label: "Tarjeta de Identidad" },
];
const positions = [
  { value: "", label: "Selecciona cargo desempeñado" },
  { value: "Planta", label: "Planta" },
  { value: "Contratista", label: "Contratista" },
];
const body = document.getElementsByTagName("body")[0];
let userId = "";
const jwt_decode = require("jwt-decode");
const userData = ref({
  name: "",
  email: "",
  phone: "",
  role: "",
  position: "",
  documentNumber: "",
  documentType: "",
  image: "",
});
const userHeader = ref({
  name: "",
  role: "",
});
const store = useStore();

async function getUser() {
  try {
    const token = Cookies.get("authToken");

    const decodedToken = jwt_decode.jwtDecode(token);
    userId = decodedToken.sub;

    const response = await apiService.get(
      `users/${userId}`,
      {},
      { Authorization: `Bearer ${token}` }
    );

    userData.value.name = response?.name;
    userData.value.email = response?.email;
    userData.value.phone = response?.phone;
    userData.value.role = response?.assignedRol?.name;
    userData.value.position = response?.assignedPosition;
    userData.value.documentNumber = response?.numberDocument;
    userData.value.documentType = response?.typeDocument;
    userData.value.image = response?.photoUrl || "../assets/img/team-1.jpg";
    userHeader.value.name = response?.name;
    userHeader.value.role = response?.assignedRol?.name;

    console.log(userData.value);
  } catch (error) {
    console.log(error);
    Swal.fire({
      title: "Error",
      text:
        error.response?.data?.message ||
        "Hubo un problema al cargar la información.",
      icon: "error",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#dc3545",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
      customClass: {
        title: "swal-title-white",
      },
    });
  }
}

onMounted(() => {
  store.state.isAbsolute = true;
  setNavPills();
  setTooltip();
  getUser();
});
onBeforeMount(() => {
  store.state.imageLayout = "profile-overview";
  store.state.showNavbar = false;
  store.state.showFooter = true;
  store.state.hideConfigButton = true;
  body.classList.add("profile-overview");
});
onBeforeUnmount(() => {
  store.state.isAbsolute = false;
  store.state.imageLayout = "default";
  store.state.showNavbar = true;
  store.state.showFooter = true;
  store.state.hideConfigButton = false;
  body.classList.remove("profile-overview");
});
</script>
<template>
  <main>
    <div class="container-fluid">
      <div
        class="page-header min-height-300"
        style="
          background-image: url(&quot;https://images.unsplash.com/photo-1531512073830-ba890ca4eba2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80&quot;);
          margin-right: -24px;
          margin-left: -34%;
        "
      >
        <span class="mask bg-gradient-success opacity-6"></span>
      </div>
      <h4 class="mb-1 text-succes">Configuraciones</h4>
      <div
        class="card shadow-lg mt-2"
        style="margin-top: -50px; margin-right: 24px"
      >
        <div class="card-header pb-0">
          <div class="d-flex align-items-center">
            <p class="mb-0">Edit Profile</p>
          </div>
          <div class="row gx-4">
            <div class="col-auto">
              <div
                class="avatar avatar-xxl position-relative"
                style="min-width: 150px; min-height: 150px"
              >
                <img
                  :src="
                    userData.image ? userData.image : '../assets/img/team-1.jpg'
                  "
                  alt="profile_image"
                  class="shadow-sm w-100 border-radius-lg"
                  style="max-width: 200px; height: auto"
                />
                <button
                  class="btn btn-success btn-circle"
                  style="position: absolute; bottom: 2px; right: 2px; margin: 0"
                >
                  <i class="fas fa-edit"></i>
                </button>
              </div>
            </div>
            <div class="col-md-5 my-auto">
              <div class="h-100">
                <h5 class="mb-1">{{ userHeader.name }}</h5>
                <p class="mb-0 font-weight-bold text-sm">
                  {{ userHeader.role }}
                </p>
              </div>
            </div>
            <div class="col-md-4 d-flex align-items-center">
              <div class="row g-2">
                <argon-button color="success" size="sm" class="ms-auto"
                  >Cambiar contraseña</argon-button
                >
                <argon-button color="success" size="sm" class="ms-auto"
                  >Actualizar perfil</argon-button
                >
              </div>
            </div>
          </div>
        </div>
        <div class="card-body p-3">
          <div class="row">
            <hr class="horizontal dark" />
            <div class="col-md-4">
              <div class="row">
                <p class="text-uppercase text-sm">User Information</p>
                <div>
                  <label for="example-text-input" class="form-control-label"
                    >Nombre de usuario</label
                  >
                  <argon-input
                    type="text"
                    value="lucky.jesse"
                    v-model="userData.name"
                  />
                </div>
                <div>
                  <label for="example-text-input" class="form-control-label"
                    >Tipo de documento</label
                  >
                  <argon-select
                    :options="documentTypes"
                    v-model="userData.documentType"
                  />
                </div>
                <div>
                  <label for="example-text-input" class="form-control-label"
                    >Número de documento</label
                  >
                  <argon-input
                    type="number"
                    v-model="userData.documentNumber"
                  />
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <p class="text-uppercase text-sm">Contact Information</p>
              <div class="row">
                <div>
                  <label for="example-text-input" class="form-control-label"
                    >Correo electrónico</label
                  >
                  <argon-input
                    type="email"
                    value="jesse@example.com"
                    v-model="userData.email"
                  />
                </div>
                <div>
                  <label for="example-text-input" class="form-control-label"
                    >Número de telefóno</label
                  >
                  <argon-input type="number" v-model="userData.phone" />
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <p class="text-uppercase text-sm">About me</p>
              <div class="row">
                <div>
                  <label for="example-text-input" class="form-control-label"
                    >Cargo desempeñado</label
                  >
                  <argon-select
                    :options="positions"
                    v-model="userData.position"
                  />
                </div>
                <div>
                  <label for="example-text-input" class="form-control-label"
                    >Rol asignado</label
                  >
                  <argon-input type="text" v-model="userData.role" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
