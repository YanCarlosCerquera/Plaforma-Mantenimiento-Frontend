<script setup>
import { onBeforeMount, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { ref } from "vue";
import setNavPills from "@/assets/js/nav-pills.js";
import setTooltip from "@/assets/js/tooltip.js";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import Swal from "sweetalert2";
import apiService from "../service/apiService";
import ArgonSelect from "@/components/ArgonSelect.vue";
import ArgonAutocomplete from "../components/ArgonAutocomplete.vue";
import Cookies from "js-cookie";
const dialogVisible = ref(false);
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
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
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
const userRole = ref("");
const store = useStore();
const token = Cookies.get("authToken");
const decodedToken = jwt_decode.jwtDecode(token);
userId = decodedToken.sub;
const roles = ref([]);
const selectedRoleId = ref('')

async function getRoles() {
  try {
    const response = await apiService.get(
      `rol`,
      {},
      { Authorization: `Bearer ${token}` }
    );

    roles.value = response.map((role) => ({
      title: role.name,
      value: role._id,
    }));

    const currentRole = roles.value.find(role => role.value === userData.value.role);
    if (currentRole) {
      userData.value.role = currentRole.value;
    }
  } catch (error) {
    console.error("Error fetching roles:", error);
  }
}

async function getUser() {
  try {
    const response = await apiService.get(
      `users/${userId}`,
      {},
      { Authorization: `Bearer ${token}` }
    );

    userData.value.name = response?.name;
    userData.value.email = response?.email;
    userData.value.phone = response?.phone.replace(/^\+?\d{1,2}/, "");
    userData.value.role = response?.assignedRol?._id;
    selectedRoleId.value = response?.assignedRol?._id;
    userData.value.position = response?.assignedPosition;
    userData.value.documentNumber = response?.numberDocument;
    userData.value.documentType = response?.typeDocument;
    userData.value.image = response?.photoUrl || "../assets/img/team-1.jpg";
    userRole.value = response?.assignedRol?.name;
  } catch (error) {
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
        title: "text-succes",
      },
    });
  }
}

function handleImageChange(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const maxWidth = 800;
        const maxHeight = 800;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const compressedImage = canvas.toDataURL("image/jpeg", 0.8);

        userData.value.image = compressedImage;
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }
}

