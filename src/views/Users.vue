<script setup>
import { ref, onMounted } from "vue";
import AuthorsTable from "./components/AuthorsTable.vue";
import apiService from "../service/apiService";
import { useDisplay } from "vuetify";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

const token = Cookies.get("authToken");

const headers = ref([
  "Nombre de usuario",
  "Teléfono",
  "Tipo de documento",
  "Número de documento",
  "Fecha de registro",
]);
const icons = ref({
  firstIcon: "fas fa-check",
  secondIcon: "fas fa-trash",
});

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
const { mobile } = useDisplay();
const availableRoles = ref([]);
const isLoading = ref(false);

const formatPhone = (phone) => {
  if (!phone) return "";
  const prefijo = phone.slice(0, phone.indexOf("-") + 1);
  const numero = phone.slice(phone.indexOf("-") + 1);
  return prefijo.startsWith("+")
    ? `${prefijo} ${numero}`
    : `+${prefijo} ${numero}`;
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
          : user.photoUrl,
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
    availableRoles.value = response.data || response;
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

onMounted(async () => {
  await fetchData();
  fetchRoles();
});
</script>

<template>
  <div class="py-5 container-fluid">
    <div class="row">
      <div class="col-12">
        <AuthorsTable
          :title="'Control de acceso'"
          :headers="headers"
          :rows="rows"
          :fields="fields"
          :icons="icons"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>
    <v-dialog v-model="dialog" scrollable :fullscreen="mobile" max-width="500px">
      <v-card class="bg-white">
        <v-card-title class="text-h5 bg-light">
          Autorizar Usuario
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.assignedRol"
                  :items="availableRoles"
                  item-title="name"
                  item-value="_id"
                  label="Asignar rol"
                  variant="outlined"
                  required
                  :loading="!availableRoles.length"
                  :disabled="!availableRoles.length || isLoading"
                  class="bg-white"
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="bg-light">
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="dialog = false"
            :disabled="isLoading"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="acceptUser(editedItem._id, editedItem.assignedRol)"
            :disabled="!editedItem.assignedRol || isLoading"
            :loading="isLoading"
          >
            Autorizar y Asignar Rol
          </v-btn>
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
