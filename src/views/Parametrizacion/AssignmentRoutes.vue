<script setup>
import { ref, onMounted } from "vue";
import AuthorsTable from "../components/AuthorsTable.vue";
import apiService from "../../service/apiService";
import Swal from "sweetalert2";
import ArgonAutocomplete from "@/components/ArgonAutocomplete.vue";

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
const originalData = ref(null);

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
                _id: rol._id,
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
    rol.value.view = row.view || { id: "", name: "", route: "" }; 
    rol.value.state = row.state === "Activo" ? true : false;
    rol.value.id = row._id;
    rolId.value = row._id;
    isEditing.value = true;
    dialog.value = true;
    
    originalData.value = {
        rolId: row._id,
        viewId: row.view.id
    };
};

const handleCancel = () => {
    Object.keys(rol.value).forEach((key) => (rol.value[key] = ""));
    rolId.value = "";
    isEditing.value = false;
    dialog.value = false;
    originalData.value = null;
};

const handleDelete = async (row) => {
    const result = await Swal.fire({
        title: "¿Estás seguro de que quieres eliminar esta vista del rol?",
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
        isDeleting.value = true;

        const roleId = row._id; 
        const viewIdToDelete = row.view.id; 

        const updatedViews = row.views.filter(view => view._id !== viewIdToDelete);

        await apiService.patch(`/rol/${roleId}`, { views: updatedViews });

        Swal.fire({
            title: "Vista eliminada exitosamente",
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
        console.error("Error al eliminar la vista:", error);

        Swal.fire({
            title: "Error al eliminar la vista",
            text: error.message || "Algo salió mal.",
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
        isDeleting.value = false;
    }
};

const handleSubmit = async () => {
    try {
        isLoading.value = true;

        if (!rol.value.view || !rol.value.view.id) {
            throw new Error("Debes seleccionar una vista válida.");
        }

        if (!rol.value.id) {
            throw new Error("Debes seleccionar un rol válido.");
        }

        if (isEditing.value && originalData.value) {
            const newRolId = rol.value.id;
            const newViewId = rol.value.view.id;
            const originalRolId = originalData.value.rolId;
            const originalViewId = originalData.value.viewId;
            
            if (newRolId !== originalRolId && newViewId === originalViewId) {
                const originalRolData = rows.value.find(row => row._id === originalRolId);
                
                if (originalRolData) {
                    const updatedOriginalViews = originalRolData.views.filter(view => view._id !== originalViewId);
                    await apiService.patch(`/rol/${originalRolId}`, { views: updatedOriginalViews });
                }
                
                const newRolData = rows.value.find(row => row._id === newRolId);
                const newRolViews = newRolData ? [...newRolData.views.map(view => view._id)] : [];
                
                if (!newRolViews.includes(originalViewId)) {
                    newRolViews.push(originalViewId);
                }
                
                await apiService.patch(`/rol/${newRolId}`, { views: newRolViews });
            }
            else if (newRolId === originalRolId && newViewId !== originalViewId) {
                const rolData = rows.value.find(row => row._id === originalRolId);
                
                if (rolData) {
                    const updatedViews = rolData.views.filter(view => view._id !== originalViewId);
                    
                    if (!updatedViews.some(view => view._id === newViewId)) {
                        updatedViews.push({ _id: newViewId });
                    }
                    
                    await apiService.patch(`/rol/${originalRolId}`, { 
                        views: updatedViews.map(view => view._id || view) 
                    });
                }
            }
            else if (newRolId !== originalRolId && newViewId !== originalViewId) {
                const originalRolData = rows.value.find(row => row._id === originalRolId);
                if (originalRolData) {
                    const updatedOriginalViews = originalRolData.views.filter(view => view._id !== originalViewId);
                    await apiService.patch(`/rol/${originalRolId}`, { views: updatedOriginalViews });
                }
                
                const newRolData = rows.value.find(row => row._id === newRolId);
                const newRolViews = newRolData ? [...newRolData.views.map(view => view._id || view)] : [];
                
                if (!newRolViews.includes(newViewId)) {
                    newRolViews.push(newViewId);
                }
                
                await apiService.patch(`/rol/${newRolId}`, { views: newRolViews });
            }
        } 
        else {
            const selectedRole = roles.value.find(role => role.value === rol.value.id);
            if (!selectedRole) {
                throw new Error("Rol seleccionado no válido.");
            }

            const selectedViewId = rol.value.view.id;

            const currentRole = rows.value.find(row => row._id === selectedRole.value);
            
            const currentViewIds = currentRole ? currentRole.views.map(view => view._id) : [];

            if (!currentViewIds.includes(selectedViewId)) {
                currentViewIds.push(selectedViewId);
            }

            await apiService.patch(`/rol/${selectedRole.value}`, { views: currentViewIds });
        }

        Swal.fire({
            title: isEditing.value ? "Permiso actualizado correctamente" : "Vista agregada correctamente",
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
        console.error("Error:", error);
        Swal.fire({
            title: isEditing.value ? "Error al actualizar el permiso" : "Error al agregar la vista",
            text: error.response?.data?.message || error.message || "Algo salió mal.",
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
    originalData.value = null;
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
                    {{ isEditing ? 'Editar permiso' : 'Asignar permiso' }}
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
                                    {{ isEditing ? 'Actualizar' : 'Registrar' }}
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