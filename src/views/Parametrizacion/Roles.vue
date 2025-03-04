<script setup>
import { ref, onMounted } from "vue";
import AuthorsTable from "../components/AuthorsTable.vue";
import apiService from "../../service/apiService";
import Swal from "sweetalert2";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonSelect from "@/components/ArgonSelect.vue";

const rol = ref({
    name: "",
    description: "",
    state: true,
});
const rolId = ref("");
const headers = ref([
    { text: "Nombre del rol", value: "rol.name" },
    { text: "Descripción", value: "rol.description" },
    { text: "Estado", value: "rol.state" },
]);

const states = [
    { value: true, label: "Activo" },
    { value: false, label: "Inactivo" },
];

const fields = ref({
    rol: {
        value: "name",
        class: "align-middle",
        textClass: "text-xs font-weight-bold mb-0",
    },
    descripción: {
        value: "description",
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
const dialog = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);

const fetchData = async () => {
    try {
        const response = await apiService.get(
            "/rol",
            {},
        );
        rows.value = response.map((rol) => ({
            ...rol,
            state: rol.state ? "Activo" : "Inactivo",
        }));
    } catch (error) {
        console.error("Error fetching rols:", error);
        alert("Error al cargar los usuarios");
    }
};

const handleEdit = (row) => {
    rol.value = { ...row };
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
        title: "¿Estás seguro de que quieres eliminar este rol?",
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
        await apiService.delete(`rol/${id}`);
        Swal.fire({
            title: "Rol eliminado correctamente",
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
            title: "Error al eliminar rol.",
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
        isLoading.value = true;

        const data = {
            name: rol.value.name,
            description: rol.value.description,
            state: rol.value.state,
        };

        if (isEditing.value) {
            await apiService.patch(`rol/${rolId.value}`, data, );

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
        } else {
            await apiService.post(`rol`, data,);

            Swal.fire({
                title: "Rol creado exitosamente",
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
        }

        handleCancel();
        await fetchData();
    } catch (error) {
        Swal.fire({
            title: "Error al " + (isEditing.value ? "editar" : "crear") + " rol: ",
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
        name: "",
        description: "",
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
});
</script>

<template>
    <div class="py-4 container-fluid">
        <div class="row">
            <div class="col-12">
                
                <AuthorsTable :title="'Parametrización roles'" :headers="headers" :rows="rows" :fields="fields"
                :icons="icons" >
                    <template #add-button >
                        <button class="btn btn-custom " @click="openCreateDialog">
                            <i class="fas fa-plus me-2"></i>Agregar Nuevo Rol
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
                    {{ isEditing ? 'Editar rol' : 'Crear nuevo rol' }}
                </v-card-title>
                <v-card-text class="card-body p-3">
                    <v-container>
                        <form @submit.prevent="handleSubmit">
                            <div class="row">
                                <div class="row" style="width: 100%">
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Nombre
                                            del rol</label>
                                        <argon-input id="name" type="text" v-model="rol.name" />
                                    </div>
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Descripción</label>
                                        <argon-input id="description" type="text" v-model="rol.description" />
                                    </div>
                                    <div>
                                        <label for="example-text-input" class="form-control-label">Estado</label>
                                        <argon-select id="state" :options="states" v-model="rol.state" />
                                    </div>
                                </div>
                            </div>
                            <v-card-actions class="d-flex justify-content-center mt-4"
                                style="gap: 60px; padding-top: 20px">
                                <button class="btn btn-danger" type="button" @click="handleCancel">
                                    Cancelar
                                </button>
                                <button class="btn btn-success" type="submit">
                                    {{ isEditing ? 'Guardar cambios' : 'Crear rol' }}
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