const updateUser = async () => {
  try {
    const result = await Swal.fire({
      title: "¿Actualizar perfil?",
      text: "Está seguro de actualizar el perfil.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      customClass: {
        title: "swal-title-white",
        confirmButton: "btn-success",
        cancelButton: "btn-danger"
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    const data = {
      name: userData.value.name,
      email: userData.value.email,
      phone: `57${userData.value.phone}`,
      typeDocument: userData.value.documentType,
      numberDocument: userData.value.documentNumber,
      assignedPosition: userData.value.position,
      assignedRol: userData.value.role,
      photoUrl: userData.value.image,
    };

    await apiService.patch(`users/${userId}`, data, {
      Authorization: `Bearer ${token}`,
    });

    Swal.fire({
      title: "perfil actualizado",
      text: "Se actualizo el perfil correctamente.",
      icon: "success",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#28a745",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
      customClass: {
        title: "swal-title-white",
      },
    });
  } catch (error) {
    Swal.fire({
      title: "Error",
      text:
        error.response?.data?.message ||
        "Hubo un problema al actualizar el perfil.",
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
};

const updatePassword = async () => {
  try {
    if (newPassword.value !== confirmPassword.value) {
      Swal.fire({
        title: "Contraseñas no coinciden",
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
      return;
    }

    const data = {
      oldPassword: currentPassword.value,
      password: newPassword.value,
    };

    await apiService.patch(`users/${userId}`, data, {
      Authorization: `Bearer ${token}`,
    });

    Swal.fire({
      title: "Contraseña actualizada",
      text: "Se actualizo la contraseña correctamente.",
      icon: "success",
      position: "bottom-right",
      toast: true,
      timer: 3000,
      background: "#28a745",
      color: "white",
      iconColor: "white",
      showConfirmButton: false,
      customClass: {
        title: "swal-title-white",
      },
    });

    closeDialog()
  } catch (error) {
    Swal.fire({
      title: "Error",
      text:
        error.response?.data?.message ||
        "Hubo un problema al actualizar la contraseña.",
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
};

function closeDialog() {
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
  dialogVisible.value = false;
}

onMounted(() => {
  store.state.isAbsolute = true;
  setNavPills();
  setTooltip();
  getUser();
  getRoles();
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
      <div class="page-header min-height-300" style="
          /* background-image: url(&quot;https://images.unsplash.com/photo-1531512073830-ba890ca4eba2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80&quot;); */
          margin-right: -24px;
          margin-left: -34%;
        ">
        <span class="mask  opacity-6"></span>
      </div>
      <h3 class="mt-3 mb-1 text-succes">Configuraciones</h3>
      <h5 class="mb-1">Perfil de {{ userRole }}</h5>
      <div class="card shadow-lg mt-2" style="margin-top: -50px; margin-right: 24px">
        <div class="card-body p-3">
          <div class="row">
            <div class="col-md-2 d-flex align-items-center">
              <div class="avatar avatar-xxl position-relative" style="min-width: 150px; min-height: 150px">
                <img :src="userData.image ? userData.image : '../assets/img/team-1.jpg'
                  " alt="profile_image" class="shadow-sm w-100 border-radius-lg"
                  style="max-width: 200px; height: auto" />
                <button class="btn btn-success btn-circle"
                  style="position: absolute; bottom: 2px; right: 2px; margin: 0" @click="$refs.fileInput.click()">
                  <i class="fas fa-edit"></i>
                </button>
                <input ref="fileInput" type="file" accept="image/*" @change="handleImageChange" style="display: none" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="row">
                <p class="text-sm">Información del usuario</p>
                <div>
                  <label for="example-text-input" class="form-control-label">Nombre de usuario</label>
                  <argon-input id="name" type="text" value="lucky.jesse" v-model="userData.name" />
                </div>
                <div>
                  <label for="example-text-input" class="form-control-label">Tipo de documento</label>
                  <argon-select :options="documentTypes" v-model="userData.documentType" />
                </div>
                <div>
                  <label for="example-text-input" class="form-control-label">Número de documento</label>
                  <argon-input type="number" v-model="userData.documentNumber" />
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <p class="text-sm">Contactos</p>
              <div class="row">
                <div>
                  <label for="example-text-input" class="form-control-label">Correo electrónico</label>
                  <argon-input id="email" type="email" value="jesse@example.com" v-model="userData.email" />
                </div>
                <div>
                  <label for="example-text-input" class="form-control-label">Número de telefóno</label>
                  <argon-input prefix="+57 " type="number" v-model="userData.phone" />
                </div>
                <div>
                  <argon-button color="success" size="sm" class="ms-auto" @click="updateUser">Actualizar
                    perfil</argon-button>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <p class="text-sm">Cargos</p>
              <div class="row">
                <div>
                  <label for="example-text-input" class="form-control-label">Cargo desempeñado</label>
                  <argon-select id="position" :options="positions" v-model="userData.position" />
                </div>
                <div>
                  <label for="example-text-input" class="form-control-label">Rol asignado</label>
                  <ArgonAutocomplete type="text" v-model="userData.role" :items="roles" />
                </div>
                <div>
                  <argon-button color="success" size="sm" class="ms-auto" @click="dialogVisible = true">Cambiar
                    contraseña</argon-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-dialog v-model="dialogVisible" max-width="500">
      <v-card>
        <v-card-title class="d-flex justify-content-center">
          <h5 class="modal-title text-succes" id="exampleModalLabel">
            Cambiar Contraseña
          </h5>
        </v-card-title>
        <v-card-text>
          <form>
            <div class="mb-3">
              <label for="currentPassword" class="form-label">Contraseña anterior</label>
              <ArgonInput type="password" id="currentPassword" placeholder="Ingrese su actual contraseña"
                v-model="currentPassword" />
            </div>
            <div class="mb-3">
              <label for="newPassword" class="form-label">Nueva contraseña</label>
              <ArgonInput type="password" id="newPassword" placeholder="Ingrese su nueva contraseña"
                v-model="newPassword" />
            </div>
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirmar nueva contraseña</label>
              <ArgonInput type="password" id="confirmPassword" placeholder="Confirme su contraseña"
                v-model="confirmPassword" />
            </div>
          </form>
        </v-card-text>
        <v-card-actions class="d-flex justify-content-center gap-5">
          <button type="button" class="btn btn-danger" @click="closeDialog">
            Cancelar
          </button>
          <button type="button" class="btn btn-success" @click="updatePassword">
            Guardar Cambios
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </main>
</template>
