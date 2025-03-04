<script setup>
import { ref, onMounted, computed } from "vue";
import AuthorsTable from "./components/AuthorsTable.vue";
import apiService from "../service/apiService";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";
import defaultImage from "@/assets/img/logos/user.svg";

const token = Cookies.get("authToken");
const user = ref({
  name: "",
  phone: "",
  assignedRol: "",
  assignedPosition: "",
  typeDocument: "",
  numberDocument: "",
  photoUrl: defaultImage,
});
const userId = ref("");
const headers = ref([
  { text: "Nombre de usuario", value: "usuario.name" },
  { text: "Rol asignado", value: "rol.value" },
  { text: "Cargo", value: "position.value" },
  { text: "Fecha de creación", value: "fecha.value" },
]);

const documentTypes = [
  { value: "", label: "Selecciona tu tipo de documento" },
  { value: "Cédula de Ciudadanía", label: "Cédula de Ciudadanía" },
  { value: "Cédula de Extranjería", label: "Cédula de Extranjería" },
  { value: "Tarjeta de Identidad", label: "Tarjeta de Identidad" },
];
const assignedPosition = [
  { value: "", label: "Selecciona cargo desempeñado" },
  { value: "Planta", label: "Planta" },
  { value: "Contratista", label: "Contratista" },
];

