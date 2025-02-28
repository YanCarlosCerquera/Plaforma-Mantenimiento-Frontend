<script setup>
import { ref, onMounted, computed } from "vue";
import AuthorsTable from "./components/AuthorsTable.vue";
import apiService from "../service/apiService";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import ArgonSelect from "@/components/ArgonSelect.vue"; // Importa el componente ArgonSelect
import defaultImage from "@/assets/img/logos/user.svg";

const token = Cookies.get("authToken");

const headers = ref([
  "Nombre de usuario",
  "Teléfono",
  "Tipo de documento",
  "Número de documento",
  "Fecha de registro",
]);

const fields = ref({
  usuario: {
    showAvatar: true,
    avatar: "photoUrl",
    main: "name",
    sub: "email",
  },
  telefono: {
    value: "phone",
    class: "align-middle",
    textClass: "text-xs font-weight-bold mb-0",
  },
  tipoDocumento: {
    value: "typeDocument",
    class: "align-middle",
    textClass: "text-xs font-weight-bold",
  },
  numeroDocumento: {
    value: "numberDocument",
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
const editedItem = ref({});
const availableRoles = ref([]);
const isLoading = ref(false);

const formatPhone = (phone) => {
  if (!phone) return "";
  const prefijo = phone.slice(0, phone.indexOf("-") + 1);
  const numero = phone.slice(phone.indexOf("-") + 1);
  return prefijo.startsWith("+")
    ? `${prefijo} ${numero}`
    : `${prefijo} ${numero}`;
};

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
      "/users",
      {},
      { Authorization: `Bearer ${token}` }
    );
    rows.value = (response.data || response)
      .filter((user) => !user.state)
      .map((user) => ({
        ...user,
        phone: formatPhone(user.phone),
        createdAt: formatDate(user.createdAt),
        photoUrl: user.photoUrl
        ? user.photoUrl.replace("http://localhost:3000", "")
        : defaultImage, 
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
    availableRoles.value = response.map((role) => ({
      value: role._id,
      label: role.name,
    }));
  } catch (error) {
    console.error("Error fetching roles:", error);
    alert("Error al cargar los roles");
  }
};

const handleEdit = (row) => {
  editedItem.value = { ...row, assignedRol: "" };
  dialog.value = true;
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

const acceptUser = async (Userid, assignedRol) => {
  try {
    if (!Userid || !assignedRol) {
      throw new Error("Datos insuficientes para autorizar al usuario.");
    }

    isLoading.value = true;

    const response = await apiService.patch(`users/${Userid}`, {
      state: true,
      assignedRol: assignedRol,
    });
    console.log(response);

    dialog.value = false;
    await fetchData();
  } catch (error) {
    Swal.fire({
      title: "Error al autorizar usuario: ",
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
{ class: 'fas fa-check', method: handleEdit },
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
      return fieldValue === filter.selectedOption; 
    });
  });
});

const filters = ref([
  {
    field: "typeDocument",
    options: [
      { value: "", label: "tipo documento" },
      { value: "Cédula de Ciudadanía", label: "Cédula de Ciudadanía" },
      { value: "Cédula de Extranjería", label: "Cédula de Extranjería" },
      { value: "Tarjeta de Identidad", label: "Tarjeta de Identidad" },
    ],
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
          :title="'Control de acceso'"
          :headers="headers"
          :rows="filteredRows"
          :fields="fields"
          :icons="icons"
          :filters="filters"
        />
      </div>
    </div>
    <v-dialog v-model="dialog" scrollable  max-width="600px">
      <v-card class="bg-white">
        <v-card-title
          class="card-title d-flex align-items-center justify-content-center text-h4 text-succes"
          style="margin: 1rem"
        >
          Autorizar Usuario
        </v-card-title>
        <v-card-text class="card-body p-3">
          <v-container>
            <v-row>
              <v-col cols="12">
                <label for="assignedRol" class="form-control-label"
                  >Asignar rol</label
                >
                <argon-select
                  id="assignedRol"
                  :options="availableRoles"
                  v-model="editedItem.assignedRol"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions
          class="d-flex justify-content-center mt-4"
          style="gap: 60px; padding-top: 20px"
        >
          <button
            class="btn btn-danger"
            type="button"
            @click="dialog = false"
            :disabled="isLoading"
          >
            Cancelar
          </button>
          <button
            class="btn btn-success"
            type="button"
            @click="acceptUser(editedItem._id, editedItem.assignedRol)"
            :disabled="!editedItem.assignedRol || isLoading"
            :loading="isLoading"
          >
            Autorizar y Asignar Rol
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
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