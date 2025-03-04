<script setup>
import { ref, onMounted } from "vue";
import AuthorsTable from "./components/AuthorsTable.vue";
import apiService from "../service/apiService";
import Swal from "sweetalert2";
import ArgonAutocomplete from "../components/ArgonAutocomplete.vue";

const rol = ref({
    views: [],
    view: {
        id: "",
        name: "",
        route: "",
    },
    name: "",
    state: true,
    id: "",
});
const rolId = ref("");
const headers = ref([
    { text: "Nombre de la vista", value: "rol.view.name" },
    { text: "Ruta", value: "rol.view.route" },
    { text: "Rol asignado", value: "rol.name" },
    { text: "Estado", value: "rol.state" },
]);

const fields = ref({
    nameView: {
        value: "view.name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold mb-0",
    },
    route: {
        value: "view.route",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    nameRol: {
        value: "name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
    estado: {
        value: "state",
        class: "align-middle",
        textClass: "text-xs font-weight-bold",
    },
});

const rows = ref([]);
const roles = ref([]);
const views = ref([]);
const isDeleting = ref(false);
const dialog = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);

const fetchData = async () => {
    try {
        const response = await apiService.get("/rol", {});
        rows.value = response.flatMap(rol => 
            rol.views.map(view => ({
                view: {
                    id: view._id,
                    name: view.name,
                    route: view.route,
                },
                name: rol.name,
                state: rol.state ? "Activo" : "Inactivo",
                views: rol.views,
            }))
        );

        roles.value = response.map((assignedRol) => ({
            value: assignedRol._id,
            title: assignedRol.name,
        }));
    } catch (error) {
        console.error("Error fetching rols:", error);
        alert("Error al cargar los usuarios");
    }
};

const fetchViews = async () => {
    try {
        const response = await apiService.get(
            "/views",
            {},
        );
        views.value = response.map((view) => ({
            value: view._id,
            title: view.name,
            subtitle: view.route,
        }));
    } catch (error) {
        console.error("Error fetching views:", error);
        alert("Error al cargar las vistas");
    }
}

const handleEdit = (row) => {
    rol.value = { ...row };
    rol.value.view = row.view || { id: "", name: "", route: "" }; // Asegurar que view esté definido
    rol.value.state = row.state === "Activo" ? true : false;
    rolId.value = row._id;
    isEditing.value = true;
    dialog.value = true;
};

const handleCancel = () => {
    Object.keys(rol.value).forEach((key) => (rol.value[key] = ""));
    rolId.value = "";
    isEditing.value = false;
    dialog.value = false;
};

const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: "¿Estás seguro de que quieres eliminar esta ruta del rol?",
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
        // Marcar que estamos en modo de eliminación
        isDeleting.value = true;
        rolId.value = id;

        // Obtener el rol seleccionado y la vista seleccionada
        const selectedRole = roles.value.find(role => role.value === rol.value.id);
        const selectedView = views.value.find(view => view.value === rol.value.view.id);

        if (!selectedRole || !selectedView) {
            throw new Error("Selecciona un rol y una vista válidos.");
        }

        // Obtener el arreglo actual de views del rol
        const currentRole = rows.value.find(row => row.name === selectedRole.title);
        const currentViews = currentRole ? currentRole.views.map(view => view.id) : [];

        // Quitar la ruta del arreglo
        const updatedViews = currentViews.filter(viewId => viewId !== selectedView.value);

        // Enviar la petición PATCH con el arreglo actualizado
        await apiService.patch(`/rol/${selectedRole.value}`, { views: updatedViews });

        Swal.fire({
            title: "Ruta eliminada exitosamente",
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
        console.error("Error al eliminar la ruta:", error);
    } finally {
        isDeleting.value = false;
    }
};

const handleSubmit = async () => {
    try {
        isLoading.value = true;

        // Verificar que rol.value.view esté definido
        if (!rol.value.view) {
            throw new Error("La vista no está definida.");
        }

        // Obtener el rol seleccionado y la vista seleccionada
        const selectedRole = roles.value.find(role => role.value === rol.value.id);
        const selectedView = views.value.find(view => view.value === rol.value.view.id);

        if (!selectedRole || !selectedView) {
            throw new Error("Selecciona un rol y una vista válidos.");
        }

        // Obtener el arreglo actual de views del rol
        const currentRole = rows.value.find(row => row.name === selectedRole.title);
        const currentViews = currentRole ? currentRole.views.map(view => view.id) : [];

        // Reemplazar la ruta antigua con la nueva
        const updatedViews = currentViews.map(viewId => 
            viewId === rol.value.view.id ? selectedView.value : viewId
        );

        // Enviar la petición PATCH con el arreglo actualizado
        await apiService.patch(`/rol/${selectedRole.value}`, { views: updatedViews });

        Swal.fire({
            title: "Rol editado exitosamente",
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
            title: "Error al editar la ruta: ",
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

const openCreateDialog = () => {
    rol.value = {
        views: [],
        view: {
            id: "",
            name: "",
            route: "",
        },
        name: "",
        state: true,
    };
    isEditing.value = false;
    dialog.value = true;
};

const icons = ref([
{ class: 'fas fa-edit', method: handleEdit },
{ class: 'fas fa-trash', method: handleDelete },
]);

onMounted(async () => {
    await fetchData();
    await fetchViews();
});
</script>

<template>
    <div class="py-4 container-fluid">
        <div class="row">
            <div class="col-12">
                <AuthorsTable :title="'Asignación de permisos'" :headers="headers" :rows="rows" :fields="fields"
                :icons="icons" >
                    <template #add-button >
                        <button class="btn btn-custom " @click="openCreateDialog">
                            <i class="fas fa-plus me-2"></i>Asignar permiso
                        </button>
                    </template>
                </AuthorsTable>
            </div>
        </div>

        <!-- Diálogo para crear/editar roles -->
        <v-dialog v-model="dialog" :fullscreen="mobile" scrollable persistent max-width="800px">
            <v-card class="bg-white">
                <v-card-title class="card-title d-flex align-items-center justify-content-center text-h4 text-succes"
                    style="margin: 1rem">
                    Asignar permiso
                </v-card-title>
                <v-card-text class="card-body p-3">
                    <v-container>
                        <form @submit.prevent="handleSubmit">
                            <div class="row">
                                <div class="row" style="width: 100%">
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Seleccionar una ruta</label>
                                        <ArgonAutocomplete id="route" type="text" :items="views" v-model="rol.view.id" />
                                    </div>
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Seleccionar un rol</label>
                                        <ArgonAutocomplete id="rol" type="text" :items="roles" v-model="rol.id" />
                                    </div>
                                </div>
                            </div>
                            <v-card-actions class="d-flex justify-content-center mt-4"
                                style="gap: 60px; padding-top: 20px">
                                <button class="btn btn-danger" type="button" @click="handleCancel">
                                    Cancelar
                                </button>
                                <button class="btn btn-success" type="submit">
                                    Registrar
                                </button>
                            </v-card-actions>
                        </form>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<style scoped>
/* Estilos personalizados para el botón */
.btn-custom {
    background-color: white; /* Fondo blanco */
    color: #28a745; /* Letra verde */
    border: 1px solid #28a745; /* Borde verde */
    transition: all 0.3s ease; /* Transición suave */
    margin-bottom: 0%;
}

.btn-custom:hover {
    background-color: #28a745; /* Fondo verde al pasar el mouse */
    color: white; /* Letra blanca al pasar el mouse */
}

/* Estilos para la tarjeta del diálogo */
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