const fields = ref({
  usuario: {
    showAvatar: true,
    avatar: "photoUrl",
    main: "name",
    sub: "email",
  },
  rol: {
    value: "assignedRol.name",
    class: "align-middle",
    textClass: "text-xs font-weight-bold mb-0",
  },
  position: {
    value: "assignedPosition",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  fecha: {
    value: "createdAt",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
});

const rows = ref([]);
const dialog = ref(false);
const availableRoles = ref([]);
const isLoading = ref(false);

const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(dateString)
    .toLocaleDateString("es-ES", options)
    .replace(".", "");
};

const fetchData = async () => {
  try {
    const response = await apiService.get(
      "/users?state=true",
      {},
      { Authorization: `Bearer ${token}` }
    );
    rows.value = (response.data || response).map((user) => ({
      ...user,
      createdAt: formatDate(user.createdAt),
      assignedPosition: user.assignedPosition
        ? user.assignedPosition
        : "Sin cargo asignado",
      photoUrl: user.photoUrl
        ? user.photoUrl.replace("http://localhost:3000", "")
        : defaultImage, 
      phone: user.phone ? user.phone.replace(/^\+?\d{1,2}/, "") : user.phone,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    alert("Error al cargar los usuarios");
  }
};

const fetchRoles = async () => {
  try {
    const response = await apiService.get(
      "/rol",
      {},
      { Authorization: `Bearer ${token}` }
    );
    availableRoles.value = response.map((assignedRol) => ({
      value: assignedRol._id,
      label: assignedRol.name,
    }));
  } catch (error) {
    console.error("Error fetching roles:", error);
    alert("Error al cargar los roles");
  }
};

const handleImageUpload = (event) => {
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

        user.value.photoUrl = compressedImage;
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }
};

const handleEdit = (row) => {
  user.value = { ...row };
  user.value.assignedRol = row.assignedRol._id;
  userId.value = row._id;
  dialog.value = true;
};
const handleCancel = () => {
  Object.keys(user.value).forEach((key) => (user.value[key] = ""));
  user.value.photoUrl = defaultImage; // Restablecer a la imagen por defecto
  userId.value = "";
  dialog.value = false;
};

const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "¿Estás seguro de que quieres eliminar este usuario?",
    text: "Esta acción no puede deshacerse.",
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    customClass: {
      title: "text-succes",
      confirmButton: "btn-success",
      cancelButton: "btn-danger",
    },
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await apiService.delete(`users/${id}`);
    Swal.fire({
      title: "Usuario eliminado correctamente",
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
    await fetchData();
  } catch (error) {
    Swal.fire({
      title: "Error al eliminar usuario",
      text: error.response?.data?.message || "Algo salió mal.",
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

const handleSubmit = async () => {
  try {
    if (!userId.value) {
      throw new Error("Datos insuficientes para editar al usuario.");
    }

    isLoading.value = true;

    const data = {
      name: user.value.name,
      phone: `57${user.value.phone}`,
      typeDocument: user.value.typeDocument,
      numberDocument: user.value.numberDocument,
      assignedRol: user.value.assignedRol,
      assignedPosition: user.value.assignedPosition,
      photoUrl: user.value.photoUrl,
    };

    await apiService.patch(`users/${userId.value}`, data, {
      Authorization: `Bearer ${token}`,
    });

    Swal.fire({
      title: "Usuario editado exitosamente",
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

    handleCancel();

    await fetchData();
  } catch (error) {
    Swal.fire({
      title: "Error al editar usuario: ",
      text: error.response?.data?.message || "Algo salió mal.",
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
  } finally {
    isLoading.value = false;
  }
};

const icons = ref([
{ class: 'fas fa-edit', method: handleEdit },
{ class: 'fas fa-trash', method: handleDelete },
]);

const getFieldValue = (obj, path) => {
  return path.split(".").reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
};

const filteredRows = computed(() => {
  return rows.value.filter(row => {
    return filters.value.every(filter => {
      if (!filter.selectedOption) return true;

      const fieldValue = getFieldValue(row, filter.field);

      if (filter.type === 'date') {
        const selectedDate = new Date(filter.selectedOption);
        const rowDate = new Date(fieldValue);

        // Comparar las fechas con un margen de +/- 1 día
        const timeDifference = Math.abs(rowDate.getTime() - selectedDate.getTime());
        const dayDifference = timeDifference / (1000 * 3600 * 24);

        return dayDifference <= 1; // Aceptar fechas dentro de un margen de 1 día
      }

      return fieldValue === filter.selectedOption;
    });
  });
});

const filters = ref([
  {
    field: "assignedRol.name",
    options: [
      { value: "", label: "rol" },
      { value: "administrador", label: "administrador" },
      { value: "instructor", label: "instructor" },
      { value: "supervisor", label: "supervisor" },
    ],
    selectedOption: "",
  },
  {
    field: "assignedPosition",
    options: [
      { value: "", label: "cargo" },
      { value: "Contratista", label: "Contratista" },
      { value: "Planta", label: "Planta" },
    ],
    selectedOption: "",
  },
  {
    field: "createdAt", // Campo de fecha en tus datos
    label: "Fecha",
    type: "date",
    selectedOption: "",
  },
])

onMounted(async () => {
  await fetchData();
  fetchRoles();
});
</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <AuthorsTable
          :title="'Gestion de usuarios'"
          :headers="headers"
          :rows="filteredRows"
          :fields="fields"
          :icons="icons"
          :filters="filters"
        />
      </div>
    </div>
    <v-dialog
      v-model="dialog"
      :fullscreen="mobile"
      scrollable
      persistent
      max-width="800px"
    >
      <v-card class="bg-white">
        <v-card-title
          class="card-title d-flex align-items-center justify-content-center text-h4 text-succes"
          style="margin: 1rem"
        >
          Editar usuario
        </v-card-title>
        <v-card-text class="card-body p-3">
          <v-container>
            <form @submit.prevent="handleSubmit">
              <div class="grid-container">
                <!-- Columna izquierda -->
                <div class="grid-item image-container">
                  <div class="text-center">
                    <div
                      class="image-upload"
                      style="position: relative; display: inline-block"
                    >
                      <img
                        :src="user.photoUrl || 'https://via.placeholder.com/150'"
                        alt="Imagen de usuario"
                        class="rounded-circle"
                        style="
                          width: 150px;
                          height: 150px;
                          object-fit: cover;
                          border: 2px solid #ddd;
                        "
                      />
                      <input
                        type="file"
                        accept="image/*"
                        @change="handleImageUpload"
                        style="
                          position: absolute;
                          top: 0;
                          left: 0;
                          width: 100%;
                          height: 100%;
                          opacity: 0;
                          cursor: pointer;
                        "
                      />
                    </div>
                    <h4 class="mt-2">Cargar imagen</h4>
                  </div>
                </div>
                <div class="grid-item">
                  <label for="name" class="form-control-label"
                  >Nombre completo</label
                  >
                  <argon-input id="name" type="text" v-model="user.name" />
                </div>
                <div class="grid-item">
                  <label for="phone" class="form-control-label"
                  >Número de teléfono</label
                  >
                  <argon-input
                  id="phone"
                    prefix="+57"
                    type="number"
                    v-model="user.phone"
                  />
                </div>
                <!-- Columna derecha -->
                <div class="grid-item">
                  <label for="assignedRol" class="form-control-label"
                    >Asignar rol</label
                  >
                  <argon-select
                    id="assignedRol"
                    :options="availableRoles"
                    v-model="user.assignedRol"
                  />
                </div>
                <div class="grid-item">
                  <label for="typeDocument" class="form-control-label"
                    >Tipo de documento</label
                    >
                    <argon-select
                    id="typeDocument"
                    :options="documentTypes"
                    v-model="user.typeDocument"
                    />
                  </div>
                  <div class="grid-item">
                    <label for="assignedPosition" class="form-control-label"
                      >Asignar cargo</label
                      >
                      <argon-select
                      id="assignedPosition"
                      :options="assignedPosition"
                      v-model="user.assignedPosition"
                    />
                  </div>
                  <div class="grid-item">
                    <label for="numberDocument" class="form-control-label"
                    >Número de documento</label
                    >
                  <argon-input
                    id="numberDocument"
                    type="number"
                    v-model="user.numberDocument"
                  />
                </div>
              </div>
              <v-card-actions
                class="d-flex justify-content-center mt-4"
                style="gap: 60px; padding-top: 20px"
              >
                <button
                  class="btn btn-danger"
                  type="button"
                  @click="handleCancel"
                >
                  Cancelar
                </button>
                <button class="btn btn-success" type="submit">Registrar</button>
              </v-card-actions>
            </form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(4, auto);
  gap: 1rem;
}

.grid-item {
  display: flex;
  flex-direction: column;
}

.image-container {
  grid-row: span 2;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }

  .image-container {
    grid-row: span 1;
  }
}

.v-card {
  color: rgba(0, 0, 0, 0.87);
}
.v-card-title {
  color: rgba(0, 0, 0, 0.87);
}
.v-card-text {
  color: rgba(0, 0, 0, 0.6);
}
</style>
